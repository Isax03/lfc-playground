<script lang="ts">
    import { page } from "$app/state";
    import FSABoard from "$lib/components/render/fsa/FSABoard.svelte";
    import RegexInput from "$lib/components/tools/RegexInput.svelte";
    import RegexToolLayout from "$lib/components/tools/RegexToolLayout.svelte";
    import ThompsonStepsTable from "$lib/components/tools/tables/ThompsonStepsTable.svelte";
    import TransitionTable from "$lib/components/tools/tables/TransitionTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { NFA, ThompsonStep } from "$lib/types/automaton";
    import { parseRegex, thompsonConstruction } from "$lib/utils/automaton";
    import { generateNFALayout } from "$lib/utils/automaton/fsaLayoutGenerator";
    import { onMount } from "svelte";

    let regexInput = $state("");
    let nfa: NFA | null = $state(null);
    let steps: ThompsonStep[] = $state([]);
    let error = $state("");

    let showSteps = $state(true);
    let showAutomaton = $state(true);
    let showTable = $state(true);

    function compute() {
        error = "";
        nfa = null;
        steps = [];
        try {
            const ast = parseRegex(regexInput);
            const result = thompsonConstruction(ast);
            nfa = result.nfa;
            steps = result.steps;
        } catch (e: any) {
            error = e.message;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            compute();
        }
    }

    onMount(() => {
        let regexParam = page.url.searchParams.get("regex") || "";
        if (regexParam !== "") {
            try {
                regexInput = decodeURIComponent(atob(regexParam));
                compute();
            } catch {
                regexInput = "(a|b)*abb";
            }
        } else {
            regexInput = "(a|b)*abb";
        }
    });

    const layout = $derived(nfa ? generateNFALayout(nfa) : null);
</script>

<svelte:head>
    <title>Regex → NFA (Thompson) - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <RegexInput
        bind:value={regexInput}
        onCompute={compute}
        showShare={nfa !== null}
    >
        <div class="flex flex-wrap items-center gap-4">
                <Label for="show-steps" class="flex items-center gap-2">
                    <Checkbox id="show-steps" bind:checked={showSteps} />
                    Show steps
                </Label>
                <Label for="show-automaton" class="flex items-center gap-2">
                    <Checkbox id="show-automaton" bind:checked={showAutomaton} />
                    Show automaton
                </Label>
                <Label for="show-table" class="flex items-center gap-2">
                    <Checkbox id="show-table" bind:checked={showTable} />
                    Show table
                </Label>
        </div>
    </RegexInput>
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        {#if error}
            <div class="p-4 border border-red-500 rounded-md bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                <p class="font-medium">Error parsing regex:</p>
                <p class="font-mono text-sm">{error}</p>
            </div>
        {/if}

        {#if nfa}
            {#if showSteps}
                <ThompsonStepsTable {steps} />
            {/if}

            {#if showTable}
                <TransitionTable {nfa} title="NFA Transition Table" />
            {/if}
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <RegexToolLayout
        title="Regex → NFA (Thompson's Construction)"
        description="Build an NFA from a regular expression using Thompson's construction algorithm. Each step shows how the NFA is incrementally constructed."
        input={InputSection}
        output={OutputSection}
    />

    {#if nfa && showAutomaton && layout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">NFA Automaton</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={layout.nodes} edges={layout.edges} title="NFA" />
            </div>
        </div>
    {/if}
</div>
