<script lang="ts">
    import type { ParseStep } from "$lib/types/parse";
    import * as Table from "$lib/shadcn-ui/components/ui/table";

    interface Props {
        trace: ParseStep[];
    }

    let { trace }: Props = $props();
</script>

<div class="flex flex-col h-full table-div">
    <h5 class="mb-4 text-lg font-medium tracking-tight">Parsing Trace</h5>
    <div class="w-full border rounded-md overflow-auto flex-1">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head class="font-mono whitespace-nowrap bg-background sticky top-0 z-10">Stack</Table.Head>
                    <Table.Head class="font-mono whitespace-nowrap bg-background sticky top-0 z-10">Input</Table.Head>
                    <Table.Head class="font-mono whitespace-nowrap bg-background sticky top-0 z-10">Next Production</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each trace as step, i}
                    <Table.Row>
                        <Table.Cell class="font-mono whitespace-nowrap w-1/3">
                            {step.stack.join(" ")}
                        </Table.Cell>
                        <Table.Cell class="font-mono whitespace-nowrap w-1/3">
                            {step.input.join(" ")}
                        </Table.Cell>
                        <Table.Cell class="font-mono whitespace-nowrap w-1/3">
                            {#if i < trace.length - 1}
                                {trace[i + 1].production || ''}
                            {/if}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</div>

<style>
    .table-div :global(table) {
        width: 100%;
        table-layout: fixed;
    }

    .table-div :global(th) {
        border-bottom: 1px solid var(--border);
    }

    .table-div :global(th), .table-div :global(td) {
        padding: 0.5rem;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 640px) {
        .table-div :global(th), .table-div :global(td) {
            padding: 0.25rem;
            font-size: 0.75rem;
        }
    }
</style>
