<script lang="ts">
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import ShareLink from "./ShareLink.svelte";

    let {
        onCompute = $bindable(),
        showShare = $bindable(false),
        grammarInput = $bindable(""),
    } = $props();
</script>

<div class="flex flex-col gap-2 mt-4">
    <div class="flex gap-2">
        <Button onclick={onCompute}>Compute</Button>
        {#if showShare}
            <ShareLink grammar={grammarInput} />
        {/if}
    </div>
    <kbd
        class="w-max pointer-events-none select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden md:inline-flex"
    >
        <span class="text-xs">Ctrl</span>+<span class="text-xs">Enter</span>
    </kbd>
</div>
