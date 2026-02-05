import type { Grammar } from "$lib/types/grammar";
import type { SLRMove, SLRTable, ReducingLabel } from "$lib/types/slr";
import type { ShiftReduceStep, ShiftReduceResult } from "$lib/types/parse";
import type { TreeNode } from "$lib/types/tree";
import { isRuleEqual } from "../utils";

let nodeIdCounter = 0;

function createNode(symbol: string, children: TreeNode[] = []): TreeNode {
    return {
        id: `node-${nodeIdCounter++}`,
        symbol,
        children
    };
}

/**
 * Tokenizes an input string for parsing
 * Splits on whitespace, handling terminals and identifiers
 */
function tokenize(input: string): string[] {
    const trimmed = input.trim();
    if (trimmed === "") return [];
    return trimmed.split(/\s+/);
}

/**
 * Formats an action for display in the trace
 */
function formatAction(move: SLRMove, reducingLabels: ReducingLabel[]): string {
    if (move === "accept") return "accept";
    if (move === "error") return "error";
    if (typeof move === "number") return `goto ${move}`;

    if (move.action === "shift") {
        return `shift ${move.state}`;
    }

    if (move.action === "reduce") {
        const [[head, bodies]] = move.rule.entries();
        const body = bodies[0];
        const label = reducingLabels.find(rl =>
            isRuleEqual(rl.rule, { head, body })
        );
        const bodyStr = body.join(" ");
        return `reduce ${label?.label || "r?"} (${head} → ${bodyStr})`;
    }

    if (move.action === "conflict") {
        // For conflicts, prefer shift over reduce (standard resolution)
        const shiftMove = move.moves.find(m =>
            typeof m === "object" && "action" in m && m.action === "shift"
        );
        if (shiftMove) {
            return formatAction(shiftMove, reducingLabels) + " (conflict resolved)";
        }
        return formatAction(move.moves[0], reducingLabels) + " (conflict)";
    }

    return "unknown";
}

/**
 * Resolves a conflict by preferring shift over reduce
 */
function resolveConflict(move: SLRMove): SLRMove {
    if (typeof move === "object" && "action" in move && move.action === "conflict") {
        // Prefer shift over reduce
        const shiftMove = move.moves.find(m =>
            typeof m === "object" && "action" in m && m.action === "shift"
        );
        if (shiftMove) return shiftMove;

        // Prefer accept
        const acceptMove = move.moves.find(m => m === "accept");
        if (acceptMove) return acceptMove;

        // Otherwise return first
        return move.moves[0];
    }
    return move;
}

/**
 * Performs shift/reduce parsing using an LR parsing table
 *
 * This algorithm works identically for SLR, LR(1), and LALR - only the table differs.
 *
 * Algorithm:
 * - Maintain state stack, symbol stack, and node stack (for tree building)
 * - On shift: push state and token, create terminal node
 * - On reduce: pop RHS symbols, create parent node, use GOTO
 * - On accept: return tree
 * - Handles conflicts by preferring shift (standard resolution)
 */
export function shiftReduceParse(
    input: string,
    table: SLRTable,
    grammar: Grammar,
    reducingLabels: ReducingLabel[]
): ShiftReduceResult {
    // Reset node counter for each parse
    nodeIdCounter = 0;

    const tokens = tokenize(input);
    const inputQueue = [...tokens, "$"];

    const stateStack: number[] = [0];
    const symbolStack: string[] = [];
    const nodeStack: TreeNode[] = [];
    const trace: ShiftReduceStep[] = [];

    // Record initial state
    trace.push({
        stateStack: [...stateStack],
        symbolStack: [...symbolStack],
        input: [...inputQueue],
        action: "start"
    });

    while (true) {
        const currentState = stateStack[stateStack.length - 1];
        const currentSymbol = inputQueue[0];

        // Get action from table
        let move = table[currentState]?.[currentSymbol];

        if (move === undefined || move === "error") {
            trace.push({
                stateStack: [...stateStack],
                symbolStack: [...symbolStack],
                input: [...inputQueue],
                action: `error: no action for state ${currentState}, symbol '${currentSymbol}'`
            });

            return {
                tree: null,
                trace,
                success: false,
                error: `Syntax error: unexpected '${currentSymbol}' in state ${currentState}`
            };
        }

        // Resolve conflicts
        move = resolveConflict(move);

        // Handle accept
        if (move === "accept") {
            trace.push({
                stateStack: [...stateStack],
                symbolStack: [...symbolStack],
                input: [...inputQueue],
                action: "accept"
            });

            // The parse tree should be the single node on the stack
            // (or we need to construct the final S' -> S reduction)
            const tree = nodeStack.length > 0 ? nodeStack[0] : null;

            return {
                tree,
                trace,
                success: true
            };
        }

        // Handle shift
        if (typeof move === "object" && "action" in move && move.action === "shift") {
            const newState = move.state;

            trace.push({
                stateStack: [...stateStack],
                symbolStack: [...symbolStack],
                input: [...inputQueue],
                action: formatAction(move, reducingLabels)
            });

            // Shift: consume input, push symbol and state
            inputQueue.shift();
            symbolStack.push(currentSymbol);
            stateStack.push(newState);

            // Create terminal node
            nodeStack.push(createNode(currentSymbol));

            continue;
        }

        // Handle reduce
        if (typeof move === "object" && "action" in move && move.action === "reduce") {
            const [[head, bodies]] = move.rule.entries();
            const body = bodies[0];
            const rhsLength = body[0] === "ε" ? 0 : body.length;

            trace.push({
                stateStack: [...stateStack],
                symbolStack: [...symbolStack],
                input: [...inputQueue],
                action: formatAction(move, reducingLabels)
            });

            // Pop RHS symbols and states
            const children: TreeNode[] = [];
            for (let i = 0; i < rhsLength; i++) {
                stateStack.pop();
                symbolStack.pop();
                // Pop from node stack in reverse order
                if (nodeStack.length > 0) {
                    children.unshift(nodeStack.pop()!);
                }
            }

            // Get goto state
            const gotoState = stateStack[stateStack.length - 1];
            const gotoAction = table[gotoState]?.[head];

            if (gotoAction === undefined || gotoAction === "error" || typeof gotoAction !== "number") {
                return {
                    tree: null,
                    trace,
                    success: false,
                    error: `Goto error: no goto for state ${gotoState}, non-terminal '${head}'`
                };
            }

            // Push new state and symbol
            symbolStack.push(head);
            stateStack.push(gotoAction);

            // Create parent node with children
            const parentNode = createNode(head, children);
            nodeStack.push(parentNode);

            continue;
        }

        // Shouldn't reach here
        return {
            tree: null,
            trace,
            success: false,
            error: `Unknown action in state ${currentState} for symbol '${currentSymbol}'`
        };
    }
}
