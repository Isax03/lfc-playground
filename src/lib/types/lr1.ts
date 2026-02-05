import type { ProductionRule } from "./grammar";

/**
 * Represents an LR(1) item with lookahead
 * Format: [A → α · β, Δ] where Δ is the lookahead set
 */
export interface LR1Item {
    head: string;           // Non-terminal A
    body: string[];         // Production body with dot marker (·)
    lookahead: Set<string>; // Lookahead terminals
}

/**
 * Represents an LR(1) closure containing kernel and body items
 */
export interface LR1Closure {
    kernel: LR1Item[];
    body: LR1Item[];
}

/**
 * Represents the LR(1) automaton with states and transitions
 */
export interface LR1Automaton {
    states: Record<string, LR1Closure>;
    transitions: Record<string, Record<string, string>>;
}

/**
 * Represents a step in building the LR(1) automaton
 */
export interface LR1AutomatonStep {
    stateId: string;
    symbol?: string;          // The symbol being processed (undefined for initial state)
    fromStateId?: string;     // The source state (undefined for initial state)
    closure?: LR1Closure;     // The full closure containing both kernel and body
    kernel?: LR1Item[];       // Just the kernel items (for existing state transitions)
    isExistingState?: boolean;
}

/**
 * Information about LALR state merging
 */
export interface LALRMergeInfo {
    mergeMap: Record<string, string[]>;  // newStateId -> [originalLR1StateIds]
}

/**
 * Result of building LR(1) automaton
 */
export interface LR1AutomatonBuildResult {
    automaton: LR1Automaton;
    steps: LR1AutomatonStep[];
    reducingLabels: import("./slr").ReducingLabel[];
}
