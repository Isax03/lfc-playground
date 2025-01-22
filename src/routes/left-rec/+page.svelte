<script lang="ts">
    import { page } from "$app/state";
    import ShareLink from "$lib/components/ShareLink.svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { Grammar } from "$lib/types/grammar";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { stringifyGrammar } from "$lib/utils/grammar/pretty_print";
    import { eliminateLeftRecursion } from "$lib/utils/ll1/left-recursion";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { onMount } from "svelte";
    import GrammarToolLayout from "$lib/components/GrammarToolLayout.svelte";
    import ComputeButtonGroup from "$lib/components/ComputeButtonGroup.svelte";
    import GrammarInput from "$lib/components/GrammarInput.svelte";

    let grammarInput = $state("");
    let transformedGrammar = $state("");
    let showOutput = $state(false);

    function parseAndTransform() {
        const grammar: Grammar = parseGrammar(grammarInput);
        const transformed = eliminateLeftRecursion(grammar);

        // Format the transformed grammar
        transformedGrammar = stringifyGrammar(transformed);

        showOutput = true;
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(transformedGrammar);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndTransform();
        }
    }

    onMount(() => {
        let grammarParam = page.url.searchParams.get("grammar") || "";
        if (grammarParam !== "") {
            grammarInput = decodeGrammar(grammarParam) || grammarInput;
            parseAndTransform();
        }
        else {
            grammarInput = "S -> S a | b";
        }
    });
</script>

<svelte:head>
    <title>Left Recursion</title>
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
            <h5 class="mb-4 text-lg font-medium tracking-tight">Resulting Grammar</h5>
            <div class="w-max max-w-full">
                <p class="p-4 max-w-full bg-muted rounded-md font-mono whitespace-pre-wrap break-words">
                    {transformedGrammar}
                </p>
            </div>
        </div>
    {/if}
{/snippet}

<GrammarToolLayout
    title="Left Recursion"
    description="Remove left recursion from your context-free grammar"
    input={InputSection}
    output={OutputSection}
/>
