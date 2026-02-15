<script lang="ts">
    import * as Table from "$lib/shadcn-ui/components/ui/table";
    import type { NFA, DFA, MinDFA } from "$lib/types/automaton";

    interface Props {
        nfa?: NFA;
        dfa?: DFA;
        minDfa?: MinDFA;
        title?: string;
    }
    let { nfa, dfa, minDfa, title = "Transition Table" }: Props = $props();

    // Build a generic table from whichever automaton is provided
    interface TableData {
        states: string[];
        alphabet: string[];
        transitions: Map<string, Map<string, string[]>>; // state -> symbol -> target states
        startState: string;
        acceptStates: string[];
    }

    const tableData = $derived.by((): TableData | null => {
        if (nfa) {
            const allSymbols = [...new Set(['ε', ...nfa.alphabet])];
            const trans = new Map<string, Map<string, string[]>>();
            for (const s of nfa.states) {
                trans.set(String(s), new Map());
                for (const sym of allSymbols) {
                    trans.get(String(s))!.set(sym, []);
                }
            }
            for (const t of nfa.transitions) {
                const sym = t.symbol === null ? 'ε' : t.symbol;
                const fromKey = String(t.from);
                if (!trans.has(fromKey)) continue;
                trans.get(fromKey)!.get(sym)?.push(String(t.to));
            }
            return {
                states: nfa.states.map(s => String(s)),
                alphabet: allSymbols,
                transitions: trans,
                startState: String(nfa.startState),
                acceptStates: nfa.acceptStates.map(s => String(s)),
            };
        }
        if (dfa) {
            const trans = new Map<string, Map<string, string[]>>();
            for (const s of dfa.states) {
                trans.set(s.id, new Map());
                for (const sym of dfa.alphabet) {
                    trans.get(s.id)!.set(sym, []);
                }
            }
            for (const t of dfa.transitions) {
                trans.get(t.from)?.get(t.symbol)?.push(t.to);
            }
            return {
                states: dfa.states.map(s => s.id),
                alphabet: dfa.alphabet,
                transitions: trans,
                startState: dfa.startState,
                acceptStates: dfa.acceptStates,
            };
        }
        if (minDfa) {
            const trans = new Map<string, Map<string, string[]>>();
            for (const s of minDfa.states) {
                trans.set(s.id, new Map());
                for (const sym of minDfa.alphabet) {
                    trans.get(s.id)!.set(sym, []);
                }
            }
            for (const t of minDfa.transitions) {
                trans.get(t.from)?.get(t.symbol)?.push(t.to);
            }
            return {
                states: minDfa.states.map(s => s.id),
                alphabet: minDfa.alphabet,
                transitions: trans,
                startState: minDfa.startState,
                acceptStates: minDfa.acceptStates,
            };
        }
        return null;
    });
</script>

{#if tableData}
    <div>
        <h5 class="mb-4 text-lg font-medium tracking-tight">
            {title}
        </h5>
        <div class="w-full border rounded-md">
            <div class="overflow-x-auto">
                <div class="min-w-max">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-24">State</Table.Head>
                                {#each tableData.alphabet as sym}
                                    <Table.Head class="text-center">{sym}</Table.Head>
                                {/each}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each tableData.states as state}
                                <Table.Row class="font-mono">
                                    <Table.Cell class="font-semibold">
                                        <span class="flex items-center gap-1">
                                            {#if state === tableData.startState}
                                                <span class="text-green-600" title="Start">→</span>
                                            {/if}
                                            {#if tableData.acceptStates.includes(state)}
                                                <span class="text-yellow-600" title="Accept">*</span>
                                            {/if}
                                            {state}
                                        </span>
                                    </Table.Cell>
                                    {#each tableData.alphabet as sym}
                                        <Table.Cell class="text-center">
                                            {#if tableData.transitions.get(state)?.get(sym)?.length}
                                                {`{${tableData.transitions.get(state)!.get(sym)!.join(', ')}}`}
                                            {:else}
                                                <span class="text-muted-foreground">∅</span>
                                            {/if}
                                        </Table.Cell>
                                    {/each}
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
        </div>
    </div>
{/if}
