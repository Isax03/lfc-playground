import type { TreeNode } from "./tree";

export interface ParseStep {
    stack: string[];
    input: string[];
    production?: string;
}

export interface ParseResult {
    tree: TreeNode | null;
    trace: ParseStep[];
    success: boolean;
    error?: string;
}

/**
 * Represents a single step in shift/reduce parsing
 */
export interface ShiftReduceStep {
    stateStack: number[];
    symbolStack: string[];
    input: string[];
    action: string;
}

/**
 * Result of shift/reduce parsing
 */
export interface ShiftReduceResult {
    tree: TreeNode | null;
    trace: ShiftReduceStep[];
    success: boolean;
    error?: string;
}
