#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const manifestPath = 'ops/operational-env-governance.json';
const allowedClassifications = new Set([
  'secret',
  'public/internal config',
  'test fixture',
  'CI-only',
  'inactive example',
]);
const requiredEntryFields = [
  'key',
  'classification',
  'operationalScope',
  'owner',
  'bwsStatus',
  'references',
];
const requiredExclusionFields = [
  'key',
  'classification',
  'exclusionReason',
  'references',
];
const secretLike = /(?:TOKEN|SECRET|WEBHOOK(?:_URL)?|API_KEY|PASSWORD|PRIVATE_KEY|ACCESS_KEY)$/;
const envAccessPatterns = [
  /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
  /process\.env\[['"]([A-Za-z_][A-Za-z0-9_]*)['"]\]/g,
  /env::var(?:_os)?\(['"]([A-Za-z_][A-Za-z0-9_]*)['"]\)/g,
  /\bexport\s+([A-Z][A-Z0-9_]*(?:TOKEN|SECRET|WEBHOOK|API_KEY|PASSWORD|PRIVATE_KEY|ACCESS_KEY))\b/g,
  /\b([A-Z][A-Z0-9_]*(?:TOKEN|SECRET|WEBHOOK|API_KEY|PASSWORD|PRIVATE_KEY|ACCESS_KEY)):\s*\$\{\{\s*(?:secrets|github)\./g,
];
const ignoredFileParts = new Set(['dist', 'node_modules', '.git', '.omx', '.clawhip']);
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.lock']);

function fail(message) {
  console.error(`env-governance check failed: ${message}`);
  process.exitCode = 1;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateRecord(record, fields, collectionName) {
  if (!isObject(record)) {
    fail(`${collectionName} contains a non-object item`);
    return;
  }
  for (const field of fields) {
    if (!(field in record)) fail(`${collectionName}.${record.key ?? '<unknown>'} missing ${field}`);
  }
  if (typeof record.key !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(record.key)) {
    fail(`${collectionName} contains invalid key ${JSON.stringify(record.key)}`);
  }
  if (!allowedClassifications.has(record.classification)) {
    fail(`${collectionName}.${record.key} has invalid classification ${JSON.stringify(record.classification)}`);
  }
  if (!Array.isArray(record.references) || record.references.length === 0) {
    fail(`${collectionName}.${record.key} must have at least one reference`);
  } else {
    for (const ref of record.references) {
      if (typeof ref !== 'string' || ref.includes('=')) {
        fail(`${collectionName}.${record.key} has invalid/value-like reference ${JSON.stringify(ref)}`);
      } else if (!existsSync(ref)) {
        fail(`${collectionName}.${record.key} reference does not exist: ${ref}`);
      }
    }
  }
}

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .filter((file) => !file.split('/').some((part) => ignoredFileParts.has(part)))
    .filter((file) => !ignoredExtensions.has(extname(file)))
    .filter((file) => !file.includes('/__tests__/'))
    .filter((file) => !file.includes('/fixtures/'));
}

function collectHighSignalRefs() {
  const refs = new Map();
  for (const file of trackedFiles()) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      for (const pattern of envAccessPatterns) {
        pattern.lastIndex = 0;
        for (const match of line.matchAll(pattern)) {
          const key = match[1];
          if (!secretLike.test(key)) continue;
          const locations = refs.get(key) ?? new Set();
          locations.add(`${file}:${lineIndex + 1}`);
          refs.set(key, locations);
        }
      }
    }
  }
  return refs;
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!Array.isArray(manifest.entries)) fail('entries must be an array');
if (!Array.isArray(manifest.excludedHighSignalRefs)) fail('excludedHighSignalRefs must be an array');

const allKeys = new Set();
for (const entry of manifest.entries ?? []) {
  validateRecord(entry, requiredEntryFields, 'entries');
  if (allKeys.has(entry.key)) fail(`duplicate manifest key ${entry.key}`);
  allKeys.add(entry.key);
}
for (const exclusion of manifest.excludedHighSignalRefs ?? []) {
  validateRecord(exclusion, requiredExclusionFields, 'excludedHighSignalRefs');
  if (allKeys.has(exclusion.key)) fail(`key appears in both entries and exclusions: ${exclusion.key}`);
  allKeys.add(exclusion.key);
}

for (const [key, locations] of collectHighSignalRefs()) {
  if (!allKeys.has(key)) {
    fail(`high-signal env ref ${key} is not governed; refs: ${Array.from(locations).slice(0, 5).join(', ')}`);
  }
}

if (!process.exitCode) {
  console.log('env-governance check passed: manifest is value-free and high-signal env refs are governed.');
}
