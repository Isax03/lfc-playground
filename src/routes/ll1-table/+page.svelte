<script lang="ts">
    import FirstTable from "$lib/components/FirstFollowTable.svelte";
    import LL1Table from "$lib/components/LL1Table.svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { computeLL1Table } from "$lib/utils/ll1/table";
    import { parseGrammar } from "$lib/utils/grammar/parse";

    let grammarInput = $state(`E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> id | ( E )`);

    let grammar: Grammar = $state({
        N: new Set(),
        T: new Set(),
        S: "",
        P: [],
    } as Grammar);
    let firstSets: FirstSets = $state(new Map());
    let followSets: FollowSets = $state(new Map());
    let ll1Result = $state({ table: {}, notLL1: false });

    function parseAndCompute() {
        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);
        ll1Result = computeLL1Table(grammar, firstSets, followSets);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'Enter') {
            parseAndCompute();
        }
    }
</script>

<svelte:head>
    <title>LL(1) Parsing Table</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-8 w-full max-w-screen-xl mx-auto">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">LL(1) Parsing Table</h1>
        <p class="text-muted-foreground mt-2">
            Calculate First, Follow sets and LL(1) parsing table for your context-free grammar
        </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Input Section -->
        <div class="w-full lg:w-2/5">
            <p class="mb-2 text-muted-foreground">
                If you need the epsilon symbol, use `ε` or `epsilon`.
            </p>
            <Textarea bind:value={grammarInput} class="w-72 h-60 font-mono" />
            <div class="flex items-center gap-2 my-4">
                <Button onclick={parseAndCompute}>Compute</Button>
                <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span class="text-xs">Ctrl</span>+<span class="text-xs">Enter</span>
                </kbd>
            </div>
            {#if ll1Result.notLL1}
                <p class="text-red-500 w-max text-center">
                    This grammar is not LL(1)<br/>Multiple productions found for some
                    entries
                </p>
            {/if}
        </div>

        <!-- Tables Section -->
        <div class="w-full lg:w-3/5 flex flex-col gap-8">
            <FirstTable {firstSets} {followSets} />
            <LL1Table table={ll1Result.table} notLL1={ll1Result.notLL1} grammar={grammar} />
        </div>
    </div>
</div>
