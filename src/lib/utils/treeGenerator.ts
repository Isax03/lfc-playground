import type { TreeNode } from "$lib/types/tree";
import type { Node, Edge } from "@xyflow/svelte";

export function generateTreeLayout(root: TreeNode | null, levelHeight: number = 100, nodeWidth: number = 100): TreeNode {
    if (!root) {
        return {
            id: 'none',
            symbol: '',
            children: [],
            x: 0,
            y: 0
        };
    }
    
    let currentX = 0;
    
    function calculatePositions(node: TreeNode, level: number): number {
        if (node.children.length === 0) {
            node.x = currentX;
            node.y = level * levelHeight;
            currentX += nodeWidth;
            return node.x;
        }

        const childrenXs = node.children.map(child => calculatePositions(child, level + 1));
        node.x = (childrenXs[0] + childrenXs[childrenXs.length - 1]) / 2;
        node.y = level * levelHeight;
        return node.x;
    }

    calculatePositions(root, 0);
    return root;
}

export function convertToFlowNodes(tree: TreeNode): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let idCounter = 0;

    function traverse(node: TreeNode, parentId?: string) {
        const currentId = `node_${idCounter++}`;
        nodes.push({
            id: currentId,
            type: 'simple',
            data: { label: node.symbol },
            position: { x: node.x!, y: node.y! },
        });

        if (parentId) {
            edges.push({
                id: `edge_${parentId}_${currentId}`,
                type: 'straight',
                source: parentId,
                target: currentId,
            });
        }

        node.children.forEach(child => traverse(child, currentId));
    }

    traverse(tree);
    return { nodes, edges };
}
