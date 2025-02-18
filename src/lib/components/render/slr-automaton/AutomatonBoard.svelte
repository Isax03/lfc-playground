<script lang="ts">
    import * as Select from "$lib/shadcn-ui/components/ui/select/index";
    import type { StatesAutomaton } from "$lib/types/slr";
    import { generateAutomatonLayout } from "$lib/utils/automatonGenerator";
    import {
        Background,
        ConnectionMode,
        Controls,
        SvelteFlow,
        type EdgeTypes,
        type NodeTypes,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import { mode } from "mode-watcher";
    import { writable } from "svelte/store";
    import AutomatonEdge from "./AutomatonEdge.svelte";
    import AutomatonNode from "./AutomatonNode.svelte";
    import Label from "$lib/shadcn-ui/components/ui/label/label.svelte";

    interface Props {
        automaton: StatesAutomaton;
    }

    let { automaton }: Props = $props();

    const { nodes, edges } = generateAutomatonLayout(automaton);

    const nodesStore = writable(nodes);
    const edgesStore = writable(edges);

    const nodeTypes: NodeTypes = {
        stateNode: AutomatonNode,
    };

    const edgeTypes: EdgeTypes = {
        floating: AutomatonEdge,
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


</script>

<main class="w-[90%] h-[90%] border border-gray-500 rounded-md">
    <SvelteFlow
        nodes={nodesStore}
        edges={edgesStore}
        colorMode={$mode}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        connectionMode={ConnectionMode.Loose}
        {nodeTypes}
        {edgeTypes}
        fitView
        class="rounded-md"
    >
        <div class="z-10 absolute top-4 right-4 flex gap-2 items-center">
            <Label for="line-style">Edge Type</Label>
            <Select.Root type="single" name="line-style" bind:value>
                <Select.Trigger class="w-max gap-2">
                    {triggerContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        {#each lines as line}
                            <Select.Item value={line.value} label={line.label}
                                >{line.label}</Select.Item
                            >
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
        <Background />
        <Controls />
    </SvelteFlow>
</main>