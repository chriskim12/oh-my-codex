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

const TERMINAL_RUN_OUTCOME_SET = new Set<string>(TERMINAL_RUN_OUTCOMES);
const NON_TERMINAL_RUN_OUTCOME_SET = new Set<string>(NON_TERMINAL_RUN_OUTCOMES);

const RUN_OUTCOME_ALIASES: Readonly<Record<string, RunOutcome>> = {
  finish: 'finish',
  finished: 'finish',
  complete: 'finish',
  completed: 'finish',
  done: 'finish',
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

function normalizeRunOutcomeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeRunOutcome(value: unknown): RunOutcome | null {
  const normalized = normalizeRunOutcomeValue(value);
  if (!normalized) return null;
  return RUN_OUTCOME_ALIASES[normalized] ?? null;
}

export function classifyRunOutcome(value: unknown): RunOutcome {
  return normalizeRunOutcome(value) ?? 'progress';
}

export function isTerminalRunOutcome(value: unknown): value is TerminalRunOutcome {
  const normalized = normalizeRunOutcome(value);
  return normalized !== null && TERMINAL_RUN_OUTCOME_SET.has(normalized);
}

export function isNonTerminalRunOutcome(value: unknown): value is NonTerminalRunOutcome {
  const normalized = normalizeRunOutcome(value);
  return normalized !== null && NON_TERMINAL_RUN_OUTCOME_SET.has(normalized);
}

export function isNonTerminalRunState(value: unknown): boolean {
  return isNonTerminalRunOutcome(classifyRunOutcome(value));
}

export function isTerminalRunState(value: unknown): boolean {
  return isTerminalRunOutcome(classifyRunOutcome(value));
}
