import type { Grammar } from "$lib/types/grammar";
import type { FollowSets } from "$lib/types/first-follow";
import type { ReducingLabel, SLRMove, SLRTable, StatesAutomaton } from "$lib/types/slr";
import { isRuleEqual } from "../utils";

export function computeSlrTable(
    automaton: StatesAutomaton,
    reducingLabels: ReducingLabel[],
    grammar: Grammar,
    followSets: FollowSets
): { table: SLRTable; hasConflicts: boolean } {
    const table: SLRTable = {};
    let hasConflicts = false;

    // Initialize table cells
    for (const stateId of Object.keys(automaton.states)) {
        table[stateId] = {};
        // Initialize terminals + $
        for (const terminal of grammar.T) {
            table[stateId][terminal] = "error";
        }
        table[stateId]["$"] = "error";
        // Initialize non-terminals
        for (const nonTerminal of grammar.N) {
            table[stateId][nonTerminal] = "error";
        }
    }

    // Process transitions for shifts and gotos
    for (const [stateId, transitions] of Object.entries(automaton.transitions)) {
        for (const [symbol, targetState] of Object.entries(transitions)) {
            if (grammar.T.has(symbol)) {
                // Shift for terminals
                const move: SLRMove = { action: "shift", state: parseInt(targetState) };
                if (table[stateId][symbol] !== "error") {
                    // Conflict detected
                    hasConflicts = true;
                    table[stateId][symbol] = mergeMove(table[stateId][symbol], move);
                } else {
                    table[stateId][symbol] = move;
                }
            } else {
                // Goto for non-terminals
                table[stateId][symbol] = parseInt(targetState);
            }
        }
    }

    // Process reducing items
    for (const [stateId, state] of Object.entries(automaton.states)) {
        // Check for accepting state
        const hasAcceptItem = Array.from(state.kernel.entries()).some(
            ([nt, prods]) => nt === "S'" && prods.some(p => p[p.length - 1] === "·")
        );
        
        // Find reducing items in this state
        const reducingItems = findReducingItems(state);
        
        for (const item of reducingItems) {
            const label = reducingLabels.find(rl => isRuleEqual(rl.rule, item));
            if (!label) continue;

            const follow = followSets.get(item.head);
            if (!follow) continue;

            const reduceMove: SLRMove = { 
                action: "reduce", 
                rule: new Map([[item.head, [item.body]]])
            };

            for (const symbol of follow) {
                if (hasAcceptItem && symbol === "$") {
                    // Se siamo nello stato di accettazione e il simbolo è $,
                    // dobbiamo creare un conflitto con accept
                    table[stateId][symbol] = mergeMove("accept", reduceMove);
                } else if (table[stateId][symbol] !== "error") {
                    hasConflicts = true;
                    table[stateId][symbol] = mergeMove(table[stateId][symbol], reduceMove);
                } else {
                    table[stateId][symbol] = reduceMove;
                }
            }
        }
    }

    return { table, hasConflicts };
}

// Nel mergeMove, modifichiamo per gestire correttamente accept con reduce:
function mergeMove(existing: SLRMove, newMove: SLRMove): SLRMove {
    // Se uno dei due è error, ritorna l'altro
    if (existing === "error") return newMove;
    if (newMove === "error") return existing;

    // Se già abbiamo un conflitto, aggiungiamo il nuovo move
    if (typeof existing === "object" && "action" in existing && existing.action === "conflict") {
        return {
            action: "conflict",
            moves: [...existing.moves, newMove].sort((a, b) => {
                if (a === "accept") return -1;
                if (b === "accept") return 1;
                if (typeof a === "number" || typeof b === "number") return 0;
                if (typeof a === "string") return 1;
                if (typeof b === "string") return -1;
                if (a.action === "shift" && b.action === "reduce") return -1;
                if (a.action === "reduce" && b.action === "shift") return 1;
                return 0;
            })
        };
    }

    // Altrimenti creiamo un nuovo conflitto
    return {
        action: "conflict",
        moves: [existing, newMove].sort((a, b) => {
            if (a === "accept") return -1;
            if (b === "accept") return 1;
            if (typeof a === "number" || typeof b === "number") return 0;
            if (a.action === "shift" && b.action === "reduce") return -1;
            if (a.action === "reduce" && b.action === "shift") return 1;
            return 0;
        })
    };
}

function findReducingItems(state: { kernel: Map<string, string[][]>, body: Map<string, string[][]> }) {
    const items: { head: string; body: string[] }[] = [];

    function processProductions(head: string, productions: string[][]) {
        for (const prod of productions) {
            if (prod.length === 1 && prod[0] === "·") {
                // Epsilon case
                items.push({ head, body: ["ε"] });
            } else if (prod[prod.length - 1] === "·") {
                // Normal reduction
                items.push({ head, body: prod.filter(s => s !== "·") });
            }
        }
    }

    for (const [head, prods] of state.kernel.entries()) {
        processProductions(head, prods);
    }
    for (const [head, prods] of state.body.entries()) {
        processProductions(head, prods);
    }

    return items;
}
