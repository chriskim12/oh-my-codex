import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canResumeTeamState,
  createTeamState,
  isTerminalPhase as isTerminalTeamPhase,
  type TeamPhase,
  type TerminalPhase,
} from '../orchestrator.js';
import {
  isTerminalTeamDispatchRequestStatus,
  isTerminalTeamTaskStatus,
  type TeamDispatchRequestStatus,
  type TeamTaskStatus,
} from '../contracts.js';
import { isTerminalPhase as isNotifyHookTerminalPhase } from '../../scripts/notify-hook/utils.js';

const TERMINAL_PHASES: TerminalPhase[] = ['complete', 'failed', 'cancelled'];
const NON_TERMINAL_PHASES: TeamPhase[] = ['team-plan', 'team-prd', 'team-exec', 'team-verify', 'team-fix'];
const TERMINAL_TASK_STATUSES: TeamTaskStatus[] = ['completed', 'failed'];
const NON_TERMINAL_TASK_STATUSES: TeamTaskStatus[] = ['pending', 'blocked', 'in_progress'];
const TERMINAL_DISPATCH_STATUSES: TeamDispatchRequestStatus[] = ['delivered', 'failed'];
const NON_TERMINAL_DISPATCH_STATUSES: TeamDispatchRequestStatus[] = ['pending', 'notified'];

describe('run outcome contract regressions', () => {
  it('keeps terminal phase detection aligned across central team surfaces', () => {
    for (const phase of TERMINAL_PHASES) {
      assert.equal(isTerminalTeamPhase(phase), true, `${phase} should be terminal for team orchestration`);
      assert.equal(isNotifyHookTerminalPhase(phase), true, `${phase} should be terminal for notify-hook`);
    }

    for (const phase of NON_TERMINAL_PHASES) {
      assert.equal(isTerminalTeamPhase(phase), false, `${phase} should stay non-terminal for team orchestration`);
      assert.equal(isNotifyHookTerminalPhase(phase), false, `${phase} should stay non-terminal for notify-hook`);
    }
  });

  it('treats active non-terminal team phases as resumable progress states', () => {
    for (const phase of NON_TERMINAL_PHASES) {
      const state = {
        ...createTeamState(`progress-${phase}`),
        phase,
        active: true,
      };
      assert.equal(canResumeTeamState(state), true, `${phase} should remain resumable while active`);
    }
  });

  it('treats terminal team phases as non-resumable outcomes', () => {
    for (const phase of TERMINAL_PHASES) {
      const state = {
        ...createTeamState(`terminal-${phase}`),
        phase,
        active: false,
      };
      assert.equal(canResumeTeamState(state), false, `${phase} should stop resuming once terminal`);
    }
  });

  it('keeps team task statuses split cleanly between progress and terminal outcomes', () => {
    for (const status of TERMINAL_TASK_STATUSES) {
      assert.equal(isTerminalTeamTaskStatus(status), true, `${status} should stay terminal`);
    }

    for (const status of NON_TERMINAL_TASK_STATUSES) {
      assert.equal(isTerminalTeamTaskStatus(status), false, `${status} should stay non-terminal`);
    }
  });

  it('keeps team dispatch statuses split cleanly between in-flight and terminal outcomes', () => {
    for (const status of TERMINAL_DISPATCH_STATUSES) {
      assert.equal(isTerminalTeamDispatchRequestStatus(status), true, `${status} should stay terminal`);
    }

    for (const status of NON_TERMINAL_DISPATCH_STATUSES) {
      assert.equal(isTerminalTeamDispatchRequestStatus(status), false, `${status} should stay non-terminal`);
    }
  });
});
