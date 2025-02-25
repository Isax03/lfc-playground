<script lang="ts">
    import type { ProductionRule } from "$lib/types/grammar";
    import type { ReducingLabel } from "$lib/types/slr";
    import { isRuleEqual } from "$lib/utils/utils";
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";

    interface NodeData {
        id: string;
        kernel: ProductionRule;
        closure: ProductionRule;
        isAccept?: boolean;
        isReduce?: boolean;
        reducingLabels?: ReducingLabel[];
    }

    type $$Props = NodeProps & {
        data: NodeData;
    };

    export let data: NodeData;
    export let isConnectable: $$Props["isConnectable"];

    let id: string;
    let kernel: ProductionRule;
    let closure: ProductionRule;

    ({ id, kernel, closure } = data);

    function formatProduction(
        nt: string,
        prod: string[],
        reducingLabels?: ReducingLabel[]
    ): string {
        // Per le produzioni nella closure, mostriamo sempre il marker
        const formatted = `${nt} → ${prod.join("")}`;

        if (prod.length === 1 && prod[0] === "·") {
            const rule = {
                head: nt,
                body: ["ε"],
            };
            const label = reducingLabels?.find((rl) =>
                isRuleEqual(rl.rule, rule)
            )?.label;
            if (label) {
                // Per le closure items mostriamo il marker
                return `${nt} → · (${label})`;
            }
            return `${nt} → ·`;
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

<Handle
    type="source"
    id="left"
    position={Position.Left}
    style="opacity: 0"
    {isConnectable}
/>
<Handle
    type="source"
    id="top"
    position={Position.Top}
    style="opacity: 0"
    {isConnectable}
/>
<div class="p-4 border rounded-md bg-card shadow-xs min-w-[200px] relative">
    <!-- State ID badge -->
    <div
        class="absolute -top-3 -left-2 bg-primary text-primary-foreground text-sm font-bold px-2 py-0.5 rounded-md shadow-xs"
    >
        {id}
    </div>

    <!-- Accept/Reduce badges -->
    {#if data.isAccept}
        <div
            class="absolute -top-3 -right-2 bg-yellow-500/80 text-yellow-950 text-sm font-bold px-2 py-0.5 rounded-md shadow-xs"
        >
            ACC
        </div>
    {/if}
    {#if data.isReduce}
        <div
            class="absolute -top-3 -right-2 bg-blue-400/80 text-blue-950 text-sm font-bold px-2 py-0.5 rounded-md shadow-xs"
        >
            RED
        </div>
    {/if}

    <!-- Kernel section -->
    <div class="mt-3 text-sm font-mono">
        <div class="text-xs font-semibold text-muted-foreground mb-1">
            Kernel:
        </div>
        <div class="space-y-0.5">
            {#each Array.from(kernel.entries()) as [nt, productions]}
                {#each productions as prod}
                    <div class="text-foreground">
                        {formatProduction(nt, prod, data.reducingLabels)}
                    </div>
                {/each}
            {/each}
        </div>
    </div>

    {#if closure.size > 0}
        <!-- Divider -->
        <div class="my-2 border-t border-border border-2"></div>

        <!-- Closure section -->
        <div class="text-sm font-mono">
            <div class="text-xs font-semibold text-muted-foreground mb-1">
                Closure:
            </div>
            <div class="space-y-0.5"></div>
            {#each Array.from(closure.entries()) as [nt, productions]}
                {#each productions as prod}
                    <div class="text-foreground">
                        {formatProduction(nt, prod, data.reducingLabels)}
                    </div>
                {/each}
            {/each}
        </div>
    {/if}
</div>
<Handle
    type="source"
    id="right"
    position={Position.Right}
    style="opacity: 0"
    {isConnectable}
/>
<Handle
    type="source"
    id="bottom"
    position={Position.Bottom}
    style="opacity: 0"
    {isConnectable}
/>

<style>
</style>
