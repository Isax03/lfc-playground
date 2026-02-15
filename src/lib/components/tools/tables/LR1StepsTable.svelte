<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { LR1AutomatonStep, LR1Item } from "$lib/types/lr1";
    import type { ReducingLabel } from "$lib/types/slr";
    import { isRuleEqual } from "$lib/utils/utils";

    interface Props {
        steps: LR1AutomatonStep[];
        reducingLabels?: ReducingLabel[];
    }
    let { steps, reducingLabels = [] }: Props = $props();

    function formatLookahead(lookahead: Set<string>): string {
        return [...lookahead].sort().join(", ");
    }

    function formatLR1Item(item: LR1Item): string {
        const bodyStr = item.body.join(" ");
        const lookaheadStr = formatLookahead(item.lookahead);
        let formatted = `[${item.head} → ${bodyStr}, {${lookaheadStr}}]`;

        // Check for reducing item
        if (item.body.length === 1 && item.body[0] === "·") {
            const rule = { head: item.head, body: ["ε"] };
            const label = reducingLabels?.find((rl) => isRuleEqual(rl.rule, rule))?.label;
            if (label) {
                formatted = `[${item.head} → ·, {${lookaheadStr}}] (${label})`;
            }
        } else if (item.body[item.body.length - 1] === "·") {
            const rule = {
                head: item.head,
                body: item.body.filter((s) => s !== "·"),
            };
            const label = reducingLabels?.find((rl) => isRuleEqual(rl.rule, rule))?.label;
            if (label) {
                formatted = `[${item.head} → ${bodyStr}, {${lookaheadStr}}] (${label})`;
            }
        }

        return formatted;
    }

</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Steps of the LR(1) Automaton Construction
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto max-h-128 overflow-y-scroll">
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
                                <Table.Row
                                    class="font-mono text-sm {step.isExistingState
                                        ? 'bg-muted/50'
                                        : ''}"
                                >
                                    <Table.Cell class="font-medium">
                                        {#if step.fromStateId && step.symbol}
                                            τ({step.fromStateId}, {step.symbol})
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#each step.kernel ?? step.closure?.kernel ?? [] as item, i}
                                            {formatLR1Item(item)}{#if i < (step.kernel ?? step.closure?.kernel ?? []).length - 1}<br />{/if}
                                        {/each}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if !step.isExistingState && step.closure}
                                            {#each step.closure.body as item, i}
                                                {formatLR1Item(item)}{#if i < step.closure.body.length - 1}<br />{/if}
                                            {/each}
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
