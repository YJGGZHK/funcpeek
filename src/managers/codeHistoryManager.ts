/**
 * Manager for function usage history
 */

import * as vscode from 'vscode';
import { FunctionInfo, HistoryEntry } from '../types';
import { HISTORY } from '../config/constants';
import { logError } from '../utils/errors';

/**
 * Manages storage and retrieval of function usage history
 */
export class CodeHistoryManager {
    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Save a function usage to history
     * @param functionInfo - Information about the function
     * @param usage - The usage example code
     */
    public async saveFunctionUsage(functionInfo: FunctionInfo, usage: string): Promise<void> {
        try {
            const history = await this.getHistory();
            const newEntry = this.createHistoryEntry(functionInfo, usage);

            // Remove existing entries for the same function
            const filteredHistory = history.filter(item => item.functionName !== functionInfo.name);

            // Add to beginning
            filteredHistory.unshift(newEntry);

            // Limit history size
            if (filteredHistory.length > HISTORY.MAX_ITEMS) {
                filteredHistory.splice(HISTORY.MAX_ITEMS);
            }

            await this.context.workspaceState.update(HISTORY.KEY, filteredHistory);
        } catch (error) {
            logError('Error saving function usage', error);
        }
    }

    /**
     * Create a history entry from function info and usage
     */
    private createHistoryEntry(functionInfo: FunctionInfo, usage: string): HistoryEntry {
        return {
            functionName: functionInfo.name,
            signature: functionInfo.signature,
            language: functionInfo.language,
            usage: usage,
            timestamp: new Date().toISOString(),
            filePath: functionInfo.filePath,
            lineNumber: functionInfo.lineNumber
        };
    }

    /**
     * Get all history entries
     * @returns Array of history entries
     */
    public async getHistory(): Promise<HistoryEntry[]> {
        try {
            const history = this.context.workspaceState.get<HistoryEntry[]>(HISTORY.KEY);
            return history || [];
        } catch (error) {
            logError('Error getting history', error);
            return [];
        }
    }

    /**
     * Get history for a specific function
     * @param functionName - Name of the function
     * @returns Array of history entries for the function
     */
    public async getFunctionHistory(functionName: string): Promise<HistoryEntry[]> {
        try {
            const history = await this.getHistory();
            return history.filter(item => item.functionName === functionName);
        } catch (error) {
            logError('Error getting function history', error);
            return [];
        }
    }

    /**
     * Clear all history
     */
    public async clearHistory(): Promise<void> {
        try {
            await this.context.workspaceState.update(HISTORY.KEY, []);
        } catch (error) {
            logError('Error clearing history', error);
        }
    }

    /**
     * Get recent usage entries
     * @param limit - Maximum number of entries to return
     * @returns Array of recent history entries
     */
    public async getRecentUsages(limit: number = HISTORY.DEFAULT_RECENT_LIMIT): Promise<HistoryEntry[]> {
        try {
            const history = await this.getHistory();
            return history.slice(0, limit);
        } catch (error) {
            logError('Error getting recent usages', error);
            return [];
        }
    }
}
