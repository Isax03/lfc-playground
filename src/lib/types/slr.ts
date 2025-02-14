import { TreePine } from "lucide-svelte";
import type { ProductionRule } from "./grammar";

/**
 * Represents a move to make in an SLR parsing table
 */
export type SLRMove = 'accept' | 'error' | { action: 'shift'; state: number } | { action: 'reduce'; rule: ProductionRule };

/**
 * Represents an SLR parsing table where each cell contains
 * the move to make for a given state and lookahead
 */
export type SLRTable = Record<string, Record<string, SLRMove>>;

export type Closure = {
    kernel: ProductionRule;
    body: ProductionRule;
}

export type StatesAutomaton = {
	states: Record<string, Closure>; 						// state -> closure
	transitions: Record<string, Record<string, string>>; 	// state -> symbol -> next state
}

export type AutomatonStep = {
    stateId: string;
    symbol?: string;          // The symbol being processed (undefined for initial state)
    fromStateId?: string;     // The source state (undefined for initial state)
    closure?: Closure;        // The full closure containing both kernel and body
    kernel?: ProductionRule;  // Add this
    isExistingState?: boolean;  // Add this
}

export type AutomatonBuildResult = {
    automaton: StatesAutomaton;
    steps: AutomatonStep[];
}
