import type { Grammar, Production, ProductionRule } from "$lib/types/grammar";
import type {
    AutomatonBuildResult,
    AutomatonStep,
    Closure,
    ReducingLabel,
    StatesAutomaton,
} from "../../types/slr";
import { closure } from "./closure";

function moveMarker(production: Production): Production | null {
    // Non muovere il marker per produzioni epsilon (che hanno solo il marker)
    if (production.length === 1 && production[0] === "·") return null;

    const markerIndex = production.findIndex((symbol) => symbol === "·");
    if (markerIndex === production.length - 1) return null;

    const result = [...production];
    result[markerIndex] = result[markerIndex + 1];
    result[markerIndex + 1] = "·";
    return result;
}

function computeKernel(state: Closure, symbol: string): ProductionRule {
    const kernel = new Map<string, Production[]>();

    // Check kernel items
    for (const [head, productions] of state.kernel.entries()) {
        for (const prod of productions) {
            const markerIndex = prod.findIndex((s) => s === "·");
            if (
                markerIndex < prod.length - 1 &&
                prod[markerIndex + 1] === symbol
            ) {
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
            const markerIndex = prod.findIndex((s) => s === "·");
            if (
                markerIndex < prod.length - 1 &&
                prod[markerIndex + 1] === symbol
            ) {
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
        if (
            !prods1.every((p1) =>
                prods2.some(
                    (p2) =>
                        p1.length === p2.length &&
                        p1.every((s, i) => s === p2[i])
                )
            )
        )
            return false;
    }

    return true;
}

function findReducingItems(
    closure: Closure
): { head: string; body: string[] }[] {
    const reducingItems: { head: string; body: string[] }[] = [];

    function processProductions(head: string, productions: Production[]) {
        for (const prod of productions) {
            // Salta SOLO l'item di accept (S' -> S•)
            if (
                head === "S'" &&
                prod.length === 2 &&
                prod[0] === "S" &&
                prod[1] === "·"
            ) {
                continue;
            }

            // Processa normalmente tutti gli altri items
            if (prod.length === 1 && prod[0] === "·") {
                reducingItems.push({ head, body: ["ε"] });
            } else if (prod[prod.length - 1] === "·") {
                const body = prod.filter((s) => s !== "·");
                reducingItems.push({ head, body });
            }
        }
    }

    // Process both kernel and body items
    for (const [head, productions] of closure.kernel.entries()) {
        processProductions(head, productions);
    }
    for (const [head, productions] of closure.body.entries()) {
        processProductions(head, productions);
    }

    return reducingItems;
}

function isRuleEqual(
    r1: { head: string; body: string[] },
    r2: { head: string; body: string[] }
): boolean {
    return (
        r1.head === r2.head &&
        r1.body.length === r2.body.length &&
        r1.body.every((s, i) => s === r2.body[i])
    );
}

export function buildSlrAutomaton(grammar: Grammar): AutomatonBuildResult {
    const automaton: StatesAutomaton = {
        states: {},
        transitions: {},
    };

    const steps: AutomatonStep[] = [];
    const reducingLabels: ReducingLabel[] = [];
    let reduceCounter = 1;

    // Create initial state with S' → ·S
    const initialKernel = new Map([
        [grammar.S, [["·", ...grammar.P.get(grammar.S)![0]]]],
    ]);
    const initialState = closure(grammar, initialKernel);
    automaton.states["0"] = initialState;

    // Check for reducing items in initial state
    const initialReducingItems = findReducingItems(initialState);
    for (const item of initialReducingItems) {
        if (!reducingLabels.some((rl) => isRuleEqual(rl.rule, item))) {
            reducingLabels.push({
                rule: item,
                label: `r${reduceCounter++}`,
            });
        }
    }

    // Record initial step
    steps.push({
        stateId: "0",
        closure: initialState,
    });

    const unmarked = new Set(["0"]);
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
                const markerIndex = prod.findIndex((s) => s === "·");
                if (markerIndex < prod.length - 1) {
                    symbols.add(prod[markerIndex + 1]);
                }
            }
        }
        for (const [, prods] of state.body.entries()) {
            for (const prod of prods) {
                const markerIndex = prod.findIndex((s) => s === "·");
                if (markerIndex < prod.length - 1) {
                    symbols.add(prod[markerIndex + 1]);
                }
            }
        }

        console.log("State", stateId, "Symbols", symbols);

        for (const symbol of symbols) {
            const targetKernel = computeKernel(state, symbol);

            let targetStateId = Object.entries(automaton.states).find(([, s]) =>
                kernelsEqual(s.kernel, targetKernel)
            )?.[0];

            if (!targetStateId) {
                targetStateId = stateCounter.toString();
                stateCounter++;

                console.log("New state", targetStateId, targetKernel);
                
                const targetClosure = closure(grammar, targetKernel);

                console.log("New closure", targetClosure);

                automaton.states[targetStateId] = targetClosure;
                unmarked.add(targetStateId);

                // Check for new reducing items
                const reducingItems = findReducingItems(targetClosure);
                for (const item of reducingItems) {
                    if (
                        !reducingLabels.some((rl) => isRuleEqual(rl.rule, item))
                    ) {
                        reducingLabels.push({
                            rule: item,
                            label: `r${reduceCounter++}`,
                        });
                    }
                }

                // Record step for new state
                steps.push({
                    stateId: targetStateId,
                    symbol: symbol,
                    fromStateId: stateId!!,
                    closure: targetClosure,
                });
            } else {
                // Record step even when we find an existing state
                steps.push({
                    stateId: targetStateId,
                    symbol: symbol,
                    fromStateId: stateId!!,
                    kernel: targetKernel, // Instead of full closure, we just show the kernel
                    isExistingState: true,
                });
            }

            automaton.transitions[stateId!!][symbol] = targetStateId;
        }
    }

    return { automaton, steps, reducingLabels };
}
