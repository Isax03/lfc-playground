<script lang="ts">
    import { page } from "$app/state";
    import ShareLink from "$lib/components/ShareLink.svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { Grammar } from "$lib/types/grammar";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { stringifyGrammar } from "$lib/utils/grammar/pretty_print";
    import { factorizeToLeft } from "$lib/utils/ll1/left-factorization";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { onMount } from "svelte";

    let grammarInput = $state("");
    let transformedGrammar = $state("");
    let showOutput = $state(false);

    function parseAndTransform() {
        const grammar: Grammar = parseGrammar(grammarInput);
        const transformed = factorizeToLeft(grammar);

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
    <title>Left Factoring</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Left Factoring</h1>
        <p class="text-muted-foreground mt-2">
            Apply left factoring to your context-free grammar
        </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Input Section -->
        <div class="w-full lg:w-2/5">
            <p class="mb-2 text-muted-foreground">
                If you need the epsilon symbol, use `ε` or `epsilon`.
            </p>
            <Textarea bind:value={grammarInput} class="w-72 h-60 font-mono resize" />
            <div class="flex gap-2 mt-4">
                <div class="flex items-center gap-2">
                    <Button onclick={parseAndTransform}>Compute</Button>
                    <kbd
                        class="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden md:inline-flex"
                    >
                        <span class="text-xs">Ctrl</span>+<span class="text-xs"
                            >Enter</span
                        >
                    </kbd>
                </div>
                {#if showOutput}
                    <ShareLink grammar={grammarInput} />
                {/if}
            </div>
        </div>

        <!-- Output Section -->
        <div class="w-full lg:w-3/5">
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
        </div>
    </div>
</div>
