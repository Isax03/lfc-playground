<script lang="ts">
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import type { Snippet } from "svelte";
    import ComputeButtonGroup from "../generic/ComputeButtonGroup.svelte";

    interface Props {
        children?: Snippet;
        value?: string;
        onCompute?: () => void;
        showShare?: boolean;
    }

    let { 
        children = undefined,
        value = $bindable(""),
        onCompute = $bindable(() => {}),
        showShare = $bindable(false)
    } = $props();
</script>

<Textarea bind:value class="w-72 h-60 font-mono resize" />
{@render children?.()}
<ComputeButtonGroup {onCompute} {showShare} grammarInput={value} />
