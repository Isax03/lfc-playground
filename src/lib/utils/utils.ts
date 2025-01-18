export function areProductionsEqual(p1: string[], p2: string[]) {
    return (
        p1.length === p2.length &&
        p1.every((symbol, index) => symbol === p2[index])
    );
}
