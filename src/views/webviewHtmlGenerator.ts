/**
 * HTML template generator for webview
 */

import { FunctionInfo, UsageExample, HistoryEntry } from '../types';

/**
 * Generates HTML content for webview display
 */
export class WebviewHtmlGenerator {
    /**
     * Generate complete HTML for webview
     */
    public static generate(
        functionInfo: FunctionInfo,
        usage: string,
        history: HistoryEntry[],
        aiEnabled: boolean,
        realUsages: UsageExample[]
    ): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Function Usage: ${this.escapeHtml(functionInfo.name)}</title>
            ${this.generateStyles()}
        </head>
        <body>
            <div class="container">
                ${this.generateFunctionInfoSection(functionInfo)}
                ${this.generateUsageSection(usage, aiEnabled)}
                ${this.generateParametersSection(functionInfo)}
                ${this.generateRealUsagesSection(realUsages)}
                ${this.generateHistorySection(history)}
            </div>
            ${this.generateScript()}
        </body>
        </html>`;
    }

    /**
     * Generate styles section
     */
    private static generateStyles(): string {
        return `<style>
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 16px;
                    line-height: 1.6;
                    margin: 0;
                }

                .container {
                    width: 100%;
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                }

                .section {
                    margin-bottom: 20px;
                    padding: 16px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 6px;
                    width: 100%;
                }

                .section-title {
                    font-size: 1.2em;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--vscode-textLink-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .function-signature {
                    font-family: var(--vscode-editor-font-family);
                    font-size: 1em;
                    padding: 12px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    margin: 10px 0;
                    overflow-x: auto;
                    width: 100%;
                }

                .function-signature code {
                    white-space: pre;
                    word-break: normal;
                    overflow-wrap: normal;
                }

                .code-block {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 16px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin: 10px 0;
                    width: 100%;
                }

                .code-block code {
                    font-family: var(--vscode-editor-font-family);
                    font-size: 0.9em;
                    white-space: pre;
                    display: block;
                    line-height: 1.5;
                }

                /* Markdown content styling */
                .markdown-content {
                    width: 100%;
                }

                .markdown-content h1,
                .markdown-content h2,
                .markdown-content h3,
                .markdown-content h4,
                .markdown-content h5,
                .markdown-content h6 {
                    color: var(--vscode-textLink-foreground);
                    margin-top: 16px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .markdown-content p {
                    margin: 8px 0;
                    line-height: 1.6;
                }

                .markdown-content code {
                    font-family: var(--vscode-editor-font-family);
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 0.9em;
                }

                .markdown-content pre {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 16px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin: 12px 0;
                    width: 100%;
                }

                .markdown-content pre code {
                    background-color: transparent;
                    padding: 0;
                    white-space: pre;
                    display: block;
                }

                .markdown-content ul,
                .markdown-content ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }

                .markdown-content li {
                    margin: 4px 0;
                }

                .markdown-content blockquote {
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    padding-left: 16px;
                    margin: 12px 0;
                    color: var(--vscode-descriptionForeground);
                }

                .info-item {
                    margin: 8px 0;
                    padding: 6px 0;
                }

                .parameter {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 8px 12px;
                    margin: 6px 0;
                    border-radius: 3px;
                    font-family: var(--vscode-editor-font-family);
                    width: 100%;
                }

                .copy-button, .ai-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.9em;
                    white-space: nowrap;
                }

                .copy-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                .ai-button {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    margin-left: 8px;
                }

                .ai-button:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }

                .ai-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .config-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }

                .config-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                .history-item, .usage-item {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    border-left: 2px solid var(--vscode-textLink-foreground);
                    width: 100%;
                }

                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .function-name {
                    font-weight: 600;
                    color: var(--vscode-textLink-foreground);
                    word-break: break-all;
                }

                .timestamp {
                    font-size: 0.85em;
                    color: var(--vscode-descriptionForeground);
                    white-space: nowrap;
                }

                .button-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                @media (max-width: 600px) {
                    body {
                        padding: 12px;
                    }

                    .section {
                        padding: 12px;
                    }

                    .section-title {
                        font-size: 1.1em;
                    }
                }
            </style>`;
    }

    /**
     * Generate function info section
     */
    private static generateFunctionInfoSection(functionInfo: FunctionInfo): string {
        return `<div class="section">
                    <div class="section-title">Function Information</div>
                    <div class="function-signature">
                        <code>${this.escapeHtml(functionInfo.signature)}</code>
                    </div>
                    <div class="info-item">
                        <strong>Language:</strong> ${this.escapeHtml(functionInfo.language)}
                    </div>
                    <div class="info-item">
                        <strong>Return Type:</strong> ${this.escapeHtml(functionInfo.returnType)}
                    </div>
                    <div class="info-item">
                        <strong>Location:</strong> ${this.escapeHtml(functionInfo.filePath)}:${functionInfo.lineNumber}
                    </div>
                </div>`;
    }

    /**
     * Generate usage example section
     */
    private static generateUsageSection(usage: string, aiEnabled: boolean): string {
        const aiButtonsHtml = aiEnabled
            ? '<button class="ai-button" onclick="generateWithAI()">Generate with AI</button>'
            : `<button class="ai-button config-button" onclick="openAISettings()">
                <span style="margin-right: 4px;">⚙️</span>Configure AI
               </button>`;

        return `<div class="section">
                    <div class="section-title">
                        Usage Example
                        <div class="button-group">
                            <button class="copy-button" onclick="copyCode()">Copy</button>
                            ${aiButtonsHtml}
                        </div>
                    </div>
                    <div class="code-block">
                        <code id="usage-code">${this.escapeHtml(usage)}</code>
                    </div>
                </div>`;
    }

    /**
     * Generate parameters section
     */
    private static generateParametersSection(functionInfo: FunctionInfo): string {
        if (functionInfo.parameters.length === 0) {
            return '';
        }

        return `<div class="section">
                    <div class="section-title">Parameters</div>
                    <div class="parameters">
                        ${functionInfo.parameters.map(param =>
                            `<div class="parameter">${this.escapeHtml(param)}</div>`
                        ).join('')}
                    </div>
                </div>`;
    }

    /**
     * Generate real usages section
     */
    private static generateRealUsagesSection(realUsages: UsageExample[]): string {
        if (realUsages.length === 0) {
            return '';
        }

        return `<div class="section">
                    <div class="section-title">Real Usage Examples from Codebase (${realUsages.length})</div>
                    ${realUsages.map(usage => `
                        <div class="usage-item">
                            <div class="history-header">
                                <span class="function-name">${this.getRelativePath(usage.filePath)}:${usage.lineNumber}</span>
                            </div>
                            <div class="code-block">
                                <code>${this.escapeHtml(usage.context)}</code>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
    }

    /**
     * Generate history section
     */
    private static generateHistorySection(history: HistoryEntry[]): string {
        if (history.length === 0) {
            return '';
        }

        const historyItems = history.map(item => `
            <div class="history-item">
                <div class="history-header">
                    <span class="function-name">${this.escapeHtml(item.functionName)}</span>
                    <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div class="code-block">
                    <code>${this.escapeHtml(item.usage)}</code>
                </div>
            </div>
        `).join('');

        return `<div class="section">
                    <div class="section-title">Recent Usage History</div>
                    ${historyItems}
                </div>`;
    }

    /**
     * Generate JavaScript section
     */
    private static generateScript(): string {
        return `<script>
                const vscode = acquireVsCodeApi();

                function copyCode() {
                    const code = document.getElementById('usage-code').textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        const button = document.querySelector('.copy-button');
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 2000);
                    });
                }

                function generateWithAI() {
                    const button = document.querySelector('.ai-button');
                    button.disabled = true;
                    button.textContent = 'Generating...';

                    vscode.postMessage({
                        command: 'generateWithAI'
                    });
                }

                function openAISettings() {
                    vscode.postMessage({
                        command: 'openAISettings'
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateUsage':
                            document.getElementById('usage-code').textContent = message.usage;
                            const button = document.querySelector('.ai-button');
                            if (button) {
                                button.disabled = false;
                                button.textContent = 'Generate with AI';
                            }
                            break;
                        case 'generationError':
                            const aiButton = document.querySelector('.ai-button');
                            if (aiButton) {
                                aiButton.disabled = false;
                                aiButton.textContent = 'Generate with AI';
                            }
                            break;
                    }
                });
            </script>`;
    }

    /**
     * Escape HTML special characters
     */
    private static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Get relative path for display
     */
    private static getRelativePath(filePath: string): string {
        const parts = filePath.split(/[\\/]/);
        return parts[parts.length - 1];
    }
}
