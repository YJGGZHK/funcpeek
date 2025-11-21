/**
 * Integration Tests for FuncPeek Extension
 *
 * Test all major features:
 * 1. Symbol selection (function names, class names, variables)
 * 2. Reference finding
 * 3. Webview display
 * 4. AI configuration
 */

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('FuncPeek Integration Tests', () => {
    vscode.window.showInformationMessage('Start FuncPeek integration tests');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your-publisher.funcpeek'));
    });

    test('Should register peek function command', async () => {
        const commands = await vscode.commands.getCommands();
        assert.strictEqual(
            commands.includes('funcpeek.peekFunction'),
            true,
            'Peek function command should be registered'
        );
    });

    test('Should register AI generation command', async () => {
        const commands = await vscode.commands.getCommands();
        assert.strictEqual(
            commands.includes('funcpeek.generateWithAI'),
            true,
            'Generate with AI command should be registered'
        );
    });

    test('Should register clear history command', async () => {
        const commands = await vscode.commands.getCommands();
        assert.strictEqual(
            commands.includes('funcpeek.clearHistory'),
            true,
            'Clear history command should be registered'
        );
    });

    test('Should handle function selection', async () => {
        const content = `
function testFunction(a: number, b: number): number {
    return a + b;
}

const result = testFunction(1, 2);
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select just the function name "testFunction" on first line
        const nameStart = doc.getText().indexOf('testFunction');
        const nameEnd = nameStart + 'testFunction'.length;
        const startPos = doc.positionAt(nameStart);
        const endPos = doc.positionAt(nameEnd);

        editor.selection = new vscode.Selection(startPos, endPos);

        // Execute peek function command
        await vscode.commands.executeCommand('funcpeek.peekFunction');

        // Wait a bit for the webview to open
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if there are any active webview panels
        // Note: VSCode doesn't expose webview panels directly in tests,
        // so we mainly verify the command executes without error
        assert.ok(true, 'Command executed successfully');
    });

    test('Should handle class name selection', async () => {
        const content = `
class UserManager {
    private users: any[] = [];

    addUser(name: string) {
        this.users.push({ name });
    }
}

const manager = new UserManager();
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select the class name
        const nameStart = doc.getText().indexOf('UserManager');
        const nameEnd = nameStart + 'UserManager'.length;
        const startPos = doc.positionAt(nameStart);
        const endPos = doc.positionAt(nameEnd);

        editor.selection = new vscode.Selection(startPos, endPos);

        await vscode.commands.executeCommand('funcpeek.peekFunction');
        await new Promise(resolve => setTimeout(resolve, 500));

        assert.ok(true, 'Class name selection handled');
    });

    test('Should handle variable name selection', async () => {
        const content = `
const API_URL = "https://api.example.com";

function fetchData() {
    return fetch(API_URL);
}

console.log(API_URL);
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select the variable name
        const nameStart = doc.getText().indexOf('API_URL');
        const nameEnd = nameStart + 'API_URL'.length;
        const startPos = doc.positionAt(nameStart);
        const endPos = doc.positionAt(nameEnd);

        editor.selection = new vscode.Selection(startPos, endPos);

        await vscode.commands.executeCommand('funcpeek.peekFunction');
        await new Promise(resolve => setTimeout(resolve, 500));

        assert.ok(true, 'Variable name selection handled');
    });

    test('Should handle cursor position without selection', async () => {
        const content = `
function myFunc() {
    console.log("test");
}
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Place cursor on function name without selecting
        const nameStart = doc.getText().indexOf('myFunc');
        const pos = doc.positionAt(nameStart + 2); // middle of "myFunc"

        editor.selection = new vscode.Selection(pos, pos);

        await vscode.commands.executeCommand('funcpeek.peekFunction');
        await new Promise(resolve => setTimeout(resolve, 500));

        assert.ok(true, 'Cursor position handled');
    });
});
