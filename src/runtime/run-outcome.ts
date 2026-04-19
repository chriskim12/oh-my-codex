export const TERMINAL_RUN_OUTCOMES = [
  'finish',
  'blocked_on_user',
  'failed',
  'cancelled',
] as const;

export const NON_TERMINAL_RUN_OUTCOMES = [
  'progress',
  'continue',
] as const;

export const RUN_OUTCOMES = [
  ...NON_TERMINAL_RUN_OUTCOMES,
  ...TERMINAL_RUN_OUTCOMES,
] as const;

export type TerminalRunOutcome = (typeof TERMINAL_RUN_OUTCOMES)[number];
export type NonTerminalRunOutcome = (typeof NON_TERMINAL_RUN_OUTCOMES)[number];
export type RunOutcome = (typeof RUN_OUTCOMES)[number];

export const EXPLICIT_TERMINAL_LIFECYCLE_STATUSES = [
  'finished',
  'blocked',
  'failed',
  'userinterlude',
  'askuserQuestion',
] as const;

export type ExplicitTerminalLifecycleStatus =
  (typeof EXPLICIT_TERMINAL_LIFECYCLE_STATUSES)[number];

export interface ExplicitTerminalLifecycle {
  status: ExplicitTerminalLifecycleStatus;
  legacy_run_outcome: TerminalRunOutcome;
}

const TERMINAL_RUN_OUTCOME_SET = new Set<string>(TERMINAL_RUN_OUTCOMES);
const NON_TERMINAL_RUN_OUTCOME_SET = new Set<string>(NON_TERMINAL_RUN_OUTCOMES);
const RUN_OUTCOME_SET = new Set<string>(RUN_OUTCOMES);
const EXPLICIT_TERMINAL_LIFECYCLE_STATUS_SET = new Set<string>(EXPLICIT_TERMINAL_LIFECYCLE_STATUSES);

const RUN_OUTCOME_ALIASES: Readonly<Record<string, RunOutcome>> = {
  finish: 'finish',
  finished: 'finish',
  complete: 'finish',
  completed: 'finish',
  done: 'finish',
  blocked: 'blocked_on_user',
  'blocked-on-user': 'blocked_on_user',
  blocked_on_user: 'blocked_on_user',
  failed: 'failed',
  fail: 'failed',
  error: 'failed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  cancel: 'cancelled',
  aborted: 'cancelled',
  abort: 'cancelled',
  progress: 'progress',
  continue: 'continue',
  continued: 'continue',
} as const;

const TERMINAL_PHASE_TO_RUN_OUTCOME: Readonly<Record<string, TerminalRunOutcome>> = {
  complete: 'finish',
  completed: 'finish',
  blocked: 'blocked_on_user',
  blocked_on_user: 'blocked_on_user',
  'blocked-on-user': 'blocked_on_user',
  failed: 'failed',
  cancelled: 'cancelled',
  cancel: 'cancelled',
};

const EXPLICIT_TERMINAL_LIFECYCLE_ALIASES: Readonly<Record<string, ExplicitTerminalLifecycleStatus>> = {
  finished: 'finished',
  finish: 'finished',
  complete: 'finished',
  completed: 'finished',
  done: 'finished',
  blocked: 'blocked',
  blocked_on_user: 'blocked',
  'blocked-on-user': 'blocked',
  failed: 'failed',
  fail: 'failed',
  error: 'failed',
  userinterlude: 'userinterlude',
  user_interlude: 'userinterlude',
  'user-interlude': 'userinterlude',
  cancelled: 'userinterlude',
  canceled: 'userinterlude',
  cancel: 'userinterlude',
  aborted: 'userinterlude',
  abort: 'userinterlude',
  askuserquestion: 'askuserQuestion',
  ask_user_question: 'askuserQuestion',
  'ask-user-question': 'askuserQuestion',
  omxquestion: 'askuserQuestion',
  'omx-question': 'askuserQuestion',
} as const;

const EXPLICIT_TERMINAL_LIFECYCLE_TO_RUN_OUTCOME: Readonly<Record<ExplicitTerminalLifecycleStatus, TerminalRunOutcome>> = {
  finished: 'finish',
  blocked: 'blocked_on_user',
  failed: 'failed',
  userinterlude: 'cancelled',
  askuserQuestion: 'blocked_on_user',
} as const;

const RUN_OUTCOME_TO_EXPLICIT_TERMINAL_LIFECYCLE: Readonly<Record<TerminalRunOutcome, ExplicitTerminalLifecycleStatus>> = {
  finish: 'finished',
  blocked_on_user: 'blocked',
  failed: 'failed',
  cancelled: 'userinterlude',
} as const;

export interface RunOutcomeNormalizationResult {
  outcome?: RunOutcome;
  warning?: string;
  error?: string;
}

export interface ExplicitTerminalLifecycleNormalizationResult {
  lifecycle?: ExplicitTerminalLifecycle;
  warning?: string;
  error?: string;
}

export interface RunOutcomeValidationResult {
  ok: boolean;
  state?: Record<string, unknown>;
  warning?: string;
  error?: string;
}

function normalizeRunOutcomeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeExplicitTerminalLifecycleStatusValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeTerminalRunOutcome(
  value: unknown,
): { outcome?: TerminalRunOutcome; warning?: string; error?: string } {
  const normalized = normalizeRunOutcome(value);
  if (!normalized.outcome) {
    return normalized.error ? { error: normalized.error } : {};
  }
  if (!isTerminalRunOutcome(normalized.outcome)) {
    return { error: `explicit_terminal legacy_run_outcome must be terminal, got "${normalized.outcome}"` };
  }
  return { outcome: normalized.outcome, warning: normalized.warning };
}

export function normalizeRunOutcome(value: unknown): RunOutcomeNormalizationResult {
  const normalized = normalizeRunOutcomeValue(value);
  if (!normalized) return {};
  if (RUN_OUTCOME_SET.has(normalized)) {
    return { outcome: normalized as RunOutcome };
  }
  const alias = RUN_OUTCOME_ALIASES[normalized];
  if (alias) {
    return {
      outcome: alias,
      warning: `normalized legacy run outcome "${value}" -> "${alias}"`,
    };
  }
  return { error: `run_outcome must be one of: ${RUN_OUTCOMES.join(', ')}` };
}

export function explicitTerminalLifecycleFromRunOutcome(
  value: unknown,
): ExplicitTerminalLifecycle | undefined {
  const normalized = normalizeTerminalRunOutcome(value).outcome;
  if (!normalized) return undefined;
  return {
    status: RUN_OUTCOME_TO_EXPLICIT_TERMINAL_LIFECYCLE[normalized],
    legacy_run_outcome: normalized,
  };
}

export function normalizeExplicitTerminalLifecycle(
  value: unknown,
): ExplicitTerminalLifecycleNormalizationResult {
  if (value == null) return {};

  if (typeof value === 'string') {
    const normalized = normalizeExplicitTerminalLifecycleStatusValue(value);
    if (!normalized) return {};
    if (EXPLICIT_TERMINAL_LIFECYCLE_STATUS_SET.has(normalized)) {
      const status = normalized as ExplicitTerminalLifecycleStatus;
      return {
        lifecycle: {
          status,
          legacy_run_outcome: EXPLICIT_TERMINAL_LIFECYCLE_TO_RUN_OUTCOME[status],
        },
      };
    }
    const alias = EXPLICIT_TERMINAL_LIFECYCLE_ALIASES[normalized];
    if (alias) {
      return {
        lifecycle: {
          status: alias,
          legacy_run_outcome: EXPLICIT_TERMINAL_LIFECYCLE_TO_RUN_OUTCOME[alias],
        },
        warning: `normalized explicit_terminal "${value}" -> "${alias}"`,
      };
    }
    return {
      error: `explicit_terminal.status must be one of: ${EXPLICIT_TERMINAL_LIFECYCLE_STATUSES.join(', ')}`,
    };
  }

  if (typeof value !== 'object') {
    return {
      error: `explicit_terminal must be a string or object with status/legacy_run_outcome`,
    };
  }

  const candidate = value as Record<string, unknown>;
  const statusValue = candidate.status;
  const legacyValue = candidate.legacy_run_outcome ?? candidate.run_outcome;

  const normalizedStatus = normalizeExplicitTerminalLifecycle(statusValue);
  const normalizedLegacy = normalizeTerminalRunOutcome(legacyValue);

  if (normalizedStatus.error) return normalizedStatus;
  if (normalizedLegacy.error) return normalizedLegacy;

  const status = normalizedStatus.lifecycle?.status;
  const legacyRunOutcome = normalizedLegacy.outcome;

  if (!status && !legacyRunOutcome) return {};

  const derivedLifecycle = status
    ? {
      status,
      legacy_run_outcome: EXPLICIT_TERMINAL_LIFECYCLE_TO_RUN_OUTCOME[status],
    }
    : explicitTerminalLifecycleFromRunOutcome(legacyRunOutcome);

  if (!derivedLifecycle) {
    return {
      error: `explicit_terminal must include status or legacy_run_outcome`,
    };
  }

  if (legacyRunOutcome && derivedLifecycle.legacy_run_outcome !== legacyRunOutcome) {
    return {
      error: `explicit_terminal.status "${derivedLifecycle.status}" maps to legacy run_outcome "${derivedLifecycle.legacy_run_outcome}", not "${legacyRunOutcome}"`,
    };
  }

  return {
    lifecycle: derivedLifecycle,
    warning: normalizedStatus.warning ?? normalizedLegacy.warning,
  };
}

export function classifyRunOutcome(value: unknown): RunOutcome {
  return normalizeRunOutcome(value).outcome ?? 'progress';
}

export function isTerminalRunOutcome(value: unknown): value is TerminalRunOutcome {
  const normalized = normalizeRunOutcome(value).outcome;
  return normalized !== undefined && TERMINAL_RUN_OUTCOME_SET.has(normalized);
}

export function isNonTerminalRunOutcome(value: unknown): value is NonTerminalRunOutcome {
  const normalized = normalizeRunOutcome(value).outcome;
  return normalized !== undefined && NON_TERMINAL_RUN_OUTCOME_SET.has(normalized);
}

export function isNonTerminalRunState(value: unknown): boolean {
  return isNonTerminalRunOutcome(classifyRunOutcome(value));
}

export function isTerminalRunState(value: unknown): boolean {
  return isTerminalRunOutcome(classifyRunOutcome(value));
}

export function inferRunOutcome(candidate: Record<string, unknown>): RunOutcome {
  const explicit = normalizeRunOutcome(candidate.run_outcome);
  if (explicit.outcome) return explicit.outcome;

  const phase = safeString(candidate.current_phase).toLowerCase();
  if (phase && TERMINAL_PHASE_TO_RUN_OUTCOME[phase]) {
    return TERMINAL_PHASE_TO_RUN_OUTCOME[phase];
  }

  if (candidate.active === true) return 'continue';
  if (safeString(candidate.completed_at)) return 'finish';
  if (candidate.active === false) return 'finish';
  return 'continue';
}

export function applyRunOutcomeContract(
  candidate: Record<string, unknown>,
  options?: { nowIso?: string },
): RunOutcomeValidationResult {
  const nowIso = options?.nowIso ?? new Date().toISOString();
  const next: Record<string, unknown> = { ...candidate };
  const normalized = normalizeRunOutcome(next.run_outcome);
  if (normalized.error) return { ok: false, error: normalized.error };
  const normalizedExplicitTerminal = normalizeExplicitTerminalLifecycle(next.explicit_terminal);
  if (normalizedExplicitTerminal.error) {
    return { ok: false, error: normalizedExplicitTerminal.error };
  }

  const outcome = normalized.outcome
    ?? normalizedExplicitTerminal.lifecycle?.legacy_run_outcome
    ?? inferRunOutcome(next);
  next.run_outcome = outcome;

  if (isTerminalRunOutcome(outcome)) {
    if (next.active === true) {
      return { ok: false, error: `terminal run outcome "${outcome}" requires active=false` };
    }
    next.active = false;
    if (!safeString(next.completed_at)) {
      next.completed_at = nowIso;
    }
  } else {
    if (next.active === false) {
      return { ok: false, error: `non-terminal run outcome "${outcome}" requires active=true` };
    }
    next.active = true;
    if (safeString(next.completed_at)) {
      delete next.completed_at;
    }
  }

  const explicitTerminal = normalizedExplicitTerminal.lifecycle
    ?? explicitTerminalLifecycleFromRunOutcome(outcome);

  if (explicitTerminal) {
    if (isTerminalRunOutcome(outcome) && explicitTerminal.legacy_run_outcome !== outcome) {
      return {
        ok: false,
        error: `explicit_terminal.status "${explicitTerminal.status}" is incompatible with run_outcome "${outcome}"`,
      };
    }
    next.explicit_terminal = explicitTerminal;
  } else {
    delete next.explicit_terminal;
  }

  return {
    ok: true,
    state: next,
    warning: normalized.warning ?? normalizedExplicitTerminal.warning,
  };
}
