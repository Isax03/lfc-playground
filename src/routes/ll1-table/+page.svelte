<script lang="ts">
    import { page } from "$app/state";
    import FirstTable from "$lib/components/FirstFollowTable.svelte";
    import GrammarInput from "$lib/components/GrammarInput.svelte";
    import GrammarToolLayout from "$lib/components/GrammarToolLayout.svelte";
    import LL1Table from "$lib/components/LL1Table.svelte";
    import ParseInput from "$lib/components/ParseInput.svelte";
    import Board from "$lib/components/render/Board.svelte";
    import ParseTraceTable from "$lib/components/ParseTraceTable.svelte";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import type { TreeNode } from "$lib/types/tree";
    import type { ParseResult } from "$lib/types/parse";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { ll1Parsing } from "$lib/utils/ll1/parse";
    import { computeLL1Table } from "$lib/utils/ll1/table";
    import { decodeGrammar } from "$lib/utils/sharing";
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
    let ll1Result = $state({ table: {}, notLL1: false });
    let showParseTree = $state(false);
    let inputString = $state("");
    let parseResult = $state<ParseResult>({ tree: null, trace: [], success: false });
    let isParsed = $state(false);

    /**
     * Parses the grammar input and computes First sets, Follow sets and LL(1) table
     */
    function parseAndCompute() {
        showParseTree = false;
        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);
        ll1Result = computeLL1Table(grammar, firstSets, followSets);
    }

    /**
     * Handles Ctrl+Enter keyboard shortcut to trigger computation
     */
    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndCompute();
        }
    }

    function handleParse() {
        try {
            parseResult = ll1Parsing(inputString, ll1Result.table, grammar);
            isParsed = parseResult.success;
            showParseTree = parseResult.success;
            if (!parseResult.success) {
                alert(`Error parsing input: ${parseResult.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            showParseTree = false;
        }
    }

    function handleClear() {
        parseResult = { tree: null, trace: [], success: false };
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
            grammarInput = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> id | ( E )`;
        }
    });
</script>

<svelte:head>
    <title>LL(1) Parsing Table - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <GrammarInput
        bind:value={grammarInput}
        onCompute={parseAndCompute}
        showShare={firstSets.size > 0}
    />
    {#if ll1Result.notLL1}
        <p class="text-red-500 w-max text-center mt-2">
            This grammar is not LL(1)<br />Multiple productions found for some
            entries
        </p>
    {/if}
{/snippet}

{#snippet OutputSection()}
    <div class="flex flex-col gap-8">
        <FirstTable {firstSets} {followSets} />
        <LL1Table table={ll1Result.table} notLL1={ll1Result.notLL1} {grammar} />
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <GrammarToolLayout
        title="LL(1) Parsing Table"
        description="Calculate First, Follow sets and LL(1) parsing table for your context-free grammar"
        input={InputSection}
        output={OutputSection}
    />

    {#if firstSets.size > 0 && !ll1Result.notLL1}
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
                        <Board parseTree={parseResult.tree} />
                    </div>
                    <div class="h-[400px] md:h-[600px]">
                        <ParseTraceTable trace={parseResult.trace} />
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>
