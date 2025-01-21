export function encodeGrammar(grammar: string): string {
    return btoa(encodeURIComponent(grammar));
}

export function decodeGrammar(encoded: string): string {
    try {
        return decodeURIComponent(atob(encoded));
    } catch {
        return '';
    }
}

export function createShareableLink(path: string, grammar: string): string {
    const encoded = encodeGrammar(grammar);
    return `${window.location.origin}${path}?grammar=${encoded}`;
}
