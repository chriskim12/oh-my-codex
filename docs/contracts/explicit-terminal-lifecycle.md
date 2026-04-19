# Explicit Terminal Lifecycle Contract

This document defines the first-pass canonical explicit-terminal vocabulary for
OMX runtime/state/question surfaces.

## Goal

Expose one narrow metadata layer that can express the newer terminal semantics
without breaking legacy `run_outcome` readers.

Canonical metadata lives in `explicit_terminal`. Legacy compatibility remains in
`run_outcome`.

## Canonical statuses

`explicit_terminal.status` may be one of:

- `finished`
- `blocked`
- `failed`
- `userinterlude`
- `askuserQuestion`

## Compatibility mapping

The first pass is intentionally compatibility-first.

| Canonical `explicit_terminal.status` | Legacy `run_outcome` | Meaning |
| --- | --- | --- |
| `finished` | `finish` | Successful terminal completion |
| `blocked` | `blocked_on_user` | Terminal blocked state without claiming the blocker is a structured OMX question |
| `failed` | `failed` | Terminal failure |
| `userinterlude` | `cancelled` | User-originated interruption / interlude; `cancelled` remains the legacy compatibility string |
| `askuserQuestion` | `blocked_on_user` | OMX is blocked on a model-originated structured question |

## Contract rules

1. `run_outcome` remains the compatibility field for brownfield readers.
2. `explicit_terminal` is canonical only for terminal semantics.
3. Non-terminal outcomes such as `continue` and `progress` must not carry
   `explicit_terminal`.
4. `explicit_terminal.status` and `run_outcome` must agree on the compatibility
   mapping above.
5. `cancelled` remains legacy/internal compatibility vocabulary in state files.
   Cancelled remains legacy/internal compatibility vocabulary for brownfield readers.
   User-facing canonical docs should prefer `userinterlude`.

## State and MCP exposure

`state_write` may accept:

- legacy `run_outcome`
- canonical `explicit_terminal`
- both together, as long as they are compatible

Persisted state should expose both fields for terminal states so newer and older
consumers can coexist.

## Deep-interview question lifecycle

Deep-interview does not migrate its main mode state to `askuserQuestion`.
Instead, it persists a narrow question-lifecycle compatibility surface:

- pending OMX-owned question obligation -> `deep_interview_question_lifecycle.status=askuserQuestion`
- satisfied question obligation -> `deep_interview_question_lifecycle.status=question_asked`
- cleared/aborted/error obligation -> `deep_interview_question_lifecycle.status=userinterlude`

This keeps the initial rollout narrow while still exposing the canonical
question-vs-user-interruption distinction.

## Out of scope

- Replacing every legacy `run_outcome` consumer in one change
- Redefining existing phase enums across Ralph/team/CLI
- A broad Stop-hook or watcher lifecycle redesign
