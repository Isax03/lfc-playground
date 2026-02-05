import type { Grammar } from "$lib/types/grammar";
import type { ReducingLabel, SLRMove, SLRTable } from "$lib/types/slr";
import type { LR1Automaton, LR1Closure, LR1Item } from "$lib/types/lr1";
import { isRuleEqual } from "../utils";
import { getAllItems } from "./closure";

/**
 * Merges two moves, creating a conflict if needed
 */
function mergeMove(existing: SLRMove, newMove: SLRMove): SLRMove {
    // If one is error, return the other
    if (existing === "error") return newMove;
    if (newMove === "error") return existing;

    // If already a conflict, add the new move
    if (typeof existing === "object" && "action" in existing && existing.action === "conflict") {
        return {
            action: "conflict",
            moves: [...existing.moves, newMove].sort((a, b) => {
                if (a === "accept") return -1;
                if (b === "accept") return 1;
                if (typeof a === "number" || typeof b === "number") return 0;
                if (typeof a === "string") return 1;
                if (typeof b === "string") return -1;
                if (a.action === "shift" && b.action === "reduce") return -1;
                if (a.action === "reduce" && b.action === "shift") return 1;
                return 0;
            })
        };
    }

    // Create a new conflict
    return {
        action: "conflict",
        moves: [existing, newMove].sort((a, b) => {
            if (a === "accept") return -1;
            if (b === "accept") return 1;
            if (typeof a === "number" || typeof b === "number") return 0;
            if (a.action === "shift" && b.action === "reduce") return -1;
            if (a.action === "reduce" && b.action === "shift") return 1;
            return 0;
        })
    };
}

/**
 * Finds reducing items in a state with their lookahead sets
 * This is the key difference from SLR - we return the item's lookahead, not FOLLOW(head)
 */
function findReducingItemsWithLookahead(state: LR1Closure): {
    head: string;
    body: string[];
    lookahead: Set<string>;
}[] {
    const items: { head: string; body: string[]; lookahead: Set<string> }[] = [];
    const allItems = getAllItems(state);

    for (const item of allItems) {
        // Check for epsilon reduction (body is just "·")
        if (item.body.length === 1 && item.body[0] === "·") {
            items.push({
                head: item.head,
                body: ["ε"],
                lookahead: new Set(item.lookahead)
            });
        } else if (item.body[item.body.length - 1] === "·") {
            // Normal reduction
            items.push({
                head: item.head,
                body: item.body.filter(s => s !== "·"),
                lookahead: new Set(item.lookahead)
            });
        }
    }

    return items;
}

/**
 * Checks if a state has the accept item [S' → S ·, {$}]
 */
function hasAcceptItem(state: LR1Closure): boolean {
    const allItems = getAllItems(state);
    return allItems.some(item =>
        item.head === "S'" &&
        item.body.length === 2 &&
        item.body[0] === "S" &&
        item.body[1] === "·" &&
        item.lookahead.has("$")
    );
}

/**
 * Computes the LR(1) parsing table
 *
 * KEY DIFFERENCE FROM SLR:
 * - In SLR, we reduce on FOLLOW(A) for item [A → α ·]
 * - In LR(1), we reduce only on the item's lookahead set Δ for item [A → α ·, Δ]
 *
 * This results in fewer conflicts because lookahead is more precise than FOLLOW
 */
export function computeLR1Table(
    automaton: LR1Automaton,
    reducingLabels: ReducingLabel[],
    grammar: Grammar
): { table: SLRTable; hasConflicts: boolean } {
    const table: SLRTable = {};
    let hasConflicts = false;

    // Initialize table cells
    for (const stateId of Object.keys(automaton.states)) {
        table[stateId] = {};
        // Initialize terminals + $
        for (const terminal of grammar.T) {
            table[stateId][terminal] = "error";
        }
        table[stateId]["$"] = "error";
        // Initialize non-terminals
        for (const nonTerminal of grammar.N) {
            table[stateId][nonTerminal] = "error";
        }
    }

    // Process transitions for shifts and gotos
    for (const [stateId, transitions] of Object.entries(automaton.transitions)) {
        for (const [symbol, targetState] of Object.entries(transitions)) {
            if (grammar.T.has(symbol)) {
                // Shift for terminals
                const move: SLRMove = { action: "shift", state: parseInt(targetState) };
                if (table[stateId][symbol] !== "error") {
                    hasConflicts = true;
                    table[stateId][symbol] = mergeMove(table[stateId][symbol], move);
                } else {
                    table[stateId][symbol] = move;
                }
            } else {
                // Goto for non-terminals
                table[stateId][symbol] = parseInt(targetState);
            }
        }
    }

    // Process reducing items
    for (const [stateId, state] of Object.entries(automaton.states)) {
        // Check for accepting state (S' → S ·)
        const isAcceptState = hasAcceptItem(state);

        if (isAcceptState) {
            // Add accept action for $
            if (table[stateId]["$"] !== "error") {
                hasConflicts = true;
                table[stateId]["$"] = mergeMove(table[stateId]["$"], "accept");
            } else {
                table[stateId]["$"] = "accept";
            }
        }

        // Find reducing items with their lookahead
        const reducingItems = findReducingItemsWithLookahead(state);

        for (const item of reducingItems) {
            // Skip the augmented start production
            if (item.head === "S'") continue;

            const label = reducingLabels.find(rl =>
                isRuleEqual(rl.rule, { head: item.head, body: item.body })
            );
            if (!label) continue;

            const reduceMove: SLRMove = {
                action: "reduce",
                rule: new Map([[item.head, [item.body]]])
            };

            // KEY DIFFERENCE: Use item's lookahead, NOT FOLLOW(head)
            for (const symbol of item.lookahead) {
                if (table[stateId][symbol] !== "error") {
                    hasConflicts = true;
                    table[stateId][symbol] = mergeMove(table[stateId][symbol], reduceMove);
                } else {
                    table[stateId][symbol] = reduceMove;
                }
            }
        }
    }

    return { table, hasConflicts };
}
