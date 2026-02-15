<script lang="ts">
    import { Input } from "$lib/shadcn-ui/components/ui/input";
    import type { Snippet } from "svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import RegexShareLink from "./RegexShareLink.svelte";

    interface Props {
        children?: Snippet;
        value?: string;
        onCompute?: () => void;
        showShare?: boolean;
    }

    let {
        children = undefined,
        value = $bindable(""),
        onCompute = $bindable(() => {}) as () => void,
        showShare = $bindable(false),
    } = $props();
</script>

<div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1">
            <label for="regex-input" class="text-sm text-muted-foreground">Regular Expression</label>
            <Input
                id="regex-input"
                bind:value
                placeholder="e.g. (a|b)*abb"
                class="w-72 font-mono"
            />
        </div>
        <div class="flex items-center gap-2">
            <Button onclick={() => onCompute()}>Compute</Button>
            {#if showShare}
                <RegexShareLink regex={value} />
            {/if}
            <kbd
                class="pointer-events-none select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground hidden md:inline-flex"
            >
                <span class="text-xs">Ctrl</span>+<span class="text-xs">Enter</span>
            </kbd>
        </div>
    </div>
    <p class="text-xs text-muted-foreground">
        Supported: <code>a-z</code>, <code>|</code> (union), <code>*</code> (star), <code>+</code> (plus), <code>?</code> (optional), <code>()</code>, <code>[a-z]</code> (ranges), <code>ε</code>
    </p>
	{@render children?.()}
</div>
