import type { Production } from "$lib/types/grammar";
import type { ReducingLabel } from "$lib/types/slr";

export function areProductionsEqual(p1: Production, p2: Production): boolean {
    return (
        p1.length === p2.length &&
        p1.every((symbol, index) => symbol === p2[index])
    );
}

export interface Rule {
    head: string;
    body: string[];
}

export function isRuleEqual(p1: Rule, p2: Rule): boolean {
    if (p1.head !== p2.head) return false;
    
    // Se uno dei due è epsilon, devono essere entrambi epsilon
    const isP1Epsilon = p1.body.length === 1 && p1.body[0] === 'ε';
    const isP2Epsilon = p2.body.length === 1 && p2.body[0] === 'ε';
    
    if (isP1Epsilon || isP2Epsilon) {
        return isP1Epsilon && isP2Epsilon;
    }
    
    return p1.body.length === p2.body.length && 
           p1.body.every((s, i) => s === p2.body[i]);
}
