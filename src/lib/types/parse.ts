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
