<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { ShiftReduceStep } from "$lib/types/parse";

    interface Props {
        trace: ShiftReduceStep[];
    }

    let { trace }: Props = $props();
</script>

{#if trace.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Shift/Reduce Parsing Trace
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto max-h-128 overflow-y-scroll">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="min-w-[60px] text-center">#</Table.Head>
                                <Table.Head class="min-w-[120px]">State Stack</Table.Head>
                                <Table.Head class="min-w-[150px]">Symbol Stack</Table.Head>
                                <Table.Head class="min-w-[150px]">Input</Table.Head>
                                <Table.Head class="min-w-[200px]">Action</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each trace as step, index}
                                <Table.Row class="font-mono text-sm">
                                    <Table.Cell class="text-center text-muted-foreground">
                                        {index}
                                    </Table.Cell>
                                    <Table.Cell>
                                        [{step.stateStack.join(", ")}]
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if step.symbolStack.length === 0}
                                            <span class="text-muted-foreground">ε</span>
                                        {:else}
                                            {step.symbolStack.join(" ")}
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {step.input.join(" ")}
                                    </Table.Cell>
                                    <Table.Cell class="{step.action === 'accept' ? 'text-green-600 dark:text-green-400 font-semibold' : ''} {step.action.startsWith('error') ? 'text-red-600 dark:text-red-400' : ''}">
                                        {step.action}
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
