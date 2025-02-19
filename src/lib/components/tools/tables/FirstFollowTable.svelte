<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { FirstSets, FollowSets } from "$lib/types/first-follow";
    import { sortSetElements } from "$lib/utils/sets";

    interface Props {
        firstSets: FirstSets;
        followSets: FollowSets;
    }

    let { firstSets, followSets }: Props = $props();

    // Check if there's data to display
    let hasData = $derived(firstSets.size > 0);

    // Get sorted list of non-terminals
    let nonTerminals = $derived([...firstSets.keys()].sort());
</script>

<!-- Display First and Follow sets in a table -->
{#if hasData}
    <div class="flex flex-col w-full max-w-2xl">
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            First/Follow Table
        </h5>
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
    </div>
{/if}

<style>
    /* Ensure cells adapt to content */
    :global(th), :global(td) {
        white-space: normal !important;
        word-wrap: break-word;
    }
</style>
