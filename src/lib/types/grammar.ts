export type Grammar = {
    N: Set<string>; // Set of non-terminals
    T: Set<string>; // Set of terminals
    S: string;      // Start symbol
    P: ProductionRule[]; // Set of productions
};

export type ProductionRule = {
    driver: string; // Left-hand side of the production
    productions: string[][]; // Right-hand side (array of symbols)
};