<script lang="ts">
    import { page } from "$app/state";
    import FirstFollowTable from "$lib/components/tools/tables/FirstFollowTable.svelte";
    import GrammarInput from "$lib/components/tools/GrammarInput.svelte";
    import GrammarToolLayout from "$lib/components/tools/GrammarToolLayout.svelte";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import type {
        AutomatonBuildResult,
        AutomatonStep,
        StatesAutomaton,
    } from "$lib/types/slr";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { buildSlrAutomaton } from "$lib/utils/slr/states";
    import { onMount } from "svelte";
    import AutomatonStepsTable from "$lib/components/tools/tables/AutomatonStepsTable.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";

    let grammarInput = $state("");

    let grammar: Grammar = $state({
        N: new Set(),
        T: new Set(),
        S: "",
        P: new Map(),
    } as Grammar);
    let firstSets: FirstSets = $state(new Map());
    let followSets: FollowSets = $state(new Map());
    let automaton: StatesAutomaton = $state({
        states: {},
        transitions: {},
    });
    let steps: AutomatonStep[] = $state([]);
    let showSteps = $state(false);
    let showParseTree = $state(false);
    let inputString = $state("");
    let isParsed = $state(false);

    /**
     * Parses the grammar input and computes First sets, Follow sets and LL(1) table
     */
    function parseAndCompute() {
        showParseTree = false;
        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);
        ({ automaton, steps } = buildSlrAutomaton(grammar));
    }

    /**
     * Handles Ctrl+Enter keyboard shortcut to trigger computation
     */
    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndCompute();
        }
    }

    // function handleParse() {
    //     try {
    //         parseResult = slrParsing(inputString, ll1Result.table, grammar);
    //         isParsed = parseResult.success;
    //         showParseTree = parseResult.success;
    //         if (!parseResult.success) {
    //             alert(`Error parsing input: ${parseResult.error}`);
    //         }
    //     } catch (error: any) {
    //         alert(`Error: ${error.message}`);
    //         showParseTree = false;
    //     }
    // }

    function handleClear() {
        // parseResult = { tree: null, trace: [], success: false };
        showParseTree = false;
        isParsed = false;
        inputString = "";
    }

    onMount(() => {
        // Load grammar from URL parameters if available, otherwise use example grammar
        let grammarParam = page.url.searchParams.get("grammar") || "";
        if (grammarParam !== "") {
            grammarInput = decodeGrammar(grammarParam) || grammarInput;
            parseAndCompute();
        } else {
            grammarInput = `S' -> S
S -> a A B e
A -> A b c | b
B -> d`;
        }
    });
</script>

<svelte:head>
    <title>SLR Parsing Table - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <GrammarInput
        bind:value={grammarInput}
        onCompute={parseAndCompute}
        showShare={firstSets.size > 0}
    >
        <div class="flex items-center gap-2 my-4">
            <Checkbox id="render-steps" bind:checked={showSteps} />
            <Label for="render-steps">Show steps</Label>
        </div>
    </GrammarInput>
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        <!-- <FirstFollowTable {firstSets} {followSets} /> -->
        {#if showSteps}
            <AutomatonStepsTable {steps} />
        {/if}
        <!-- <SLRTable table={ll1Result.table} {grammar} /> -->
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <GrammarToolLayout
        title="SLR Parsing Table"
        description="Calculate automaton states and SLR parsing table for your context-free grammar.<br/><b>Important:</b> Insert also the additional production S' -> S"
        input={InputSection}
        output={OutputSection}
    />

    <!-- {#if firstSets.size > 0 /* && !ll1Result.notLL1 */}
        <div class="p-4 border rounded-lg mx-4 md:mx-32">
            <div class="max-w-full md:max-w-lg">
                <ParseInput
                    bind:inputString
                    onParse={handleParse}
                    onClear={handleClear}
                    {isParsed}
                />
            </div>

            {#if showParseTree}
                <div class="mt-4 flex flex-col lg:grid lg:grid-cols-2 gap-4">
                    <div class="h-[400px] md:h-[600px] flex items-center justify-center border rounded-lg">
                        <ParseTreeBoard parseTree={parseResult.tree} />
                    </div>
                    <div class="h-[400px] md:h-[600px]">
                        <ParseTraceTable trace={parseResult.trace} />
                    </div>
                </div>
            {/if}
        </div>
    {/if} -->
</div>
