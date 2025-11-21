/**
 * FuncPeek Extension - Main entry point
 */

import * as vscode from 'vscode';
import { FunctionAnalyzer } from './analyzers/functionAnalyzer';
import { CodeHistoryManager } from './managers/codeHistoryManager';
import { WebviewProvider } from './views/webviewProvider';
import { AIService } from './services/aiService';
import { UsageFinder } from './finders/usageFinder';
import { UsageExample } from './types';
import { COMMANDS, WEBVIEW } from './config/constants';
import { getErrorMessage, logError } from './utils/errors';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('FuncPeek extension is now active!');

    const historyManager = new CodeHistoryManager(context);
    const webviewProvider = new WebviewProvider(context);
    const aiService = new AIService();

    // Register main command
    const peekFunctionCommand = vscode.commands.registerCommand(
        COMMANDS.PEEK_FUNCTION,
        async () => await handlePeekFunction(historyManager, webviewProvider, aiService)
    );

    // Register AI generation command
    const generateWithAICommand = vscode.commands.registerCommand(
        COMMANDS.GENERATE_WITH_AI,
        async (functionInfo) => await handleGenerateWithAI(
            functionInfo,
            webviewProvider,
            aiService,
            historyManager
        )
    );

    // Register clear history command
    const clearHistoryCommand = vscode.commands.registerCommand(
        COMMANDS.CLEAR_HISTORY,
        async () => await handleClearHistory(historyManager)
    );

    context.subscriptions.push(
        peekFunctionCommand,
        generateWithAICommand,
        clearHistoryCommand
    );
}

/**
 * Handle peek function command
 * Enhanced to support class names, function names, variable names, and more
 */
async function handlePeekFunction(
    historyManager: CodeHistoryManager,
    webviewProvider: WebviewProvider,
    aiService: AIService
): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    let selectedText = editor.document.getText(selection).trim();

    // If nothing is selected, try to get word at cursor
    if (!selectedText) {
        const wordRange = editor.document.getWordRangeAtPosition(selection.active);
        if (wordRange) {
            selectedText = editor.document.getText(wordRange).trim();
        }
    }

    if (!selectedText) {
        vscode.window.showWarningMessage('Please select text or place cursor on a symbol to search');
        return;
    }

    try {
        // Try to analyze as function first, passing the selected text
        let functionInfo = FunctionAnalyzer.analyzeSelectedFunction(editor, selectedText);

        // If no function found and selection is just a simple identifier,
        // use it as-is for searching
        if (!functionInfo && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(selectedText)) {
            // This is a simple identifier (class name, variable name, etc.)
            functionInfo = {
                name: selectedText,
                signature: selectedText,
                parameters: [],
                returnType: 'unknown',
                language: editor.document.languageId,
                filePath: editor.document.fileName,
                lineNumber: selection.start.line + 1
            };
        } else if (!functionInfo) {
            // Not a valid function or identifier
            vscode.window.showWarningMessage(`"${selectedText}" is not a valid symbol to search`);
            return;
        }

        const searchInfo = functionInfo;

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Searching for "${searchInfo.name}"...`,
                cancellable: false
            },
            async (progress) => {
                // Generate basic usage
                progress.report({ message: 'Generating usage example...' });
                const hasParams = searchInfo.parameters && searchInfo.parameters.length > 0;
                const usage = hasParams
                    ? FunctionAnalyzer.generateUsageExample(searchInfo)
                    : `// References for: ${searchInfo.name}`;

                // Find real usage examples using VSCode's reference provider first
                progress.report({ message: 'Searching for references...' });
                const realUsages = await findRealUsagesEnhanced(editor, searchInfo);

                // Load history
                progress.report({ message: 'Loading history...' });
                const functionHistory = await historyManager.getFunctionHistory(searchInfo.name);

                // Save to history
                await historyManager.saveFunctionUsage(searchInfo, usage);

                // Show webview
                const aiEnabled = aiService.isEnabled();
                webviewProvider.showFunctionUsage(
                    searchInfo,
                    usage,
                    functionHistory,
                    aiEnabled,
                    realUsages
                );
            }
        );

    } catch (error) {
        logError('Error analyzing symbol', error);
        vscode.window.showErrorMessage(`Error analyzing symbol: ${getErrorMessage(error)}`);
    }
}

/**
 * Find real usage examples using enhanced methods
 * Uses VSCode's reference provider first, then falls back to workspace search
 */
async function findRealUsagesEnhanced(editor: vscode.TextEditor, functionInfo: any): Promise<UsageExample[]> {
    try {
        // First, try using VSCode's built-in reference provider
        // This works best for classes, functions, variables, etc.
        const position = new vscode.Position(
            functionInfo.lineNumber - 1,
            0
        );

        // Try to find the exact position of the symbol name in the line
        const line = editor.document.lineAt(position.line);
        const nameIndex = line.text.indexOf(functionInfo.name);
        const symbolPosition = nameIndex >= 0
            ? new vscode.Position(position.line, nameIndex)
            : position;

        const referenceUsages = await UsageFinder.findReferences(editor.document, symbolPosition);

        // If we found references, return them
        if (referenceUsages && referenceUsages.length > 0) {
            return referenceUsages;
        }

        // Fallback: search workspace using regex
        const workspaceUsages = await UsageFinder.findUsagesInWorkspace(functionInfo);
        return workspaceUsages;
    } catch (error) {
        logError('Error finding usages', error);
        // Last resort: try workspace search
        try {
            return await UsageFinder.findUsagesInWorkspace(functionInfo);
        } catch (fallbackError) {
            logError('Error in fallback usage search', fallbackError);
            return [];
        }
    }
}

/**
 * Handle AI generation command
 */
async function handleGenerateWithAI(
    functionInfo: any,
    webviewProvider: WebviewProvider,
    aiService: AIService,
    historyManager: CodeHistoryManager
): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        webviewProvider.notifyError();
        return;
    }

    if (!aiService.isEnabled()) {
        const configureNow = await vscode.window.showWarningMessage(
            'AI service is not configured. Please set your API key in settings.',
            'Open Settings'
        );

        if (configureNow === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'funcpeek.ai');
        }

        webviewProvider.notifyError();
        return;
    }

    try {
        vscode.window.showInformationMessage('Generating usage example with AI...');

        const document = editor.document;
        const selection = editor.selection;
        let sourceCode = document.getText(selection);

        // Expand source code if too short
        if (sourceCode.length < WEBVIEW.MIN_SOURCE_CODE_LENGTH) {
            sourceCode = expandSourceCode(document, selection);
        }

        // Find real usages for AI context
        const realUsages = await UsageFinder.findUsagesInWorkspace(functionInfo);

        // Generate with AI
        const aiUsage = await aiService.generateUsageExample(functionInfo, sourceCode, realUsages);

        // Update webview
        webviewProvider.updateUsage(aiUsage);

        // Save to history
        await historyManager.saveFunctionUsage(functionInfo, aiUsage);

        vscode.window.showInformationMessage('AI-generated usage example ready!');

    } catch (error) {
        logError('Error generating with AI', error);
        vscode.window.showErrorMessage(`AI generation failed: ${getErrorMessage(error)}`);
        webviewProvider.notifyError();
    }
}

/**
 * Expand source code selection
 */
function expandSourceCode(document: vscode.TextDocument, selection: vscode.Selection): string {
    const startLine = Math.max(0, selection.start.line - WEBVIEW.EXPAND_LINES_BEFORE);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + WEBVIEW.EXPAND_LINES_AFTER);
    const expandedRange = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
    return document.getText(expandedRange);
}

/**
 * Handle clear history command
 */
async function handleClearHistory(historyManager: CodeHistoryManager): Promise<void> {
    try {
        await historyManager.clearHistory();
        vscode.window.showInformationMessage('Function usage history cleared');
    } catch (error) {
        logError('Error clearing history', error);
        vscode.window.showErrorMessage(`Failed to clear history: ${getErrorMessage(error)}`);
    }
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
    // Cleanup if needed
}
