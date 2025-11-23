/**
 * HTML template generator for React-based webview
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { FunctionInfo, UsageExample, HistoryEntry } from '../types';

/**
 * Generates HTML content for React webview display
 */
export class WebviewHtmlGenerator {
    /**
     * Generate complete HTML for webview with React app
     */
    public static generate(
        webview: vscode.Webview,
        extensionUri: vscode.Uri,
        functionInfo: FunctionInfo,
        usage: string,
        history: HistoryEntry[],
        aiEnabled: boolean,
        realUsages: UsageExample[],
        usageLocation?: { filePath: string; lineNumber: number }
    ): string {
        const buildPath = path.join(extensionUri.fsPath, 'webview-ui', 'build');

        // Read the built index.html
        const indexPath = path.join(buildPath, 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

        // Get URIs for assets
        const assetsPath = vscode.Uri.joinPath(extensionUri, 'webview-ui', 'build', 'assets');
        const assetsUri = webview.asWebviewUri(assetsPath);

        // Replace asset paths
        html = html.replace(/\/assets\//g, `${assetsUri.toString()}/`);

        // Inject initial state
        const initialState = {
            functionInfo,
            usage,
            usageLocation,
            history,
            aiEnabled,
            realUsages,
            aiGenerated: undefined,
            isGenerating: false
        };

        // Add CSP and initial state
        html = html.replace(
            '<head>',
            `<head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">
            <script>
                window.initialState = ${JSON.stringify(initialState)};
            </script>`
        );

        return html;
    }
}
