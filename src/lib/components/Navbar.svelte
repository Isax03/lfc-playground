<script lang="ts">
    import Button from "$lib/shadcn-ui/components/ui/button/button.svelte";
    import { GithubIcon } from "lucide-svelte";
    import DarkMode from "./DarkMode.svelte";
    import Logo from "./Logo.svelte";
</script>

<nav class="sticky top-0 z-[99] w-full h-max py-4 flex items-center justify-between bg-background border-b border-border">
    <div class="w-full flex items-center justify-between mx-auto h-max px-4">
        <a href="/" class="flex items-center w-40">
            <Logo />
        </a>

        <!-- <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
            <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium md:flex-row md:space-x-8 md:mt-0 md:border-0">
                <li>
                    <a 
                        href="/" 
                        class="block py-2 pl-3 pr-4 text-primary rounded md:bg-transparent md:p-0" 
                        aria-current="page"
                    >
                        Home
                    </a>
                </li>
                <li>
                    <a 
                        href="/about" 
                        class="block py-2 pl-3 pr-4 text-muted-foreground hover:text-primary rounded md:p-0 transition-colors"
                    >
                        About
                    </a>
                </li>
                <li>
                    <a 
                        href="/services" 
                        class="block py-2 pl-3 pr-4 text-muted-foreground hover:text-primary rounded md:p-0 transition-colors"
                    >
                        Services
                    </a>
                </li>
                <li>
                    <a 
                        href="/contact" 
                        class="block py-2 pl-3 pr-4 text-muted-foreground hover:text-primary rounded md:p-0 transition-colors"
                    >
                        Contact
                    </a>
                </li>
            </ul>
        </div> -->

        <div class="flex items-center justify-end gap-3 w-48 md:w-auto md:order-2">
			<Button variant="outline" size="icon" href="https://github.com/Isax03/lfc-playground" target="_blank">
				<GithubIcon />
			</Button>
            <DarkMode />
        </div>
    </div>
</nav>
