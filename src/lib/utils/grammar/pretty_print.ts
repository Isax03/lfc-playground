import type { Grammar } from "$lib/types/grammar";

// Function to print the grammar in a readable format
export function stringifyGrammar(grammar: Grammar): string {
    return `${Array.from(grammar.P.entries()).map(([driver, productions]) => {
        const productionsStr = productions.map(prod => prod.join(' ')).join(' | ');
        return `${driver} -> ${productionsStr}`;
    }).join('\n').trimEnd()}`;
}