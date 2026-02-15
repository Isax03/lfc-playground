<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { AutomatonStep, ReducingLabel } from "$lib/types/slr";
    import { isRuleEqual } from "$lib/utils/utils";

    interface Props {
        steps: AutomatonStep[];
        reducingLabels?: ReducingLabel[];
    }
    let { steps, reducingLabels = [] }: Props = $props();

    function formatProduction(nt: string, prod: string[]): string {
        const formatted = `${nt} -> ${prod.join("")}`;
        if (prod.length === 1 && prod[0] === "·") {
            const rule = {
                head: nt,
                body: ["ε"],
            };
            const label = reducingLabels?.find((rl) =>
                isRuleEqual(rl.rule, rule)
            )?.label;
            if (label) {
                return `${nt} -> · (${label})`;
            }
            return `${nt} -> ·`;
        } else if (prod[prod.length - 1] === "·") {
            const rule = {
                head: nt,
                body: prod.filter((s) => s !== "·"),
            };
            const label = reducingLabels?.find((rl) =>
                isRuleEqual(rl.rule, rule)
            )?.label;
            if (label) {
                return `${formatted} (${label})`;
            }
        }
        return formatted;
    }
</script>

{#if steps.length > 0}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            Steps of the SLR Automaton Construction
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
                                    class="font-mono {step.isExistingState
                                        ? 'bg-muted/50'
                                        : ''}"
                                >
                                    <Table.Cell class="font-medium">
                                        {#if step.fromStateId && step.symbol}
                                            &#964;({step.fromStateId}, {step.symbol})
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {@html Array.from(
                                            (
                                                step.kernel ??
                                                step.closure!!.kernel
                                            ).entries()
                                        )
                                            .flatMap(([nt, productions]) =>
                                                productions.map((prod) =>
                                                    formatProduction(nt, prod)
                                                )
                                            )
                                            .join("<br />")}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if !step.isExistingState}
                                            {@html Array.from(
                                                step.closure!!.body.entries()
                                            )
                                                .flatMap(([nt, productions]) =>
                                                    productions.map((prod) =>
                                                        formatProduction(
                                                            nt,
                                                            prod
                                                        )
                                                    )
                                                )
                                                .join("<br />")}
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
