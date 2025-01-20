import type { Grammar } from "$lib/types/grammar";

// Function to print the grammar in a readable format
export function printGrammar(grammar: Grammar): string {
    return `Grammar:\n
    Non-Terminals (N): ${Array.from(grammar.N).join(', ')}
    Terminals (T): ${Array.from(grammar.T).join(', ')}
    Start Symbol (S): ${grammar.S}
    Productions (P):
    ${Array.from(grammar.P.entries()).map(([driver, productions]) => {
        const productionsStr = productions.map(prod => prod.join(' ')).join(' | ');
        return `${driver} -> ${productionsStr}`;
    }).join('\n    ')}`;
}