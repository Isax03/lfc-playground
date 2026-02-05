<script lang="ts">
    import { page } from "$app/state";
    import Button, {
        buttonVariants,
    } from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import * as Sheet from "$lib/shadcn-ui/components/ui/sheet";
    import { Menu } from "lucide-svelte";
    import DarkMode from "./DarkMode.svelte";
    import Logo from "./Logo.svelte";

    const navItems = [
        { href: "/first-follow", label: "First & Follow" },
        { href: "/ll1-table", label: "LL(1) Table" },
        { href: "/left-rec", label: "Left Recursion" },
        { href: "/left-fact", label: "Left Factoring" },
        { href: "/cnf", label: "CNF" },
        { href: "/slr-table", label: "SLR Table" },
        { href: "/lr1-table", label: "LR(1) Table" },
        { href: "/lalr-table", label: "LALR Table" },
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
    class="sticky top-0 z-99 w-full h-max py-4 flex items-center justify-between bg-background border-b border-border"
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
                <svg
                    role="img"
                    viewBox="0 0 24 24"
                    class="w-full h-full dark:fill-white"
                    xmlns="http://www.w3.org/2000/svg"
                    ><title>GitHub</title><path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    /></svg
                >
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
                    <Sheet.Content side="right" class="w-72 z-100">
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
