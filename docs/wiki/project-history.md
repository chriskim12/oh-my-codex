---
title: "Project History"
tags: ["git", "history", "commits", "pull-requests", "changelog"]
created: 2026-04-15T05:51:25.752Z
updated: 2026-04-15T05:51:25.752Z
sources: []
links: []
category: environment
confidence: medium
schemaVersion: 1
---

# Project History

# Project History

This page tracks the commit and pull request history for the oh-my-codex (OMX) project.

## Repository
- **Name**: oh-my-codex
- **Path**: /mnt/offloading/Workspace/oh-my-codex.omx-worktrees/launch-test-wiki-init

## Recent Commits

### Merge Pull Requests

| PR # | Commit | Branch | Description |
|------|--------|--------|-------------|
| #1605 | `08f57d2d` | `lifrary/fix/detached-leader-orphans-codex` | Fix: terminate codex child when detached leader shell exits on signal |
| #1604 | `cb6dd261` | `Yeachan-Heo/fix/issue-1603-ralph-session-scope` | Fix Ralph assignment leaking across concurrent OMX sessions |
| #1598 | `84add801` | `Yeachan-Heo/fix/adapt-hermes` | feat: add Hermes adapt follow-on |
| #1599 | `4bcfbcf8` | `Yeachan-Heo/fix/adapt-openclaw` | feat: add OpenClaw adapt follow-on |
| #1600 | `7b08d75b` | `Yeachan-Heo/fix/adapt-foundation` | Establish an OMX-owned foundation for persistent adapter targets |
| #1596 | `f5b088fc` | `Yeachan-Heo/fix/issue-1594-state-write-transport` | Fix issue 1594 state write transport |
| #1595 | `9644fb29` | `Yeachan-Heo/fix/issue-1492-startup-inbox-dispatch-lock` | Lock queued Codex startup banners behind a regression test |
| #1591 | `adec5ad1` | `Yeachan-Heo/fix/issue-1583-tmux-ralph-nudge-state` | Fix tmux Ralph nudge state |
| #1590 | `72283bea` | `Yeachan-Heo/fix/issue-1584-native-stop-permission-seeking` | Fix native stop permission seeking |
| #1589 | `e3c95412` | `Yeachan-Heo/fix/issue-1581-windows-cleanup` | Fix Windows cleanup |

## Key Contributors

- **Yeachan-Heo**: Adapt system improvements, session scope fixes, state management
- **lifrary**: Detached leader signal handling

## Recent Development Themes

### Adapt System Expansion
Recent work has focused on extending the adapt system to support external runtimes:
- Hermes integration (read-only over HERMES_HOME)
- OpenClaw local observation
- Foundation layer for persistent adapter targets

### Session & State Management
- Ralph session scoping fixes to prevent cross-session leaks
- State write transport improvements
- Detached leader signal handling for tmux sessions

### Testing & Reliability
- Regression test coverage for signal handling
- Detached leader child process lifecycle management

---

*Last updated: 2026-04-15*
*Auto-generated from git history*
