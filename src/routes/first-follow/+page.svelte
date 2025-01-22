<script lang="ts">
    import { page } from "$app/state";
    import FirstTable from "$lib/components/FirstFollowTable.svelte";
    import GrammarToolLayout from "$lib/components/GrammarToolLayout.svelte";
    import ComputeButtonGroup from "$lib/components/ComputeButtonGroup.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
    import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { decodeGrammar } from "$lib/utils/sharing";
    import { onMount } from "svelte";
    import GrammarInput from "$lib/components/GrammarInput.svelte";

    let grammarInput = $state("");

    let grammar: Grammar = $state({
        N: new Set(),
        T: new Set(),
        S: "",
        P: new Map(),
    } as Grammar);
    let firstSets: FirstSets = $state(new Map());
    let followSets: FollowSets = $state(new Map());

    function parseAndCompute() {
        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter") {
            parseAndCompute();
        }
    }

    onMount(() => {
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
    <title>First & Follow - LFC Playground</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#snippet InputSection()}
    <GrammarInput 
        bind:value={grammarInput}
        onCompute={parseAndCompute}
        showShare={firstSets.size > 0}
    />
{/snippet}

{#snippet OutputSection()}
    <FirstTable {firstSets} {followSets} />
{/snippet}

<GrammarToolLayout
    title="First & Follow Sets"
    description="Calculate First and Follow sets for your context-free grammar"
    input={InputSection}
    output={OutputSection}
/>
