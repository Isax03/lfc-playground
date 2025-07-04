<script lang="ts">
    import Label from "$lib/shadcn-ui/components/ui/label/label.svelte";
    import * as Select from "$lib/shadcn-ui/components/ui/select/index";
    import * as Dialog from "$lib/shadcn-ui/components/ui/dialog/index";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import type { ReducingLabel, StatesAutomaton } from "$lib/types/slr";
    import { generateAutomatonLayout } from "$lib/utils/automatonGenerator";
    import {
        Background,
        ConnectionMode,
        Controls,
        SvelteFlow,
        type EdgeTypes,
        type NodeTypes,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";    import { mode } from "mode-watcher";
    import { Expand, Minimize2, X } from "lucide-svelte";
    import AutomatonEdge from "./AutomatonEdge.svelte";
    import AutomatonNode from "./AutomatonNode.svelte";

    interface Props {
        automaton: StatesAutomaton;
        reducingLabels: ReducingLabel[]; // aggiungiamo questa prop
    }

    let { automaton, reducingLabels }: Props = $props();

    const { nodes, edges } = $derived(
        generateAutomatonLayout(automaton, reducingLabels)
    ); // passiamo reducingLabels

    const nodeTypes: NodeTypes = {
        stateNode: AutomatonNode,
    };

    const edgeTypes: EdgeTypes = {
        floating: AutomatonEdge,
    };    let value = $state("bezier");
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
        console.log(value);
        show = false;
        setTimeout(() => {
            show = true;
        }, 20);
    });
</script>

{#if show}
    <main class="w-[90%] h-[90%] border border-gray-500 rounded-md relative">
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
            fitViewOptions={{ padding: 0.1 }}
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
        </SvelteFlow>        <!-- Pulsante per ingrandire -->
        <Button 
            variant="outline" 
            size="icon"
            class="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-md hover:shadow-lg transition-all duration-200"
            title="Ingrandisci automaton"
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
                        connectionMode={ConnectionMode.Loose}
                        {nodeTypes}
                        {edgeTypes}
                        fitView={true}
                        fitViewOptions={{ padding: 0.1 }}
                        class="rounded-md"
                    >
                        <div class="z-10 absolute top-4 right-4 flex gap-2 items-center">
                            <Label for="line-style-fullscreen">Edge Type</Label>
                            <Select.Root type="single" name="line-style-fullscreen" bind:value>
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
                        </div>                        <!-- Pulsante per chiudere la modalità fullscreen -->
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
{/if}
