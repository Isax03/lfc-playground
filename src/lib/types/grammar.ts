/**
 * Represents a formal grammar
 * defined as a 4-tuple (N, T, S, P)
 */
export type Grammar = {
    N: Set<string>;    // Set of non-terminals
    T: Set<string>;    // Set of terminals
    S: string;         // Start symbol
    P: ProductionRule; // Map of productions
};

/**
 * Maps non-terminal symbols to their production rules
 */
export type ProductionRule = Map<string, Production[]>;

/**
 * Represents a single production rule as an array of symbols
 */
export type Production = string[];