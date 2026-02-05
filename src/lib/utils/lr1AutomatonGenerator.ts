import type { LR1Automaton, LR1Item } from "$lib/types/lr1";
import type { ReducingLabel } from "$lib/types/slr";
import { type Edge, MarkerType, type Node } from "@xyflow/svelte";
import dagre from "dagre";

/**
 * Check if any item in the array has the dot marker at the end
 */
function hasMarkerAtEnd(items: LR1Item[]): boolean {
    return items.some((item) => {
        const body = item.body;
        return body.length > 0 && body[body.length - 1] === "·";
    });
}

/**
 * Generate layout for LR(1) automaton visualization using dagre
 */
export function generateLR1AutomatonLayout(
    automaton: LR1Automaton,
    reducingLabels: ReducingLabel[]
): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a new dagre graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 70, ranksep: 70 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    const nodeWidth = 250; // Slightly wider to accommodate lookahead sets
    const nodeHeight = 120;

    Object.entries(automaton.states).forEach(([stateId, closure]) => {
        // Check if it's a reduce state
        const isReduce =
            hasMarkerAtEnd(closure.kernel) || hasMarkerAtEnd(closure.body);

        // Check if it's an accept state - the marker is at the end and S' is in kernel
        const isAccept = closure.kernel.some(
            (item) =>
                item.head === "S'" &&
                item.body.length > 0 &&
                item.body[item.body.length - 1] === "·"
        );

        const node = {
            id: stateId,
            type: "lr1StateNode",
            data: {
                id: stateId,
                kernel: closure.kernel,
                closure: closure.body,
                isAccept,
                isReduce: !isAccept && isReduce, // if it's accept, it's not just reduce
                reducingLabels,
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
