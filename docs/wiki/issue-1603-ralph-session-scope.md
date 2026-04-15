---
title: "Issue 1603: Ralph Session Scope"
tags: ["bugfix", "ralph", "session-scope", "concurrency", "state-management"]
created: 2026-04-15T05:51:41.470Z
updated: 2026-04-15T05:51:41.470Z
sources: []
links: ["project-history.md", "issue-1605-detached-leader-orphans.md"]
category: debugging
confidence: medium
schemaVersion: 1
---

# Issue 1603: Ralph Session Scope

# Issue #1603: Ralph Session Scope Leak

## Problem
Ralph assignment was leaking across concurrent OMX sessions. When prompt-submit keyword activation mirrored session-scoped Ralph state into the root canonical skill-active file, concurrent sessions without their own scoped canonical state would observe Ralph as globally active and pick up the wrong workflow overlay/stop behavior.

## Fix
- Keep existing root mirror behavior for other prompt-routed skills
- Treat session-scoped Ralph activation as session-only when no prior root canonical state exists
- Root writer now supports explicit null sentinel so callers can skip creating root canonical copy while still persisting session-scoped canonical file

## Commits

### `cb6dd261` - Merge PR #1604
Merge pull request #1604 from Yeachan-Heo/fix/issue-1603-ralph-session-scope

### `48b5d4dc` - Keep Ralph assignment scoped to activating session
**Intent**: Fix Ralph assignment leaking across concurrent OMX sessions

**Trailers**:
```
Constraint: Preserve existing team/root canonical behavior for overlapping workflow routing
Rejected: Stop writing any root canonical prompt-submit state | would widen behavior risk
Confidence: high
Scope-risk: narrow
Reversibility: clean
Directive: Session-scoped workflow activations must not silently materialize new root canonical state
Tested: npm run build; node --test dist/hooks/__tests__/keyword-detector.test.js dist/scripts/__tests__/codex-native-hook.test.js; npx biome lint
Not-tested: Full repository test suite
Co-authored-by: OpenAI Codex <codex@openai.com>
```

## References
- [[project-history]]
- [[issue-1605-detached-leader-orphans]]

