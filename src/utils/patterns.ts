/**
 * Language-specific pattern definitions for function detection
 */

import { SupportedLanguage, PatternType } from '../types';

/**
 * Pattern definition for a specific language
 */
interface LanguagePatterns {
    [key: string]: RegExp;
}

/**
 * All language patterns
 */
const LANGUAGE_PATTERNS: Record<string, LanguagePatterns> = {
    typescript: {
        function: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^\{]+))?/g,
        method: /(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^\{]+))?/g,
        arrow: /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?:=>|:\s*([^\{]+))?/g,
        classMethod: /(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^\{]+))?\s*\{/g
    },
    javascript: {
        function: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
        method: /(\w+)\s*:\s*(?:async\s+)?function\s*\(([^)]*)\)/g,
        arrow: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g
    },
    python: {
        function: /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?/g,
        method: /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?/g
    },
    java: {
        method: /(?:public|private|protected)?\s*(?:static)?\s*(\w+)\s+(\w+)\s*\(([^)]*)\)/g,
        function: /(?:public|private|protected)?\s*(?:static)?\s*(\w+)\s+(\w+)\s*\(([^)]*)\)/g
    }
};

/**
 * Get language patterns for a specific language
 */
export function getLanguagePatterns(language: string): LanguagePatterns {
    const normalizedLanguage = normalizeLanguage(language);
    return LANGUAGE_PATTERNS[normalizedLanguage] || LANGUAGE_PATTERNS.typescript;
}

/**
 * Normalize language identifier
 */
function normalizeLanguage(language: string): string {
    switch (language) {
        case 'typescript':
        case 'typescriptreact':
            return 'typescript';
        case 'javascript':
        case 'javascriptreact':
            return 'javascript';
        case 'python':
            return 'python';
        case 'java':
            return 'java';
        default:
            return 'typescript';
    }
}

/**
 * Build regex patterns for simple method matching
 */
export function buildSimpleMethodPatterns(functionName: string, language: string): RegExp[] {
    const escapedName = escapeRegex(functionName);

    if (language.includes('typescript') || language.includes('javascript')) {
        return [
            // Complete class method: public/private/protected static async methodName(params): returnType
            new RegExp(
                `(?:public|private|protected)?\\s*(?:static)?\\s*(?:async)?\\s*${escapedName}\\s*\\([^)]*\\)(?:\\s*:\\s*[^{]+)?`,
                'g'
            ),
            // Function expression: const/let/var methodName = (params) => or function(params)
            new RegExp(
                `(?:const|let|var)\\s+${escapedName}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*=>`,
                'g'
            ),
            // Regular function: function methodName(params)
            new RegExp(
                `(?:export\\s+)?(?:async\\s+)?function\\s+${escapedName}\\s*\\([^)]*\\)`,
                'g'
            )
        ];
    } else if (language === 'python') {
        return [
            new RegExp(
                `def\\s+${escapedName}\\s*\\([^)]*\\)(?:\\s*->\\s*[^:]+)?`,
                'g'
            )
        ];
    } else if (language === 'java') {
        return [
            new RegExp(
                `(?:public|private|protected)?\\s*(?:static)?\\s*\\w+\\s+${escapedName}\\s*\\([^)]*\\)`,
                'g'
            )
        ];
    }

    return [];
}

/**
 * Escape regex special characters
 */
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clean function name from modifiers
 */
export function cleanFunctionName(selectedText: string): string {
    return selectedText
        .replace(/^(public|private|protected)\s+/, '')
        .replace(/^(static)\s+/, '')
        .replace(/^(async)\s+/, '')
        .trim();
}
