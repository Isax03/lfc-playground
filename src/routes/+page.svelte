<script lang="ts">
    import { ArrowRight } from "lucide-svelte";

    // Tool definitions for the homepage grid
    const tools = [
        {
            title: "First & Follow Sets",
            description:
                "Calculate First and Follow sets for your context-free grammar",
            href: "/first-follow",
        },
        {
            title: "LL(1) Parsing Table",
            description:
                "Generate LL(1) parsing table and check if your grammar is LL(1)",
            href: "/ll1-table",
        },
        {
            title: "Left Recursion",
            description: "Remove left recursion from your context-free grammar",
            href: "/left-rec",
        },
        {
            title: "Left Factoring",
            description: "Apply left factoring to your context-free grammar",
            href: "/left-fact",
        },
    ];
</script>

<svelte:head>
    <title>LFC Playground</title>
</svelte:head>

<div
    class="flex flex-col items-center justify-center w-full h-full gap-8 text-center"
>
    <h1 class="text-4xl font-bold">Welcome to LFC Playground</h1>
    <p class="text-xl text-muted-foreground max-w-[600px]">
        A collection of tools for Language and Compilation course
    </p>

    <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-xl w-full px-4"
    >
        {#each tools as tool}
            <a
                href={tool.href}
                class="block p-6 border rounded-lg hover:bg-muted transition-colors duration-200"
            >
                <h2 class="text-xl font-semibold mb-2">{tool.title}</h2>
                <p class="text-muted-foreground mb-4">{tool.description}</p>
                <div class="flex items-center justify-end text-sm">
                    Try it <ArrowRight class="w-4 h-4 ml-2" />
                </div>
            </a>
        {/each}
    </div>
</div>
