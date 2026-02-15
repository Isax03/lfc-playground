/**
 * Regex parser: converts a regular expression string into an AST (RegexNode).
 * 
 * Supported syntax:
 *   a, b, c, ...   - literal characters
 *   |               - union (alternation)
 *   *               - Kleene star
 *   +               - one or more (r+ = rr*)
 *   ?               - optional (r? = r|ε)
 *   ( )             - grouping
 *   ε or epsilon    - epsilon (empty string)
 *   [a-z]           - character ranges (expanded to alternation)
 *   \\ escape       - escape next char as literal
 * 
 * Precedence (low to high): union < concat < star/plus/optional
 */

import type { RegexNode } from '$lib/types/automaton';

class RegexParser {
    private input: string;
    private pos: number;

    constructor(input: string) {
        // Preprocess: replace 'epsilon' with 'ε'
        this.input = input.replace(/epsilon/g, 'ε');
        this.pos = 0;
    }

    parse(): RegexNode {
        const node = this.parseUnion();
        if (this.pos < this.input.length) {
            throw new Error(`Unexpected character '${this.input[this.pos]}' at position ${this.pos}`);
        }
        return node;
    }

    private peek(): string | null {
        if (this.pos >= this.input.length) return null;
        return this.input[this.pos];
    }

    private consume(): string {
        return this.input[this.pos++];
    }

    // union = concat ('|' concat)*
    private parseUnion(): RegexNode {
        let left = this.parseConcat();
        while (this.peek() === '|') {
            this.consume(); // eat '|'
            const right = this.parseConcat();
            left = { type: 'union', left, right };
        }
        return left;
    }

    // concat = postfix postfix*
    private parseConcat(): RegexNode {
        let parts: RegexNode[] = [];
        while (this.peek() !== null && this.peek() !== '|' && this.peek() !== ')') {
            parts.push(this.parsePostfix());
        }
        if (parts.length === 0) {
            return { type: 'epsilon' };
        }
        let result = parts[0];
        for (let i = 1; i < parts.length; i++) {
            result = { type: 'concat', left: result, right: parts[i] };
        }
        return result;
    }

    // postfix = atom ('*' | '+' | '?')*
    private parsePostfix(): RegexNode {
        let node = this.parseAtom();
        while (this.peek() === '*' || this.peek() === '+' || this.peek() === '?') {
            const op = this.consume();
            if (op === '*') {
                node = { type: 'star', child: node };
            } else if (op === '+') {
                node = { type: 'plus', child: node };
            } else if (op === '?') {
                node = { type: 'optional', child: node };
            }
        }
        return node;
    }

    // atom = '(' union ')' | char_class | literal | epsilon
    private parseAtom(): RegexNode {
        const ch = this.peek();
        if (ch === '(') {
            this.consume(); // eat '('
            const node = this.parseUnion();
            if (this.peek() !== ')') {
                throw new Error(`Expected ')' at position ${this.pos}`);
            }
            this.consume(); // eat ')'
            return node;
        }

        if (ch === '[') {
            return this.parseCharClass();
        }

        if (ch === 'ε') {
            this.consume();
            return { type: 'epsilon' };
        }

        if (ch === '\\') {
            this.consume(); // eat '\\'
            const escaped = this.peek();
            if (escaped === null) {
                throw new Error('Unexpected end of input after \\');
            }
            this.consume();
            return { type: 'literal', value: escaped };
        }

        if (ch === null || ch === ')' || ch === '|') {
            throw new Error(`Unexpected character at position ${this.pos}`);
        }

        // Regular literal character
        this.consume();
        return { type: 'literal', value: ch };
    }

    // [a-z], [abc], [a-zA-Z0-9], etc.
    private parseCharClass(): RegexNode {
        this.consume(); // eat '['
        let chars: string[] = [];

        while (this.peek() !== null && this.peek() !== ']') {
            const start = this.consume();
            if (this.peek() === '-' && this.pos + 1 < this.input.length && this.input[this.pos + 1] !== ']') {
                this.consume(); // eat '-'
                const end = this.consume();
                const startCode = start.charCodeAt(0);
                const endCode = end.charCodeAt(0);
                if (startCode > endCode) {
                    throw new Error(`Invalid range [${start}-${end}]`);
                }
                for (let code = startCode; code <= endCode; code++) {
                    chars.push(String.fromCharCode(code));
                }
            } else {
                chars.push(start);
            }
        }

        if (this.peek() !== ']') {
            throw new Error(`Expected ']' at position ${this.pos}`);
        }
        this.consume(); // eat ']'

        if (chars.length === 0) {
            throw new Error('Empty character class []');
        }

        // Build union of all characters
        let node: RegexNode = { type: 'literal', value: chars[0] };
        for (let i = 1; i < chars.length; i++) {
            node = { type: 'union', left: node, right: { type: 'literal', value: chars[i] } };
        }
        return node;
    }
}

/**
 * Parse a regex string into an AST.
 */
export function parseRegex(input: string): RegexNode {
    const parser = new RegexParser(input.trim());
    return parser.parse();
}

/**
 * Pretty-print a RegexNode back to string form.
 */
export function regexToString(node: RegexNode): string {
    switch (node.type) {
        case 'literal':
            return node.value;
        case 'epsilon':
            return 'ε';
        case 'concat':
            return regexToString(node.left) + regexToString(node.right);
        case 'union':
            return `${regexToString(node.left)}|${regexToString(node.right)}`;
        case 'star':
            return wrapIfComplex(node.child) + '*';
        case 'plus':
            return wrapIfComplex(node.child) + '+';
        case 'optional':
            return wrapIfComplex(node.child) + '?';
    }
}

function wrapIfComplex(node: RegexNode): string {
    const str = regexToString(node);
    if (node.type === 'concat' || node.type === 'union') {
        return `(${str})`;
    }
    return str;
}
