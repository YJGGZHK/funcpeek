/**
 * AI service for generating intelligent usage examples
 */

import * as vscode from 'vscode';
import { FunctionInfo, UsageExample, AIConfig } from '../types';
import { AI_SERVICE, AI_CONFIG_KEYS, CONFIG_NAMESPACE } from '../config/constants';
import { AIServiceError, logError } from '../utils/errors';

/**
 * Service for interacting with AI APIs to generate usage examples
 */
export class AIService {
    private config: AIConfig;

    constructor() {
        this.config = this.loadConfig();

        // Listen for configuration changes and reload
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(CONFIG_NAMESPACE)) {
                this.config = this.loadConfig();
                console.log('[FuncPeek AI] Configuration reloaded:', {
                    enabled: this.config.enabled,
                    hasApiKey: this.config.apiKey.length > 0
                });
            }
        });
    }

    /**
     * Load AI configuration from VS Code settings
     */
    private loadConfig(): AIConfig {
        const config = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
        return {
            enabled: config.get<boolean>(AI_CONFIG_KEYS.ENABLED, false),
            apiKey: config.get<string>(AI_CONFIG_KEYS.API_KEY, ''),
            endpoint: config.get<string>(AI_CONFIG_KEYS.ENDPOINT, AI_SERVICE.DEFAULT_ENDPOINT),
            model: config.get<string>(AI_CONFIG_KEYS.MODEL, AI_SERVICE.DEFAULT_MODEL)
        };
    }

    /**
     * Check if AI service is properly configured and enabled
     */
    public isEnabled(): boolean {
        return this.config.enabled && this.config.apiKey.length > 0;
    }

    /**
     * Generate usage example using AI
     * @param functionInfo - Information about the function
     * @param sourceCode - Optional source code context
     * @param realUsages - Optional real usage examples from codebase
     * @returns AI-generated usage example
     * @throws {AIServiceError} If AI service is not enabled or request fails
     */
    public async generateUsageExample(
        functionInfo: FunctionInfo,
        sourceCode?: string,
        realUsages?: UsageExample[]
    ): Promise<string> {
        if (!this.isEnabled()) {
            throw new AIServiceError('AI service is not enabled or API key is not configured');
        }

        try {
            const prompt = this.buildPrompt(functionInfo, sourceCode, realUsages);
            const response = await this.callAPI(prompt);
            return response;
        } catch (error) {
            logError('Error calling AI service', error);
            throw error;
        }
    }

    /**
     * Build prompt for AI generation
     */
    private buildPrompt(
        functionInfo: FunctionInfo,
        sourceCode?: string,
        realUsages?: UsageExample[]
    ): string {
        let prompt = `Generate a practical usage example for the following ${functionInfo.language} function/method:\n\n`;
        prompt += `Function Name: ${functionInfo.name}\n`;
        prompt += `Signature: ${functionInfo.signature}\n`;
        prompt += `Return Type: ${functionInfo.returnType}\n`;

        if (functionInfo.parameters.length > 0) {
            prompt += `Parameters:\n${functionInfo.parameters.map(p => `  - ${p}`).join('\n')}\n`;
        }

        if (sourceCode) {
            prompt += `\nFunction Source Code:\n\`\`\`${functionInfo.language}\n${sourceCode}\n\`\`\`\n`;
        }

        if (realUsages && realUsages.length > 0) {
            prompt += this.buildRealUsagesSection(realUsages, functionInfo.language);
        }

        prompt += this.buildInstructions(realUsages);

        return prompt;
    }

    /**
     * Build real usages section of the prompt
     */
    private buildRealUsagesSection(realUsages: UsageExample[], language: string): string {
        let section = `\nReal usage examples found in the codebase:\n`;

        realUsages.slice(0, AI_SERVICE.MAX_REAL_USAGES_IN_PROMPT).forEach((usage, index) => {
            section += `\nExample ${index + 1} (from ${usage.filePath}:${usage.lineNumber}):\n`;
            section += `\`\`\`${language}\n${usage.context}\n\`\`\`\n`;
        });

        section += `\nPlease analyze these real usage examples and generate a comprehensive, practical usage example that follows the same patterns.\n`;

        return section;
    }

    /**
     * Build instructions section of the prompt
     */
    private buildInstructions(realUsages?: UsageExample[]): string {
        let instructions = `\nPlease provide:
1. A realistic usage example showing how to call this function with appropriate arguments
2. Brief comments explaining what the function does`;

        if (realUsages && realUsages.length > 0) {
            instructions += `
3. Follow the coding style and patterns shown in the real usage examples`;
        }

        instructions += `
4. If the function returns a value, show how to use the returned value

Provide ONLY the code example, without additional explanation text.`;

        return instructions;
    }

    /**
     * Call the AI API
     */
    private async callAPI(prompt: string): Promise<string> {
        const url = `${this.config.endpoint}/chat/completions`;

        const requestBody = {
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful coding assistant that generates clear, practical code examples.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: AI_SERVICE.DEFAULT_TEMPERATURE,
            max_tokens: AI_SERVICE.MAX_TOKENS
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new AIServiceError(
                `API request failed: ${response.status} ${response.statusText}\n${errorText}`,
                response.status
            );
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
            throw new AIServiceError('No response from AI service');
        }

        let generatedText = data.choices[0].message.content.trim();

        // Clean up code block markers
        generatedText = this.cleanCodeBlockMarkers(generatedText);

        return generatedText;
    }

    /**
     * Remove code block markers from generated text
     */
    private cleanCodeBlockMarkers(text: string): string {
        return text
            .replace(/^```[\w]*\n?/gm, '')
            .replace(/```$/gm, '')
            .trim();
    }

    /**
     * Test connection to AI service
     * @returns True if connection is successful
     */
    public async testConnection(): Promise<boolean> {
        try {
            const url = `${this.config.endpoint}/models`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.ok;
        } catch (error) {
            logError('Error testing AI connection', error);
            return false;
        }
    }
}
