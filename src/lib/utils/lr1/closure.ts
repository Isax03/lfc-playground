import type { Grammar } from "$lib/types/grammar";
import type { FirstSets } from "$lib/types/first-follow";
import type { LR1Item, LR1Closure } from "$lib/types/lr1";
import { computeFirstForSequence } from "../first-follow/first";

/**
 * Creates a marked production (with dot at the beginning)
 */
function markProduction(prod: string[]): string[] {
    // Special case for epsilon productions
    if (prod.length === 1 && prod[0] === "ε") {
        return ["·"];
    }
    return ["·", ...prod];
}

/**
 * Checks if two LR(1) items have the same core (ignoring lookahead)
 */
function itemCoreEquals(item1: LR1Item, item2: LR1Item): boolean {
    if (item1.head !== item2.head) return false;
    if (item1.body.length !== item2.body.length) return false;
    return item1.body.every((s, i) => s === item2.body[i]);
}

/**
 * Finds an item with the same core in a list
 */
function findItemWithSameCore(items: LR1Item[], item: LR1Item): LR1Item | undefined {
    return items.find(i => itemCoreEquals(i, item));
}

/**
 * Merges lookahead sets for items with the same core
 * Returns true if any new lookahead was added
 */
function mergeLookahead(existing: LR1Item, newItem: LR1Item): boolean {
    const originalSize = existing.lookahead.size;
    for (const la of newItem.lookahead) {
        existing.lookahead.add(la);
    }
    return existing.lookahead.size > originalSize;
}

/**
 * Computes the LR(1) closure of a set of LR(1) items
 *
 * For item [A → α · B β, Δ], we add [B → · γ, FIRST(βΔ)] for each B → γ
 * where FIRST(βΔ) = FIRST(β) if ε ∉ FIRST(β), else (FIRST(β) - {ε}) ∪ Δ
 */
export function closure1(
    grammar: Grammar,
    items: LR1Item[],
    firstSets: FirstSets
): LR1Closure {
    const result: LR1Closure = {
        kernel: items.map(item => ({
            head: item.head,
            body: [...item.body],
            lookahead: new Set(item.lookahead)
        })),
        body: []
    };

    // Queue of items to process (both kernel and body)
    const unmarked: LR1Item[] = items.map(item => ({
        head: item.head,
        body: [...item.body],
        lookahead: new Set(item.lookahead)
    }));

    while (unmarked.length > 0) {
        const item = unmarked.shift()!;

        // Find the dot position
        const dotIndex = item.body.findIndex(s => s === "·");

        // If dot is at the end, this is a reducing item - nothing to expand
        if (dotIndex === item.body.length - 1) continue;

        // Get the symbol after the dot
        const nextSymbol = item.body[dotIndex + 1];

        // Only process non-terminals
        if (!grammar.N.has(nextSymbol)) continue;

        // Get β (everything after B in α · B β)
        const beta = item.body.slice(dotIndex + 2);

        // Compute FIRST(βΔ) for each lookahead symbol in Δ
        const newLookahead = new Set<string>();

        for (const la of item.lookahead) {
            // Create sequence βla to compute FIRST(βla)
            const sequence = [...beta, la];
            const firstOfSequence = computeFirstForSequence(sequence, grammar, firstSets);

            for (const symbol of firstOfSequence) {
                if (symbol !== "ε") {
                    newLookahead.add(symbol);
                }
            }
        }

        // Get all productions for the non-terminal B
        const productions = grammar.P.get(nextSymbol);
        if (!productions) continue;

        // Add [B → · γ, FIRST(βΔ)] for each B → γ
        for (const prod of productions) {
            const markedBody = markProduction(prod);

            const newItem: LR1Item = {
                head: nextSymbol,
                body: markedBody,
                lookahead: new Set(newLookahead)
            };

            // Check if we already have an item with the same core in body
            const existingInBody = findItemWithSameCore(result.body, newItem);

            if (existingInBody) {
                // Merge lookahead - if new lookahead was added, re-process this item
                if (mergeLookahead(existingInBody, newItem)) {
                    // Add back to unmarked queue to propagate new lookaheads
                    unmarked.push({
                        head: existingInBody.head,
                        body: [...existingInBody.body],
                        lookahead: new Set(existingInBody.lookahead)
                    });
                }
            } else {
                // New item - add to body and mark for processing
                result.body.push(newItem);
                unmarked.push({
                    head: newItem.head,
                    body: [...newItem.body],
                    lookahead: new Set(newItem.lookahead)
                });
            }
        }
    }

    return result;
}

/**
 * Gets all items from a closure (kernel + body)
 */
export function getAllItems(closure: LR1Closure): LR1Item[] {
    return [...closure.kernel, ...closure.body];
}

/**
 * Formats an LR(1) item as a string for display
 */
export function formatLR1Item(item: LR1Item): string {
    const bodyStr = item.body.join(" ");
    const lookaheadStr = [...item.lookahead].sort().join(", ");
    return `[${item.head} → ${bodyStr}, {${lookaheadStr}}]`;
}
