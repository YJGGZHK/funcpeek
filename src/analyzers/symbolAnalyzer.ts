/**
 * Enhanced symbol analyzer for all code elements
 * Supports: functions, classes, interfaces, types, objects, variables, constants, enums
 */

import * as vscode from 'vscode';
import { FunctionInfo } from '../types';

/**
 * Symbol types that can be detected
 */
export enum SymbolType {
    Function = 'function',
    Class = 'class',
    Interface = 'interface',
    Type = 'type',
    Variable = 'variable',
    Constant = 'constant',
    Object = 'object',
    Enum = 'enum',
    Property = 'property',
    Unknown = 'unknown'
}

/**
 * Analyzes any code symbol (not just functions)
 */
export class SymbolAnalyzer {
    /**
     * Detect what type of symbol is selected
     */
    public static detectSymbolType(editor: vscode.TextEditor, symbolName: string): SymbolType {
        const document = editor.document;
        const selection = editor.selection;
        const currentLine = selection.start.line;

        // Search nearby lines for symbol definition
        const startLine = Math.max(0, currentLine - 5);
        const endLine = Math.min(document.lineCount - 1, currentLine + 2);

        for (let i = startLine; i <= endLine; i++) {
            const lineText = document.lineAt(i).text;

            if (!lineText.includes(symbolName)) continue;

            // Class
            if (/\bclass\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Class;
            }

            // Interface
            if (/\binterface\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Interface;
            }

            // Type alias
            if (/\btype\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Type;
            }

            // Enum
            if (/\benum\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Enum;
            }

            // Const (constant)
            if (/\bconst\s+/.test(lineText) && lineText.includes(symbolName)) {
                // Check if it's an object literal
                if (lineText.includes('{')) {
                    return SymbolType.Object;
                }
                return SymbolType.Constant;
            }

            // Let/var (variable)
            if (/\b(let|var)\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Variable;
            }

            // Function
            if (/\bfunction\s+/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Function;
            }

            // Arrow function or method
            if (/=\s*(\(.*\)|[a-zA-Z_$][\w$]*)\s*=>/.test(lineText) && lineText.includes(symbolName)) {
                return SymbolType.Function;
            }
        }

        return SymbolType.Unknown;
    }

    /**
     * Create symbol info for any type of code element
     */
    public static createSymbolInfo(
        editor: vscode.TextEditor,
        symbolName: string,
        symbolType: SymbolType
    ): FunctionInfo {
        const document = editor.document;
        const selection = editor.selection;
        const lineText = document.lineAt(selection.start.line).text;

        // Extract type information if available
        const typeInfo = this.extractTypeInfo(lineText, symbolName);

        return {
            name: symbolName,
            signature: this.buildSignature(symbolName, symbolType, typeInfo),
            parameters: typeInfo.parameters || [],
            returnType: typeInfo.returnType || this.getDefaultReturnType(symbolType),
            language: document.languageId,
            filePath: document.fileName,
            lineNumber: selection.start.line + 1
        };
    }

    /**
     * Extract type information from line
     */
    private static extractTypeInfo(lineText: string, symbolName: string): {
        parameters: string[];
        returnType: string;
        valueType?: string;
    } {
        const result = {
            parameters: [] as string[],
            returnType: 'unknown',
            valueType: undefined as string | undefined
        };

        // Try to extract type annotation
        // Example: const name: string = ...
        const typeAnnotationMatch = lineText.match(new RegExp(`${symbolName}\\s*:\\s*([^=;]+)`));
        if (typeAnnotationMatch) {
            result.valueType = typeAnnotationMatch[1].trim();
            result.returnType = result.valueType;
        }

        // Try to extract function parameters
        // Example: function test(a: number, b: string)
        const paramsMatch = lineText.match(/\(([^)]*)\)/);
        if (paramsMatch) {
            const params = paramsMatch[1].trim();
            if (params) {
                result.parameters = params.split(',').map(p => p.trim()).filter(p => p);
            }
        }

        // Try to extract return type
        // Example: function test(): string
        const returnTypeMatch = lineText.match(/\):\s*([^{;=]+)/);
        if (returnTypeMatch) {
            result.returnType = returnTypeMatch[1].trim();
        }

        return result;
    }

    /**
     * Build a readable signature for the symbol
     */
    private static buildSignature(symbolName: string, symbolType: SymbolType, typeInfo: any): string {
        switch (symbolType) {
            case SymbolType.Function:
                if (typeInfo.parameters.length > 0) {
                    return `${symbolName}(${typeInfo.parameters.join(', ')})${typeInfo.returnType !== 'unknown' ? ': ' + typeInfo.returnType : ''}`;
                }
                return `${symbolName}()`;

            case SymbolType.Class:
                return `class ${symbolName}`;

            case SymbolType.Interface:
                return `interface ${symbolName}`;

            case SymbolType.Type:
                return `type ${symbolName}`;

            case SymbolType.Enum:
                return `enum ${symbolName}`;

            case SymbolType.Constant:
            case SymbolType.Variable:
                if (typeInfo.valueType) {
                    return `${symbolName}: ${typeInfo.valueType}`;
                }
                return symbolName;

            case SymbolType.Object:
                return `const ${symbolName} = {...}`;

            default:
                return symbolName;
        }
    }

    /**
     * Get default return type for symbol type
     */
    private static getDefaultReturnType(symbolType: SymbolType): string {
        switch (symbolType) {
            case SymbolType.Class:
            case SymbolType.Interface:
            case SymbolType.Type:
                return 'type';
            case SymbolType.Object:
                return 'object';
            case SymbolType.Constant:
            case SymbolType.Variable:
                return 'any';
            default:
                return 'unknown';
        }
    }
}
