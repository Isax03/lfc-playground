<script lang="ts">
    import { ArrowRight } from "lucide-svelte";
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
</script>

<svelte:head>
    <title>LFC Playground</title>
</svelte:head>

<div class="flex flex-col items-center justify-center w-full h-full gap-8 text-center">
    <h1 class="text-4xl font-bold">Welcome to LFC Playground</h1>
    <p class="text-xl text-muted-foreground max-w-[600px]">
        A collection of tools for Language and Compilation course
    </p>
    <Button href="/first-follow" class="flex items-center gap-2">
        Try First & Follow
        <ArrowRight class="w-4 h-4" />
    </Button>
</div>
