<script lang="ts">
    import type { LR1Item } from "$lib/types/lr1";
    import type { ReducingLabel } from "$lib/types/slr";
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";

    interface NodeData {
        id: string;
        kernel: LR1Item[];
        closure: LR1Item[];
        isAccept?: boolean;
        isReduce?: boolean;
        reducingLabels?: ReducingLabel[];
    }

    type $$Props = NodeProps & {
        data: NodeData;
    };

    let { data, isConnectable }: $$Props = $props();

    const id = $derived(data.id);
    const kernel = $derived(data.kernel);
    const closure = $derived(data.closure);

    /**
     * Format lookahead set as comma-separated terminals
     */
    function formatLookahead(lookahead: Set<string>): string {
        return Array.from(lookahead).sort().join("/");
    }

    /**
     * Check if an item matches a reducing rule (for labeling)
     */
    function findReducingLabel(
        item: LR1Item,
        reducingLabels?: ReducingLabel[]
    ): string | undefined {
        if (!reducingLabels) return undefined;

        // Check if the dot is at the end (reducing item)
        const body = item.body;
        if (body.length === 0 || body[body.length - 1] !== "·") {
            return undefined;
        }

        // Get the body without the dot
        const bodyWithoutDot = body.filter((s) => s !== "·");

        // Handle epsilon case
        if (body.length === 1 && body[0] === "·") {
            const label = reducingLabels.find(
                (rl) => rl.rule.head === item.head && rl.rule.body.length === 1 && rl.rule.body[0] === "ε"
            )?.label;
            return label;
        }

        // Find matching reducing label
        const label = reducingLabels.find((rl) => {
            if (rl.rule.head !== item.head) return false;
            if (rl.rule.body.length !== bodyWithoutDot.length) return false;
            return rl.rule.body.every((s, i) => s === bodyWithoutDot[i]);
        })?.label;

        return label;
    }

    /**
     * Format an LR(1) item for display
     * Format: A → α · β, {a/b/$}
     */
    function formatLR1Item(
        item: LR1Item,
        reducingLabels?: ReducingLabel[]
    ): string {
        const bodyStr = item.body.join("");
        const lookaheadStr = formatLookahead(item.lookahead);
        const label = findReducingLabel(item, reducingLabels);

        // Handle epsilon case (only dot in body)
        if (item.body.length === 1 && item.body[0] === "·") {
            if (label) {
                return `${item.head} → ·, ${lookaheadStr} (${label})`;
            }
            return `${item.head} → ·, ${lookaheadStr}`;
        }

        if (label) {
            return `${item.head} → ${bodyStr}, ${lookaheadStr} (${label})`;
        }
        return `${item.head} → ${bodyStr}, ${lookaheadStr}`;
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
            {#each kernel as item}
                <div class="text-foreground">
                    {formatLR1Item(item, data.reducingLabels)}
                </div>
            {/each}
        </div>
    </div>

    {#if closure.length > 0}
        <!-- Divider -->
        <div class="my-2 border-t border-border border-2"></div>

        <!-- Closure section -->
        <div class="text-sm font-mono">
            <div class="text-xs font-semibold text-muted-foreground mb-1">
                Closure:
            </div>
            <div class="space-y-0.5">
                {#each closure as item}
                    <div class="text-foreground">
                        {formatLR1Item(item, data.reducingLabels)}
                    </div>
                {/each}
            </div>
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
