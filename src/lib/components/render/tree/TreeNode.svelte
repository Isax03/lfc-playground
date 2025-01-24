<script lang="ts">
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";

    type $$Props = NodeProps;

    export let data: $$Props["data"];
    export let isConnectable: $$Props["isConnectable"];
</script>

<Handle
    type="target"
    position={Position.Top}
    style="opacity: 0"
    {isConnectable}
/>
<div class="size-9 font-mono text-3xl flex items-center justify-center">
    {data.label}
</div>
<Handle
    type="source"
    position={Position.Bottom}
    style="opacity: 0"
    {isConnectable}
/>

<style>
</style>
