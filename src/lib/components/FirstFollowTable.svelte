<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    export let firstSets: FirstSets;
    export let followSets: FollowSets;

    $: hasData = firstSets.size > 0;
</script>



{#if hasData}
    <div class="w-full border rounded-md">
        <Table.Root class="w-full">
            <Table.Header>
                <Table.Row>
                    <Table.Head class="w-[100px]">Non-terminal</Table.Head>
                    <Table.Head>First</Table.Head>
                    <Table.Head>Follow</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each [...firstSets.entries()] as [nonTerminal, firstSet]}
                    <Table.Row>
                        <Table.Cell class="font-medium">{nonTerminal}</Table.Cell>
                        <Table.Cell>{[...firstSet].join(', ')}</Table.Cell>
                        <Table.Cell>{[...followSets.get(nonTerminal) ?? []].join(', ')}</Table.Cell>
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
