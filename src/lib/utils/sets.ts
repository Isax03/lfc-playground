export function sortSetElements(set: Set<string>): string[] {
    const result: string[] = [];
    const special = new Set(['ε', '$']);
    
    // First add all non-special symbols in alphabetical order
    [...set]
        .filter(s => !special.has(s))
        .sort()
        .forEach(s => result.push(s));
    
    // Then add epsilon if present
    if (set.has('ε')) {
        result.push('ε');
    }
    
    // Finally add dollar if present
    if (set.has('$')) {
        result.push('$');
    }
    
    return result;
}
