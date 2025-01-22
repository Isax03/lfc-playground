<script lang="ts">
	interface Props {
		title: string;
		description: string;
		input: () => any;
		output: () => any;
	}

    let { title = $bindable(), description = $bindable(), input = $bindable(), output = $bindable() } = $props();
</script>

<div class="flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
        <p class="text-muted-foreground mt-2">
            {description}
        </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Input Section -->
        <div class="w-full lg:w-2/5">
            <p class="mb-2 text-muted-foreground">
                If you need the epsilon symbol, use `ε` or `epsilon`.
            </p>
            {@render input()}
        </div>

        <!-- Output Section -->
        <div class="w-full lg:w-3/5">
            {@render output()}
        </div>
    </div>
</div>
