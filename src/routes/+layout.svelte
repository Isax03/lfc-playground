<!-- Base layout component that provides the app structure and theme management -->
<script lang="ts">
    import Navbar from "$lib/components/generic/Navbar.svelte";
    import "../app.css";

    import { ModeWatcher } from "mode-watcher";
    let { children } = $props();
</script>

<ModeWatcher />
<div class="min-h-svh flex flex-col">
    <Navbar />
    <section class="w-full p-4 flex-1">
        {@render children?.()}
    </section>
</div>
