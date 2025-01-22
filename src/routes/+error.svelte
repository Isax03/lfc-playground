<script lang="ts">
    import { page } from "$app/state";
    import { Button } from "$lib/shadcn-ui/components/ui/button";
    import { Home, Shuffle } from "lucide-svelte";

    const tools = [
        "/first-follow",
        "/ll1-table",
        "/left-rec",
        "/left-fact",
        "/cnf"
    ];

    function getRandomTool() {
        const randomIndex = Math.floor(Math.random() * tools.length);
        return tools[randomIndex];
    }
</script>

<svelte:head>
    <title>Error {page.status} - LFC Playground</title>
</svelte:head>

<div class="h-full w-full flex flex-col items-center justify-center gap-6 text-center p-4">
    <h1 class="text-4xl font-bold">Oops! 🤔</h1>
    
    <p class="text-xl text-muted-foreground max-w-[600px]">
        {#if page.status === 404}
            Looks like you got lost in the grammar maze! <br />
            This page doesn't exist, but don't worry - it happens to the best parsers. 🚀
        {:else}
            Houston, we have a problem! 
            Something went wrong, but our finite state automata are working on it. 🛠️
        {/if}
    </p>

    <p class="text-sm text-muted-foreground mb-4">
        Error {page.status}
    </p>

    <div class="flex flex-col sm:flex-row gap-4">
        <Button href="/" variant="outline">
            <Home class="w-4 h-4 mr-2" />
            Return Home
        </Button>
        <Button href={getRandomTool()} variant="outline">
            <Shuffle class="w-4 h-4 mr-2" />
            Execute Random Tool ⚡
        </Button>
    </div>
</div>
