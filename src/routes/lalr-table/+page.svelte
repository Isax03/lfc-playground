<script lang="ts">
    import { page } from "$app/state";
    import LR1AutomatonBoard from "$lib/components/render/lr1-automaton/LR1AutomatonBoard.svelte";
    import GrammarInput from "$lib/components/tools/GrammarInput.svelte";
    import GrammarToolLayout from "$lib/components/tools/GrammarToolLayout.svelte";
    import LR1StepsTable from "$lib/components/tools/tables/LR1StepsTable.svelte";
    import FirstFollowTable from "$lib/components/tools/tables/FirstFollowTable.svelte";
    import LR1Table from "$lib/components/tools/tables/LR1Table.svelte";
    import LALRMergeTable from "$lib/components/tools/tables/LALRMergeTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import type { LR1Automaton, LR1AutomatonStep, LALRMergeInfo } from "$lib/types/lr1";
    import type { ReducingLabel, SLRTable as SLRTableType } from "$lib/types/slr";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { buildLR1Automaton } from "$lib/utils/lr1/states";
    import { computeLR1Table } from "$lib/utils/lr1/table";
    import { mergeLALR } from "$lib/utils/lr1/lalr";
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

    // LR(1) automaton (before merging)
    let lr1Automaton: LR1Automaton | null = $state(null);
    let lr1Steps: LR1AutomatonStep[] = $state([]);

    // LALR automaton (after merging)
    let lalrAutomaton: LR1Automaton | null = $state(null);
    let mergeInfo: LALRMergeInfo | null = $state(null);
    let reducingLabels: ReducingLabel[] = $state([]);

    let showSteps = $state(true);
    let showAutomaton = $state(true);
    let showFirstFollow = $state(true);
    let showTable = $state(true);
    let showMergeInfo = $state(true);

    let lalrResult = $state<{
        table: SLRTableType;
        hasConflicts: boolean;
    } | null>(null);

    /**
     * Parses the grammar input and computes First sets, Follow sets, LR(1) automaton, and LALR table
     */
    async function parseAndCompute() {
        lr1Automaton = null;
        lalrAutomaton = null;
        lalrResult = null;
        mergeInfo = null;

        // Small delay for UI update
        await new Promise((resolve) => setTimeout(resolve, 100));

        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);

        // Build LR(1) automaton first
        const lr1Result = buildLR1Automaton(grammar, firstSets);
        lr1Automaton = lr1Result.automaton;
        lr1Steps = lr1Result.steps;
        reducingLabels = lr1Result.reducingLabels;

        // Merge to create LALR automaton
        if (lr1Automaton) {
            const merged = mergeLALR(lr1Automaton);
            lalrAutomaton = merged.automaton;
            mergeInfo = merged.mergeInfo;

            // Compute LALR table using merged automaton
            lalrResult = computeLR1Table(
                lalrAutomaton,
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

    // Computed state counts - use getter functions to work around TypeScript inference
    function getLR1StateCount(): number {
        return lr1Automaton ? Object.keys(lr1Automaton.states).length : 0;
    }
    function getLALRStateCount(): number {
        return lalrAutomaton ? Object.keys(lalrAutomaton.states).length : 0;
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
    <title>LALR Parsing Table - LFC Playground</title>
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
                    Show LR(1) steps
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
                <Label for="render-merge" class="flex items-center gap-2">
                    <Checkbox
                        id="render-merge"
                        bind:checked={showMergeInfo}
                    />
                    Show merge info
                </Label>
            </div>
        </div>
    </GrammarInput>
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        {#if showSteps && lr1Steps.length > 0}
            <LR1StepsTable steps={lr1Steps} {reducingLabels} />
        {/if}
        {#if showAutomaton && lalrAutomaton !== null && !showSteps}
            <div
                class="h-[600px] w-full flex items-center justify-center border rounded-lg"
            >
                <LR1AutomatonBoard automaton={lalrAutomaton} {reducingLabels} />
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <GrammarToolLayout
        title="LALR Parsing Table"
        description="Calculate LALR(1) automaton (merged from LR(1) states) and parsing table for your context-free grammar.<br/><b>Important:</b> Insert also the additional production S' -> S"
        input={InputSection}
        output={OutputSection}
    />

    <div class="flex flex-col gap-8 w-full max-w-(--breakpoint-xl) mx-auto px-4">
        {#if lalrAutomaton !== null && mergeInfo !== null}
            {#if showAutomaton && showSteps}
                <div
                    class="h-[600px] w-full flex items-center justify-center border rounded-lg"
                >
                    <LR1AutomatonBoard automaton={lalrAutomaton} {reducingLabels} />
                </div>
            {/if}

            {#if showMergeInfo}
                <LALRMergeTable
                    {mergeInfo}
                    lr1StateCount={getLR1StateCount()}
                    lalrStateCount={getLALRStateCount()}
                />
            {/if}

            {#if showFirstFollow || (showTable && lalrResult)}
                <div class="w-full flex flex-col lg:flex-row gap-10">
                    {#if showFirstFollow}
                        <FirstFollowTable {firstSets} {followSets} />
                    {/if}

                    {#if showTable && lalrResult}
                        <div class="flex-1">
                            <LR1Table
                                table={lalrResult.table}
                                {grammar}
                                hasConflicts={lalrResult.hasConflicts}
                                {reducingLabels}
                                title="LALR Parsing Table"
                            />
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>
