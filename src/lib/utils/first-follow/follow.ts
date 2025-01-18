import type { FirstSets, FollowSet, FollowSets } from "$lib/types/first-follow";
import type { Grammar } from "$lib/types/grammar";
import { computeFirstForSequence } from "./first";

export function computeFollow(grammar: Grammar, firstSets: FirstSets): FollowSets {
    let followSets = new Map<string, FollowSet>();

    // Inizializziamo il follow set per tutti i non-terminali
    for (const nonTerminal of grammar.N) {
        followSets.set(nonTerminal, new Set());
    }
    followSets.set(grammar.S, new Set(['$']));

    // Mappa per tenere traccia delle dipendenze tra follow sets
    const followDependencies = new Map<string, Set<string>>();
    for (const nonTerminal of grammar.N) {
        followDependencies.set(nonTerminal, new Set());
    }

    let changed: boolean;
    do {
        changed = false;
        for (const rule of grammar.P) {
            const B = rule.driver;
            for (const production of rule.productions) {
                for (let i = 0; i < production.length; i++) {
                    const A = production[i];
                    if (grammar.N.has(A)) {
                        const beta = production.slice(i + 1);
                        const followA = followSets.get(A)!;

                        if (beta.length > 0) {
                            const firstBeta = computeFirstForSequence(beta, grammar, firstSets);
                            for (const symbol of firstBeta) {
                                if (symbol !== 'ε' && !followA.has(symbol)) {
                                    followA.add(symbol);
                                    changed = true;
                                }
                            }
                            if (firstBeta.has('ε')) {
                                // Aggiungi una dipendenza: follow(A) dipende da follow(B)
                                followDependencies.get(A)!.add(B);
                            }
                        } else {
                            // Aggiungi una dipendenza: follow(A) dipende da follow(B)
                            followDependencies.get(A)!.add(B);
                        }
                    }
                }
            }
        }

        // Propagazione degli aggiornamenti basata sulle dipendenze
        for (const [A, dependencies] of followDependencies) {
            const followA = followSets.get(A)!;
            for (const B of dependencies) {
                const followB = followSets.get(B)!;
                for (const symbol of followB) {
                    if (!followA.has(symbol)) {
                        followA.add(symbol);
                        changed = true;
                    }
                }
            }
        }
    } while (changed);

    return followSets;
}