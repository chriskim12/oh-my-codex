# Run outcome contract (Issue #1718 PR1)

This document captures the narrow PR1 contract for Issue #1718: introduce a
shared terminal/non-terminal run outcome vocabulary before changing runtime
ownership or adding the later reusable run loop.

## Canonical run outcomes

PR1 should normalize lifecycle readers and writers onto these meanings:

### Terminal outcomes

- `finish` — successful terminal completion
- `blocked_on_user` — terminal wait that requires explicit user input before a
  new run should start
- `failed` — terminal error/failure
- `cancelled` — terminal operator/runtime cancellation

### Non-terminal outcomes

- `progress` — work advanced but the run is still active
- `continue` — the current run remains active and should keep going rather than
  finalizing

## Compatibility mapping expected in PR1

Brownfield surfaces already use several words for the same idea. PR1 should not
rewrite every public string yet, but it should make the shared meaning explicit.

| Existing label | Shared meaning |
| --- | --- |
| `complete`, `completed`, `finished` | `finish` |
| active non-terminal mode/team phase | `continue` / `progress` |
| stop-hook block because work is still active | `continue` |
| cancellation phase/status | `cancelled` |
| explicit failure phase/status | `failed` |

`blocked_on_user` is the missing canonical term today. PR1 should introduce it
as contract vocabulary even where the first implementation still adapts from
older pause/wait wording.

## Vocabulary mismatches found during review

1. **Successful terminal state is fragmented** across `finish`, `finished`,
   `complete`, and `completed`.
2. **Non-terminal continuation is mostly implicit** in stop-hook and idle
   notification logic instead of being named as a shared run outcome.
3. **`blocked_on_user` is not yet a first-class shared term**, which makes
   user-wait terminalization harder to reason about consistently.

## Smallest central file set for PR1

The current review indicates the smallest high-value implementation slice is:

- `src/scripts/codex-native-hook.ts`
  - replace local non-terminal/terminal checks with the shared run outcome
    contract while preserving current Stop behavior
- `src/scripts/notify-hook/utils.ts`
  - make terminal phase detection read from the shared contract vocabulary
- `src/team/orchestrator.ts`
  - keep team terminal phases aligned with the shared contract instead of local
    terminal assumptions
- `src/team/phase-controller.ts`
  - preserve reopen/terminal handling through the same shared helpers
- `src/team/runtime-cli.ts`
  - normalize terminal CLI output through the shared outcome mapping, while
    keeping the current CLI-facing `completed|failed` output compatibility

## Focused regression coverage for PR1

The most relevant existing tests to update are:

- `src/scripts/__tests__/codex-native-hook.test.ts`
- `src/hooks/__tests__/notify-hook-modules.test.ts`
- `src/team/__tests__/orchestrator.test.ts`
- `src/team/__tests__/phase-controller.test.ts`
- `src/team/__tests__/runtime-cli.test.ts`

## Out of scope for PR1

- reusable continue-until-terminal run loop semantics
- moving ownership into shared run-state storage
- Ralph/team/runtime ownership reshaping beyond contract adoption

Those belong to PR2+ from `.omx/context/issue-1718-pr-plan.md`.
