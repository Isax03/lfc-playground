<script lang="ts">
    import { page } from "$app/state";
    import GrammarInput from "$lib/components/tools/GrammarInput.svelte";
    import GrammarToolLayout from "$lib/components/tools/GrammarToolLayout.svelte";
    import type { Grammar } from "$lib/types/grammar";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { stringifyGrammar } from "$lib/utils/grammar/pretty_print";
    import { factorizeToLeft } from "$lib/utils/ll1/left-factorization";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { onMount } from "svelte";

    let grammarInput = $state("");
    let transformedGrammar = $state("");
    let showOutput = $state(false);

    /**
     * Parses the input grammar and applies left factoring transformation
     */
    function parseAndTransform() {
        const grammar: Grammar = parseGrammar(grammarInput);
        const transformed = factorizeToLeft(grammar);

        // Format the transformed grammar
        transformedGrammar = stringifyGrammar(transformed);

        showOutput = true;
    }

    /**
     * Copies the transformed grammar to clipboard
     */
    function copyToClipboard() {
        navigator.clipboard.writeText(transformedGrammar);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndTransform();
        }
    }

    onMount(() => {
        // Load grammar from URL parameters if available, otherwise use example grammar
        let grammarParam = page.url.searchParams.get("grammar") || "";
        if (grammarParam !== "") {
            grammarInput = decodeGrammar(grammarParam) || grammarInput;
            parseAndTransform();
        } else {
            grammarInput = "S -> S a | b";
        }
    });
</script>

<svelte:head>
    <title>Left Factoring - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <GrammarInput
        bind:value={grammarInput}
        onCompute={parseAndTransform}
        showShare={showOutput}
    />
{/snippet}

{#snippet OutputSection()}
    {#if showOutput && transformedGrammar}
        <div class="w-max max-w-full h-max flex flex-col">
            <h5 class="mb-4 text-lg font-medium tracking-tight">
                Resulting Grammar
            </h5>
            <div class="w-max max-w-full">
                <p
                    class="p-4 max-w-full bg-muted rounded-md font-mono whitespace-pre-wrap break-words"
                >
                    {transformedGrammar}
                </p>
            </div>
        </div>
    {/if}
{/snippet}

<GrammarToolLayout
    title="Left Factoring"
    description="Apply left factoring to your context-free grammar"
    input={InputSection}
    output={OutputSection}
/>
