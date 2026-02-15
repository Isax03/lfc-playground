<script lang="ts">
    import { ArrowRight } from "lucide-svelte";

    // Tool definitions for the homepage grid
    const grammarTools = [
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
        {
            title: "Chomsky Normal Form",
            description: "Convert a context-free grammar to Chomsky Normal Form (CNF)",
            href: "/cnf",
        },
        {
            title: "SLR Parsing Table",
            description:
                "Generate SLR Automaton and parsing table with steps",
            href: "/slr-table",
        },
        {
            title: "LR(1) Parsing Table",
            description:
                "Generate LR(1) automaton and parsing table with shift/reduce parsing",
            href: "/lr1-table",
        },
        {
            title: "LALR Parsing Table",
            description:
                "Generate LALR(1) automaton (merged LR(1) states) and parsing table",
            href: "/lalr-table",
        },
    ];

    const automataTools = [
        {
            title: "Regex → NFA",
            description:
                "Build an NFA from a regex using Thompson's construction with step-by-step details",
            href: "/automata/nfa",
        },
        {
            title: "Regex → DFA",
            description:
                "Convert a regex directly to a DFA (Thompson + Subset Construction)",
            href: "/automata/dfa",
        },
        {
            title: "NFA → DFA",
            description:
                "Convert NFA to DFA via subset construction with step-by-step details",
            href: "/automata/nfa-to-dfa",
        },
        {
            title: "Regex → Min-DFA",
            description:
                "Convert a regex directly to its minimized DFA",
            href: "/automata/min-dfa",
        },
        {
            title: "DFA → Min-DFA",
            description:
                "Minimize a DFA using partition refinement with step-by-step details",
            href: "/automata/dfa-to-min-dfa",
        },
        {
            title: "NFA → Min-DFA",
            description:
                "Full pipeline: NFA → DFA → Min-DFA with all intermediate steps",
            href: "/automata/nfa-to-min-dfa",
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
    <p class="text-xl text-muted-foreground max-w-150">
        A collection of tools for Formal Languages and Compilators course
    </p>

    <!-- Grammars Section -->
    <div class="w-full max-w-(--breakpoint-xl) px-4">
        <h2 class="text-2xl font-semibold mb-4 text-left">Context-Free Grammars</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each grammarTools as tool}
                <a
                    href={tool.href}
                    class="block p-6 border rounded-lg hover:bg-muted transition-colors duration-200 text-left"
                >
                    <h3 class="text-xl font-semibold mb-2">{tool.title}</h3>
                    <p class="text-muted-foreground mb-4">{@html tool.description}</p>
                    <div class="flex items-center justify-end text-sm">
                        Try it <ArrowRight class="w-4 h-4 ml-2" />
                    </div>
                </a>
            {/each}
        </div>
    </div>

    <!-- Automata Section -->
    <div class="w-full max-w-(--breakpoint-xl) px-4">
        <h2 class="text-2xl font-semibold mb-4 text-left">Finite Automata & Regex</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each automataTools as tool}
                <a
                    href={tool.href}
                    class="block p-6 border rounded-lg hover:bg-muted transition-colors duration-200 text-left"
                >
                    <h3 class="text-xl font-semibold mb-2">{tool.title}</h3>
                    <p class="text-muted-foreground mb-4">{@html tool.description}</p>
                    <div class="flex items-center justify-end text-sm">
                        Try it <ArrowRight class="w-4 h-4 ml-2" />
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
