---
title: "Adapt System"
tags: ["architecture", "adapt", "hermes", "openclaw", "integration", "runtime"]
created: 2026-04-15T05:51:57.912Z
updated: 2026-04-15T05:51:57.912Z
sources: []
links: ["project-history.md", "issue-1605-detached-leader-orphans.md", "issue-1603-ralph-session-scope.md"]
category: architecture
confidence: medium
schemaVersion: 1
---

# Adapt System

# Adapt System Architecture

The Adapt system provides runtime discovery and integration with external systems (Hermes, OpenClaw) while keeping OMX-owned boundaries clear.

## Core Principles

### 1. Read-Only External Integration
- Hermes: read-only over HERMES_HOME
- OpenClaw: local observation only
- No mutation of external runtime state

### 2. OMX-Owned Foundation
All adapter outputs live in OMX-owned artifacts under `.omx/`. External runtimes are never modified.

### 3. Contract-Based Boundaries
Each adapter defines clear read/write contracts:
- What it reads from external runtime
- What it writes to OMX-owned surfaces
- Explicit rejection of mutation scopes outside contract

## Components

### Foundation Layer (`adapt/foundation`)
Shared infrastructure for all adapters:
- Probe/status/envelope/bootstrap patterns
- Common evidence collection
- Adapter-owned output generation

### Hermes Adapter (`adapt/hermes`)
- Extends shared adapt foundation
- Reads ACP, gateway, and session-store evidence
- Hermes remains external; OMX never mutates Hermes internals
- Constraint: Keep Hermes integration read-only over HERMES_HOME

### OpenClaw Adapter (`adapt/openclaw`)
- Local observation of OpenClaw environment/config/gateway
- Lifecycle bridge metadata
- Adapter-owned bootstrap output
- Honors `OMX_OPENCLAW_COMMAND=1` for command-gateway readiness

## Recent Development

### PR #1598 - Hermes Adapt Follow-on
- Honored supplied cwd for Hermes adapt discovery
- Added Hermes runtime evidence to adapt reports
- Regression test ensures buildAdaptProbeReportForTarget() resolves against supplied temp-dir cwd

### PR #1599 - OpenClaw Adapt Follow-on  
- Added local OpenClaw observation to adapt surface
- Deferred stub replaced with actual implementation

### PR #1600 - Adapt Foundation
- Established OMX-owned foundation for persistent adapter targets
- Reject inherited adapt registry targets during validation

## Design Decisions

### Rejected Alternatives
- **Full Hermes control-plane mutation**: Outside MVP thin-adapter contract
- **Echo gateway URLs in adapt output**: Leaks operational details beyond needed readiness evidence
- **Reuse notifications module as broader integration surface**: Unnecessary scope drift

## References
- [[project-history]]
- [[issue-1605-detached-leader-orphans]]
- [[issue-1603-ralph-session-scope]]

