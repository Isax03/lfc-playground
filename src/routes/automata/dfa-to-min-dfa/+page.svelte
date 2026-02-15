<script lang="ts">
    import { page } from "$app/state";
    import FSABoard from "$lib/components/render/fsa/FSABoard.svelte";
    import RegexInput from "$lib/components/tools/RegexInput.svelte";
    import RegexToolLayout from "$lib/components/tools/RegexToolLayout.svelte";
    import MinimizationStepsTable from "$lib/components/tools/tables/MinimizationStepsTable.svelte";
    import TransitionTable from "$lib/components/tools/tables/TransitionTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { DFA, MinDFA, MinimizationStep } from "$lib/types/automaton";
    import { parseRegex, thompsonConstruction, subsetConstruction, minimizeDFA } from "$lib/utils/automaton";
    import { generateDFALayout, generateMinDFALayout } from "$lib/utils/automaton/fsaLayoutGenerator";
    import { onMount } from "svelte";

    let regexInput = $state("");
    let dfa: DFA | null = $state(null);
    let minDfa: MinDFA | null = $state(null);
    let minSteps: MinimizationStep[] = $state([]);
    let error = $state("");

    let showSteps = $state(true);
    let showDFA = $state(true);
    let showMinDFA = $state(true);
    let showTables = $state(true);

    function compute() {
        error = "";
        dfa = null;
        minDfa = null;
        minSteps = [];
        try {
            const ast = parseRegex(regexInput);
            const { nfa } = thompsonConstruction(ast);
            const subset = subsetConstruction(nfa);
            dfa = subset.dfa;
            const result = minimizeDFA(dfa);
            minDfa = result.minDfa;
            minSteps = result.steps;
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

    const dfaLayout = $derived(dfa ? generateDFALayout(dfa) : null);
    const minDfaLayout = $derived(minDfa ? generateMinDFALayout(minDfa) : null);
</script>

<svelte:head>
    <title>DFA → Min-DFA (Minimization) - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <RegexInput
        bind:value={regexInput}
        onCompute={compute}
        showShare={minDfa !== null}
    >
        <div class="flex flex-wrap items-center gap-4">
                <Label for="show-steps" class="flex items-center gap-2">
                    <Checkbox id="show-steps" bind:checked={showSteps} />
                    Show steps
                </Label>
                <Label for="show-dfa" class="flex items-center gap-2">
                    <Checkbox id="show-dfa" bind:checked={showDFA} />
                    Show DFA
                </Label>
                <Label for="show-min-dfa" class="flex items-center gap-2">
                    <Checkbox id="show-min-dfa" bind:checked={showMinDFA} />
                    Show Min-DFA
                </Label>
                <Label for="show-tables" class="flex items-center gap-2">
                    <Checkbox id="show-tables" bind:checked={showTables} />
                    Show tables
                </Label>
        </div>
    </RegexInput>
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        {#if error}
            <div class="p-4 border border-red-500 rounded-md bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                <p class="font-medium">Error:</p>
                <p class="font-mono text-sm">{error}</p>
            </div>
        {/if}

        {#if dfa && minDfa}
            {#if showSteps}
                <MinimizationStepsTable steps={minSteps} />
            {/if}

            {#if showTables}
                <TransitionTable {dfa} title="DFA Transition Table (before minimization)" />
                <TransitionTable {minDfa} title="Min-DFA Transition Table (after minimization)" />
            {/if}

            <div class="p-3 border rounded-md bg-muted/50">
                <p class="text-sm">
                    <strong>DFA states:</strong> {dfa.states.length} → <strong>Min-DFA states:</strong> {minDfa.states.length}
                    &nbsp;({dfa.states.length - minDfa.states.length} states removed)
                </p>
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <RegexToolLayout
        title="DFA → Min-DFA (Minimization)"
        description="Minimize a DFA using partition refinement (Hopcroft-style). Shows the DFA before and after minimization with detailed steps of partition splitting."
        input={InputSection}
        output={OutputSection}
    />

    {#if dfa && showDFA && dfaLayout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">Source DFA</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={dfaLayout.nodes} edges={dfaLayout.edges} title="DFA" />
            </div>
        </div>
    {/if}

    {#if minDfa && showMinDFA && minDfaLayout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">Minimized DFA</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={minDfaLayout.nodes} edges={minDfaLayout.edges} title="Min-DFA" />
            </div>
        </div>
    {/if}
</div>
