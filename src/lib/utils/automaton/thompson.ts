/**
 * Thompson's Construction: Converts a RegexNode AST into an NFA.
 * 
 * Properties of generated NFA:
 * - Exactly one start state and one accept state
 * - No arcs into the start state
 * - No arcs out of the accept state
 */

import type { NFA, NFATransition, RegexNode, ThompsonStep } from '$lib/types/automaton';
import { regexToString } from './regex-parser';

let stateCounter = 0;

function newState(): number {
    return stateCounter++;
}

interface NFAFragment {
    start: number;
    accept: number;
    transitions: NFATransition[];
    states: number[];
}

function buildNFAFragment(node: RegexNode, steps: ThompsonStep[], alphabet: Set<string>): NFAFragment {
    switch (node.type) {
        case 'epsilon': {
            const s = newState();
            const f = newState();
            const transitions: NFATransition[] = [{ from: s, to: f, symbol: null }];
            const frag: NFAFragment = { start: s, accept: f, transitions, states: [s, f] };
            steps.push({
                description: `Base case: ε → NFA with ε-transition from state ${s} to state ${f}`,
                subExpression: 'ε',
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'literal': {
            const s = newState();
            const f = newState();
            alphabet.add(node.value);
            const transitions: NFATransition[] = [{ from: s, to: f, symbol: node.value }];
            const frag: NFAFragment = { start: s, accept: f, transitions, states: [s, f] };
            steps.push({
                description: `Base case: '${node.value}' → NFA with transition on '${node.value}' from state ${s} to state ${f}`,
                subExpression: node.value,
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'union': {
            const left = buildNFAFragment(node.left, steps, alphabet);
            const right = buildNFAFragment(node.right, steps, alphabet);
            const s = newState();
            const f = newState();
            const transitions: NFATransition[] = [
                ...left.transitions,
                ...right.transitions,
                { from: s, to: left.start, symbol: null },
                { from: s, to: right.start, symbol: null },
                { from: left.accept, to: f, symbol: null },
                { from: right.accept, to: f, symbol: null },
            ];
            const states = [...left.states, ...right.states, s, f];
            const frag: NFAFragment = { start: s, accept: f, transitions, states };
            steps.push({
                description: `Union: (${regexToString(node.left)} | ${regexToString(node.right)}) → new start ${s}, new accept ${f}, ε-branches to both sub-NFA`,
                subExpression: regexToString(node),
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'concat': {
            const left = buildNFAFragment(node.left, steps, alphabet);
            const right = buildNFAFragment(node.right, steps, alphabet);
            // Merge left.accept with right.start
            const mergedTransitions = [
                ...left.transitions,
                ...right.transitions.map(t => ({
                    ...t,
                    from: t.from === right.start ? left.accept : t.from,
                    to: t.to === right.start ? left.accept : t.to,
                })),
            ];
            const states = [...left.states, ...right.states.filter(s => s !== right.start)];
            const frag: NFAFragment = { start: left.start, accept: right.accept, transitions: mergedTransitions, states };
            steps.push({
                description: `Concatenation: (${regexToString(node.left)} · ${regexToString(node.right)}) → merge accept of left (${left.accept}) with start of right (${right.start})`,
                subExpression: regexToString(node),
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'star': {
            const child = buildNFAFragment(node.child, steps, alphabet);
            const s = newState();
            const f = newState();
            const transitions: NFATransition[] = [
                ...child.transitions,
                { from: s, to: child.start, symbol: null },
                { from: s, to: f, symbol: null },                          // accept ε
                { from: child.accept, to: f, symbol: null },
                { from: child.accept, to: child.start, symbol: null },     // loop back
            ];
            const states = [...child.states, s, f];
            const frag: NFAFragment = { start: s, accept: f, transitions, states };
            steps.push({
                description: `Kleene star: (${regexToString(node.child)})* → new start ${s}, new accept ${f}, ε-loop and ε-bypass`,
                subExpression: regexToString(node),
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'plus': {
            // r+ = r · r*
            const child = buildNFAFragment(node.child, steps, alphabet);
            const s = newState();
            const f = newState();
            const transitions: NFATransition[] = [
                ...child.transitions,
                { from: s, to: child.start, symbol: null },
                { from: child.accept, to: f, symbol: null },
                { from: child.accept, to: child.start, symbol: null },     // loop back (1+ times)
            ];
            const states = [...child.states, s, f];
            const frag: NFAFragment = { start: s, accept: f, transitions, states };
            steps.push({
                description: `Plus: (${regexToString(node.child)})+ → like star but no ε-bypass (at least one occurrence)`,
                subExpression: regexToString(node),
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
        case 'optional': {
            // r? = r | ε
            const child = buildNFAFragment(node.child, steps, alphabet);
            const s = newState();
            const f = newState();
            const transitions: NFATransition[] = [
                ...child.transitions,
                { from: s, to: child.start, symbol: null },
                { from: s, to: f, symbol: null },                          // bypass (ε)
                { from: child.accept, to: f, symbol: null },
            ];
            const states = [...child.states, s, f];
            const frag: NFAFragment = { start: s, accept: f, transitions, states };
            steps.push({
                description: `Optional: (${regexToString(node.child)})? → can bypass via ε (zero or one occurrence)`,
                subExpression: regexToString(node),
                nfa: fragmentToNFA(frag, [...alphabet]),
            });
            return frag;
        }
    }
}

function fragmentToNFA(frag: NFAFragment, alphabet: string[]): NFA {
    return {
        states: [...frag.states].sort((a, b) => a - b),
        alphabet: [...alphabet].sort(),
        transitions: [...frag.transitions],
        startState: frag.start,
        acceptStates: [frag.accept],
    };
}

/**
 * Build an NFA from a RegexNode using Thompson's construction.
 * Returns the NFA and the construction steps.
 */
export function thompsonConstruction(ast: RegexNode): { nfa: NFA; steps: ThompsonStep[] } {
    stateCounter = 0;
    const steps: ThompsonStep[] = [];
    const alphabet = new Set<string>();
    const fragment = buildNFAFragment(ast, steps, alphabet);
    const nfa = fragmentToNFA(fragment, [...alphabet]);
    return { nfa, steps };
}
