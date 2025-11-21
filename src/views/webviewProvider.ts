/**
 * Webview provider for displaying function usage information
 */

import * as vscode from 'vscode';
import { FunctionInfo, UsageExample, HistoryEntry } from '../types';
import { WEBVIEW, COMMANDS } from '../config/constants';
import { WebviewHtmlGenerator } from './webviewHtmlGenerator';
import { logError } from '../utils/errors';

/**
 * Manages the webview panel for displaying function usage
 */
export class WebviewProvider {
    private currentPanel: vscode.WebviewPanel | undefined;

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Show function usage in webview panel
     * @param functionInfo - Information about the function
     * @param usage - Usage example code
     * @param history - Usage history entries
     * @param aiEnabled - Whether AI generation is enabled
     * @param realUsages - Real usage examples from codebase
     */
    public showFunctionUsage(
        functionInfo: FunctionInfo,
        usage: string,
        history: HistoryEntry[],
        aiEnabled: boolean = false,
        realUsages: UsageExample[] = []
    ): void {
        try {
            if (this.currentPanel) {
                this.currentPanel.reveal(vscode.ViewColumn.Beside);
            } else {
                this.createPanel(functionInfo);
            }

            this.updatePanelContent(functionInfo, usage, history, aiEnabled, realUsages);
        } catch (error) {
            logError('Error showing function usage', error);
            vscode.window.showErrorMessage('Failed to display function usage');
        }
    }

    /**
     * Create the webview panel
     */
    private createPanel(functionInfo: FunctionInfo): void {
        this.currentPanel = vscode.window.createWebviewPanel(
            WEBVIEW.VIEW_TYPE,
            `Usage: ${functionInfo.name}`,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.currentPanel.onDidDispose(
            () => {
                this.currentPanel = undefined;
            },
            null,
            this.context.subscriptions
        );

        this.setupMessageHandling(functionInfo);
    }

    /**
     * Setup message handling from webview
     */
    private setupMessageHandling(functionInfo: FunctionInfo): void {
        if (!this.currentPanel) {
            return;
        }

        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'generateWithAI':
                        vscode.commands.executeCommand(COMMANDS.GENERATE_WITH_AI, functionInfo);
                        break;
                    case 'openAISettings':
                        vscode.commands.executeCommand('workbench.action.openSettings', 'funcpeek.ai');
                        break;
                }
            },
            null,
            this.context.subscriptions
        );
    }

    /**
     * Update panel content
     */
    private updatePanelContent(
        functionInfo: FunctionInfo,
        usage: string,
        history: HistoryEntry[],
        aiEnabled: boolean,
        realUsages: UsageExample[]
    ): void {
        if (!this.currentPanel) {
            return;
        }

        this.currentPanel.webview.html = WebviewHtmlGenerator.generate(
            functionInfo,
            usage,
            history,
            aiEnabled,
            realUsages
        );
    }

    /**
     * Update the usage example in the webview
     * @param usage - New usage example code
     */
    public updateUsage(usage: string): void {
        if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
                command: 'updateUsage',
                usage: usage
            });
        }
    }

    /**
     * Notify webview of generation error
     */
    public notifyError(): void {
        if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
                command: 'generationError'
            });
        }
    }
}
