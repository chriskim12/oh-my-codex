# CLI Polish Pass Review - 2026-04-09

Date: **2026-04-09**  
Baseline commit: **`84f2467a`**

## Scope

This note documents the review/documentation lane for the approved
CLI polish pass in `.omx/plans/prd-cli-polish-passes.md` and
`.omx/plans/test-spec-cli-polish-passes.md`.

The review stayed intentionally bounded to daemon/help/setup/catalog/test seams.

## Summary

The current branch already presents a coherent daemon onboarding
story across the main user-facing surfaces:

1. `omx --help` advertises `omx daemon` as a lifecycle
   surface, not a second setup workflow.
2. `omx daemon --help` points users to `$setup-omx-daemon`
   for onboarding and keeps `omx daemon scaffold` as the
   explicit recovery path.
3. `skills/setup-omx-daemon/SKILL.md` matches that split:
   tracked governance files and `.gitignore` shaping happen
   during setup, while runtime control stays under
   `omx daemon`.
4. Project-scoped setup keeps `.omx/daemon/*` trackable
   while `.omx/state/daemon/*` remains ignored, and
   catalog-driven setup still installs `setup-omx-daemon`.

## Reviewed surfaces

### Help and onboarding consistency

Reviewed together:

- `src/cli/index.ts`
- `src/cli/daemon.ts`
- `skills/setup-omx-daemon/SKILL.md`

Result:

- Top-level help is intentionally terse and lifecycle-oriented.
- Command-local daemon help adds the onboarding bridge and
  explicitly names `omx daemon scaffold` as the fallback path.
- The setup skill keeps CLI ownership clear: scaffold/configure
  first, then `run-once` or `start`.

No contradictory setup-vs-runtime wording was found in these surfaces.

### Setup and `.gitignore` contract clarity

Reviewed together:

- `src/cli/setup.ts`
- `src/cli/__tests__/setup-refresh.test.ts`

Result:

- The `.gitignore` contract is explicit and git-valid.
- The review confirmed the intended carve-out chain:
  - `.omx/*`
  - `!.omx/daemon/`
  - `.omx/daemon/*`
  - `!.omx/daemon/*.md`
  - `!.omx/daemon/daemon.config.json`
- Setup messaging correctly describes tracked daemon governance
  inputs versus ignored runtime state.

### Catalog discoverability

Reviewed together:

- `src/catalog/manifest.json`
- `templates/catalog-manifest.json`
- `src/catalog/generated/public-catalog.json`
- `src/catalog/__tests__/generator.test.ts`
- `src/cli/__tests__/setup-skills-overwrite.test.ts`
- `src/cli/__tests__/setup-scope.test.ts`

Result:

- `setup-omx-daemon` remains present in
  source/template/generated catalog surfaces.
- Project-scoped setup still installs the skill, keeping
  catalog-driven discoverability intact.

### Status and targeted verification lane

Reviewed together:

- `src/daemon/index.ts`
- `src/daemon/__tests__/index.test.ts`
- `src/cli/__tests__/daemon.test.ts`
- `src/cli/__tests__/nested-help-routing.test.ts`

Result:

- The shipped status copy is actionable for pre-setup,
  stopped/running, and missing-credential branches.
- The current baseline already proves pre-setup guidance,
  help routing, catalog sync, and setup/gitignore behavior.
- **Follow-up still worth keeping explicit before merge:**
  add/retain direct automated coverage for the
  stopped/running/missing-credentials daemon status branches
  so AC4 is proven as directly as the rest of the polish lane.

That follow-up is a targeted test-lane requirement, not a
reason to widen the polish scope.

## Verification evidence

### Manual / CLI checks

Commands run:

```bash
node dist/cli/omx.js --help
node dist/cli/omx.js daemon --help
(cd "$TMPDIR" && node /path/to/dist/cli/omx.js daemon status)
(cd "$TMPDIR" && node /path/to/dist/cli/omx.js setup --scope project)
```

Observed results:

- `omx --help` includes `omx daemon    Manage daemon lifecycle
  for GitHub issue triage (start|stop|status|run-once|approve|reject)`.
- `omx daemon --help` points users to `$setup-omx-daemon`
  and keeps `omx daemon scaffold` visible as the
  recovery/onboarding command.
- In a fresh temp repo, `omx daemon status` reports:
  `Daemon is not initialized for this worktree. Use
  $setup-omx-daemon or scaffold .omx/daemon first.`
- In that same temp repo, project-scoped setup:
  - installs `.codex/skills/setup-omx-daemon/SKILL.md`
  - writes the expected daemon `.gitignore` carve-out sequence
  - leaves `.omx/state/daemon/queue.json` ignored via `.gitignore:1:.omx/*`

### Targeted automated verification

Commands run:

```bash
npm run build
node --test dist/cli/__tests__/daemon.test.js \
  dist/cli/__tests__/nested-help-routing.test.js \
  dist/cli/__tests__/setup-refresh.test.js \
  dist/cli/__tests__/setup-skills-overwrite.test.js \
  dist/cli/__tests__/setup-scope.test.js \
  dist/catalog/__tests__/generator.test.js \
  dist/daemon/__tests__/index.test.js
node dist/scripts/generate-catalog-docs.js --check
```

Observed results:

- `npm run build` ✅
- targeted node test batch ✅
  (`41` + `11` passing checks across the selected suites;
  `0` failures)
- catalog contract check ✅ (`catalog check ok`)

## Residual risk / handoff note

The documentation and manual review lane found the main
polish story coherent. The remaining high-value merge gate
is to keep the verification lane explicit around daemon
status branches beyond pre-setup, especially
missing-credentials and stopped/running messaging.

If those direct assertions are present in the final
integrated branch, this review lane has no blocking
documentation concerns.
