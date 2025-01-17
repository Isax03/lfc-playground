<script lang="ts">
    import FirstTable from "$lib/components/FirstTable.svelte";
import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { printGrammar } from "$lib/utils/grammar/pretty_print";

    const grammarInput = `
        A -> a
        A -> b
        S -> A a R
        S -> B B
        B -> b
        B -> ε
    `;
    
    const grammar = parseGrammar(grammarInput);
    const firstSets = computeFirstSets(grammar);
</script>

<div class="w-[500px]">
    {#each printGrammar(grammar).split("\n") as x}
        <p class="mb-2">{x}</p>
    {/each}
</div>

<FirstTable {firstSets} />
