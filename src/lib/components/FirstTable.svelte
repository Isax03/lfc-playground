<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table/index";

	interface Props {
		firstSets: Map<string, Set<string>>;
	}

	let { firstSets }: Props = $props();
</script>

<Table.Root class="w-max">
    <Table.Header>
        <Table.Row>
            <Table.Head class="w-[20px] px-12"></Table.Head>
            <Table.Head class="w-[20px] px-12">First</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each firstSets.keys()  as nonTerminal}
            <Table.Row>
                <Table.Cell class="w-[20px] font-medium">{nonTerminal}</Table.Cell>
                <Table.Cell class="w-[20px]">{Array.from(firstSets.get(nonTerminal)!!).join(", ")}</Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>
