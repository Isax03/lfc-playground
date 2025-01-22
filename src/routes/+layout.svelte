<!-- Base layout component that provides the app structure and theme management -->
<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import "../app.css";

    import { ModeWatcher } from "mode-watcher";
    let { children } = $props();
</script>

<ModeWatcher />
<div class="min-h-[100svh] flex flex-col overflow-x-hidden">
    <Navbar />
    <section class="w-full p-4 h-full flex flex-grow">
        <div class="w-full max-w-full overflow-x-hidden">
            {@render children?.()}
        </div>
    </section>
</div>
