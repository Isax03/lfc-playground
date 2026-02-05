<script lang="ts">
    import type { Grammar } from "$lib/types/grammar";
    import type { SLRTable, SLRMove, ReducingLabel } from "$lib/types/slr";
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import { isRuleEqual } from "$lib/utils/utils";

    interface Props {
        table: SLRTable;
        grammar: Grammar;
        hasConflicts: boolean;
        reducingLabels: ReducingLabel[];
        title?: string;
    }

    let { table, grammar, hasConflicts, reducingLabels, title = "LR(1) Parsing Table" }: Props = $props();

    // Sort symbols for consistent table display
    const terminals = $derived([...grammar.T].sort());
    const nonTerminals = $derived([...grammar.N].sort());
    const stateIds = $derived(Object.keys(table).sort((a, b) => Number(a) - Number(b)));

    function formatMove(move: SLRMove): string {
        if (move === "accept") return "accept";
        if (move === "error") return "";
        if (typeof move === "number") return move.toString();
        if (move.action === "shift") return `s${move.state}`;
        if (move.action === "reduce") {
            const [[head, bodies]] = move.rule.entries();
            const body = bodies[0];
            // Find the reducing label
            const label = reducingLabels.find(rl =>
                rl.rule.head === head &&
                isRuleEqual(rl.rule, { head, body: body.filter(s => s !== "·") })
            );
            return label ? label.label : "r?";
        }
        if (move.action === "conflict") {
            return move.moves.map(m => formatMove(m)).join("/");
        }
        return "";
    }

    function getCellClass(move: SLRMove): string {
        if (typeof move === 'object' && 'action' in move && move.action === "conflict") {
            return "bg-red-100 dark:bg-red-900/20";
        }
        return "";
    }
</script>

{#if stateIds.length > 0}
<div>
    <h5 class="mb-4 text-lg font-medium tracking-tight">
        {title}
        {#if hasConflicts}
            <span class="text-red-500 ml-2">(has conflicts)</span>
        {:else}
            <span class="text-green-500 ml-2">(no conflicts)</span>
        {/if}
    </h5>
    <div class="w-full border rounded-md">
        <div class="overflow-x-auto">
            <div class="min-w-max">
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="font-mono text-center">State</Table.Head>
                            <!-- Terminals -->
                            {#each terminals as terminal}
                                <Table.Head class="font-mono min-w-[80px] text-center">{terminal}</Table.Head>
                            {/each}
                            <!-- End marker -->
                            <Table.Head class="font-mono min-w-[80px] text-center">$</Table.Head>
                            <!-- Non-terminals -->
                            {#each nonTerminals as nonTerminal}
                                <Table.Head class="font-mono min-w-[80px] border-l-2 text-center">{nonTerminal}</Table.Head>
                            {/each}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each stateIds as stateId}
                            <Table.Row>
                                <Table.Cell class="font-mono font-bold text-center">{stateId}</Table.Cell>
                                <!-- Terminals -->
                                {#each terminals as terminal}
                                    <Table.Cell class="font-mono text-center {getCellClass(table[stateId][terminal])}">
                                        {formatMove(table[stateId][terminal])}
                                    </Table.Cell>
                                {/each}
                                <!-- End marker -->
                                <Table.Cell class="font-mono text-center {getCellClass(table[stateId]['$'])}">
                                    {formatMove(table[stateId]["$"])}
                                </Table.Cell>
                                <!-- Non-terminals -->
                                {#each nonTerminals as nonTerminal}
                                    <Table.Cell class="font-mono border-l-2 text-center {getCellClass(table[stateId][nonTerminal])}">
                                        {formatMove(table[stateId][nonTerminal])}
                                    </Table.Cell>
                                {/each}
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
        </div>
    </div>
</div>
{/if}
