import type { Grammar, Production, ProductionRule } from "$lib/types/grammar";
import type { StatesAutomaton, Closure, AutomatonBuildResult, AutomatonStep } from "../../types/slr";
import { closure } from "./closure";

function moveMarker(production: Production): Production | null {
    const markerIndex = production.findIndex(symbol => symbol === '·');
    if (markerIndex === production.length - 1) return null;
    
    const result = [...production];
    result[markerIndex] = result[markerIndex + 1];
    result[markerIndex + 1] = '·';
    return result;
}

function computeKernel(state: Closure, symbol: string): ProductionRule {
    const kernel = new Map<string, Production[]>();
    
    // Check kernel items
    for (const [head, productions] of state.kernel.entries()) {
        for (const prod of productions) {
            const markerIndex = prod.findIndex(s => s === '·');
            if (markerIndex < prod.length - 1 && prod[markerIndex + 1] === symbol) {
                const moved = moveMarker(prod);
                if (moved) {
                    if (!kernel.has(head)) kernel.set(head, []);
                    kernel.get(head)!.push(moved);
                }
            }
        }
    }
    
    // Check body items
    for (const [head, productions] of state.body.entries()) {
        for (const prod of productions) {
            const markerIndex = prod.findIndex(s => s === '·');
            if (markerIndex < prod.length - 1 && prod[markerIndex + 1] === symbol) {
                const moved = moveMarker(prod);
                if (moved) {
                    if (!kernel.has(head)) kernel.set(head, []);
                    kernel.get(head)!.push(moved);
                }
            }
        }
    }
    
    return kernel;
}

function kernelsEqual(k1: ProductionRule, k2: ProductionRule): boolean {
    if (k1.size !== k2.size) return false;
    
    for (const [head, prods1] of k1.entries()) {
        const prods2 = k2.get(head);
        if (!prods2) return false;
        if (prods1.length !== prods2.length) return false;
        if (!prods1.every(p1 => prods2.some(p2 => 
            p1.length === p2.length && p1.every((s, i) => s === p2[i])))) return false;
    }
    
    return true;
}

export function buildSlrAutomaton(grammar: Grammar): AutomatonBuildResult {
    const automaton: StatesAutomaton = {
        states: {},
        transitions: {}
    };
    
    const steps: AutomatonStep[] = [];
    
    // Create initial state with S' → ·S
    const initialKernel = new Map([[grammar.S, [['·', ...grammar.P.get(grammar.S)![0]]]]]);
    const initialState = closure(grammar, initialKernel);
    automaton.states['0'] = initialState;
    
    // Record initial step
    steps.push({
        stateId: '0',
        closure: initialState
    });
    
    const unmarked = new Set(['0']);
    let stateCounter = 1;
    
    while (unmarked.size > 0) {
        const stateId = unmarked.values().next().value;
        unmarked.delete(stateId!!);
        const state = automaton.states[stateId!!];
        
        automaton.transitions[stateId!!] = {};
        
        // Get all symbols after markers
        const symbols = new Set<string>();
        for (const [, prods] of state.kernel.entries()) {
            for (const prod of prods) {
                const markerIndex = prod.findIndex(s => s === '·');
                if (markerIndex < prod.length - 1) {
                    symbols.add(prod[markerIndex + 1]);
                }
            }
        }
        for (const [, prods] of state.body.entries()) {
            for (const prod of prods) {
                const markerIndex = prod.findIndex(s => s === '·');
                if (markerIndex < prod.length - 1) {
                    symbols.add(prod[markerIndex + 1]);
                }
            }
        }
        
        for (const symbol of symbols) {
            const targetKernel = computeKernel(state, symbol);
            
            let targetStateId = Object.entries(automaton.states)
                .find(([, s]) => kernelsEqual(s.kernel, targetKernel))?.[0];
            
            if (!targetStateId) {
                targetStateId = stateCounter.toString();
                stateCounter++;
                const targetClosure = closure(grammar, targetKernel);
                automaton.states[targetStateId] = targetClosure;
                unmarked.add(targetStateId);
                
                // Record step for new state
                steps.push({
                    stateId: targetStateId,
                    symbol: symbol,
                    fromStateId: stateId!!,
                    closure: targetClosure
                });
            } else {
                // Record step even when we find an existing state
                steps.push({
                    stateId: targetStateId,
                    symbol: symbol,
                    fromStateId: stateId!!,
                    kernel: targetKernel,  // Instead of full closure, we just show the kernel
                    isExistingState: true
                });
            }
            
            automaton.transitions[stateId!!][symbol] = targetStateId;
        }
    }
    
    return { automaton, steps };
}