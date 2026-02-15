<script lang="ts">
    import { page } from "$app/state";
    import FSABoard from "$lib/components/render/fsa/FSABoard.svelte";
    import RegexInput from "$lib/components/tools/RegexInput.svelte";
    import RegexToolLayout from "$lib/components/tools/RegexToolLayout.svelte";
    import SubsetStepsTable from "$lib/components/tools/tables/SubsetStepsTable.svelte";
    import MinimizationStepsTable from "$lib/components/tools/tables/MinimizationStepsTable.svelte";
    import TransitionTable from "$lib/components/tools/tables/TransitionTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { NFA, DFA, MinDFA, SubsetConstructionStep, MinimizationStep } from "$lib/types/automaton";
    import { parseRegex, thompsonConstruction, subsetConstruction, minimizeDFA } from "$lib/utils/automaton";
    import { generateNFALayout, generateDFALayout, generateMinDFALayout } from "$lib/utils/automaton/fsaLayoutGenerator";
    import { onMount } from "svelte";

    let regexInput = $state("");
    let nfa: NFA | null = $state(null);
    let dfa: DFA | null = $state(null);
    let minDfa: MinDFA | null = $state(null);
    let subsetSteps: SubsetConstructionStep[] = $state([]);
    let minSteps: MinimizationStep[] = $state([]);
    let error = $state("");

    let showSubsetSteps = $state(true);
    let showMinSteps = $state(true);
    let showNFA = $state(true);
    let showDFA = $state(false);
    let showMinDFA = $state(true);
    let showTables = $state(true);

    function compute() {
        error = "";
        nfa = null;
        dfa = null;
        minDfa = null;
        subsetSteps = [];
        minSteps = [];
        try {
            const ast = parseRegex(regexInput);
            const thompson = thompsonConstruction(ast);
            nfa = thompson.nfa;
            const subset = subsetConstruction(nfa);
            dfa = subset.dfa;
            subsetSteps = subset.steps;
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

    const nfaLayout = $derived(nfa ? generateNFALayout(nfa) : null);
    const dfaLayout = $derived(dfa ? generateDFALayout(dfa) : null);
    const minDfaLayout = $derived(minDfa ? generateMinDFALayout(minDfa) : null);
</script>

<svelte:head>
    <title>NFA → Min-DFA (Full Pipeline) - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <RegexInput
        bind:value={regexInput}
        onCompute={compute}
        showShare={minDfa !== null}
    >
        <div class="flex flex-wrap items-center gap-4">
                <Label for="show-subset-steps" class="flex items-center gap-2">
                    <Checkbox id="show-subset-steps" bind:checked={showSubsetSteps} />
                    Subset steps
                </Label>
                <Label for="show-min-steps" class="flex items-center gap-2">
                    <Checkbox id="show-min-steps" bind:checked={showMinSteps} />
                    Min steps
                </Label>
                <Label for="show-nfa" class="flex items-center gap-2">
                    <Checkbox id="show-nfa" bind:checked={showNFA} />
                    Show NFA
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

        {#if nfa && dfa && minDfa}
            {#if showSubsetSteps}
                <SubsetStepsTable steps={subsetSteps} />
            {/if}

            {#if showMinSteps}
                <MinimizationStepsTable steps={minSteps} />
            {/if}

            {#if showTables}
                <TransitionTable {nfa} title="NFA Transition Table" />
                <TransitionTable {dfa} title="DFA Transition Table" />
                <TransitionTable {minDfa} title="Min-DFA Transition Table" />
            {/if}

            <div class="p-3 border rounded-md bg-muted/50">
                <p class="text-sm">
                    <strong>Pipeline:</strong>
                    NFA ({nfa.states.length} states) → DFA ({dfa.states.length} states) → Min-DFA ({minDfa.states.length} states)
                </p>
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <RegexToolLayout
        title="NFA → Min-DFA (Full Pipeline)"
        description="Full pipeline: Regex → NFA (Thompson) → DFA (Subset Construction) → Min-DFA (Minimization). Shows all intermediate steps and automata."
        input={InputSection}
        output={OutputSection}
    />

    {#if nfa && showNFA && nfaLayout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">NFA</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={nfaLayout.nodes} edges={nfaLayout.edges} title="NFA" />
            </div>
        </div>
    {/if}

    {#if dfa && showDFA && dfaLayout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">DFA</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={dfaLayout.nodes} edges={dfaLayout.edges} title="DFA" />
            </div>
        </div>
    {/if}

    {#if minDfa && showMinDFA && minDfaLayout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">Min-DFA</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={minDfaLayout.nodes} edges={minDfaLayout.edges} title="Min-DFA" />
            </div>
        </div>
    {/if}
</div>
