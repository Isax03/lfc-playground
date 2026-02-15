<script lang="ts">
    import { page } from "$app/state";
    import FSABoard from "$lib/components/render/fsa/FSABoard.svelte";
    import RegexInput from "$lib/components/tools/RegexInput.svelte";
    import RegexToolLayout from "$lib/components/tools/RegexToolLayout.svelte";
    import TransitionTable from "$lib/components/tools/tables/TransitionTable.svelte";
    import Checkbox from "$lib/shadcn-ui/components/ui/checkbox/checkbox.svelte";
    import { Label } from "$lib/shadcn-ui/components/ui/label";
    import type { DFA, NFA } from "$lib/types/automaton";
    import { parseRegex, thompsonConstruction, subsetConstruction } from "$lib/utils/automaton";
    import { generateDFALayout } from "$lib/utils/automaton/fsaLayoutGenerator";
    import { onMount } from "svelte";

    let regexInput = $state("");
    let nfa: NFA | null = $state(null);
    let dfa: DFA | null = $state(null);
    let error = $state("");

    let showAutomaton = $state(true);
    let showTable = $state(true);

    function compute() {
        error = "";
        nfa = null;
        dfa = null;
        try {
            const ast = parseRegex(regexInput);
            const thompson = thompsonConstruction(ast);
            nfa = thompson.nfa;
            const subset = subsetConstruction(nfa);
            dfa = subset.dfa;
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

    const layout = $derived(dfa ? generateDFALayout(dfa) : null);
</script>

<svelte:head>
    <title>Regex → DFA - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <RegexInput
        bind:value={regexInput}
        onCompute={compute}
        showShare={dfa !== null}
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

        {#if dfa}
            {#if showTable}
                <TransitionTable {dfa} title="DFA Transition Table" />
            {/if}

            <div class="p-3 border rounded-md bg-muted/50">
                <p class="text-sm"><strong>States:</strong> {dfa.states.length} &nbsp; | &nbsp; <strong>Alphabet:</strong> {`{${dfa.alphabet.join(', ')}}`} &nbsp; | &nbsp; <strong>Accept:</strong> {dfa.acceptStates.join(', ')}</p>
            </div>
        {/if}
    </div>
{/snippet}

<div class="flex flex-col gap-5 w-full">
    <RegexToolLayout
        title="Regex → DFA"
        description="Convert a regular expression directly to a DFA (via Thompson's construction + subset construction)."
        input={InputSection}
        output={OutputSection}
    />

    {#if dfa && showAutomaton && layout}
        <div class="w-full max-w-(--breakpoint-xl) mx-auto px-4">
            <h5 class="mb-4 text-lg font-medium tracking-tight">DFA Automaton</h5>
            <div class="h-125 w-full flex items-center justify-center border rounded-lg">
                <FSABoard nodes={layout.nodes} edges={layout.edges} title="DFA" />
            </div>
        </div>
    {/if}
</div>
