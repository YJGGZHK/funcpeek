/**
 * Application-wide constants
 */

/**
 * History management constants
 */
export const HISTORY = {
    /** Storage key for history data */
    KEY: 'funcpeek.codeHistory',
    /** Maximum number of history items to keep */
    MAX_ITEMS: 50,
    /** Default number of recent items to show */
    DEFAULT_RECENT_LIMIT: 5,
} as const;

/**
 * Usage finding constants
 */
export const USAGE_FINDER = {
    /** Maximum number of files to search */
    MAX_FILES: 100,
    /** Maximum number of usage examples to collect */
    MAX_USAGES: 10,
    /** Maximum usages per file */
    MAX_USAGES_PER_FILE: 3,
    /** Number of context lines before usage */
    CONTEXT_LINES_BEFORE: 2,
    /** Number of context lines after usage */
    CONTEXT_LINES_AFTER: 2,
    /** File patterns to search */
    FILE_PATTERNS: '**/*.{ts,tsx,js,jsx,py,java}',
    /** Patterns to exclude from search - 空字符串表示不排除任何文件 */
    EXCLUDE_PATTERNS: '',
} as const;

/**
 * AI Service constants
 */
export const AI_SERVICE = {
    /** Default API endpoint */
    DEFAULT_ENDPOINT: 'https://api.openai.com/v1',
    /** Default model */
    DEFAULT_MODEL: 'gpt-3.5-turbo',
    /** Default temperature */
    DEFAULT_TEMPERATURE: 0.7,
    /** Maximum tokens for response */
    MAX_TOKENS: 500,
    /** Maximum real usage examples to include in prompt */
    MAX_REAL_USAGES_IN_PROMPT: 3,
} as const;

/**
 * Extension configuration namespace
 */
export const CONFIG_NAMESPACE = 'funcpeek' as const;

/**
 * AI configuration keys
 */
export const AI_CONFIG_KEYS = {
    ENABLED: 'ai.enabled',
    API_KEY: 'ai.apiKey',
    ENDPOINT: 'ai.endpoint',
    MODEL: 'ai.model',
} as const;

/**
 * Commands
 */
export const COMMANDS = {
    PEEK_FUNCTION: 'funcpeek.peekFunction',
    GENERATE_WITH_AI: 'funcpeek.generateWithAI',
    CLEAR_HISTORY: 'funcpeek.clearHistory',
} as const;

/**
 * Webview configuration
 */
export const WEBVIEW = {
    /** Webview type identifier */
    VIEW_TYPE: 'functionUsage',
    /** Minimum source code length to trigger expansion */
    MIN_SOURCE_CODE_LENGTH: 100,
    /** Lines to show before function when expanding */
    EXPAND_LINES_BEFORE: 5,
    /** Lines to show after function when expanding */
    EXPAND_LINES_AFTER: 10,
} as const;
