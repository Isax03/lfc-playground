<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { AutomatonStep } from "$lib/types/slr";

    interface Props {
        steps: AutomatonStep[];
    }
    let { steps }: Props = $props();
</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Steps of the SLR Automaton Construction
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto max-h-[32rem] overflow-y-scroll">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-32">Move</Table.Head>
                                <Table.Head>Kernel</Table.Head>
                                <Table.Head>Closure</Table.Head>
                                <Table.Head>State</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each steps as step}
                                <Table.Row class="font-mono {step.isExistingState ? 'bg-muted/50' : ''}">
                                    <Table.Cell class="font-medium">
                                        {#if step.fromStateId && step.symbol}
                                            &#964;({step.fromStateId}, {step.symbol})
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {@html Array.from((step.kernel ?? step.closure!!.kernel).entries())
                                            .flatMap(([nt, productions]) => 
                                                productions.map(prod => `${nt} -> ${prod.join('')}`))
                                            .join('<br />')}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if !step.isExistingState}
                                            {@html Array.from(step.closure!!.body.entries())
                                                .flatMap(([nt, productions]) => 
                                                    productions.map(prod => `${nt} -> ${prod.join('')}`))
                                                .join('<br />')}
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.stateId}
                                        {#if step.isExistingState}
                                            (existing)
                                        {/if}
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
