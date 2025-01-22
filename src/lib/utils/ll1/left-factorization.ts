import type { Grammar, Production } from "$lib/types/grammar";

/**
 * Helper function to compare two arrays of symbols for equality
 */
function arrayEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
}

/**
 * Performs left factorization on a grammar to eliminate common prefixes.
 * For productions like:
 * A → αβ1 | αβ2
 * Creates:
 * A → αA'
 * A' → β1 | β2
 * 
 * Continues until no common prefixes remain.
 */
export function factorizeToLeft(grammar: Grammar): Grammar {
    const newGrammar: Grammar = {
        N: new Set(grammar.N),
        T: new Set(grammar.T),
        S: grammar.S,
        P: new Map(grammar.P)
    };

    const nonTerminals = Array.from(newGrammar.N);

    for (const nonTerminal of nonTerminals) {
        let helperName = `${nonTerminal}'`;
        let hasPrefix = true;

        while (hasPrefix) {
            hasPrefix = false;
            let longest: string[] = [];
            const productions = newGrammar.P.get(nonTerminal) || [];

            // Find the longest common prefix
            for (let i = 0; i < productions.length; i++) {
                for (let j = i + 1; j < productions.length; j++) {
                    const prod1 = productions[i];
                    const prod2 = productions[j];
                    
                    let commonLength = 0;
                    while (commonLength < prod1.length && 
                           commonLength < prod2.length && 
                           prod1[commonLength] === prod2[commonLength]) {
                        commonLength++;
                    }

                    if (commonLength > 0) {
                        hasPrefix = true;
                        if (commonLength > longest.length) {
                            longest = prod1.slice(0, commonLength);
                        }
                    }
                }
            }

            if (hasPrefix) {
                // Ensure unique helper name
                while (newGrammar.P.has(helperName)) {
                    helperName += "'";
                }

                // Add new non-terminal to the grammar
                newGrammar.N.add(helperName);
                const newProductions: Production[] = [];
                const remainingProductions: Production[] = [];

                // Split productions
                for (const prod of productions) {
                    if (prod.length >= longest.length && 
                        arrayEqual(prod.slice(0, longest.length), longest)) {
                        if (prod.length === longest.length) {
                            newProductions.push(['ε']);
                        } else {
                            newProductions.push(prod.slice(longest.length));
                        }
                    } else {
                        remainingProductions.push(prod);
                    }
                }

                // Update grammar with new productions
                newGrammar.P.set(helperName, newProductions);
                newGrammar.P.set(
                    nonTerminal, 
                    [[...longest, helperName], ...remainingProductions]
                );
            }
        }
    }

    return newGrammar;
}