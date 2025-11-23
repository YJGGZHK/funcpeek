/**
 * AI service for generating intelligent usage examples
 */

import * as vscode from 'vscode';
import type { FunctionInfo, UsageExample, AIConfig } from '../types';
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
     * Generate usage example using AI with streaming
     * @param functionInfo - Information about the function
     * @param sourceCode - Optional source code context
     * @param realUsages - Optional real usage examples from codebase
     * @param onChunk - Callback function called for each chunk of generated text
     * @returns Complete AI-generated usage example
     * @throws {AIServiceError} If AI service is not enabled or request fails
     */
    public async generateUsageExampleStream(
        functionInfo: FunctionInfo,
        sourceCode: string | undefined,
        realUsages: UsageExample[] | undefined,
        onChunk: (chunk: string) => void
    ): Promise<string> {
        if (!this.isEnabled()) {
            throw new AIServiceError('AI service is not enabled or API key is not configured');
        }

        try {
            const prompt = this.buildPrompt(functionInfo, sourceCode, realUsages);
            const fullResponse = await this.callAPIStream(prompt, onChunk);
            return fullResponse;
        } catch (error) {
            logError('Error calling AI service with stream', error);
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
        let prompt = `请为以下 ${functionInfo.language} 函数/方法生成使用说明：\n\n`;
        prompt += `函数名: ${functionInfo.name}\n`;
        prompt += `签名: ${functionInfo.signature}\n`;
        prompt += `返回类型: ${functionInfo.returnType}\n`;

        if (functionInfo.parameters.length > 0) {
            prompt += `参数:\n${functionInfo.parameters.map(p => `  - ${p}`).join('\n')}\n`;
        }

        if (sourceCode) {
            prompt += `\n函数源代码:\n\`\`\`${functionInfo.language}\n${sourceCode}\n\`\`\`\n`;
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
        let section = `\n项目中实际使用示例:\n`;

        realUsages.slice(0, AI_SERVICE.MAX_REAL_USAGES_IN_PROMPT).forEach((usage, index) => {
            section += `\n示例 ${index + 1} (来自 ${usage.filePath}:${usage.lineNumber}):\n`;
            section += `\`\`\`${language}\n${usage.context}\n\`\`\`\n`;
        });

        return section;
    }

    /**
     * Build instructions section of the prompt
     */
    private buildInstructions(realUsages?: UsageExample[]): string {
        let instructions = `\n请简洁明了地回答，包含以下两部分：

1. **这是什么**：
   - 简要说明这个函数的作用和用途
   - 说明每个参数的含义
   - 说明返回值的含义

2. **怎么用**：
   - 提供一个简洁实用的代码示例
   - 如果提供了项目中的实际使用示例，请参考这些示例的用法和风格
   - 展示如何调用函数、传递参数、处理返回值`;

        if (realUsages && realUsages.length > 0) {
            instructions += `
   - 参考项目中实际使用示例的代码风格和模式`;
        }

        instructions += `

要求：
- 内容简洁，不要过于冗长
- 代码示例要实用，可以直接使用
- 如果提供了项目中的使用示例，要参考其风格`;

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
                    content: '你是一个专业的编程助手，能够简洁清晰地解释函数的作用和使用方法。你的回答要简洁实用，不要过于冗长。'
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
     * Call the AI API with streaming
     */
    private async callAPIStream(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
        const url = `${this.config.endpoint}/chat/completions`;

        const requestBody = {
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的编程助手，能够简洁清晰地解释函数的作用和使用方法。你的回答要简洁实用，不要过于冗长。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: AI_SERVICE.DEFAULT_TEMPERATURE,
            max_tokens: AI_SERVICE.MAX_TOKENS,
            stream: true
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

        if (!response.body) {
            throw new AIServiceError('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') {
                        continue;
                    }
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            continue;
                        }

                        try {
                            const json = JSON.parse(data);
                            const delta = json.choices?.[0]?.delta?.content;
                            if (delta) {
                                fullText += delta;
                                onChunk(delta);
                            }
                        } catch {
                            // Ignore JSON parse errors for incomplete chunks
                        }
                    }
                }
            }

            // Process remaining buffer
            if (buffer.trim()) {
                if (buffer.startsWith('data: ')) {
                    const data = buffer.slice(6);
                    if (data !== '[DONE]') {
                        try {
                            const json = JSON.parse(data);
                            const delta = json.choices?.[0]?.delta?.content;
                            if (delta) {
                                fullText += delta;
                                onChunk(delta);
                            }
                        } catch {
                            // Ignore JSON parse errors
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // For streaming with mixed content (explanation + code), we keep the markers
        // to maintain readability in history
        return fullText;
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
