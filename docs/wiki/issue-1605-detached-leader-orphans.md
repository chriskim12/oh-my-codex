---
title: "Issue 1605: Detached Leader Orphans"
tags: ["bugfix", "tmux", "signal-handling", "orphaned-process", "detached-leader"]
created: 2026-04-15T05:51:34.943Z
updated: 2026-04-15T05:51:34.943Z
sources: []
links: ["project-history.md"]
category: debugging
confidence: medium
schemaVersion: 1
---

# Issue 1605: Detached Leader Orphans

# Issue #1605: Detached Leader Orphans Codex

## Problem
When a detached session leader shell exits on signal (SIGHUP), the codex child process was being orphaned - reparented to PID 1 and left running indefinitely, sometimes spinning at 100% CPU.

## Root Cause
The detached session leader shell registered its cleanup only on the EXIT pseudo-signal (0) and ran codex as a synchronous foreground child. When tmux delivered SIGHUP to the leader (e.g., external `tmux kill-session`, server crash), the shell terminated but the codex process — which does not propagate SIGHUP — continued running.

## Fix
- Run codex in the background, capture its PID, and `wait` on it
- Register cleanup trap on INT/TERM/HUP in addition to EXIT
- Cleanup function explicitly TERM the codex child before tearing down tmux extended-keys lease and session

## Commits

### `08f57d2d` - Merge PR #1605
Merge pull request #1605 from lifrary/fix/detached-leader-orphans-codex

### `4e5a810d` - Stabilize detached leader signal regression coverage
**Intent**: Fix regression test that was signaling the outer harness shell instead of the exec-replaced leader process.

**Details**: The test was polling PID liveness in a way that can misread zombie timing.

**Changes**: 
- Make harness exec into leader command before signaling
- Wait for leader exit event
- Assert child PID resolves to ESRCH afterwards

**Trailers**:
```
Constraint: Keep production fix unchanged; limit to regression test
Rejected: Add sleeps/retry budget only | masks harness topology bug
Confidence: high
Scope-risk: narrow
Reversibility: clean
Directive: Signal real leader process; avoid kill(pid, 0) polling as completion oracle
Tested: npm run build; node --test dist/cli/__tests__/index.test.js --test-name-pattern='detached leader'
Not-tested: Full GitHub Actions matrix rerun
```

### `42a83fa9` - Fix: terminate codex child when detached leader shell exits on signal
**Intent**: Prevent orphaned codex processes when detached leader receives SIGHUP

**Trailers**:
```
Constraint: Preserve existing behavior for non-signal exits
Rejected: Signal propagation from codex | codex doesn't handle HUP propagation
Confidence: high
Scope-risk: narrow
Reversibility: clean
Directive: Background child processes need explicit cleanup traps on all signals
Tested: npm run build; regression test for signal termination
Not-tested: Live tmux server crash scenarios
```

## References
- [[project-history]]

