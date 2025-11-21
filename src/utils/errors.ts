/**
 * Error handling utilities
 */

/**
 * Custom error for function analysis failures
 */
export class FunctionAnalysisError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FunctionAnalysisError';
    }
}

/**
 * Custom error for usage finding failures
 */
export class UsageFinderError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UsageFinderError';
    }
}

/**
 * Custom error for AI service failures
 */
export class AIServiceError extends Error {
    constructor(message: string, public readonly statusCode?: number) {
        super(message);
        this.name = 'AIServiceError';
    }
}

/**
 * Handle error and return user-friendly message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
}

/**
 * Log error to console with context
 */
export function logError(context: string, error: unknown): void {
    console.error(`[FuncPeek] ${context}:`, error);
}

/**
 * Safe async wrapper that catches and logs errors
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    context: string,
    fallback: T
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        logError(context, error);
        return fallback;
    }
}
