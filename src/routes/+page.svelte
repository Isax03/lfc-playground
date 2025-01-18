<script lang="ts">
    import FirstTable from "$lib/components/FirstFollowTable.svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import type { Grammar } from "$lib/types/grammar";
import { computeFirstSets } from "$lib/utils/first-follow/first";
    import { computeFollow } from "$lib/utils/first-follow/follow";
    import { parseGrammar } from "$lib/utils/grammar/parse";
    import { printGrammar } from "$lib/utils/grammar/pretty_print";

    let grammarInput = $state(`E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> id | ( E )`);

    let grammar: Grammar = $state({
        N: new Set(),
        T: new Set(),
        S: "",
        P: []
    } as Grammar);
    let firstSets: FirstSets = $state(new Map());
    let followSets: FollowSets = $state(new Map());

    function parseAndCompute() {
        grammar = parseGrammar(grammarInput);
        firstSets = computeFirstSets(grammar);
        followSets = computeFollow(grammar, firstSets);
    }
</script>
<div class="w-[500px] mr-10">
    If you need the epsilon symbol, use `ε` or `epsilon`.
    <Textarea bind:value={grammarInput} class="w-full h-60 mt-5" />
    <Button onclick={parseAndCompute} class="mt-4">Compute</Button>
</div>
<div class="w-[500px]">
    {#each printGrammar(grammar).split("\n") as x}
        <p class="mb-2">{x}</p>
    {/each}
</div>

<FirstTable {firstSets} {followSets} />
