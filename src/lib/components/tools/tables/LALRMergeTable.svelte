<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { LALRMergeInfo } from "$lib/types/lr1";

    interface Props {
        mergeInfo: LALRMergeInfo;
        lr1StateCount: number;
        lalrStateCount: number;
    }

    let { mergeInfo, lr1StateCount, lalrStateCount }: Props = $props();

    // Only show merged states (where more than one LR(1) state was combined)
    const mergedStates = $derived(
        Object.entries(mergeInfo.mergeMap)
            .filter(([, lr1States]) => lr1States.length > 1)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
    );
</script>

<div>
    <h5 class="mb-4 text-lg font-medium tracking-tight">
        LALR State Merging
    </h5>

    <div class="mb-4 p-4 bg-muted/50 rounded-md">
        <p class="text-sm">
            <span class="font-semibold">LR(1) states:</span> {lr1StateCount}
            <span class="mx-2">→</span>
            <span class="font-semibold">LALR states:</span> {lalrStateCount}
            <span class="text-muted-foreground ml-2">
                ({lr1StateCount - lalrStateCount} states merged)
            </span>
        </p>
    </div>

    {#if mergedStates.length > 0}
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="min-w-[100px] text-center">LALR State</Table.Head>
                                <Table.Head class="min-w-[200px]">Merged from LR(1) States</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each mergedStates as [lalrState, lr1States]}
                                <Table.Row class="font-mono">
                                    <Table.Cell class="text-center font-bold">
                                        {lalrState}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {lr1States.join(", ")}
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">
            No states were merged (all LR(1) states have unique cores).
        </p>
    {/if}
</div>
