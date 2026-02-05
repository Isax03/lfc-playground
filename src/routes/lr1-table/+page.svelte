<script lang="ts">
    import { page } from "$app/state";
    import LR1AutomatonBoard from "$lib/components/render/lr1-automaton/LR1AutomatonBoard.svelte";
    import GrammarInput from "$lib/components/tools/GrammarInput.svelte";
    import GrammarToolLayout from "$lib/components/tools/GrammarToolLayout.svelte";
    import LR1StepsTable from "$lib/components/tools/tables/LR1StepsTable.svelte";
    import FirstFollowTable from "$lib/components/tools/tables/FirstFollowTable.svelte";
    import LR1Table from "$lib/components/tools/tables/LR1Table.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import type { LR1Automaton, LR1AutomatonStep } from "$lib/types/lr1";
    import type { ReducingLabel, SLRTable as SLRTableType } from "$lib/types/slr";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { buildLR1Automaton } from "$lib/utils/lr1/states";
    import { computeLR1Table } from "$lib/utils/lr1/table";
    import { onMount } from "svelte";

    let grammarInput = $state("");

    let grammar: Grammar = $state({
        N: new Set(),
        T: new Set(),
        S: "",
        P: new Map(),
    } as Grammar);

    let firstSets: FirstSets = $state(new Map());
    let followSets: FollowSets = $state(new Map());

    let automaton: LR1Automaton | null = $state(null);
    let steps: LR1AutomatonStep[] = $state([]);
    let reducingLabels: ReducingLabel[] = $state([]);

    let showSteps = $state(true);
    let showAutomaton = $state(true);
    let showFirstFollow = $state(true);
    let showTable = $state(true);

    let lr1Result = $state<{
        table: SLRTableType;
        hasConflicts: boolean;
    } | null>(null);

    /**
     * Parses the grammar input and computes First sets, Follow sets and LR(1) table
     */
    async function parseAndCompute() {
        automaton = null;
        lr1Result = null;

        // Small delay for UI update
        await new Promise((resolve) => setTimeout(resolve, 100));

        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);

        const result = buildLR1Automaton(grammar, firstSets);
        automaton = result.automaton;
        steps = result.steps;
        reducingLabels = result.reducingLabels;

        // Compute LR(1) table
        if (automaton) {
            lr1Result = computeLR1Table(
                automaton,
                reducingLabels,
                grammar
            );
        }
    }

    /**
     * Handles Ctrl+Enter keyboard shortcut to trigger computation
     */
    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndCompute();
        }
    }

    onMount(() => {
        // Load grammar from URL parameters if available, otherwise use pointer grammar example
        let grammarParam = page.url.searchParams.get("grammar") || "";
        if (grammarParam !== "") {
            grammarInput = decodeGrammar(grammarParam) || grammarInput;
            parseAndCompute();
        } else {
            // Pointer grammar - classic example for LR(1) vs SLR
            grammarInput = `S' -> S
S -> L = R | R
L -> * R | id
R -> L`;
        }
    });
</script>

<svelte:head>
    <title>LR(1) Parsing Table - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <GrammarInput
        bind:value={grammarInput}
        onCompute={parseAndCompute}
        showShare={firstSets.size > 0}
    >
        <div class="flex items-center gap-2 my-4">
            <div class="grid grid-cols-2 gap-5 items-center">
                <Label for="render-steps" class="flex items-center gap-2">
                    <Checkbox id="render-steps" bind:checked={showSteps} />
                    Show steps
                </Label>
                <Label for="render-automaton" class="flex items-center gap-2">
                    <Checkbox
                        id="render-automaton"
                        bind:checked={showAutomaton}
                    />
                    Show automaton
                </Label>
                <Label for="render-first-follow" class="flex items-center gap-2">
                    <Checkbox
                        id="render-first-follow"
                        bind:checked={showFirstFollow}
                    />
                    Show first/follow
                </Label>
            </div>
        </div>
    </GrammarInput>
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        {#if showSteps && steps.length > 0}
            <LR1StepsTable {steps} {reducingLabels} />
        {/if}
        {#if showAutomaton && automaton !== null && !showSteps}
            <div
                class="h-[600px] w-full flex items-center justify-center border rounded-lg"
            >
                <LR1AutomatonBoard {automaton} {reducingLabels} />
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <GrammarToolLayout
        title="LR(1) Parsing Table"
        description="Calculate LR(1) automaton states and parsing table for your context-free grammar.<br/><b>Important:</b> Insert also the additional production S' -> S"
        input={InputSection}
        output={OutputSection}
    />

    <div class="flex flex-col gap-8 w-full max-w-(--breakpoint-xl) mx-auto px-4">
        {#if automaton !== null}
            {#if showAutomaton && showSteps}
                <div
                    class="h-[600px] w-full flex items-center justify-center border rounded-lg"
                >
                    <LR1AutomatonBoard {automaton} {reducingLabels} />
                </div>
            {/if}

            {#if showFirstFollow || (showTable && lr1Result)}
                <div class="w-full flex flex-col lg:flex-row gap-10">
                    {#if showFirstFollow}
                        <FirstFollowTable {firstSets} {followSets} />
                    {/if}

                    {#if showTable && lr1Result}
                        <div class="flex-1">
                            <LR1Table
                                table={lr1Result.table}
                                {grammar}
                                hasConflicts={lr1Result.hasConflicts}
                                {reducingLabels}
                            />
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>
