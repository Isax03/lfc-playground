import type { Grammar, Production } from "$lib/types/grammar";
import { areProductionsEqual } from "../utils";

export function parseGrammar(input: string, startSymbol?: string): Grammar {
    const lines = input.split("\n").filter((line) => line.trim() !== "");
    const N = new Set<string>();
    const T = new Set<string>();
    const P = new Map<string, Production[]>();
    const symbolsInProductions = new Set<string>();

    // Helper function to merge productions for the same non-terminal
    const mergeProductions = (nonTerminal: string, newProductions: Production[]) => {
        const existingProductions = P.get(nonTerminal) || [];
        const mergedProductions = [...existingProductions];
        
        newProductions.forEach((newProd) => {
            if (!mergedProductions.some(p => areProductionsEqual(p, newProd))) {
                mergedProductions.push(newProd);
            }
        });
        
        P.set(nonTerminal, mergedProductions);
    };

    // Parse the grammar
    for (const line of lines) {
        if (!line.includes("->")) {
            throw new Error(
                `Syntax error: Missing '->' in production: ${line}`
            );
        }

        const [nonTerminal, productions] = line
            .split("->")
            .map((part) => part.trim());
        if (!nonTerminal || !productions) {
            throw new Error(`Syntax error: Invalid production: ${line}`);
        }

        // Add non-terminal to the set of non-terminals
        N.add(nonTerminal);

        // Parse each production
        const productionRules = productions
            .split("|")
            .map((prod) => prod.trim());
        const newProductions: Production[] = [];

        for (const prod of productionRules) {
            if (prod === "") {
                // Handle empty production (interpret as ε)
                console.warn(
                    `Warning: Empty production for non-terminal '${nonTerminal}' interpreted as 'ε'.`
                );
                newProductions.push(["ε"]);
            } else {
                // Split on one or more spaces
                const symbols = prod
                    .split(/\s+/)
                    .filter((symbol) => symbol !== "")
                    .map(symbol => symbol === "epsilon" ? "ε" : symbol);
                newProductions.push(symbols);
            }
        }

        // Merge productions for the same non-terminal
        mergeProductions(nonTerminal, newProductions);

        // Add symbols to terminals and track symbols in production bodies
        newProductions.forEach((prod) => {
            prod.forEach((symbol) => {
                if (symbol !== "ε") {
                    symbolsInProductions.add(symbol);
                }
            });
        });
    }

    // Determine terminals (symbols in production bodies that are not non-terminals)
    for (const symbol of symbolsInProductions) {
        if (!N.has(symbol)) {
            T.add(symbol);
        }
    }

    // Determine the start symbol
    let S: string;
    if (startSymbol) {
        // Use explicitly provided start symbol
        if (!N.has(startSymbol)) {
            throw new Error(
                `Start symbol '${startSymbol}' is not a non-terminal.`
            );
        }
        S = startSymbol;
    } else {
        // Use the non-terminal of the first production rule
        S = Array.from(P.keys())[0];
    }

    return { N, T, S, P };
}