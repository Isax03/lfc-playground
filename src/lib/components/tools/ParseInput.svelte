<script lang="ts">
    interface Props {
        inputString: string;
        onParse: () => void;
        onClear: () => void;
        isParsed: boolean;
    }

    let {
        inputString = $bindable(),
        onParse,
        onClear,
        isParsed
    }: Props = $props();

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === "Enter" && !isParsed) {
            onParse();
        }
    }
</script>

<div class="flex flex-col gap-4">
    <div>
        <h3 class="text-xl font-semibold mb-2">Parse Input String</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter a string to parse using the LL(1) table. Separate tokens with spaces.
        </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <input
            type="text"
            bind:value={inputString}
            onkeydown={handleKeydown}
            placeholder="Enter input string (e.g. id + id * id)"
            class="flex-1 p-2 border rounded-md dark:bg-gray-800"
            readonly={isParsed}
            class:opacity-75={isParsed}
        />
        <button
            onclick={isParsed ? onClear : onParse}
            class="px-4 py-2 {isParsed
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md transition-colors whitespace-nowrap"
        >
            {isParsed ? "Clear" : "Parse"}
        </button>
    </div>
</div>
