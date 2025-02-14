import type { TreeNode } from "$lib/types/tree";
import type { Grammar } from "$lib/types/grammar";
import type { LL1Table } from "$lib/types/ll1";
import type { ParseResult, ParseStep } from "$lib/types/parse";

export function ll1Parsing(input: string, table: LL1Table, grammar: Grammar): ParseResult {
    const stack: [string, TreeNode][] = [];
    const trace: ParseStep[] = [];
    const root: TreeNode = {
        id: "0",
        symbol: grammar.S,
        children: [],
    };
    
    stack.push([grammar.S, root]);
    let tokens = input.trim().split(/\s+/);
    tokens.push("$");
    let currentPos = 0;
    let nodeCounter = 1;

    // Add initial state to trace
    trace.push({
        stack: [grammar.S],
        input: [...tokens],
    });

    try {
        while (stack.length > 0) {
            const [symbol, parentNode] = stack.pop()!;
            const currentToken = tokens[currentPos];

            if (stack.length === 0 && symbol !== "$") {
                stack.push(["$", root]);
            }

            if (symbol === currentToken) {
                if (currentToken !== "$") {
                    if (grammar.T.has(symbol)) {
                        parentNode.symbol = currentToken;
                    }
                    currentPos++;
                }
                trace.push({
                    stack: stack.map(([s]) => s),
                    input: tokens.slice(currentPos),
                    production: `match ${symbol}`
                });
            } else if (symbol in table && currentToken in table[symbol]) {
                const production = table[symbol][currentToken];
                
                if (!production || production.size === 0) {
                    throw new Error(`Invalid token "${currentToken}" found while parsing "${symbol}"`);
                }

                const symbols = production.get(symbol)?.[0] || [];
                const productionStr = `${symbol} → ${symbols.join(" ")}`;

                if (symbols.length === 1 && symbols[0] === "ε") {
                    const epsilonNode: TreeNode = {
                        id: `${nodeCounter++}`,
                        symbol: "ε",
                        children: [],
                    };
                    parentNode.children.push(epsilonNode);
                } else {
                    const newNodes: TreeNode[] = symbols.map(sym => ({
                        id: `${nodeCounter++}`,
                        symbol: sym,
                        children: [],
                    }));

                    parentNode.children.push(...newNodes);

                    for (let i = symbols.length - 1; i >= 0; i--) {
                        stack.push([symbols[i], newNodes[i]]);
                    }
                }

                trace.push({
                    stack: stack.map(([s]) => s),
                    input: tokens.slice(currentPos),
                    production: productionStr
                });
            } else {
                throw new Error(
                    `Unable to parse: no production rule for ${symbol} with token "${currentToken}"`
                );
            }
        }

        if (currentPos < tokens.length - 1) {
            throw new Error(`Invalid input: unexpected tokens "${tokens.slice(currentPos, -1).join(" ")}"`);
        }

        return { tree: root, trace, success: true };
    } catch (error: any) {
        return { 
            tree: null, 
            trace, 
            success: false, 
            error: error.message 
        };
    }
}