<script lang="ts">
    import { page } from "$app/state";
    import FSABoard from "$lib/components/render/fsa/FSABoard.svelte";
    import RegexInput from "$lib/components/tools/RegexInput.svelte";
    import RegexToolLayout from "$lib/components/tools/RegexToolLayout.svelte";
    import TransitionTable from "$lib/components/tools/tables/TransitionTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { MinDFA } from "$lib/types/automaton";
    import { parseRegex, thompsonConstruction, subsetConstruction, minimizeDFA } from "$lib/utils/automaton";
    import { generateMinDFALayout } from "$lib/utils/automaton/fsaLayoutGenerator";
    import { onMount } from "svelte";

    let regexInput = $state("");
    let minDfa: MinDFA | null = $state(null);
    let error = $state("");

    let showAutomaton = $state(true);
    let showTable = $state(true);

    function compute() {
        error = "";
        minDfa = null;
        try {
            const ast = parseRegex(regexInput);
            const { nfa } = thompsonConstruction(ast);
            const { dfa } = subsetConstruction(nfa);
            const result = minimizeDFA(dfa);
            minDfa = result.minDfa;
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

    const layout = $derived(minDfa ? generateMinDFALayout(minDfa) : null);
</script>

<svelte:head>
    <title>Regex → Min-DFA - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <RegexInput
        bind:value={regexInput}
        onCompute={compute}
        showShare={minDfa !== null}
    >
        <div class="flex flex-wrap items-center gap-4">
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
                <p class="font-medium">Error:</p>
                <p class="font-mono text-sm">{error}</p>
            </div>
        {/if}

        {#if minDfa}
            {#if showTable}
                <TransitionTable {minDfa} title="Min-DFA Transition Table" />
            {/if}

            <div class="p-3 border rounded-md bg-muted/50">
                <p class="text-sm"><strong>States:</strong> {minDfa.states.length} &nbsp; | &nbsp; <strong>Alphabet:</strong> {`{${minDfa.alphabet.join(', ')}}`} &nbsp; | &nbsp; <strong>Accept:</strong> {minDfa.acceptStates.join(', ')}</p>
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <RegexToolLayout
        title="Regex → Min-DFA"
        description="Convert a regular expression directly to its minimized DFA (via Thompson → Subset Construction → Minimization)."
        input={InputSection}
        output={OutputSection}
    />

    {#if minDfa && showAutomaton && layout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">Min-DFA Automaton</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={layout.nodes} edges={layout.edges} title="Min-DFA" />
            </div>
        </div>
    {/if}
</div>
