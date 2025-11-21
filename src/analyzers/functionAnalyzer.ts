/**
 * Function analyzer for detecting and parsing function definitions
 */

import * as vscode from 'vscode';
import { FunctionInfo } from '../types';
import { getLanguagePatterns, buildSimpleMethodPatterns, cleanFunctionName } from '../utils/patterns';
import { FunctionAnalysisError } from '../utils/errors';

/**
 * Analyzes and extracts information from function definitions
 */
export class FunctionAnalyzer {
    /**
     * Analyze the selected function in the editor
     * @param editor - The active text editor
     * @param selectedText - Optional pre-selected text to analyze
     * @returns Function information or null if no valid function is detected
     * @throws {FunctionAnalysisError} If analysis fails
     */
    public static analyzeSelectedFunction(editor: vscode.TextEditor, selectedText?: string): FunctionInfo | null {
        const document = editor.document;
        const selection = editor.selection;

        // Use provided text or get from selection
        let textToAnalyze = selectedText || document.getText(selection);

        if (!textToAnalyze) {
            return null;
        }

        textToAnalyze = textToAnalyze.trim();
        const language = document.languageId;

        // Try simple method match (for partial selections)
        const simpleMatch = this.trySimpleMethodMatch(editor, textToAnalyze, language);
        if (simpleMatch) {
            return simpleMatch;
        }

        // Try complete pattern matching
        const patterns = getLanguagePatterns(language);
        for (const pattern of Object.values(patterns)) {
            const matches = [...textToAnalyze.matchAll(pattern)];
            if (matches.length > 0) {
                return this.parseFunctionInfo(matches[0], language, document.fileName, selection.start.line + 1);
            }
        }

        // Try to find function within selection
        return this.findFunctionInSelection(textToAnalyze, language, document.fileName, selection.start.line + 1);
    }

    /**
     * Try to match a method when only the name or partial signature is selected
     * Searches the current line and nearby lines for function definition
     */
    private static trySimpleMethodMatch(
        editor: vscode.TextEditor,
        selectedText: string,
        language: string
    ): FunctionInfo | null {
        const document = editor.document;
        const selection = editor.selection;
        const currentLine = selection.start.line;

        const functionName = cleanFunctionName(selectedText);
        const patterns = buildSimpleMethodPatterns(functionName, language);

        // Search in current line first, then expand to nearby lines
        const linesToSearch = [
            currentLine, // Current line first
            ...Array.from({ length: 3 }, (_, i) => currentLine - (i + 1)).filter(l => l >= 0), // 3 lines above
            ...Array.from({ length: 2 }, (_, i) => currentLine + (i + 1)).filter(l => l < document.lineCount) // 2 lines below
        ];

        for (const lineNum of linesToSearch) {
            const line = document.lineAt(lineNum);
            const lineText = line.text;

            // Skip if line doesn't contain the function name
            if (!lineText.includes(functionName)) {
                continue;
            }

            for (const methodPattern of patterns) {
                const match = lineText.match(methodPattern);
                if (match) {
                    const fullSignature = match[0];
                    const matchStartIndex = lineText.indexOf(match[0]);
                    const languagePatterns = getLanguagePatterns(language);

                    for (const pattern of Object.values(languagePatterns)) {
                        const matches = [...fullSignature.matchAll(pattern)];
                        if (matches.length > 0) {
                            const functionInfo = this.parseFunctionInfo(matches[0], language, document.fileName, lineNum + 1);

                            // Calculate the precise position of the function name in the line
                            if (functionInfo) {
                                // Search for function name within the matched signature to be more precise
                                const nameInSignatureIndex = fullSignature.indexOf(functionInfo.name);
                                if (nameInSignatureIndex !== -1) {
                                    functionInfo.namePosition = matchStartIndex + nameInSignatureIndex;
                                } else {
                                    // Fallback: find in whole line but ensure it's after the match start
                                    const nameIndex = lineText.indexOf(functionInfo.name, matchStartIndex);
                                    if (nameIndex !== -1) {
                                        functionInfo.namePosition = nameIndex;
                                    }
                                }
                            }

                            return functionInfo;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Find function definition within a text selection
     */
    private static findFunctionInSelection(
        text: string,
        language: string,
        filePath: string,
        lineNumber: number
    ): FunctionInfo | null {
        const patterns = getLanguagePatterns(language);

        for (const pattern of Object.values(patterns)) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                return this.parseFunctionInfo(matches[0], language, filePath, lineNumber);
            }
        }

        return null;
    }

    /**
     * Parse regex match into FunctionInfo
     */
    private static parseFunctionInfo(
        match: RegExpMatchArray,
        language: string,
        filePath: string,
        lineNumber: number
    ): FunctionInfo {
        let name = '';
        let parameters = '';
        let returnType = 'void';

        switch (language) {
            case 'typescript':
            case 'typescriptreact':
                name = match[1] || '';
                parameters = match[2] || '';
                returnType = match[3] ? match[3].trim() : 'void';
                break;
            case 'javascript':
            case 'javascriptreact':
                name = match[1] || '';
                parameters = match[2] || '';
                break;
            case 'python':
                name = match[1] || '';
                parameters = match[2] || '';
                returnType = match[3] ? match[3].trim() : 'Any';
                break;
            case 'java':
                name = match[2] || '';
                parameters = match[3] || '';
                returnType = match[1] || 'void';
                break;
        }

        return {
            name,
            signature: this.buildSignature(name, parameters, returnType),
            parameters: this.parseParameters(parameters),
            returnType,
            language,
            filePath,
            lineNumber
        };
    }

    /**
     * Build function signature string
     */
    private static buildSignature(name: string, parameters: string, returnType: string): string {
        return `${name}(${parameters})${returnType !== 'void' ? `: ${returnType}` : ''}`;
    }

    /**
     * Parse parameters string into array
     * Handles destructured parameters correctly
     */
    private static parseParameters(parameters: string): string[] {
        if (!parameters || !parameters.trim()) {
            return [];
        }

        const result: string[] = [];
        let currentParam = '';
        let braceDepth = 0;
        let bracketDepth = 0;
        let parenDepth = 0;

        for (let i = 0; i < parameters.length; i++) {
            const char = parameters[i];

            if (char === '{') braceDepth++;
            if (char === '}') braceDepth--;
            if (char === '[') bracketDepth++;
            if (char === ']') bracketDepth--;
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;

            // Split on comma only when not inside braces/brackets/parens
            if (char === ',' && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                const trimmed = currentParam.trim();
                if (trimmed) {
                    result.push(trimmed);
                }
                currentParam = '';
            } else {
                currentParam += char;
            }
        }

        // Add the last parameter
        const trimmed = currentParam.trim();
        if (trimmed) {
            result.push(trimmed);
        }

        return result;
    }

    /**
     * Generate a basic usage example for a function
     * @param functionInfo - The function information
     * @returns A code example showing how to call the function
     */
    public static generateUsageExample(functionInfo: FunctionInfo): string {
        const { name, parameters, returnType, language } = functionInfo;

        // Check if this is a React component (starts with uppercase)
        const isReactComponent = /^[A-Z]/.test(name) &&
            (language === 'javascriptreact' || language === 'typescriptreact');

        if (isReactComponent) {
            return this.generateReactComponentExample(name, parameters);
        }

        const paramNames = parameters.map(p => {
            const parts = p.split(/[:=]/);
            return parts[0].trim().replace(/\?$/, '');
        });

        const args = paramNames.map(paramName => this.generateArgValue(paramName)).join(', ');

        return this.formatUsageExample(name, args, returnType, language);
    }

    /**
     * Generate React component usage example
     */
    private static generateReactComponentExample(name: string, parameters: string[]): string {
        if (parameters.length === 0) {
            return `<${name} />`;
        }

        // Extract parameter names from destructured parameters
        const paramNames: string[] = [];
        for (const param of parameters) {
            const cleaned = param.trim();
            // Handle destructured parameters like "{ children, isBatch, count }"
            if (cleaned.startsWith('{')) {
                const match = cleaned.match(/\{([^}]+)\}/);
                if (match) {
                    const innerParams = match[1].split(',').map(p => {
                        // Remove type annotations like "children: ReactNode"
                        return p.trim().split(':')[0].trim();
                    });
                    paramNames.push(...innerParams);
                }
            } else {
                // Regular parameter
                const parts = cleaned.split(/[:=]/);
                paramNames.push(parts[0].trim().replace(/\?$/, ''));
            }
        }

        // Generate props with appropriate values
        const props = paramNames
            .filter(p => p !== 'children') // children is special
            .map(paramName => {
                const value = this.generateReactPropValue(paramName);
                return `${paramName}={${value}}`;
            })
            .join('\n  ');

        const hasChildren = paramNames.includes('children');

        if (hasChildren && props) {
            return `<${name}\n  ${props}\n>\n  {/* children content */}\n</${name}>`;
        } else if (hasChildren) {
            return `<${name}>\n  {/* children content */}\n</${name}>`;
        } else if (props) {
            return `<${name}\n  ${props}\n/>`;
        } else {
            return `<${name} />`;
        }
    }

    /**
     * Generate appropriate React prop value
     */
    private static generateReactPropValue(paramName: string): string {
        if (paramName.includes('id') || paramName.includes('Id')) return '123';
        if (paramName.includes('count') || paramName.includes('num')) return '10';
        if (paramName.includes('flag') || paramName.includes('is') || paramName.includes('Batch')) return 'true';
        if (paramName.includes('data') || paramName.includes('list') || paramName.includes('items')) return '[]';
        if (paramName.includes('config') || paramName.includes('options')) return '{}';
        if (paramName.includes('on') || paramName.includes('handle') || paramName.includes('callback')) return '() => {}';
        if (paramName.includes('style') || paramName.includes('className')) return '""';
        return '"value"';
    }

    /**
     * Generate appropriate argument value based on parameter name
     */
    private static generateArgValue(paramName: string): string {
        if (paramName.includes('id') || paramName.includes('Id')) return '123';
        if (paramName.includes('name') || paramName.includes('Name')) return '"example"';
        if (paramName.includes('count') || paramName.includes('num')) return '10';
        if (paramName.includes('flag') || paramName.includes('is')) return 'true';
        if (paramName.includes('data') || paramName.includes('list')) return '[]';
        if (paramName.includes('config') || paramName.includes('options')) return '{}';
        return '"value"';
    }

    /**
     * Format usage example according to language conventions
     */
    private static formatUsageExample(
        name: string,
        args: string,
        returnType: string,
        language: string
    ): string {
        switch (language) {
            case 'typescript':
            case 'typescriptreact':
            case 'javascript':
            case 'javascriptreact':
                return returnType !== 'void'
                    ? `const result = ${name}(${args});`
                    : `${name}(${args});`;
            case 'python':
                return returnType !== 'Any' && returnType !== 'void'
                    ? `result = ${name}(${args})`
                    : `${name}(${args})`;
            case 'java':
                return returnType !== 'void'
                    ? `${returnType} result = ${name}(${args});`
                    : `${name}(${args});`;
            default:
                return `${name}(${args});`;
        }
    }
}
