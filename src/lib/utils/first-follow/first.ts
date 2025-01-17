import type { Grammar } from "$lib/types/grammar";

// Funzione per calcolare il first di un singolo simbolo
function computeFirstForSymbol(symbol: string, grammar: Grammar, firstSets: Map<string, Set<string>>): Set<string> {
    if (grammar.T.has(symbol)) {
        // Se il simbolo è un terminale, il first è il simbolo stesso
        return new Set([symbol]);
    }

    if (firstSets.has(symbol)) {
        // Se abbiamo già calcolato il first per questo simbolo, lo restituiamo
        return firstSets.get(symbol)!;
    }

    // Inizializziamo il set dei first per questo simbolo
    const firstSet = new Set<string>();
    firstSets.set(symbol, firstSet);

    // Iteriamo su tutte le produzioni di questo non-terminale
    for (const rule of grammar.P) {
        if (rule.nonTerminal === symbol) {
            for (const production of rule.productions) {
                let allNullable = true;
                for (const sym of production) {
                    const firstOfSym = computeFirstForSymbol(sym, grammar, firstSets);
                    for (const f of firstOfSym) {
                        if (f !== 'ε') {
                            firstSet.add(f);
                        }
                    }
                    if (!firstOfSym.has('ε')) {
                        allNullable = false;
                        break;
                    }
                }
                if (allNullable) {
                    firstSet.add('ε');
                }
            }
        }
    }

    return firstSet;
}

// Funzione per calcolare il first di una sequenza di simboli
function computeFirstForSequence(sequence: string[], grammar: Grammar, firstSets: Map<string, Set<string>>): Set<string> {
    const firstSet = new Set<string>();
    let allNullable = true;

    for (const symbol of sequence) {
        const firstOfSymbol = computeFirstForSymbol(symbol, grammar, firstSets);
        for (const f of firstOfSymbol) {
            if (f !== 'ε') {
                firstSet.add(f);
            }
        }
        if (!firstOfSymbol.has('ε')) {
            allNullable = false;
            break;
        }
    }

    if (allNullable) {
        firstSet.add('ε');
    }

    return firstSet;
}

// Funzione principale per calcolare i first per tutti i non-terminali
export function computeFirstSets(grammar: Grammar): Map<string, Set<string>> {
    const firstSets = new Map<string, Set<string>>();

    for (const nonTerminal of grammar.N) {
        computeFirstForSymbol(nonTerminal, grammar, firstSets);
    }

    // Rimuoviamo eventuali chiavi non valide (come 'ε') dalla mappa
    for (const key of firstSets.keys()) {
        if (!grammar.N.has(key)) {
            firstSets.delete(key);
        }
    }

    return firstSets;
}