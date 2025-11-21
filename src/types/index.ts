/**
 * Core type definitions for FuncPeek extension
 */

/**
 * Represents a detected function or method in the codebase
 */
export interface FunctionInfo {
    /** The name of the function */
    name: string;
    /** The complete function signature */
    signature: string;
    /** Array of parameter strings */
    parameters: string[];
    /** The return type of the function */
    returnType: string;
    /** The programming language */
    language: string;
    /** Absolute file path where the function is defined */
    filePath: string;
    /** Line number where the function starts (1-indexed) */
    lineNumber: number;
    /** Character position of function name in the line (0-indexed, optional) */
    namePosition?: number;
}

/**
 * Represents a usage example found in the codebase
 */
export interface UsageExample {
    /** The code line containing the usage */
    code: string;
    /** Absolute file path where the usage is found */
    filePath: string;
    /** Line number of the usage (1-indexed) */
    lineNumber: number;
    /** Code context including surrounding lines */
    context: string;
    /** Programming language (optional) */
    language?: string;
}

/**
 * Configuration for AI service
 */
export interface AIConfig {
    /** Whether AI generation is enabled */
    enabled: boolean;
    /** API key for the AI service */
    apiKey: string;
    /** API endpoint URL */
    endpoint: string;
    /** AI model identifier */
    model: string;
}

/**
 * History entry for function usage
 */
export interface HistoryEntry {
    /** Name of the function */
    functionName: string;
    /** Function signature */
    signature: string;
    /** Programming language */
    language: string;
    /** Usage example code */
    usage: string;
    /** ISO timestamp when saved */
    timestamp: string;
    /** File path where function is defined */
    filePath: string;
    /** Line number in file */
    lineNumber: number;
}

/**
 * Supported programming languages
 */
export type SupportedLanguage = 'typescript' | 'typescriptreact' | 'javascript' | 'javascriptreact' | 'python' | 'java';

/**
 * Pattern types for function detection
 */
export type PatternType = 'function' | 'method' | 'arrow' | 'classMethod';
