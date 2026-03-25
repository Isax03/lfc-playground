<script lang="ts">
    import { page } from "$app/state";
    import Button, {
        buttonVariants,
    } from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import * as Dialog from "$lib/shadcn-ui/components/ui/dialog";
    import { Input } from "$lib/shadcn-ui/components/ui/input";
    import Label from "$lib/shadcn-ui/components/ui/label/label.svelte";
    import { Textarea } from "$lib/shadcn-ui/components/ui/textarea";
    import { createShareableLink } from "$lib/utils/sharing";
    import { Check, Share2, X } from "@lucide/svelte";

    interface Props {
        grammar: string;
    }

    let { grammar = $bindable() }: Props = $props();
    let path = page.url.pathname;

    let copied = $state(false);
    let shareUrl = $derived(createShareableLink(path, grammar));

    // Show feedback for 2 seconds after copying
    async function copyToClipboard() {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

<Dialog.Root>
    <Dialog.Trigger
        class={buttonVariants({ variant: "outline", size: "default" })}
    >
        <Share2 class="h-4 w-4 mr-2" />
        <span>Share</span>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-125">
        <Dialog.Header>
            <Dialog.Title>Share Grammar</Dialog.Title>
            <Dialog.Description>
                Review your grammar and copy the shareable link
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid gap-2">
                <Label for="preview">Grammar Preview</Label>
                <Textarea
                    readonly
                    value={grammar}
                    class="font-mono"
                    id="preview"
                />
            </div>
            <div class="grid gap-2">
                <Label for="share">Shareable Link</Label>
                <Input readonly value={shareUrl} id="share" />
            </div>
        </div>
        <Dialog.Footer>
            <div class="flex justify-between w-full">
                <Dialog.Close class={buttonVariants({ variant: "outline" })}>
                    <X class="h-4 w-4 mr-2" />
                    Close
                </Dialog.Close>
                <Button onclick={copyToClipboard}>
                    {#if copied}
                        <Check class="h-4 w-4 mr-2" />
                        Copied!
                    {:else}
                        <Share2 class="h-4 w-4 mr-2" />
                        Copy Link
                    {/if}
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
