import { type ProductionRule } from "./grammar";

/**
 * Represents an LL(1) parsing table where each cell contains
 * the production rule to use for a given non-terminal and lookahead
 */
export type LL1Table = Record<string, Record<string, ProductionRule>>;