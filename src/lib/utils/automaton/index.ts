/**
 * Main entry point for all automaton operations.
 * Provides pipeline functions: regex → NFA → DFA → Min-DFA
 */

export { parseRegex, regexToString } from './regex-parser';
export { thompsonConstruction } from './thompson';
export { subsetConstruction, epsilonClosure } from './subset-construction';
export { minimizeDFA } from './minimization';
