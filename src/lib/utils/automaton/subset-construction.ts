/**
 * Subset Construction: Converts an NFA to a DFA.
 * Each DFA state is a set of NFA states (the powerset construction).
 */

import type { NFA, DFA, DFAState, DFATransition, SubsetConstructionStep, EpsilonClosureDetail } from '$lib/types/automaton';

/**
 * Compute the ε-closure of a set of NFA states.
 */
export function epsilonClosure(nfa: NFA, states: Set<number>): Set<number> {
    const closure = new Set<number>(states);
    const stack = [...states];

    while (stack.length > 0) {
        const s = stack.pop()!;
        for (const t of nfa.transitions) {
            if (t.from === s && t.symbol === null && !closure.has(t.to)) {
                closure.add(t.to);
                stack.push(t.to);
            }
        }
    }
    return closure;
}

/**
 * Compute move(T, a) = set of NFA states reachable from T on symbol a.
 */
function move(nfa: NFA, states: Set<number>, symbol: string): Set<number> {
    const result = new Set<number>();
    for (const s of states) {
        for (const t of nfa.transitions) {
            if (t.from === s && t.symbol === symbol) {
                result.add(t.to);
            }
        }
    }
    return result;
}

function stateSetToId(states: Set<number>): string {
    const sorted = [...states].sort((a, b) => a - b);
    return `{${sorted.join(',')}}`;
}

/**
 * Convert an NFA to a DFA using subset construction.
 * Returns the DFA, construction steps, and ε-closure details.
 */
export function subsetConstruction(nfa: NFA): {
    dfa: DFA;
    steps: SubsetConstructionStep[];
    closureDetails: EpsilonClosureDetail[];
} {
    const steps: SubsetConstructionStep[] = [];
    const closureDetails: EpsilonClosureDetail[] = [];

    // Start state: ε-closure of NFA start
    const startClosure = epsilonClosure(nfa, new Set([nfa.startState]));
    const startId = stateSetToId(startClosure);

    closureDetails.push({
        stateId: startId,
        inputStates: [nfa.startState],
        closure: [...startClosure].sort((a, b) => a - b),
    });

    steps.push({
        description: `Initial state: ε-closure({${nfa.startState}}) = ${startId}`,
        dfaStateId: startId,
        nfaStates: [...startClosure].sort((a, b) => a - b),
        isNew: true,
    });

    const dfaStates: Map<string, DFAState> = new Map();
    dfaStates.set(startId, { id: startId, nfaStates: new Set(startClosure) });

    const unmarked: string[] = [startId];
    const dfaTransitions: DFATransition[] = [];
    const alphabet = nfa.alphabet.filter(a => a !== null);

    while (unmarked.length > 0) {
        const currentId = unmarked.shift()!;
        const currentStates = dfaStates.get(currentId)!.nfaStates;

        for (const a of alphabet) {
            const moveResult = move(nfa, currentStates, a);
            if (moveResult.size === 0) continue;

            const closureResult = epsilonClosure(nfa, moveResult);
            const targetId = stateSetToId(closureResult);

            closureDetails.push({
                stateId: targetId,
                inputStates: [...moveResult].sort((a, b) => a - b),
                closure: [...closureResult].sort((a, b) => a - b),
            });

            const isNew = !dfaStates.has(targetId);

            steps.push({
                description: `move(${currentId}, '${a}') = ${stateSetToId(moveResult)} → ε-closure = ${targetId}${isNew ? ' (new state)' : ' (existing)'}`,
                dfaStateId: currentId,
                nfaStates: [...currentStates].sort((a, b) => a - b),
                symbol: a,
                targetNfaStates: [...closureResult].sort((a, b) => a - b),
                targetDfaStateId: targetId,
                isNew,
            });

            if (isNew) {
                dfaStates.set(targetId, { id: targetId, nfaStates: new Set(closureResult) });
                unmarked.push(targetId);
            }

            dfaTransitions.push({ from: currentId, to: targetId, symbol: a });
        }
    }

    // Accept states: any DFA state containing an NFA accept state
    const acceptStates = [...dfaStates.values()]
        .filter(ds => [...ds.nfaStates].some(s => nfa.acceptStates.includes(s)))
        .map(ds => ds.id);

    const dfa: DFA = {
        states: [...dfaStates.values()],
        alphabet,
        transitions: dfaTransitions,
        startState: startId,
        acceptStates,
    };

    return { dfa, steps, closureDetails };
}
