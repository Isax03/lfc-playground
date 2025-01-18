import type { FirstSet, FirstSets } from "$lib/types/first-follow";
import type { Grammar } from "$lib/types/grammar";

export function computeFirstForSymbol(
    symbol: string, 
    grammar: Grammar, 
    firstSets: FirstSets,
    processing: Set<string> = new Set()
): FirstSet {
    // Se il simbolo è un terminale o epsilon, il first è il simbolo stesso
    if (grammar.T.has(symbol) || symbol === 'ε') {
        return new Set([symbol]);
    }

    // Se abbiamo già calcolato il first per questo simbolo, lo restituiamo
    if (firstSets.has(symbol) && !processing.has(symbol)) {
        return firstSets.get(symbol)!;
    }

    // Se stiamo già processando questo simbolo, restituiamo un set vuoto
    // per evitare la ricorsione infinita
    if (processing.has(symbol)) {
        return new Set();
    }

    // Aggiungiamo il simbolo all'insieme dei simboli in elaborazione
    processing.add(symbol);

    // Inizializziamo il set dei first per questo simbolo
    let firstSet = new Set<string>();

    // Iteriamo su tutte le produzioni di questo non-terminale
    for (const rule of grammar.P) {
        if (rule.driver === symbol) {
            for (const production of rule.productions) {
                const sequenceFirst = computeFirstForSequence(production, grammar, firstSets, processing);
                firstSet = new Set([...firstSet, ...sequenceFirst]);
            }
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

        // Aggiungiamo tutti i simboli tranne epsilon
        const nonEpsilonFirst = new Set([...firstOfSymbol].filter(s => s !== 'ε'));
        firstSet = new Set([...firstSet, ...nonEpsilonFirst]);

        // Se questo simbolo non può derivare epsilon, ci fermiamo
        if (!firstOfSymbol.has('ε')) {
            allNullable = false;
            break;
        }

        // Se il simbolo è annullabile, continuiamo a considerare il prossimo simbolo nella sequenza
    }

    // Se tutti i simboli sono annullabili, aggiungiamo epsilon al risultato
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

            // Calcoliamo il nuovo FIRST per questo non-terminale
            for (const rule of grammar.P) {
                if (rule.driver === nonTerminal) {
                    for (const production of rule.productions) {
                        const sequenceFirst = computeFirstForSequence(production, grammar, firstSets);
                        const currentFirst = firstSets.get(nonTerminal)!;
                        sequenceFirst.forEach(symbol => currentFirst.add(symbol));
                    }
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