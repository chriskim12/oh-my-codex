---
title: "Repository Structure"
tags: ["git", "branches", "tags", "remotes", "config", "structure"]
created: 2026-04-15T06:07:35.697Z
updated: 2026-04-15T06:07:35.697Z
sources: []
links: []
category: environment
confidence: high
schemaVersion: 1
---

# Repository Structure

# Repository Structure

Complete overview of branches, tags, and remotes for the oh-my-codex project.

## Remotes

| Remote | URL | Purpose |
|--------|-----|---------|
| origin | https://github.com/Yeachan-Heo/oh-my-codex.git | Primary upstream |
| Yeachan-Heo | https://github.com/Yeachan-Heo/oh-my-codex.git | Author's fork |
| letsjo | https://github.com/letsjo/oh-my-codex.git | Contributor fork |
| pr902 | https://github.com/simjaemun2/oh-my-codex.git | PR #902 contributor |
| reviewer-fork | https://github.com/lifrary/oh-my-codex.git | Reviewer fork |

## GitHub Repository Info

```json
{
  "name": "oh-my-codex",
  "owner": {
    "id": "MDQ6VXNlcjU0NzU3NzA3",
    "login": "Yeachan-Heo"
  },
  "url": "https://github.com/Yeachan-Heo/oh-my-codex"
}
```

## Branch Statistics

- **Total branches**: 1,528
- **Local branches**: ~50
- **Remote tracking branches**: ~1,478

### Main Branches

| Branch | Remote | Description |
|--------|--------|-------------|
| `master` | Yeachan-Heo | Legacy default branch |
| `main` | Yeachan-Heo | Current default branch |
| `dev` | Yeachan-Heo | Development branch |

### Feature/Fix Branch Categories

**Active Development Prefixes:**
- `feat/` - Feature branches
- `fix/` - Bug fix branches
- `refactor/` - Refactoring branches
- `docs/` - Documentation branches
- `test/` - Test coverage branches
- `chore/` - Maintenance branches

**Recent Active Branches:**
- `fix/issue-1603-ralph-session-scope`
- `fix/issue-1605-detached-leader-orphans-codex`
- `fix/adapt-hermes`
- `fix/adapt-openclaw`
- `fix/adapt-foundation`

## Tags

- **Total tags**: 85
- **Version tags**: Following semver pattern `vX.Y.Z`

### Recent Version Tags

| Tag | Commit | Description |
|-----|--------|-------------|
| v0.12.6 | `3db01bc6` | Release 0.12.6 |

## Merge History

- **Total merge commits**: 564
- **Recent merge activity**: High volume in April 2026

### Merge Patterns

Most merges follow the PR workflow:
1. Feature/fix branch created from `main` or `dev`
2. Development work committed with Lore protocol
3. PR opened against upstream
4. Review and approval
5. Merge to `main` with merge commit

## Key Configuration

```
branch.master.remote=Yeachan-Heo
branch.master.merge=refs/heads/master
branch.main.remote=Yeachan-Heo
branch.main.merge=refs/heads/main
branch.dev.remote=Yeachan-Heo
branch.dev.merge=refs/heads/dev
```

---

*Last updated: 2026-04-15*
*Auto-generated from git config analysis*
