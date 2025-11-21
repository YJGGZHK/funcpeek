# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FuncPeek is a VSCode extension that analyzes function definitions and provides intelligent usage examples. It searches the codebase for real usage examples and optionally uses AI to generate context-aware examples that match project coding patterns.

Key capabilities:
- Smart function detection supporting partial selection (just function name, with modifiers, or full definition)
- Real usage discovery via VSCode reference finder and regex fallback
- AI-powered generation using OpenAI-compatible APIs
- Multi-language support: TypeScript, JavaScript, Python, Java
- History tracking and webview display

## Build Commands

```bash
# Development workflow
pnpm run watch              # Watch mode for development (then press F5)
pnpm run compile            # Development build
pnpm run build              # Alias for compile

# Production
pnpm run package            # Production build (minified)
pnpm run build:prod         # Alias for package

# Packaging & Installation
pnpm run create-vsix        # Build + create .vsix package
pnpm run install-local      # Install the .vsix to VSCode
pnpm run uninstall          # Uninstall from VSCode
pnpm run reinstall          # Full cycle: uninstall + build + install

# Testing & Quality
pnpm run test               # Run tests
pnpm run lint               # ESLint check
pnpm run clean              # Remove dist/, out/, *.vsix

# Publishing
pnpm run vsce:package       # Create VSIX only (no build)
pnpm run vsce:publish       # Publish to marketplace
```

## Architecture

### Modular Structure

The codebase uses a modular architecture with clear separation of concerns:

```
src/
├── analyzers/      # Function detection and parsing (regex patterns, AST-like parsing)
├── finders/        # Usage discovery (VSCode API + regex fallback)
├── managers/       # State management (history persistence via workspaceState)
├── services/       # External integrations (AI via fetch to OpenAI-compatible APIs)
├── views/          # UI rendering (WebviewProvider + HTML generator)
├── config/         # Centralized constants (organized by feature area)
├── types/          # TypeScript definitions (no 'any' types allowed)
├── utils/          # Shared utilities (error handling, pattern matching)
└── extension.ts    # Entry point and command orchestration
```

### Key Design Patterns

**Two-Phase Usage Discovery**:
1. Primary: VSCode's `executeReferenceProvider` for accurate results
2. Fallback: Workspace regex search when references fail
3. Both methods extract context (±2 lines) around each usage

**AI Integration Flow**:
1. Collect function info (signature, params, return type)
2. Find real usage examples from codebase
3. Include both in AI prompt to generate project-style examples
4. AI analyzes patterns and generates contextual code

**Pattern Matching Strategy**:
- Language-specific regex patterns in `utils/patterns.ts`
- Support for partial selection: clean modifiers (public/private/static/async) then match
- Multi-pattern matching: try class methods, arrow functions, regular functions in order
- Language normalization: typescriptreact → typescript, javascriptreact → javascript

### Configuration System

All constants in `config/constants.ts` organized by feature:

- `HISTORY`: Max items (50), storage key
- `USAGE_FINDER`: File patterns, max files (100), max usages (10), context lines (±2)
- `AI_SERVICE`: Default endpoint, model, temperature (0.7), max tokens (500)
- `WEBVIEW`: View type, source code expansion thresholds
- `COMMANDS`: Command identifiers for VSCode API

Access via workspace configuration: `vscode.workspace.getConfiguration('funcpeek')`

### Error Handling Architecture

Custom error classes in `utils/errors.ts`:
- `FunctionAnalysisError`: Pattern matching failures
- `UsageFinderError`: Search failures
- `AIServiceError`: API failures (includes status code)

All errors logged via `logError(context, error)` and converted to user messages via `getErrorMessage(error)`.

### WebView Generation

HTML generation separated into `webviewHtmlGenerator.ts`:
- Modular methods for each section (info, usage, parameters, real usages, history)
- Inline CSS using VSCode theme variables
- Message passing for AI generation button
- HTML escaping for all user/code content

## Type System

Core types in `types/index.ts`:

```typescript
FunctionInfo {
  name, signature, parameters[], returnType, language, filePath, lineNumber
}

UsageExample {
  code, filePath, lineNumber, context  // context includes surrounding lines
}

HistoryEntry {
  functionName, signature, language, usage, timestamp, filePath, lineNumber
}

AIConfig {
  enabled, apiKey, endpoint, model
}
```

All types are strictly enforced - no `any` types in the codebase.

## Development Workflow

### Testing Extension Locally

1. Run `pnpm run watch`
2. Press F5 to open Extension Development Host
3. Select code in the dev host and right-click → "Peek Function Usage"
4. Reload dev host window (Cmd/Ctrl+R) after code changes

### Adding New Language Support

1. Add patterns to `utils/patterns.ts` → `LANGUAGE_PATTERNS`
2. Update `normalizeLanguage()` mapping
3. Add language to `SupportedLanguage` type
4. Update file patterns in `USAGE_FINDER.FILE_PATTERNS`
5. Add example generation logic in `FunctionAnalyzer.formatUsageExample()`

### Modifying AI Prompts

Edit `aiService.ts`:
- `buildPrompt()`: Main prompt structure
- `buildRealUsagesSection()`: How real examples are formatted
- `buildInstructions()`: Generation instructions

AI prompt includes:
- Function metadata (name, signature, params, return type)
- Optional source code (expanded if < 100 chars)
- Up to 3 real usage examples with full context
- Instructions to match project coding style

### WebView Updates

Messages from extension → webview:
- `updateUsage`: Update displayed code
- `generationError`: Reset AI button state

Messages from webview → extension:
- `generateWithAI`: Trigger AI generation (passes functionInfo)

## Important Implementation Details

### Function Analysis Flow

1. `analyzeSelectedFunction()`: Entry point
2. Try `trySimpleMethodMatch()`: Handle partial selections
3. Try complete pattern matching: Iterate language patterns
4. Fallback `findFunctionInSelection()`: Search within selection
5. `parseFunctionInfo()`: Extract name, params, return type from regex groups

Language-specific regex group indices:
- TS/JS: [1]=name, [2]=params, [3]=returnType
- Python: [1]=name, [2]=params, [3]=returnType
- Java: [1]=returnType, [2]=name, [3]=params (note: reversed)

### History Management

Uses VSCode's `workspaceState` (per-workspace persistence):
- Deduplicates by function name (keeps most recent)
- Max 50 entries (oldest removed)
- Stores full metadata for each usage
- Retrieved via `getFunctionHistory(functionName)`

### Performance Optimizations

- Workspace search limited to 100 files
- Max 10 total usages collected
- Max 3 usages per file
- AI prompt limited to 3 real usage examples
- Source code expansion only if < 100 chars
- Webpack bundles to single 32KB minified file

## VSCode Extension Specifics

Entry point: `dist/extension.js` (webpack output)

Commands registered:
- `funcpeek.peekFunction`: Main analysis command
- `funcpeek.generateWithAI`: AI generation (triggered from webview)
- `funcpeek.clearHistory`: Clear workspace history

Context menu: Shows "Peek Function Usage" when `editorHasSelection`

Keybinding: Ctrl/Cmd+Shift+P (when `editorHasSelection`)

Configuration namespace: `funcpeek`
- `ai.enabled`, `ai.apiKey`, `ai.endpoint`, `ai.model`

## Debugging

Console logs prefixed with `[FuncPeek]` via `logError(context, error)`

Open DevTools in Extension Development Host:
- Help → Toggle Developer Tools
- Check Console for errors
- Network tab for AI API calls

Common issues:
- No function detected: Check regex patterns in `patterns.ts`
- No usages found: VSCode reference provider may not work for language
- AI fails: Check API key, endpoint, network connectivity

## Build System

Webpack configuration (`webpack.config.js`):
- Target: Node.js (VSCode extension host)
- Entry: `src/extension.ts`
- Output: `dist/extension.js`
- External: `vscode` module (provided by host)
- Loader: `ts-loader` for TypeScript
- Production mode: Minified, hidden source maps

TypeScript config:
- Target: ES2022
- Module: Node16
- Strict mode enabled
- Source maps for debugging
