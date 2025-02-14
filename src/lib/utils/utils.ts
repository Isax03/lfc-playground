import type { Production } from "$lib/types/grammar";

export function areProductionsEqual(p1: Production, p2: Production): boolean {
    return (
        p1.length === p2.length &&
        p1.every((symbol, index) => symbol === p2[index])
    );
}