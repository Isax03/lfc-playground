<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { ThompsonStep } from "$lib/types/automaton";

    interface Props {
        steps: ThompsonStep[];
    }
    let { steps }: Props = $props();
</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Thompson's Construction Steps
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-12">#</Table.Head>
                                <Table.Head class="w-32">Sub-expression</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head class="w-24">States</Table.Head>
                                <Table.Head class="w-24">Transitions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each steps as step, i}
                                <Table.Row class="font-mono">
                                    <Table.Cell class="font-medium">
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell class="font-semibold">
                                        {step.subExpression}
                                    </Table.Cell>
                                    <Table.Cell class="text-sm">
                                        {step.description}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.nfa.states.length}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.nfa.transitions.length}
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
