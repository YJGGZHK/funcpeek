/**
 * Usage finder for locating function references in the codebase
 */

import * as vscode from 'vscode';
import { FunctionInfo, UsageExample } from '../types';
import { USAGE_FINDER } from '../config/constants';
import { escapeRegex } from '../utils/patterns';
import { logError, safeAsync } from '../utils/errors';

/**
 * Finds usage examples of functions and variables in the workspace
 */
export class UsageFinder {
    /**
     * Find usage examples in the workspace using regex search
     * @param functionInfo - Information about the function to find
     * @returns Array of usage examples
     */
    public static async findUsagesInWorkspace(functionInfo: FunctionInfo): Promise<UsageExample[]> {
        const usages: UsageExample[] = [];
        const functionName = functionInfo.name;

        try {
            const results = await vscode.workspace.findFiles(
                USAGE_FINDER.FILE_PATTERNS,
                USAGE_FINDER.EXCLUDE_PATTERNS
            );

            const filesToSearch = results.slice(0, USAGE_FINDER.MAX_FILES);

            for (const fileUri of filesToSearch) {
                if (fileUri.fsPath === functionInfo.filePath) {
                    continue;
                }

                const usagesInFile = await this.findUsagesInFile(fileUri, functionName, functionInfo);
                usages.push(...usagesInFile);

                if (usages.length >= USAGE_FINDER.MAX_USAGES) {
                    break;
                }
            }

            return usages;
        } catch (error) {
            logError('Error finding usages in workspace', error);
            return [];
        }
    }

    /**
     * Find usages in a single file
     */
    private static async findUsagesInFile(
        fileUri: vscode.Uri,
        functionName: string,
        functionInfo: FunctionInfo
    ): Promise<UsageExample[]> {
        const usages: UsageExample[] = [];

        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            const text = document.getText();
            const lines = text.split('\n');

            const callPattern = new RegExp(
                `(?:^|[^\\w.])(${escapeRegex(functionName)})\\s*(?:\\(|<|\\{|:|$)`,
                'g'
            );

            let match;
            while ((match = callPattern.exec(text)) !== null && usages.length < USAGE_FINDER.MAX_USAGES_PER_FILE) {
                const position = document.positionAt(match.index);
                const lineNumber = position.line;

                const context = this.extractContext(lines, lineNumber);
                const callLine = lines[lineNumber];

                usages.push({
                    code: callLine.trim(),
                    filePath: fileUri.fsPath,
                    lineNumber: lineNumber + 1,
                    context: context
                });
            }
        } catch (error) {
            logError(`Error reading file ${fileUri.fsPath}`, error);
        }

        return usages;
    }

    /**
     * Find references using VSCode's reference provider
     * @param document - The document containing the function
     * @param position - The position of the function name
     * @returns Array of usage examples
     */
    public static async findReferences(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<UsageExample[]> {
        const usages: UsageExample[] = [];

        try {
            const locations = await vscode.commands.executeCommand<vscode.Location[]>(
                'vscode.executeReferenceProvider',
                document.uri,
                position
            );

            if (!locations || locations.length === 0) {
                return [];
            }

            const limitedLocations = locations.slice(0, USAGE_FINDER.MAX_USAGES);

            for (const location of limitedLocations) {
                // Skip definition location
                if (location.uri.toString() === document.uri.toString() &&
                    location.range.start.line === position.line) {
                    continue;
                }

                const usage = await this.createUsageFromLocation(location);
                if (usage) {
                    usages.push(usage);
                }

                if (usages.length >= USAGE_FINDER.MAX_USAGES) {
                    break;
                }
            }

        } catch (error) {
            logError('Error finding references', error);
        }

        return usages;
    }

    /**
     * Create usage example from a location
     */
    private static async createUsageFromLocation(location: vscode.Location): Promise<UsageExample | null> {
        try {
            const refDoc = await vscode.workspace.openTextDocument(location.uri);
            const line = refDoc.lineAt(location.range.start.line);

            const contextLines = this.extractContextLines(
                refDoc,
                location.range.start.line
            );

            return {
                code: line.text.trim(),
                filePath: location.uri.fsPath,
                lineNumber: location.range.start.line + 1,
                context: contextLines.join('\n')
            };
        } catch (error) {
            logError('Error creating usage from location', error);
            return null;
        }
    }

    /**
     * Extract context lines around a specific line
     */
    private static extractContext(lines: string[], lineNumber: number): string {
        const startLine = Math.max(0, lineNumber - USAGE_FINDER.CONTEXT_LINES_BEFORE);
        const endLine = Math.min(lines.length - 1, lineNumber + USAGE_FINDER.CONTEXT_LINES_AFTER);
        const contextLines = lines.slice(startLine, endLine + 1);
        return contextLines.join('\n');
    }

    /**
     * Extract context lines from document
     * Tries to capture the surrounding function/block scope if possible
     */
    private static extractContextLines(document: vscode.TextDocument, lineNumber: number): string[] {
        // First get a broader context to analyze structure
        const searchStart = Math.max(0, lineNumber - 20);
        const searchEnd = Math.min(document.lineCount - 1, lineNumber + 20);
        
        // Find the start of the block (e.g. "export const buildPoster = ... {")
        let startLine = Math.max(0, lineNumber - USAGE_FINDER.CONTEXT_LINES_BEFORE);
        
        // Look upwards for the start of the function/block
        for (let i = lineNumber; i >= searchStart; i--) {
            const text = document.lineAt(i).text;
            // Matches function definitions, variable assignments with arrow functions, etc.
            if (/^(\s*)(export\s+)?(async\s+)?(function|const|let|var|class)\s+[\w\d_]+/.test(text) || 
                text.includes('=> {') || 
                (text.includes(') {') && !text.trim().startsWith('if') && !text.trim().startsWith('for') && !text.trim().startsWith('while'))) {
                startLine = i;
                break;
            }
        }

        // Calculate indentation of the start line
        const startLineText = document.lineAt(startLine).text;
        const baseIndentation = startLineText.match(/^\s*/)?.[0] || '';
        
        // Find the end of the block by matching indentation of closing brace
        let endLine = Math.min(document.lineCount - 1, lineNumber + USAGE_FINDER.CONTEXT_LINES_AFTER);
        
        // Look downwards for the end of the block
        // We look for a closing brace '}' that has the same or less indentation as the start line
        // and is on its own line or at the end of a line
        let braceCount = 0;
        let foundStart = false;

        for (let i = startLine; i <= searchEnd; i++) {
            const text = document.lineAt(i).text;
            
            // Count braces to handle nested blocks
            const openBraces = (text.match(/\{/g) || []).length;
            const closeBraces = (text.match(/\}/g) || []).length;
            
            if (openBraces > 0) foundStart = true;
            braceCount += openBraces - closeBraces;

            // If we found the start and brace count returns to 0 (or less), we found the end
            if (foundStart && braceCount <= 0) {
                endLine = i;
                break;
            }
        }
        
        // Ensure we have at least some context after the usage line if we didn't find a clear block end
        if (endLine < lineNumber + 2) {
            endLine = Math.min(document.lineCount - 1, lineNumber + USAGE_FINDER.CONTEXT_LINES_AFTER);
        }

        const contextLines: string[] = [];
        for (let i = startLine; i <= endLine; i++) {
            contextLines.push(document.lineAt(i).text);
        }

        return contextLines;
    }

    /**
     * Analyze usage patterns and create a summary
     * @param usages - Array of usage examples
     * @returns Analysis summary string
     */
    public static analyzeUsagePatterns(usages: UsageExample[]): string {
        if (usages.length === 0) {
            return 'No usage examples found in the codebase.';
        }

        let analysis = `Found ${usages.length} usage example(s) in the codebase:\n\n`;

        usages.forEach((usage, index) => {
            const relPath = this.getRelativePath(usage.filePath);
            analysis += `${index + 1}. ${relPath}:${usage.lineNumber}\n`;
            analysis += `   ${usage.code}\n\n`;
        });

        return analysis;
    }

    /**
     * Get relative path for display
     */
    private static getRelativePath(filePath: string): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return filePath;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        if (filePath.startsWith(workspaceRoot)) {
            return filePath.substring(workspaceRoot.length + 1);
        }

        return filePath;
    }
}
