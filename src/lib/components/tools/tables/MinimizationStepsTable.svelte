<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { MinimizationStep } from "$lib/types/automaton";

    interface Props {
        steps: MinimizationStep[];
    }
    let { steps }: Props = $props();
</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            DFA Minimization Steps
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-12">#</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Partition</Table.Head>
                                {#if steps.some(s => s.splitSymbol)}
                                    <Table.Head>Split on</Table.Head>
                                    <Table.Head>New blocks</Table.Head>
                                {/if}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each steps as step, i}
                                <Table.Row
                                    class="font-mono {step.splitSymbol ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}"
                                >
                                    <Table.Cell class="font-medium">
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell class="text-sm max-w-md">
                                        {step.description}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each step.partition as block}
                                                <span class="inline-block px-1.5 py-0.5 rounded bg-muted text-xs">
                                                    {JSON.stringify(block)}
                                                </span>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    {#if steps.some(s => s.splitSymbol)}
                                        <Table.Cell>
                                            {step.splitSymbol ?? '—'}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {#if step.newBlocks}
                                                <div class="flex flex-wrap gap-1">
                                                    {#each step.newBlocks as block}
                                                        <span class="inline-block px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-xs">
                                                            {JSON.stringify(block)}
                                                        </span>
                                                    {/each}
                                                </div>
                                            {:else}
                                                —
                                            {/if}
                                        </Table.Cell>
                                    {/if}
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
        </div>
    </div>
{/if}
