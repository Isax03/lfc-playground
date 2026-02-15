/**
 * DFA Minimization using Hopcroft-style partition refinement.
 * 
 * 1. Make the DFA total (add sink state if needed)
 * 2. Partition into accepting and non-accepting states
 * 3. Iteratively refine partitions until stable
 * 4. Build the minimized DFA
 * 5. Remove dead (sink) states
 */

import type { DFA, DFAState, DFATransition, MinDFA, MinDFAState, MinDFATransition, MinimizationStep } from '$lib/types/automaton';

/**
 * Make a DFA total by adding a sink state for missing transitions.
 */
function makeTotalDFA(dfa: DFA): DFA {
    const sinkId = 'SINK';
    let needsSink = false;

    const transMap = new Map<string, Map<string, string>>();
    for (const s of dfa.states) {
        transMap.set(s.id, new Map());
    }
    for (const t of dfa.transitions) {
        transMap.get(t.from)?.set(t.symbol, t.to);
    }

    const newTransitions: DFATransition[] = [...dfa.transitions];

    // Check if any transition is missing
    for (const s of dfa.states) {
        for (const a of dfa.alphabet) {
            if (!transMap.get(s.id)?.has(a)) {
                needsSink = true;
                newTransitions.push({ from: s.id, to: sinkId, symbol: a });
            }
        }
    }

    if (!needsSink) {
        return dfa;
    }

    // Add sink self-loops
    for (const a of dfa.alphabet) {
        newTransitions.push({ from: sinkId, to: sinkId, symbol: a });
    }

    const sinkState: DFAState = { id: sinkId, nfaStates: new Set() };

    return {
        states: [...dfa.states, sinkState],
        alphabet: dfa.alphabet,
        transitions: newTransitions,
        startState: dfa.startState,
        acceptStates: dfa.acceptStates,
    };
}

function getTransitionTarget(transitions: DFATransition[], from: string, symbol: string): string | undefined {
    return transitions.find(t => t.from === from && t.symbol === symbol)?.to;
}

function findBlockOf(stateId: string, partition: string[][]): number {
    return partition.findIndex(block => block.includes(stateId));
}

/**
 * Minimize a DFA using partition refinement.
 * Returns the minimized DFA (as MinDFA), and the steps of the process.
 */
export function minimizeDFA(dfa: DFA): {
    minDfa: MinDFA;
    steps: MinimizationStep[];
} {
    const steps: MinimizationStep[] = [];

    // Step 1: Make DFA total
    const totalDfa = makeTotalDFA(dfa);

    // Step 2: Initial partition - accepting vs non-accepting
    const accepting = totalDfa.states.filter(s => totalDfa.acceptStates.includes(s.id)).map(s => s.id);
    const nonAccepting = totalDfa.states.filter(s => !totalDfa.acceptStates.includes(s.id)).map(s => s.id);

    let partition: string[][] = [];
    if (accepting.length > 0) partition.push(accepting);
    if (nonAccepting.length > 0) partition.push(nonAccepting);

    steps.push({
        description: `Initial partition: separate accepting states ${JSON.stringify(accepting)} from non-accepting ${JSON.stringify(nonAccepting)}`,
        partition: partition.map(b => [...b]),
    });

    // Step 3: Refine partition iteratively
    let changed = true;
    let iteration = 0;
    while (changed) {
        changed = false;
        iteration++;
        const newPartition: string[][] = [];

        for (const block of partition) {
            if (block.length <= 1) {
                newPartition.push(block);
                continue;
            }

            // Try to split this block
            let wasSplit = false;
            for (const a of totalDfa.alphabet) {
                const groups = new Map<number, string[]>();

                for (const stateId of block) {
                    const target = getTransitionTarget(totalDfa.transitions, stateId, a);
                    const targetBlock = target !== undefined ? findBlockOf(target, partition) : -1;
                    if (!groups.has(targetBlock)) {
                        groups.set(targetBlock, []);
                    }
                    groups.get(targetBlock)!.push(stateId);
                }

                if (groups.size > 1) {
                    // Split!
                    const newBlocks = [...groups.values()];
                    for (const nb of newBlocks) {
                        newPartition.push(nb);
                    }
                    changed = true;
                    wasSplit = true;

                    steps.push({
                        description: `Iteration ${iteration}: Split block ${JSON.stringify(block)} on symbol '${a}'`,
                        partition: [...newPartition, ...partition.filter(b2 => b2 !== block && !newPartition.includes(b2))].map(b => [...b]),
                        splitBlock: JSON.stringify(block),
                        splitSymbol: a,
                        newBlocks: newBlocks.map(b => [...b]),
                    });
                    break; // restart with new partition
                }
            }

            if (!wasSplit) {
                newPartition.push(block);
            }
        }

        partition = newPartition;
    }

    steps.push({
        description: `Final partition (no more splits possible): ${partition.map(b => JSON.stringify(b)).join(', ')}`,
        partition: partition.map(b => [...b]),
    });

    // Step 4: Build minimized DFA
    const minStates: MinDFAState[] = [];
    const stateToMinState = new Map<string, string>();

    for (let i = 0; i < partition.length; i++) {
        const block = partition[i];
        // Use a clean label
        const minId = `q${i}`;
        minStates.push({ id: minId, dfaStates: [...block] });
        for (const sid of block) {
            stateToMinState.set(sid, minId);
        }
    }

    const minTransitions: MinDFATransition[] = [];
    const addedTransitions = new Set<string>();

    for (const block of partition) {
        const representative = block[0];
        const minFrom = stateToMinState.get(representative)!;

        for (const a of totalDfa.alphabet) {
            const target = getTransitionTarget(totalDfa.transitions, representative, a);
            if (target !== undefined) {
                const minTo = stateToMinState.get(target)!;
                const key = `${minFrom}-${a}-${minTo}`;
                if (!addedTransitions.has(key)) {
                    addedTransitions.add(key);
                    minTransitions.push({ from: minFrom, to: minTo, symbol: a });
                }
            }
        }
    }

    const minStartState = stateToMinState.get(totalDfa.startState)!;
    const minAcceptStates = [...new Set(
        totalDfa.acceptStates.map(s => stateToMinState.get(s)!).filter(Boolean)
    )];

    // Step 5: Remove dead states (states from which no accepting state is reachable)
    const alive = new Set<string>();
    // BFS/DFS backward from accept states
    const reverseAdj = new Map<string, string[]>();
    for (const ms of minStates) {
        reverseAdj.set(ms.id, []);
    }
    for (const t of minTransitions) {
        reverseAdj.get(t.to)?.push(t.from);
    }

    const queue = [...minAcceptStates];
    for (const s of queue) alive.add(s);
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const pred of reverseAdj.get(current) || []) {
            if (!alive.has(pred)) {
                alive.add(pred);
                queue.push(pred);
            }
        }
    }
    // Always keep start reachable
    alive.add(minStartState);

    // Also find states reachable from start
    const reachable = new Set<string>();
    const forwardQueue = [minStartState];
    reachable.add(minStartState);
    while (forwardQueue.length > 0) {
        const current = forwardQueue.shift()!;
        for (const t of minTransitions) {
            if (t.from === current && !reachable.has(t.to)) {
                reachable.add(t.to);
                forwardQueue.push(t.to);
            }
        }
    }

    // Keep only states that are both reachable from start AND can reach an accepting state
    // But exclude the SINK state (dead state)
    const keepStates = new Set<string>();
    for (const s of minStates) {
        if (reachable.has(s.id) && alive.has(s.id)) {
            // Check if this is the SINK block
            const isSinkBlock = s.dfaStates.includes('SINK') && !minAcceptStates.includes(s.id);
            if (!isSinkBlock) {
                keepStates.add(s.id);
            }
        }
    }

    const finalStates = minStates.filter(s => keepStates.has(s.id));
    const finalTransitions = minTransitions.filter(t => keepStates.has(t.from) && keepStates.has(t.to));
    const finalAcceptStates = minAcceptStates.filter(s => keepStates.has(s));

    const minDfa: MinDFA = {
        states: finalStates,
        alphabet: dfa.alphabet, // use original alphabet (without SINK transitions)
        transitions: finalTransitions,
        startState: minStartState,
        acceptStates: finalAcceptStates,
    };

    return { minDfa, steps };
}
