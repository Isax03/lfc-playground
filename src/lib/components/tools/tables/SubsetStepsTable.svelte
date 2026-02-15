<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { SubsetConstructionStep } from "$lib/types/automaton";

    interface Props {
        steps: SubsetConstructionStep[];
    }
    let { steps }: Props = $props();
</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Subset Construction Steps (NFA → DFA)
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-12">#</Table.Head>
                                <Table.Head>DFA State</Table.Head>
                                <Table.Head>Symbol</Table.Head>
                                <Table.Head>Target</Table.Head>
                                <Table.Head>New?</Table.Head>
                                <Table.Head>Description</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each steps as step, i}
                                <Table.Row
                                    class="font-mono {step.isNew ? '' : 'bg-muted/50'}"
                                >
                                    <Table.Cell class="font-medium">
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell class="font-semibold">
                                        {step.dfaStateId}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.symbol ?? '—'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.targetDfaStateId ?? '—'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if step.isNew}
                                            <span class="text-green-600 font-bold">✓</span>
                                        {:else}
                                            <span class="text-muted-foreground">—</span>
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell class="text-sm max-w-md truncate">
                                        {step.description}
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
        </div>
    </div>
{/if}
