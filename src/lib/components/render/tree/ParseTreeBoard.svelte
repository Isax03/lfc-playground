<script lang="ts">
    import {
        convertToFlowNodes,
        generateTreeLayout,
    } from "$lib/utils/treeGenerator";
    import { Background, Controls, SvelteFlow, type NodeTypes } from "@xyflow/svelte";
    import { mode } from "mode-watcher";
    import { writable } from "svelte/store"

    import "@xyflow/svelte/dist/style.css";
    import TreeNode from "./TreeNode.svelte";
    import type { TreeNode as TreeNodeType } from "$lib/types/tree";

    interface Props {
        parseTree: TreeNodeType | null;
    }

    let { parseTree }: Props = $props();

    // Generate layout and convert to flow nodes
    const layoutTree = generateTreeLayout(parseTree, 80, 80);
    const { nodes, edges } = convertToFlowNodes(layoutTree);

    const nodesStore = writable(nodes);
    const edgesStore = writable(edges);

    const nodeTypes: NodeTypes = {
        simple: TreeNode
    }
</script>

<main class="w-[90%] h-[90%] m-10 border border-gray-500 rounded-md">
    <SvelteFlow
        nodes={nodesStore}
        edges={edgesStore}
        colorMode={$mode}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        {nodeTypes}
        fitView
        class="rounded-md"
    >
        <Background />
        <Controls />
    </SvelteFlow>
</main>
