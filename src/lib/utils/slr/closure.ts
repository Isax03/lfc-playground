import type { Grammar, Production, ProductionRule } from "$lib/types/grammar";
import type { Closure } from "$lib/types/slr";

export function closure(grammar: Grammar, items: ProductionRule): Closure {
    const result: Closure = {
        kernel: new Map(items),
        body: new Map()
    };
    
    const unmarked = new Map(items);
    
    while (unmarked.size > 0) {
        const [[head, productions]] = unmarked.entries();
        unmarked.delete(head);
        
        for (const body of productions) {
            const markerIndex = body.findIndex(symbol => symbol === '·');
            if (markerIndex === body.length - 1) continue;
            
            const nextSymbol = body[markerIndex + 1];
            
            if (grammar.N.has(nextSymbol)) {
                const nextProductions = grammar.P.get(nextSymbol);
                if (!nextProductions) continue;
                
                const markedProductions = nextProductions.map(prod => ['·', ...prod]);
                
                // Add to body if not already present
                if (!result.kernel.has(nextSymbol) && !result.body.has(nextSymbol)) {
                    result.body.set(nextSymbol, markedProductions);
                    unmarked.set(nextSymbol, markedProductions);
                }
                else if (!result.body.has(nextSymbol)) {
                    result.body.set(nextSymbol, markedProductions);
                    unmarked.set(nextSymbol, markedProductions);
                }
            }
        }
    }
    
    return result;
}