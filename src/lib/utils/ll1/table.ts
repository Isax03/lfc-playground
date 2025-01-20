import type { Production, Grammar } from "$lib/types/grammar";
import type { FirstSets, FollowSets } from "$lib/types/first-follow";
import type { LL1Table } from "$lib/types/tables";
import { computeFirstForSequence } from "../first-follow/first";
import { areProductionsEqual } from "../utils";

export function computeLL1Table(
    grammar: Grammar,
    firstSets: FirstSets,
    followSets: FollowSets
): {table: LL1Table, notLL1: boolean} {
    let notLL1 = false;
    const table: LL1Table = {};

    // Initialize the table
    for (const nonTerminal of grammar.N) {
        table[nonTerminal] = {};
        for (const terminal of grammar.T) {
            table[nonTerminal][terminal] = new Map<string, Production[]>();
            table[nonTerminal][terminal].set(nonTerminal, []);
        }
        table[nonTerminal]["$"] = new Map<string, Production[]>();
        table[nonTerminal]["$"].set(nonTerminal, []);
    }

    // Process each production rule
    for (const [driver, productions] of grammar.P) {
        for (const production of productions) {
            const firstOfSeq = computeFirstForSequence(
                production,
                grammar,
                firstSets
            );
            for (const b of firstOfSeq.difference(new Set(["ε"]))) {
                if (table[driver][b].get(driver)!!.length > 0) {
                    notLL1 = true;
                }

                if (!table[driver][b]?.get(driver)!!.some(p => areProductionsEqual(p, production))) {
                    table[driver][b]!!.get(driver)!!.push(production);
                }
            }

            if (firstOfSeq.has("ε")) {
                for (const b of followSets.get(driver)!!) {
                    if (table[driver][b].get(driver)!!.length > 0) {
                        notLL1 = true;
                    }
                    if (!table[driver][b]?.get(driver)!!.some(p => areProductionsEqual(p, production))) {
                        table[driver][b]!!.get(driver)!!.push(production);
                    }
                }
            }
        }
    }

    return {table, notLL1};
}