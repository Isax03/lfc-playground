/**
 * Generate xyflow nodes and edges from NFA/DFA/MinDFA for visualization.
 */

import type { NFA, DFA, MinDFA } from '$lib/types/automaton';
import { type Edge, MarkerType, type Node } from '@xyflow/svelte';
import dagre from 'dagre';

interface SimpleAutomaton {
    stateIds: string[];
    transitions: { from: string; to: string; symbol: string }[];
    startState: string;
    acceptStates: string[];
    stateLabels?: Map<string, string>; // optional extra label per state
}

function nfaToSimple(nfa: NFA): SimpleAutomaton {
    // Merge transitions with same from/to into single edges with combined labels
    const transMap = new Map<string, Set<string>>();
    for (const t of nfa.transitions) {
        const key = `${t.from}->${t.to}`;
        if (!transMap.has(key)) transMap.set(key, new Set());
        transMap.get(key)!.add(t.symbol === null ? 'ε' : t.symbol);
    }

    const transitions: SimpleAutomaton['transitions'] = [];
    for (const [key, symbols] of transMap) {
        const [from, to] = key.split('->');
        transitions.push({ from, to, symbol: [...symbols].join(', ') });
    }

    return {
        stateIds: nfa.states.map(s => String(s)),
        transitions,
        startState: String(nfa.startState),
        acceptStates: nfa.acceptStates.map(s => String(s)),
    };
}

function dfaToSimple(dfa: DFA): SimpleAutomaton {
    // Create short labels q0, q1, ... mapping from original DFA state IDs
    const idToShort = new Map<string, string>();
    // Ensure start state gets q0
    idToShort.set(dfa.startState, 'q0');
    let counter = 1;
    for (const s of dfa.states) {
        if (!idToShort.has(s.id)) {
            idToShort.set(s.id, `q${counter++}`);
        }
    }

    // Merge transitions with same from/to
    const transMap = new Map<string, Set<string>>();
    for (const t of dfa.transitions) {
        const from = idToShort.get(t.from) ?? t.from;
        const to = idToShort.get(t.to) ?? t.to;
        const key = `${from}->${to}`;
        if (!transMap.has(key)) transMap.set(key, new Set());
        transMap.get(key)!.add(t.symbol);
    }

    const transitions: SimpleAutomaton['transitions'] = [];
    for (const [key, symbols] of transMap) {
        const [from, to] = key.split('->');
        transitions.push({ from, to, symbol: [...symbols].join(', ') });
    }

    // Show original NFA states as extra label
    const stateLabels = new Map<string, string>();
    for (const s of dfa.states) {
        const shortId = idToShort.get(s.id)!;
        stateLabels.set(shortId, s.id); // e.g. q0 -> {0,2,4,6,7}
    }

    return {
        stateIds: dfa.states.map(s => idToShort.get(s.id)!),
        transitions,
        startState: idToShort.get(dfa.startState)!,
        acceptStates: dfa.acceptStates.map(id => idToShort.get(id)!),
        stateLabels,
    };
}

function minDfaToSimple(minDfa: MinDFA): SimpleAutomaton {
    // Create short labels p0, p1, ... for min-DFA states
    const idToShort = new Map<string, string>();
    idToShort.set(minDfa.startState, 'p0');
    let counter = 1;
    for (const s of minDfa.states) {
        if (!idToShort.has(s.id)) {
            idToShort.set(s.id, `p${counter++}`);
        }
    }

    const transMap = new Map<string, Set<string>>();
    for (const t of minDfa.transitions) {
        const from = idToShort.get(t.from) ?? t.from;
        const to = idToShort.get(t.to) ?? t.to;
        const key = `${from}->${to}`;
        if (!transMap.has(key)) transMap.set(key, new Set());
        transMap.get(key)!.add(t.symbol);
    }

    const transitions: SimpleAutomaton['transitions'] = [];
    for (const [key, symbols] of transMap) {
        const [from, to] = key.split('->');
        transitions.push({ from, to, symbol: [...symbols].join(', ') });
    }

    const stateLabels = new Map<string, string>();
    for (const s of minDfa.states) {
        const shortId = idToShort.get(s.id)!;
        if (s.dfaStates.length > 0) {
            stateLabels.set(shortId, s.dfaStates.join(', '));
        }
    }

    return {
        stateIds: minDfa.states.map(s => idToShort.get(s.id)!),
        transitions,
        startState: idToShort.get(minDfa.startState)!,
        acceptStates: minDfa.acceptStates.map(id => idToShort.get(id)!),
        stateLabels,
    };
}

function layoutAutomaton(automaton: SimpleAutomaton): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 80;
    const nodeHeight = 80;

    for (const stateId of automaton.stateIds) {
        const isStart = stateId === automaton.startState;
        const isAccept = automaton.acceptStates.includes(stateId);
        const extraLabel = automaton.stateLabels?.get(stateId);

        nodes.push({
            id: stateId,
            type: 'fsaNode',
            data: {
                label: stateId,
                isStart,
                isAccept,
                extraLabel,
            },
            position: { x: 0, y: 0 },
        });
        g.setNode(stateId, { width: nodeWidth, height: nodeHeight });
    }

    for (const t of automaton.transitions) {
        const edgeId = `${t.from}-${t.symbol}-${t.to}`;
        edges.push({
            id: edgeId,
            source: t.from,
            target: t.to,
            label: t.symbol,
            type: 'floating',
            data: { shape: 'bezier' },
            markerEnd: { type: MarkerType.Arrow },
        });
        g.setEdge(t.from, t.to);
    }

    dagre.layout(g);

    nodes.forEach(node => {
        const pos = g.node(node.id);
        node.position = {
            x: pos.x - nodeWidth / 2,
            y: pos.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
}

export function generateNFALayout(nfa: NFA) {
    return layoutAutomaton(nfaToSimple(nfa));
}

export function generateDFALayout(dfa: DFA) {
    return layoutAutomaton(dfaToSimple(dfa));
}

export function generateMinDFALayout(minDfa: MinDFA) {
    return layoutAutomaton(minDfaToSimple(minDfa));
}
