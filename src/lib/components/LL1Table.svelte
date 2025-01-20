<script lang="ts">
    import type { Grammar } from "$lib/types/grammar";
    import type { LL1Table } from "$lib/types/tables";
    import * as Table from "$lib/shadcn-ui/components/ui/table";

    interface Props {
        table: LL1Table;
        notLL1: boolean;
        grammar: Grammar;
    }

    let { table, notLL1, grammar }: Props = $props();

    const terminals = $derived([...grammar.T].sort());
    const nonTerminals = $derived([...grammar.N].sort());
    const hasData = $derived(nonTerminals.length > 0 && terminals.length > 0);
</script>

{#if hasData}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">LL(1) Parsing Table</h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="font-mono whitespace-nowrap" />
                                {#each terminals as terminal}
                                    <Table.Head
                                        class="font-mono whitespace-nowrap min-w-[100px]"
                                        >{terminal}</Table.Head
                                    >
                                {/each}
                                <Table.Head
                                    class="font-mono whitespace-nowrap min-w-[100px]"
                                    >$</Table.Head
                                >
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each nonTerminals as nonTerminal}
                                <Table.Row>
                                    <Table.Cell
                                        class="font-mono font-bold whitespace-nowrap"
                                        >{nonTerminal}</Table.Cell
                                    >
                                    {#each terminals as terminal}
                                        <Table.Cell
                                            class="font-mono min-w-[100px] {table[
                                                nonTerminal
                                            ]?.[terminal]?.get(nonTerminal)!!.length > 1
                                                ? 'bg-red-100 dark:bg-red-900/20'
                                                : ''}"
                                        >
                                            {#if table[nonTerminal]?.[terminal]?.get(nonTerminal)!!.length > 0}
                                                {nonTerminal} → {table[nonTerminal][
                                                    terminal
                                                ].get(nonTerminal)!!
                                                    .map((p) =>
                                                        p.length ? p.join(" ") : "ε"
                                                    )
                                                    .join(" | ")}
                                            {/if}
                                        </Table.Cell>
                                    {/each}
                                    <Table.Cell
                                        class="font-mono min-w-[100px] {table[
                                            nonTerminal
                                        ]?.['$']?.get(nonTerminal)!!.length > 1
                                            ? 'bg-red-100 dark:bg-red-900/20'
                                            : ''}"
                                    >
                                        {#if table[nonTerminal]?.["$"]?.get(nonTerminal)!!.length > 0}
                                            {nonTerminal} → {table[nonTerminal][
                                                "$"
                                            ].get(nonTerminal)!!
                                                .map((p) =>
                                                    p.length ? p.join(" ") : "ε"
                                                )
                                                .join(" | ")}
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
