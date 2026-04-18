import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { cancelMode, startMode, updateModeState } from '../base.js';
import { readRunState } from '../../runtime/run-state.js';

describe('modes/base shared run-state sync', () => {
  it('creates shared run-state on mode start in root scope', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-mode-run-state-root-'));
    try {
      await startMode('ralplan', 'shared run state root scope', 5, wd);

      assert.equal(existsSync(join(wd, '.omx', 'state', 'run-state.json')), true);
      const runState = await readRunState(wd);
      assert.ok(runState);
      assert.equal(runState?.mode, 'ralplan');
      assert.equal(runState?.active, true);
      assert.equal(runState?.outcome, 'continue');
      assert.equal(runState?.current_phase, 'starting');
      assert.equal(runState?.task_description, 'shared run state root scope');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('creates shared run-state in the current session scope', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-mode-run-state-session-'));
    try {
      await mkdir(join(wd, '.omx', 'state'), { recursive: true });
      await writeFile(join(wd, '.omx', 'state', 'session.json'), JSON.stringify({ session_id: 'sess-run-state' }));

      await startMode('ralph', 'shared run state session scope', 5, wd);

      assert.equal(existsSync(join(wd, '.omx', 'state', 'sessions', 'sess-run-state', 'run-state.json')), true);
      const runState = await readRunState(wd);
      assert.ok(runState);
      assert.equal(runState?.mode, 'ralph');
      assert.equal(runState?.active, true);
      assert.equal(runState?.outcome, 'continue');
      assert.equal(runState?.owner_omx_session_id, 'sess-run-state');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('syncs terminal finish outcome into shared run-state', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-mode-run-state-finish-'));
    try {
      await startMode('ralplan', 'finish run state', 5, wd);
      await updateModeState('ralplan', {
        active: false,
        current_phase: 'complete',
        completed_at: '2026-04-18T00:00:00.000Z',
      }, wd);

      const runState = await readRunState(wd);
      assert.ok(runState);
      assert.equal(runState?.active, false);
      assert.equal(runState?.outcome, 'finish');
      assert.equal(runState?.current_phase, 'complete');
      assert.equal(runState?.completed_at, '2026-04-18T00:00:00.000Z');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('syncs cancelled outcome into shared run-state when cancelling a mode', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-mode-run-state-cancel-'));
    try {
      await startMode('ralplan', 'cancel run state', 5, wd);
      await cancelMode('ralplan', wd);

      const runState = await readRunState(wd);
      assert.ok(runState);
      assert.equal(runState?.active, false);
      assert.equal(runState?.outcome, 'cancelled');
      assert.equal(runState?.current_phase, 'cancelled');
      assert.equal(typeof runState?.completed_at, 'string');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
