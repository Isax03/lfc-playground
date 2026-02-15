<script lang="ts">
    import Label from "$lib/shadcn-ui/components/ui/label/label.svelte";
    import * as Select from "$lib/shadcn-ui/components/ui/select/index";
    import * as Dialog from "$lib/shadcn-ui/components/ui/dialog/index";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import AutomatonEdge from "$lib/components/render/slr-automaton/AutomatonEdge.svelte";
    import FSANode from "./FSANode.svelte";
    import {
        Background,
        ConnectionMode,
        Controls,
        SvelteFlow,
        type EdgeTypes,
        type NodeTypes,
        type Node,
        type Edge,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import { mode } from "mode-watcher";
    import { Expand, X } from "lucide-svelte";

    interface Props {
        nodes: Node[];
        edges: Edge[];
        title?: string;
    }

    let { nodes, edges, title = "Automaton" }: Props = $props();

    const nodeTypes: NodeTypes = {
        fsaNode: FSANode as any,
    };

    const edgeTypes: EdgeTypes = {
        floating: AutomatonEdge as any,
    };

    let value = $state("bezier");
    let lines = [
        { value: "bezier", label: "Bezier" },
        { value: "smoothstep", label: "Smoothstep" },
        { value: "straight", label: "Straight" },
    ];

    const triggerContent = $derived(
        lines.find((l) => l.value === value)?.label ?? "Bezier"
    );

    let show = $state(true);
    let isFullscreen = $state(false);

    $effect(() => {
        edges.forEach((edge) => {
            edge.data!!.shape = value;
        });
        show = false;
        setTimeout(() => {
            show = true;
        }, 20);
    });
</script>

{#if show}
    <main class="w-full h-full border border-gray-500 rounded-md relative">
        <SvelteFlow
            {nodes}
            {edges}
            colorMode={mode.current === "dark" ? "dark" : "light"}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={false}
            connectionMode={ConnectionMode.Loose}
            {nodeTypes}
            {edgeTypes}
            fitView={true}
            fitViewOptions={{ padding: 0.2 }}
            class="rounded-md"
        >
            <div class="z-10 absolute top-4 right-4 flex gap-2 items-center">
                <Label for="line-style">Edge</Label>
                <Select.Root type="single" name="line-style" bind:value>
                    <Select.Trigger class="w-max gap-2">
                        {triggerContent}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            {#each lines as line}
                                <Select.Item
                                    value={line.value}
                                    label={line.label}>{line.label}</Select.Item
                                >
                            {/each}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </div>
            <Background />
            <Controls />
        </SvelteFlow>

        <Dialog.Root bind:open={isFullscreen}>
            <Dialog.Trigger>
                <button
                    class="absolute bottom-4 right-4 p-2 rounded-md bg-card border hover:bg-muted transition-colors"
                    title="Fullscreen"
                >
                    <Expand class="w-4 h-4" />
                </button>
            </Dialog.Trigger>
            <Dialog.Content class="max-w-[95vw] w-[95vw] h-[90vh]">
                <Dialog.Header>
                    <Dialog.Title>{title}</Dialog.Title>
                </Dialog.Header>
                <div class="w-full h-full">
                    <SvelteFlow
                        {nodes}
                        {edges}
                        colorMode={mode.current === "dark" ? "dark" : "light"}
                        nodesDraggable={true}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        connectionMode={ConnectionMode.Loose}
                        {nodeTypes}
                        {edgeTypes}
                        fitView={true}
                        fitViewOptions={{ padding: 0.2 }}
                        class="rounded-md"
                    >
                        <Background />
                        <Controls />
                    </SvelteFlow>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    </main>
{/if}
