import type { ReducingLabel, StatesAutomaton } from "$lib/types/slr";
import { type Edge, MarkerType, type Node } from "@xyflow/svelte";
import dagre from "dagre";

function hasMarkerAtEnd(productions: Map<string, string[][]>): boolean {
    for (const [, prods] of productions.entries()) {
        for (const prod of prods) {
            if (prod[prod.length - 1] === "·") {
                return true;
            }
        }
    }
    return false;
}

export function generateAutomatonLayout(
    automaton: StatesAutomaton,
    reducingLabels: ReducingLabel[]
): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a new dagre graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 70, ranksep: 70 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    const nodeWidth = 200;
    const nodeHeight = 100;

    Object.entries(automaton.states).forEach(([stateId, closure]) => {
        // Controlla se è uno stato di reduce
        const isReduce =
            hasMarkerAtEnd(closure.kernel) || hasMarkerAtEnd(closure.body);

        // Controlla se è uno stato di accept - il marker è alla fine e c'è S' nella kernel
        const isAccept = Array.from(closure.kernel.entries()).some(
            ([nt, prods]) =>
                nt === "S'" && prods.some((p) => p[p.length - 1] === "·")
        );

        const node = {
            id: stateId,
            type: "stateNode",
            data: {
                id: stateId,
                kernel: closure.kernel,
                closure: closure.body,
                isAccept,
                isReduce: !isAccept && isReduce, // se è accept non è reduce
                reducingLabels, // aggiungiamo reducingLabels ai dati del nodo
            },
            position: { x: 0, y: 0 },
        };

        nodes.push(node);
        g.setNode(stateId, { width: nodeWidth, height: nodeHeight });
    });

    // Add edges
    Object.entries(automaton.transitions).forEach(
        ([fromState, transitions]) => {
            Object.entries(transitions).forEach(([symbol, toState]) => {
                const edgeId = `${fromState}-${symbol}-${toState}`;
                edges.push({
                    id: edgeId,
                    source: fromState,
                    target: toState,
                    label: symbol,
                    type: "floating",
                    data: { shape: "bezier" },
                    markerEnd: { type: MarkerType.Arrow },
                });
                g.setEdge(fromState, toState);
            });
        }
    );

    // Calculate layout
    dagre.layout(g);

    // Apply layout to nodes
    nodes.forEach((node) => {
        const nodeWithPosition = g.node(node.id);
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
}
