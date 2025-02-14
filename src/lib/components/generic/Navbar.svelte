<script lang="ts">
    import { page } from "$app/state";
    import Button, {
        buttonVariants,
    } from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import * as Sheet from "$lib/shadcn-ui/components/ui/sheet";
    import { GithubIcon, Menu } from "lucide-svelte";
    import DarkMode from "./DarkMode.svelte";
    import Logo from "./Logo.svelte";

    const navItems = [
        { href: "/first-follow", label: "First & Follow" },
        { href: "/ll1-table", label: "LL(1) Table" },
        { href: "/left-rec", label: "Left Recursion" },
        { href: "/left-fact", label: "Left Factoring" },
        { href: "/cnf", label: "CNF" },
        { href: "/slr-table", label: "SLR Table" },
    ];

    const currentPath = $derived(page.url.pathname);

    function isActive(href: string) {
        if (href === "/") {
            return currentPath === href;
        }
        return currentPath.startsWith(href);
    }
</script>

<nav
    class="sticky top-0 z-[99] w-full h-max py-4 flex items-center justify-between bg-background border-b border-border"
>
    <div class="w-full flex items-center justify-between mx-auto h-max px-4">
        <a href="/" class="flex items-center w-40">
            <Logo />
        </a>

        <div class="items-center justify-between hidden md:flex md:w-auto">
            <ul class="flex flex-row space-x-8">
                {#each navItems as item}
                    <li>
                        <a
                            href={item.href}
                            class="block py-2 transition-colors {isActive(
                                item.href
                            )
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-primary'}"
                        >
                            {item.label}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                size="icon"
                href="https://github.com/Isax03/lfc-playground"
                target="_blank"
            >
                <GithubIcon />
            </Button>
            <DarkMode />
            <div class="block md:hidden">
                <Sheet.Root>
                    <Sheet.Trigger
                        class={buttonVariants({
                            variant: "outline",
                            size: "icon",
                        })}
                    >
                        <Menu />
                    </Sheet.Trigger>
                    <Sheet.Content side="right" class="w-72 z-[100]">
                        <Sheet.Header>
                            <Sheet.Title>Menu</Sheet.Title>
                        </Sheet.Header>
                        <div class="flex flex-col gap-4 mt-4 items-start">
                            {#each navItems as item}
                                <Sheet.Close
                                    class={buttonVariants({ variant: "link" })}
                                >
                                    <a
                                        href={item.href}
                                        class="block py-2 transition-colors {isActive(
                                            item.href
                                        )
                                            ? 'text-primary font-medium'
                                            : 'text-muted-foreground hover:text-primary'}"
                                    >
                                        {item.label}
                                    </a>
                                </Sheet.Close>
                            {/each}
                        </div>
                    </Sheet.Content>
                </Sheet.Root>
            </div>
        </div>
    </div>
</nav>
