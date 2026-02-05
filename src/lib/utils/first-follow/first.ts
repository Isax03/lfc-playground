import type { FirstSet, FirstSets } from "$lib/types/first-follow";
import type { Grammar } from "$lib/types/grammar";

export function computeFirstForSymbol(
    symbol: string,
    grammar: Grammar,
    firstSets: FirstSets,
    processing: Set<string> = new Set()
): FirstSet {
    // Se il simbolo è un terminale, epsilon, o $ (end marker), il first è il simbolo stesso
    if (grammar.T.has(symbol) || symbol === 'ε' || symbol === '$') {
        return new Set([symbol]);
    }

    // If we've already computed First for this symbol and it's not being processed, return it
    if (firstSets.has(symbol) && !processing.has(symbol)) {
        return firstSets.get(symbol)!;
    }

    // If we're already processing this symbol, return empty set to avoid infinite recursion
    if (processing.has(symbol)) {
        return new Set();
    }

    // Add symbol to processing set to track recursive calls
    processing.add(symbol);

    // Initialize First set for this symbol
    let firstSet = new Set<string>();

    // Get productions for this symbol and compute First sets
    const productions = grammar.P.get(symbol);
    if (productions) {
        for (const production of productions) {
            const sequenceFirst = computeFirstForSequence(production, grammar, firstSets, processing);
            firstSet = new Set([...firstSet, ...sequenceFirst]);
        }
    }

    // Rimuoviamo il simbolo dall'insieme dei simboli in elaborazione
    processing.delete(symbol);

    // Memorizziamo il risultato
    firstSets.set(symbol, firstSet);

    return firstSet;
}

export function computeFirstForSequence(
    sequence: string[], 
    grammar: Grammar, 
    firstSets: FirstSets,
    processing: Set<string> = new Set()
): FirstSet {
    let firstSet = new Set<string>();
    let allNullable = true;

    for (let i = 0; i < sequence.length; i++) {
        const symbol = sequence[i];
        const firstOfSymbol = computeFirstForSymbol(symbol, grammar, firstSets, processing);

        // Add all symbols except epsilon
        const nonEpsilonFirst = new Set([...firstOfSymbol].filter(s => s !== 'ε'));
        firstSet = new Set([...firstSet, ...nonEpsilonFirst]);

        // Stop if this symbol cannot derive epsilon
        if (!firstOfSymbol.has('ε')) {
            allNullable = false;
            break;
        }

        // Se il simbolo è annullabile, continuiamo a considerare il prossimo simbolo nella sequenza
    }

    // If all symbols can derive epsilon, add epsilon to the result
    if (allNullable && sequence.length > 0) {
        firstSet.add('ε');
    }

    return firstSet;
}

export function computeFirstSets(grammar: Grammar): FirstSets {
    const firstSets = new Map<string, Set<string>>();
    
    // Inizializziamo i FIRST sets per tutti i non-terminali
    for (const nonTerminal of grammar.N) {
        firstSets.set(nonTerminal, new Set());
    }

    // Iteriamo finché non ci sono più cambiamenti
    let changed = true;
    while (changed) {
        changed = false;

        for (const nonTerminal of grammar.N) {
            const oldSize = firstSets.get(nonTerminal)!.size;
            const productions = grammar.P.get(nonTerminal);
            
            if (productions) {
                for (const production of productions) {
                    const sequenceFirst = computeFirstForSequence(production, grammar, firstSets);
                    const currentFirst = firstSets.get(nonTerminal)!;
                    sequenceFirst.forEach(symbol => currentFirst.add(symbol));
                }
            }

            // Verifichiamo se il FIRST set è cambiato
            if (firstSets.get(nonTerminal)!.size !== oldSize) {
                changed = true;
            }
        }
    }

    return firstSets;
}