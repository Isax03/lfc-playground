/**
 * Types for NFA, DFA, and Min-DFA automata construction from regular expressions.
 */

// ─── Regex AST ──────────────────────────────────────────────

export type RegexNode =
    | { type: 'literal'; value: string }
    | { type: 'epsilon' }
    | { type: 'concat'; left: RegexNode; right: RegexNode }
    | { type: 'union'; left: RegexNode; right: RegexNode }
    | { type: 'star'; child: RegexNode }
    | { type: 'plus'; child: RegexNode }
    | { type: 'optional'; child: RegexNode };

// ─── NFA ────────────────────────────────────────────────────

export interface NFAState {
    id: number;
}

export interface NFATransition {
    from: number;
    to: number;
    symbol: string | null; // null = ε-transition
}

export interface NFA {
    states: number[];
    alphabet: string[];
    transitions: NFATransition[];
    startState: number;
    acceptStates: number[];
}

// ─── DFA ────────────────────────────────────────────────────

export interface DFAState {
    id: string;            // e.g. "{0,1,3}"
    nfaStates: Set<number>; // the NFA states this DFA state represents
}

export interface DFATransition {
    from: string;
    to: string;
    symbol: string;
}

export interface DFA {
    states: DFAState[];
    alphabet: string[];
    transitions: DFATransition[];
    startState: string;
    acceptStates: string[];
}

// ─── Min-DFA ────────────────────────────────────────────────

export interface MinDFAState {
    id: string;
    dfaStates: string[]; // the DFA state IDs in this partition group
}

export interface MinDFATransition {
    from: string;
    to: string;
    symbol: string;
}

export interface MinDFA {
    states: MinDFAState[];
    alphabet: string[];
    transitions: MinDFATransition[];
    startState: string;
    acceptStates: string[];
}

// ─── Steps (for showing construction process) ───────────────

export interface ThompsonStep {
    description: string;
    subExpression: string;
    nfa: NFA; // snapshot of the NFA at this step
}

export interface SubsetConstructionStep {
    description: string;
    dfaStateId: string;
    nfaStates: number[];
    symbol?: string;
    targetNfaStates?: number[];
    targetDfaStateId?: string;
    isNew: boolean;
}

export interface EpsilonClosureDetail {
    stateId: string;
    inputStates: number[];
    closure: number[];
}

export interface MinimizationStep {
    description: string;
    partition: string[][]; // current partition of DFA states
    splitBlock?: string;
    splitSymbol?: string;
    newBlocks?: string[][];
}
