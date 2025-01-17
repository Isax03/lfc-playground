<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import "../app.css";

    import { ModeWatcher } from "mode-watcher";
    let { children } = $props();
</script>

<ModeWatcher />
<div class="min-h-[100svh] flex flex-col">
    <Navbar />
    <section
        class="w-full p-5 h-full flex flex-grow"
    >
        {@render children?.()}
    </section>
</div>
