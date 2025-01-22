import type { Grammar, Production } from "$lib/types/grammar";

/**
 * Eliminates left recursion from a grammar using the standard algorithm:
 * 1. First eliminates indirect left recursion by substituting productions
 * 2. Then eliminates direct left recursion by introducing new non-terminals
 * 
 * For a production A → Aα | β, creates:
 * A → βA'
 * A' → αA' | ε
 */
export function eliminateLeftRecursion(grammar: Grammar): Grammar {
    const newGrammar: Grammar = {
        N: new Set(grammar.N),
        T: new Set(grammar.T),
        S: grammar.S,
        P: new Map(grammar.P)
    };

    const nonTerminals = Array.from(grammar.N);

    // For each non-terminal Ai
    for (let i = 0; i < nonTerminals.length; i++) {
        // For each previous non-terminal Aj
        for (let j = 0; j < i; j++) {
            const extended: Production[] = [];
            const currentProductions = newGrammar.P.get(nonTerminals[i]) || [];
            const previousProductions = newGrammar.P.get(nonTerminals[j]) || [];

            // Replace Ai → Ajγ with Ai → δγ for all productions δ of Aj
            for (const production of currentProductions) {
                if (production.length > 0 && production[0] === nonTerminals[j]) {
                    // Substitute with each production of Aj
                    for (const prevProduction of previousProductions) {
                        extended.push([...prevProduction, ...production.slice(1)]);
                    }
                } else {
                    extended.push([...production]);
                }
            }
            newGrammar.P.set(nonTerminals[i], extended);
        }

        // Check for direct left recursion
        let hasDirectRecursion = false;
        const currentProductions = newGrammar.P.get(nonTerminals[i]) || [];
        
        for (const production of currentProductions) {
            if (production.length > 0 && production[0] === nonTerminals[i]) {
                hasDirectRecursion = true;
                break;
            }
        }

        // Eliminate direct left recursion if found
        if (hasDirectRecursion) {
            let helperName = nonTerminals[i] + "'";
            while (newGrammar.N.has(helperName)) {
                helperName += "'";
            }

            const newProductions: Production[] = [];
            const helperProductions: Production[] = [];

            // Split productions and create new ones
            for (const production of currentProductions) {
                if (production.length > 0) {
                    if (production[0] === nonTerminals[i]) {
                        // If it starts with Ai, add to helper rule
                        helperProductions.push([...production.slice(1), helperName]);
                    } else {
                        // If it doesn't start with Ai, append helper and keep
                        if (production.length === 1 && production[0] === 'ε') {
                            newProductions.push([helperName]);
                        } else {
                            newProductions.push([...production, helperName]);
                        }
                    }
                }
            }

            // Add epsilon production to helper
            helperProductions.push(['ε']);

            // Update grammar
            newGrammar.N.add(helperName);
            newGrammar.P.set(nonTerminals[i], newProductions);
            newGrammar.P.set(helperName, helperProductions);
        }
    }

    // Remove empty productions
    for (const [nonTerminal, productions] of newGrammar.P) {
        const newProductions = productions.filter((production) => production.length > 0);
        if (newProductions.length === 0) {
            newGrammar.P.delete(nonTerminal);
        } else {
            newGrammar.P.set(nonTerminal, newProductions);
        }
    }

    return newGrammar;
}
