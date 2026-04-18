import {
  classifyRunOutcome,
  isTerminalRunOutcome,
  type RunOutcome,
  type TerminalRunOutcome,
} from './run-outcome.js';

export interface RunLoopIteration<TState> {
  outcome: unknown;
  state: TState;
}

export interface NormalizedRunLoopIteration<TState> {
  iteration: number;
  outcome: RunOutcome;
  terminal: boolean;
  state: TState;
}

export interface RunLoopTerminalResult<TState> {
  iteration: number;
  outcome: TerminalRunOutcome;
  state: TState;
  history: RunOutcome[];
}

export interface RunUntilTerminalOptions<TState> {
  maxIterations?: number;
  onIteration?: (result: NormalizedRunLoopIteration<TState>) => Promise<void> | void;
}

export async function runUntilTerminal<TState>(
  step: (iteration: number) => Promise<RunLoopIteration<TState>>,
  options: RunUntilTerminalOptions<TState> = {},
): Promise<RunLoopTerminalResult<TState>> {
  const history: RunOutcome[] = [];
  const maxIterations = options.maxIterations ?? Number.POSITIVE_INFINITY;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const raw = await step(iteration);
    const outcome = classifyRunOutcome(raw.outcome);
    history.push(outcome);

    const normalized: NormalizedRunLoopIteration<TState> = {
      iteration,
      outcome,
      terminal: isTerminalRunOutcome(outcome),
      state: raw.state,
    };

    await options.onIteration?.(normalized);

    if (normalized.terminal) {
      const terminalOutcome = normalized.outcome as TerminalRunOutcome;
      return {
        iteration,
        outcome: terminalOutcome,
        state: raw.state,
        history,
      };
    }
  }

  throw new Error(`run loop exceeded maxIterations=${maxIterations} without reaching a terminal outcome`);
}
