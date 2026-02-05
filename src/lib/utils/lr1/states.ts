import type { Grammar } from "$lib/types/grammar";
import type { FirstSets } from "$lib/types/first-follow";
import type { ReducingLabel } from "$lib/types/slr";
import type { LR1Item, LR1Closure, LR1Automaton, LR1AutomatonStep, LR1AutomatonBuildResult } from "$lib/types/lr1";
import { closure1, getAllItems } from "./closure";

/**
 * Moves the dot marker one position to the right in a production body
 */
function moveMarker(body: string[]): string[] | null {
    // Don't move marker for epsilon productions (that have only the marker)
    if (body.length === 1 && body[0] === "·") return null;

    const markerIndex = body.findIndex(s => s === "·");
    if (markerIndex === body.length - 1) return null;

    const result = [...body];
    result[markerIndex] = result[markerIndex + 1];
    result[markerIndex + 1] = "·";
    return result;
}

/**
 * Computes the kernel items for a new state given a symbol
 * Returns items where the dot is moved after the given symbol
 */
function computeKernel(state: LR1Closure, symbol: string): LR1Item[] {
    const kernel: LR1Item[] = [];
    const allItems = getAllItems(state);

    for (const item of allItems) {
        const dotIndex = item.body.findIndex(s => s === "·");

        // Check if the symbol after dot matches
        if (dotIndex < item.body.length - 1 && item.body[dotIndex + 1] === symbol) {
            const movedBody = moveMarker(item.body);
            if (movedBody) {
                // Check if we already have an item with the same core
                const existing = kernel.find(k =>
                    k.head === item.head &&
                    k.body.length === movedBody.length &&
                    k.body.every((s, i) => s === movedBody[i])
                );

                if (existing) {
                    // Merge lookahead
                    for (const la of item.lookahead) {
                        existing.lookahead.add(la);
                    }
                } else {
                    kernel.push({
                        head: item.head,
                        body: movedBody,
                        lookahead: new Set(item.lookahead)
                    });
                }
            }
        }
    }

    return kernel;
}

/**
 * Checks if two kernels are equal (for finding existing states)
 */
function kernelsEqual(k1: LR1Item[], k2: LR1Item[]): boolean {
    if (k1.length !== k2.length) return false;

    for (const item1 of k1) {
        const matching = k2.find(item2 =>
            item1.head === item2.head &&
            item1.body.length === item2.body.length &&
            item1.body.every((s, i) => s === item2.body[i]) &&
            item1.lookahead.size === item2.lookahead.size &&
            [...item1.lookahead].every(la => item2.lookahead.has(la))
        );

        if (!matching) return false;
    }

    return true;
}

/**
 * Finds reducing items (items where dot is at the end)
 */
function findReducingItems(closure: LR1Closure): { head: string; body: string[] }[] {
    const reducingItems: { head: string; body: string[] }[] = [];
    const allItems = getAllItems(closure);

    for (const item of allItems) {
        // Skip accept item (S' -> S·)
        if (item.head === "S'" && item.body.length === 2 && item.body[0] === "S" && item.body[1] === "·") {
            continue;
        }

        // Check for epsilon reduction (body is just "·")
        if (item.body.length === 1 && item.body[0] === "·") {
            reducingItems.push({ head: item.head, body: ["ε"] });
        } else if (item.body[item.body.length - 1] === "·") {
            // Normal reduction
            const body = item.body.filter(s => s !== "·");
            reducingItems.push({ head: item.head, body });
        }
    }

    return reducingItems;
}

/**
 * Checks if two rules are equal
 */
function isRuleEqual(r1: { head: string; body: string[] }, r2: { head: string; body: string[] }): boolean {
    return r1.head === r2.head &&
        r1.body.length === r2.body.length &&
        r1.body.every((s, i) => s === r2.body[i]);
}

/**
 * Builds the LR(1) automaton for a grammar
 */
export function buildLR1Automaton(
    grammar: Grammar,
    firstSets: FirstSets
): LR1AutomatonBuildResult {
    const automaton: LR1Automaton = {
        states: {},
        transitions: {}
    };

    const steps: LR1AutomatonStep[] = [];
    const reducingLabels: ReducingLabel[] = [];
    let reduceCounter = 1;

    // Create initial state with [S' → · S, {$}]
    const startProduction = grammar.P.get(grammar.S);
    if (!startProduction || startProduction.length === 0) {
        throw new Error("Grammar must have a start production");
    }

    const initialKernel: LR1Item[] = [{
        head: grammar.S,
        body: ["·", ...startProduction[0]],
        lookahead: new Set(["$"])
    }];

    const initialState = closure1(grammar, initialKernel, firstSets);
    automaton.states["0"] = initialState;

    // Check for reducing items in initial state
    const initialReducingItems = findReducingItems(initialState);
    for (const item of initialReducingItems) {
        if (!reducingLabels.some(rl => isRuleEqual(rl.rule, item))) {
            reducingLabels.push({
                rule: item,
                label: `r${reduceCounter++}`
            });
        }
    }

    // Record initial step
    steps.push({
        stateId: "0",
        closure: initialState
    });

    const unmarked = new Set(["0"]);
    let stateCounter = 1;

    while (unmarked.size > 0) {
        const stateId = unmarked.values().next().value!;
        unmarked.delete(stateId);
        const state = automaton.states[stateId];

        automaton.transitions[stateId] = {};

        // Get all symbols after markers
        const symbols = new Set<string>();
        const allItems = getAllItems(state);

        for (const item of allItems) {
            const dotIndex = item.body.findIndex(s => s === "·");
            if (dotIndex < item.body.length - 1) {
                symbols.add(item.body[dotIndex + 1]);
            }
        }

        for (const symbol of symbols) {
            const targetKernel = computeKernel(state, symbol);

            // Find existing state with same kernel (including lookahead)
            let targetStateId = Object.entries(automaton.states).find(([, s]) =>
                kernelsEqual(s.kernel, targetKernel)
            )?.[0];

            if (!targetStateId) {
                targetStateId = stateCounter.toString();
                stateCounter++;

                const targetClosure = closure1(grammar, targetKernel, firstSets);
                automaton.states[targetStateId] = targetClosure;
                unmarked.add(targetStateId);

                // Check for new reducing items
                const reducingItems = findReducingItems(targetClosure);
                for (const item of reducingItems) {
                    if (!reducingLabels.some(rl => isRuleEqual(rl.rule, item))) {
                        reducingLabels.push({
                            rule: item,
                            label: `r${reduceCounter++}`
                        });
                    }
                }

                // Record step for new state
                steps.push({
                    stateId: targetStateId,
                    symbol,
                    fromStateId: stateId,
                    closure: targetClosure
                });
            } else {
                // Record step for existing state transition
                steps.push({
                    stateId: targetStateId,
                    symbol,
                    fromStateId: stateId,
                    kernel: targetKernel,
                    isExistingState: true
                });
            }

            automaton.transitions[stateId][symbol] = targetStateId;
        }
    }

    return { automaton, steps, reducingLabels };
}
