# FuncPeek - Function Usage Helper

FuncPeek is a VS Code extension that helps developers quickly understand function usage by providing intelligent examples and method signatures when you select code.

## Features

- **Smart Function Detection**: Automatically recognizes functions, methods, and arrow functions in TypeScript, JavaScript, Python, and Java
  - Supports **partial selection**: just select the function name (e.g., `greetUser`, `constructor`)
  - Works with access modifiers (e.g., `public showFunctionUsage`, `private getWebviewContent`)
  - Recognizes all function styles: class methods, arrow functions, regular functions
  - Works with method declarations and function definitions
- **Real Usage Examples from Codebase**: Automatically searches your codebase for actual usage examples
  - Uses VSCode's reference finder for accurate results
  - Shows context around each usage (with surrounding code lines)
  - Displays file path and line numbers for easy navigation
  - Helps you understand how the function is actually being used in your project
- **AI-Powered Usage Generation**: Use OpenAI-compatible APIs to generate intelligent, context-aware usage examples
  - Analyzes real usage examples from your codebase
  - Generates examples that follow your project's coding patterns
  - Provides comprehensive explanations and comments
- **Intelligent Usage Examples**: Generates context-aware usage examples based on function parameters and return types
- **Usage History**: Keeps track of your function usage patterns for quick reference
- **Multi-language Support**: Works with TypeScript, JavaScript, Python, and Java
- **Beautiful Webview Display**: Shows function information in a clean, organized panel
- **Easy Integration**: Right-click context menu and keyboard shortcuts

## How to Use

### Basic Usage

1. **Select a function** in your code editor (you can select the entire function or just the method name)
2. **Right-click** and choose "Peek Function Usage" from the context menu
3. **Or use keyboard shortcut**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. **View the usage example** in the side panel

### AI-Powered Usage Generation

To use AI-powered usage generation:

1. **Configure AI Settings**:
   - Open VS Code Settings (File > Preferences > Settings)
   - Search for "FuncPeek"
   - Set the following:
     - `funcpeek.ai.enabled`: Set to `true`
     - `funcpeek.ai.apiKey`: Enter your OpenAI API key (or compatible API key)
     - `funcpeek.ai.endpoint`: Default is `https://api.openai.com/v1` (can be changed to compatible services like Azure OpenAI, LocalAI, etc.)
     - `funcpeek.ai.model`: Default is `gpt-3.5-turbo` (can be changed to other models)

2. **Generate AI Usage**:
   - After selecting a function and viewing the usage panel
   - Click the "Generate with AI" button
   - Wait for the AI to analyze the function and generate a more intelligent usage example

The AI will analyze the function's code, parameters, and context to generate more realistic and practical usage examples.

## Supported Languages

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx)
- Python (.py)
- Java (.java)

## Example

When you select a function like:
```typescript
function calculateTotal(items: Item[], discount?: number): number {
    // function implementation
}
```

FuncPeek will show you:
- Function signature: `calculateTotal(items: Item[], discount?: number): number`
- Usage example: `const result = calculateTotal([], 0.1);`
- Parameter details
- Return type information
- Recent usage history

## Commands

- `FuncPeek: Peek Function Usage` - Show function usage for selected code
- `FuncPeek: Clear Function History` - Clear the usage history

## Configuration

Configure FuncPeek in VS Code settings:

- `funcpeek.ai.enabled` (boolean, default: `false`): Enable AI-powered usage generation
- `funcpeek.ai.apiKey` (string, default: `""`): Your OpenAI API key or compatible API key
- `funcpeek.ai.endpoint` (string, default: `"https://api.openai.com/v1"`): API endpoint URL (supports OpenAI and compatible services)
- `funcpeek.ai.model` (string, default: `"gpt-3.5-turbo"`): AI model to use for generation

## Installation

1. Install from VS Code Marketplace (when published)
2. Or install locally by:
   - Clone this repository
   - Run `pnpm install`
   - Press `F5` to run in a new Extension Development Host window

## Project Structure

The extension is organized into modular components for better maintainability:

```text
src/
├── analyzers/        # Function analysis and detection
├── finders/          # Usage example finders
├── managers/         # State and history management
├── services/         # External service integrations (AI)
├── views/            # UI components and HTML generation
├── config/           # Configuration and constants
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
└── extension.ts      # Main entry point
```

## Documentation

完整文档请查看项目仓库的 `docs/` 目录。

## Development

To contribute or modify this extension:

```bash
# Install dependencies
pnpm install

# Compile and watch for changes
pnpm run watch

# Run tests
pnpm run test

# Package the extension
pnpm run package
```

### Code Quality

- Full TypeScript type safety (no `any` types)
- Comprehensive error handling with custom error classes
- JSDoc documentation on all public methods
- Modular architecture with clear separation of concerns
- Centralized configuration management

## License

MIT License
