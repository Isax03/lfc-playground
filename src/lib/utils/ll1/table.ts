import type { Grammar } from "$lib/types/grammar";
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

    for (const nonTerminal of grammar.N) {
        table[nonTerminal] = {};
        for (const terminal of grammar.T) {
            table[nonTerminal][terminal] = {
                driver: nonTerminal,
                productions: [],
            };
        }
        table[nonTerminal]["$"] = {
            driver: nonTerminal,
            productions: [],
        };
    }

    for (const rule of grammar.P) {
        const driver = rule.driver;

        for (const production of rule.productions) {
            const firstOfSeq = computeFirstForSequence(
                production,
                grammar,
                firstSets
            );
            for (const b of firstOfSeq.difference(new Set(["ε"]))) {
				if (table[driver][b].productions.length > 0) {
					notLL1 = true;
				}

                if (!table[driver][b]?.productions.some(p => areProductionsEqual(p, production))) {
                    table[driver][b]!!.productions.push(production);
                }
            }

            if (firstOfSeq.has("ε")) {
                for (const b of followSets.get(driver)!!) {
					if (table[driver][b].productions.length > 0) {
						notLL1 = true;
                    }
                    if (!table[driver][b]?.productions.some(p => areProductionsEqual(p, production))) {
                        table[driver][b]!!.productions.push(production);
                    }
                }
            }
        }
    }

    return {table, notLL1};
}