<script lang="ts">
    interface Props {
        title: string;
        description: string;
        input: () => any;
        output: () => any;
    }

    let { title = $bindable(), description = $bindable(), input = $bindable(), output = $bindable() } = $props();
</script>

<div class="flex flex-col gap-6 w-full max-w-(--breakpoint-xl) mx-auto px-4">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
        <p class="text-muted-foreground mt-1 text-sm">
            {@html description}
        </p>
    </div>

    <!-- Input Section (horizontal) -->
    {@render input()}

    <!-- Output Section (full width) -->
    {@render output()}
</div>
