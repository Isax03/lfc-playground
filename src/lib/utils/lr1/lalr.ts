import type { LR1Automaton, LR1Closure, LR1Item, LALRMergeInfo } from "$lib/types/lr1";
import type { ReducingLabel } from "$lib/types/slr";

/**
 * Gets the LR(0) core of an LR(1) item (strips the lookahead)
 */
function getItemCore(item: LR1Item): string {
    return `${item.head}:${item.body.join(" ")}`;
}

/**
 * Gets the LR(0) core of a state (all items without lookahead)
 */
function getStateCore(state: LR1Closure): string {
    const allItems = [...state.kernel, ...state.body];
    const cores = allItems.map(item => getItemCore(item)).sort();
    return cores.join("|");
}

/**
 * Merges multiple LR(1) states into one by unioning their lookahead sets
 */
function mergeStates(states: LR1Closure[]): LR1Closure {
    if (states.length === 0) {
        throw new Error("Cannot merge empty list of states");
    }

    if (states.length === 1) {
        return {
            kernel: states[0].kernel.map(item => ({
                head: item.head,
                body: [...item.body],
                lookahead: new Set(item.lookahead)
            })),
            body: states[0].body.map(item => ({
                head: item.head,
                body: [...item.body],
                lookahead: new Set(item.lookahead)
            }))
        };
    }

    // Start with deep copy of first state
    const merged: LR1Closure = {
        kernel: states[0].kernel.map(item => ({
            head: item.head,
            body: [...item.body],
            lookahead: new Set(item.lookahead)
        })),
        body: states[0].body.map(item => ({
            head: item.head,
            body: [...item.body],
            lookahead: new Set(item.lookahead)
        }))
    };

    // Merge other states
    for (let i = 1; i < states.length; i++) {
        const state = states[i];

        // Merge kernel items
        for (const item of state.kernel) {
            const existing = merged.kernel.find(k =>
                k.head === item.head &&
                k.body.length === item.body.length &&
                k.body.every((s, j) => s === item.body[j])
            );

            if (existing) {
                // Union the lookahead sets
                for (const la of item.lookahead) {
                    existing.lookahead.add(la);
                }
            } else {
                // Should not happen if cores match, but handle anyway
                merged.kernel.push({
                    head: item.head,
                    body: [...item.body],
                    lookahead: new Set(item.lookahead)
                });
            }
        }

        // Merge body items
        for (const item of state.body) {
            const existing = merged.body.find(b =>
                b.head === item.head &&
                b.body.length === item.body.length &&
                b.body.every((s, j) => s === item.body[j])
            );

            if (existing) {
                // Union the lookahead sets
                for (const la of item.lookahead) {
                    existing.lookahead.add(la);
                }
            } else {
                merged.body.push({
                    head: item.head,
                    body: [...item.body],
                    lookahead: new Set(item.lookahead)
                });
            }
        }
    }

    return merged;
}

/**
 * Merges LR(1) states to create LALR(1) automaton
 *
 * Algorithm:
 * 1. Group LR(1) states by their LR(0) core (same items ignoring lookahead)
 * 2. Merge states in each group by unioning their lookahead sets
 * 3. Update transitions to point to merged states
 * 4. Track which LR(1) states were merged for display
 */
export function mergeLALR(lr1Automaton: LR1Automaton): {
    automaton: LR1Automaton;
    mergeInfo: LALRMergeInfo;
} {
    // Step 1: Group states by LR(0) core
    const coreGroups = new Map<string, string[]>(); // core -> [stateIds]

    for (const [stateId, state] of Object.entries(lr1Automaton.states)) {
        const core = getStateCore(state);
        if (!coreGroups.has(core)) {
            coreGroups.set(core, []);
        }
        coreGroups.get(core)!.push(stateId);
    }

    // Step 2: Create mapping from old state IDs to new merged state IDs
    const stateMapping = new Map<string, string>(); // oldStateId -> newStateId
    const mergeMap: Record<string, string[]> = {}; // newStateId -> [oldStateIds]

    let newStateCounter = 0;
    const sortedGroups = [...coreGroups.entries()].sort((a, b) => {
        // Sort by the smallest state ID in each group to maintain order
        const minA = Math.min(...a[1].map(Number));
        const minB = Math.min(...b[1].map(Number));
        return minA - minB;
    });

    for (const [, stateIds] of sortedGroups) {
        const newStateId = newStateCounter.toString();
        newStateCounter++;

        mergeMap[newStateId] = stateIds.sort((a, b) => Number(a) - Number(b));
        for (const oldId of stateIds) {
            stateMapping.set(oldId, newStateId);
        }
    }

    // Step 3: Create merged automaton
    const lalrAutomaton: LR1Automaton = {
        states: {},
        transitions: {}
    };

    // Create merged states
    for (const [newStateId, oldStateIds] of Object.entries(mergeMap)) {
        const statesToMerge = oldStateIds.map(id => lr1Automaton.states[id]);
        lalrAutomaton.states[newStateId] = mergeStates(statesToMerge);
    }

    // Update transitions
    for (const [oldStateId, transitions] of Object.entries(lr1Automaton.transitions)) {
        const newFromId = stateMapping.get(oldStateId)!;

        if (!lalrAutomaton.transitions[newFromId]) {
            lalrAutomaton.transitions[newFromId] = {};
        }

        for (const [symbol, oldTargetId] of Object.entries(transitions)) {
            const newTargetId = stateMapping.get(oldTargetId)!;
            lalrAutomaton.transitions[newFromId][symbol] = newTargetId;
        }
    }

    return {
        automaton: lalrAutomaton,
        mergeInfo: { mergeMap }
    };
}

/**
 * Updates reducing labels for LALR after merging
 * The rules themselves don't change, but we may need to ensure uniqueness
 */
export function updateReducingLabelsForLALR(
    reducingLabels: ReducingLabel[]
): ReducingLabel[] {
    // Reducing labels stay the same - they reference production rules
    // which are the same regardless of state merging
    return reducingLabels;
}
