<script lang="ts">
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";

    interface NodeData {
        label: string;
        isStart: boolean;
        isAccept: boolean;
        extraLabel?: string;
    }

    type $$Props = NodeProps & {
        data: NodeData;
    };

    let { data, isConnectable }: $$Props = $props();
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

<div class="relative flex flex-col items-center">
    <!-- Accept/Start badges -->
    <div class="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1">
        {#if data.isStart}
            <span class="bg-green-500/80 text-green-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                START
            </span>
        {/if}
        {#if data.isAccept}
            <span class="bg-yellow-500/80 text-yellow-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                ACC
            </span>
        {/if}
    </div>

    <!-- State circle -->
    <div
        class="w-14 h-14 rounded-full border-2 flex items-center justify-center bg-card shadow-md
            {data.isAccept ? 'border-yellow-500' : 'border-primary'}
            {data.isStart ? 'ring-2 ring-green-500/50' : ''}"
    >
        <!-- Double circle for accept states -->
        {#if data.isAccept}
            <div class="w-10 h-10 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                <span class="text-sm font-bold text-foreground">{data.label}</span>
            </div>
        {:else}
            <span class="text-sm font-bold text-foreground">{data.label}</span>
        {/if}
    </div>

    <!-- Extra label (e.g. which DFA states are merged) -->
    {#if data.extraLabel}
        <div class="mt-1 text-[9px] text-muted-foreground font-mono text-center whitespace-nowrap">
            {data.extraLabel}
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
