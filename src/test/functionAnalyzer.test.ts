/**
 * Tests for FunctionAnalyzer
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { FunctionAnalyzer } from '../analyzers/functionAnalyzer';

suite('FunctionAnalyzer Test Suite', () => {
    vscode.window.showInformationMessage('Start FunctionAnalyzer tests');

    test('Should analyze TypeScript function definition', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: 'function testFunc(param: string): void { }',
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);
        const fullRange = new vscode.Range(0, 0, 0, doc.lineAt(0).text.length);
        editor.selection = new vscode.Selection(fullRange.start, fullRange.end);

        const result = FunctionAnalyzer.analyzeSelectedFunction(editor);

        assert.strictEqual(result !== null, true, 'Should return function info');
        assert.strictEqual(result?.name, 'testFunc', 'Should extract function name');
        assert.strictEqual(result?.parameters.length, 1, 'Should have one parameter');
    });

    test('Should analyze function name only', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: 'function myFunction(x: number): number { return x * 2; }',
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select only the function name
        const result = FunctionAnalyzer.analyzeSelectedFunction(editor, 'myFunction');

        assert.strictEqual(result !== null, true, 'Should analyze function name only');
        assert.strictEqual(result?.name, 'myFunction', 'Should extract correct name');
    });

    test('Should analyze arrow function', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: 'const arrowFunc = (a: number, b: number): number => a + b;',
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);
        const fullRange = new vscode.Range(0, 0, 0, doc.lineAt(0).text.length);
        editor.selection = new vscode.Selection(fullRange.start, fullRange.end);

        const result = FunctionAnalyzer.analyzeSelectedFunction(editor);

        assert.strictEqual(result !== null, true, 'Should analyze arrow function');
        assert.strictEqual(result?.name, 'arrowFunc', 'Should extract arrow function name');
    });

    test('Should analyze class method', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: `class MyClass {
    public myMethod(param: string): void { }
}`,
            language: 'typescript'
        });

        const editor = await vscode.window.showTextDocument(doc);

        const result = FunctionAnalyzer.analyzeSelectedFunction(editor, 'myMethod');

        assert.strictEqual(result !== null, true, 'Should analyze class method');
        assert.strictEqual(result?.name, 'myMethod', 'Should extract method name');
    });

    test('Should generate usage example', () => {
        const functionInfo = {
            name: 'calculateSum',
            signature: 'calculateSum(a: number, b: number): number',
            parameters: ['a: number', 'b: number'],
            returnType: 'number',
            language: 'typescript',
            filePath: '/test/file.ts',
            lineNumber: 1
        };

        const usage = FunctionAnalyzer.generateUsageExample(functionInfo);

        assert.strictEqual(usage.includes('calculateSum'), true, 'Usage should include function name');
        assert.strictEqual(usage.includes('const result'), true, 'Should assign to result for non-void functions');
    });

    test('Should generate void function usage', () => {
        const functionInfo = {
            name: 'logMessage',
            signature: 'logMessage(msg: string): void',
            parameters: ['msg: string'],
            returnType: 'void',
            language: 'typescript',
            filePath: '/test/file.ts',
            lineNumber: 1
        };

        const usage = FunctionAnalyzer.generateUsageExample(functionInfo);

        assert.strictEqual(usage.includes('logMessage'), true, 'Usage should include function name');
        assert.strictEqual(!usage.includes('const result'), true, 'Should not assign result for void functions');
    });
});
