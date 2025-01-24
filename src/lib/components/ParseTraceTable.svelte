<script lang="ts">
    import type { ParseStep } from "$lib/types/parse";
    import * as Table from "$lib/shadcn-ui/components/ui/table";

    interface Props {
        trace: ParseStep[];
    }

    let { trace }: Props = $props();
</script>

<div class="flex flex-col h-full">
    <h5 class="mb-4 text-lg font-medium tracking-tight sticky top-0 bg-background">Parsing Trace</h5>
    <div class="w-full border rounded-md parse-trace-table">
        <Table.Root>
            <Table.Header class="sticky top-0 bg-background z-10">
                <Table.Row>
                    <Table.Head class="font-mono whitespace-nowrap">Stack</Table.Head>
                    <Table.Head class="font-mono whitespace-nowrap">Input</Table.Head>
                    <Table.Head class="font-mono whitespace-nowrap">Next Production</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body class="overflow-y-auto">
                {#each trace as step, i}
                    <Table.Row>
                        <Table.Cell class="font-mono whitespace-nowrap">
                            {step.stack.join(" ")}
                        </Table.Cell>
                        <Table.Cell class="font-mono whitespace-nowrap">
                            {step.input.join(" ")}
                        </Table.Cell>
                        <Table.Cell class="font-mono whitespace-nowrap">
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
    .parse-trace-table :global(table) {
        display: block;
        max-height: 100%;
        overflow-y: auto;
        width: 100%;
    }
    
    .parse-trace-table :global(thead) {
        position: sticky;
        top: 0;
        z-index: 1;
        width: 100%;
    }

    .parse-trace-table :global(tr) {
        display: table;
        width: 100%;
        table-layout: fixed;
        font-size: 0.875rem;
    }

    .parse-trace-table :global(th),
    .parse-trace-table :global(td) {
        width: 33.33%;
        padding: 0.5rem;
    }

    @media (max-width: 640px) {
        .parse-trace-table :global(tr) {
            font-size: 0.75rem;
        }
        
        .parse-trace-table :global(th),
        .parse-trace-table :global(td) {
            padding: 0.25rem;
        }
    }
</style>
