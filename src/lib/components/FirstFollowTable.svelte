<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import { sortSetElements } from "$lib/utils/sets";

    export let firstSets: FirstSets;
    export let followSets: FollowSets;

    $: hasData = firstSets.size > 0;

    // Get sorted non-terminals
    $: nonTerminals = [...firstSets.keys()].sort();
</script>



{#if hasData}
    <div class="w-full border rounded-md">
        <Table.Root class="w-full">
            <Table.Header>
                <Table.Row>
                    <Table.Head class="w-32">Non-terminal</Table.Head>
                    <Table.Head>First</Table.Head>
                    <Table.Head>Follow</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each nonTerminals as nonTerminal}
                    <Table.Row class="font-mono">
                        <Table.Cell class="font-medium">{nonTerminal}</Table.Cell>
                        <Table.Cell>{`${sortSetElements(firstSets.get(nonTerminal) ?? new Set()).join(', ')}`}</Table.Cell>
                        <Table.Cell>{`${sortSetElements(followSets.get(nonTerminal) ?? new Set()).join(', ')}`}</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
{/if}

<style>
    /* Assicurati che le celle si adattino al contenuto */
    :global(th), :global(td) {
        white-space: normal !important;
        word-wrap: break-word;
    }
</style>
