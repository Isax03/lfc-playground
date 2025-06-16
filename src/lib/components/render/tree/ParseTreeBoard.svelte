<script lang="ts">
    import {
        convertToFlowNodes,
        generateTreeLayout,
    } from "$lib/utils/treeGenerator";
    import {
        Background,
        Controls,
        SvelteFlow,
        type NodeTypes,
    } from "@xyflow/svelte";
    import { mode } from "mode-watcher";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import * as Dialog from "$lib/shadcn-ui/components/ui/dialog/index";
    import { Expand, X } from "lucide-svelte";

    import "@xyflow/svelte/dist/style.css";
    import TreeNode from "./TreeNode.svelte";
    import type { TreeNode as TreeNodeType } from "$lib/types/tree";

    interface Props {
        parseTree: TreeNodeType | null;
    }

    let { parseTree }: Props = $props();

    // Generate layout and convert to flow nodes
    const layoutTree = generateTreeLayout(parseTree, 80, 80);
    const { nodes, edges } = $derived(convertToFlowNodes(layoutTree));    const nodeTypes: NodeTypes = {
        simple: TreeNode,
    };

    let isFullscreen = $state(false);
</script>

<main class="w-[90%] h-[90%] m-10 border border-gray-500 rounded-md relative">
    <SvelteFlow
        {nodes}
        {edges}
        colorMode={mode.current === "dark" ? "dark" : "light"}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        {nodeTypes}
        fitView={true}
        fitViewOptions={{ padding: 0.1 }}
        class="rounded-md"
    >
        <Background />
        <Controls />
    </SvelteFlow>
    
    <!-- Pulsante per ingrandire -->
    <Button 
        variant="outline" 
        size="icon"
        class="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-md hover:shadow-lg transition-all duration-200"
        title="Ingrandisci parse tree"
        onclick={() => isFullscreen = true}
    >
        <Expand class="h-4 w-4" />
    </Button>
      <Dialog.Root bind:open={isFullscreen}>
        <Dialog.Content class="max-w-none w-[98vw] h-[98vh] p-6 [&>button]:hidden">
            <div class="w-full h-full relative bg-background/95 rounded-lg border shadow-2xl">
                <SvelteFlow
                    {nodes}
                    {edges}
                    colorMode={mode.current === "dark" ? "dark" : "light"}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    {nodeTypes}
                    fitView={true}
                    fitViewOptions={{ padding: 0.1 }}
                    class="rounded-md"
                >                    <!-- Pulsante per chiudere la modalità fullscreen -->
                    <Button 
                        variant="destructive" 
                        size="icon"
                        class="absolute top-6 left-6 z-20 shadow-lg hover:shadow-xl transition-all duration-200 scale-110"
                        title="Chiudi modalità fullscreen"
                        onclick={() => isFullscreen = false}
                    >
                        <X class="h-5 w-5" />
                    </Button>
                    
                    <Background />
                    <Controls />
                </SvelteFlow>
            </div>
        </Dialog.Content>
    </Dialog.Root>
</main>
