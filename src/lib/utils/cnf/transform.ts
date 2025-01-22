import type { Grammar, Production } from "$lib/types/grammar";
import { areProductionsEqual } from "../utils";

export function transformToCnf(grammar: Grammar): Grammar {
    let result = { ...grammar };
    result = removeEmpties(result);
    result = removeSingles(result);
    result = convertGrammar(result);
    result = removeUnreachable(result);

    // Remove empty productions
    for (const [nonTerminal, productions] of result.P) {
        const newProductions = productions.filter((production) => production.length > 0);
        if (newProductions.length === 0) {
            result.P.delete(nonTerminal);
        } else {
            result.P.set(nonTerminal, newProductions);
        }
    }

    return result;
}

function removeEmpties(grammar: Grammar): Grammar {
    let result = { ...grammar };
    let hasEmpty = true;

    while (hasEmpty) {
        hasEmpty = false;
        for (const [nonTerminal, productions] of result.P) {
            for (let i = 0; i < productions.length; i++) {
                if (productions[i].length === 1 && productions[i][0] === 'ε') {
                    productions.splice(i, 1);
                    i--;
                    result = removeEmpty(result, Array.from(result.P.keys()), nonTerminal);
                    hasEmpty = true;
                }
            }
        }
    }
    return result;
}

function removeEmpty(grammar: Grammar, keys: string[], term: string): Grammar {
    const result = { ...grammar };

    for (const key of keys) {
        const productions = result.P.get(key) || [];
        for (const prod of productions) {
            if (prod.includes(term)) {
                const newGenerations: Production[] = [[]];
                
                for (const symbol of prod) {
                    if (symbol !== term) {
                        newGenerations.forEach(gen => gen.push(symbol));
                    } else {
                        const currentLength = newGenerations.length;
                        for (let i = 0; i < currentLength; i++) {
                            const newGen = [...newGenerations[i]];
                            newGenerations[i].push(symbol);
                            newGenerations.push(newGen);
                        }
                    }
                }

                for (const newGen of newGenerations) {
                    if (newGen.length === 0) {
                        newGen.push('ε');
                    }
                    addNewGeneration(result, key, newGen);
                }
            }
        }
    }
    return result;
}

function removeSingles(grammar: Grammar): Grammar {
    const result = { ...grammar };
    let hasSingle = true;

    while (hasSingle) {
        hasSingle = false;
        for (const [nonTerminal, productions] of result.P) {
            for (let i = 0; i < productions.length; i++) {
                const prod = productions[i];
                if (prod.length === 1 && result.P.has(prod[0])) {
                    const key = prod[0];
                    productions.splice(i, 1);
                    const keyProductions = result.P.get(key) || [];
                    keyProductions.forEach(keyProd => {
                        addNewGeneration(result, nonTerminal, keyProd);
                    });
                    hasSingle = true;
                    i--;
                }
            }
        }
    }
    return result;
}

function convertGrammar(grammar: Grammar): Grammar {
    const result = { ...grammar };
    const singles: Map<string, string> = new Map();
    const multis: Map<string, string> = new Map();
    let helperIndex = 0;

    // Handle single terminals
    for (const [nonTerminal, productions] of result.P) {
        if (productions.length === 1 && productions[0].length === 1) {
            const term = productions[0][0];
            if (term !== 'ε' && !result.P.has(term)) {
                singles.set(term, nonTerminal);
            }
        }
    }

    // Handle multiple symbols
    for (const [nonTerminal, productions] of result.P) {
        if (productions.length === 1) {
            multis.set(productions[0].join(' '), nonTerminal);
        }
    }

    // Convert productions
    for (const [nonTerminal, productions] of result.P) {
        for (let i = 0; i < productions.length; i++) {
            const prod = productions[i];
            
            if (prod.length === 2) {
                for (let j = 0; j < 2; j++) {
                    if (!result.P.has(prod[j]) && !singles.has(prod[j])) {
                        let key = getHelperKey(helperIndex++);
                        while (result.P.has(key)) {
                            key = getHelperKey(helperIndex++);
                        }
                        result.P.set(key, [[prod[j]]]);
                        result.N.add(key);
                        singles.set(prod[j], key);
                    }
                    if (singles.has(prod[j])) {
                        prod[j] = singles.get(prod[j])!;
                    }
                }
            } else if (prod.length > 2) {
                // Handle longer productions
                const last = prod.length - 1;
                if (!result.P.has(prod[last]) && !singles.has(prod[last])) {
                    const key = getHelperKey(helperIndex++);
                    result.P.set(key, [[prod[last]]]);
                    result.N.add(key);
                    singles.set(prod[last], key);
                }
                
                const lastSymbol = singles.has(prod[last]) ? singles.get(prod[last])! : prod[last];
                const prefix = prod.slice(0, last).join(' ');
                
                if (!multis.has(prefix)) {
                    const key = getHelperKey(helperIndex++);
                    result.P.set(key, [prod.slice(0, last)]);
                    result.N.add(key);
                    multis.set(prefix, key);
                }
                
                productions[i] = [multis.get(prefix)!, lastSymbol];
            }
        }
    }
    return result;
}

function removeUnreachable(grammar: Grammar): Grammar {
    const result = { ...grammar };
    const reachable = new Set<string>([result.S]);
    const queue = [result.S];
    let front = 0;

    while (front < queue.length) {
        const current = queue[front];
        const productions = result.P.get(current) || [];
        
        for (const prod of productions) {
            for (const symbol of prod) {
                if (result.P.has(symbol) && !reachable.has(symbol)) {
                    queue.push(symbol);
                    reachable.add(symbol);
                }
            }
        }
        front++;
    }

    // Remove unreachable productions
    for (const [nonTerminal] of result.P) {
        if (!reachable.has(nonTerminal)) {
            result.P.delete(nonTerminal);
            result.N.delete(nonTerminal);
        }
    }

    return result;
}

// Utility functions
function getHelperKey(index: number): string {
    return 'A' + toSubscript(index);
}

function toSubscript(num: number): string {
    const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return num.toString()
             .split('')
             .map(d => subscriptDigits[parseInt(d)])
             .join('');
}

function addNewGeneration(grammar: Grammar, key: string, newGeneration: Production): void {
    const productions = grammar.P.get(key) || [];
    if (!productions.some(prod => areProductionsEqual(prod, newGeneration))) {
        if (!grammar.P.has(key)) {
            grammar.P.set(key, []);
        }
        grammar.P.get(key)!.push(newGeneration);
    }
}