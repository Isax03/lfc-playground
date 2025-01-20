export type Grammar = {
    N: Set<string>;    // Set of non-terminals
    T: Set<string>;    // Set of terminals
    S: string;         // Start symbol
    P: ProductionRule; // Map of productions
};

export type ProductionRule = Map<string, Production[]>; // Productions map from driver to array of productions

export type Production = string[];