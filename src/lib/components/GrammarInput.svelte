<script lang="ts">
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import ComputeButtonGroup from "./ComputeButtonGroup.svelte";

    let { 
        value = $bindable(""),
        onCompute = $bindable(() => {}),
        showShare = $bindable(false)
    } = $props();
</script>

<Textarea bind:value class="w-72 h-60 font-mono resize" />
<ComputeButtonGroup {onCompute} {showShare} grammarInput={value} />
