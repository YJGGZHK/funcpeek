export interface FunctionInfo {
  name: string;
  signature: string;
  language: string;
  returnType: string;
  filePath: string;
  lineNumber: number;
  parameters: string[];
}

export interface UsageExample {
  filePath: string;
  lineNumber: number;
  context: string;
  language?: string;
}

export interface HistoryEntry {
  functionName: string;
  timestamp: number;
  usage: string;
}

export interface WebviewState {
  functionInfo: FunctionInfo;
  usage: string;
  usageLocation?: { // Optional location for the primary usage example
    filePath: string;
    lineNumber: number;
  };
  history: HistoryEntry[];
  aiEnabled: boolean;
  realUsages: UsageExample[];
  aiGenerated?: string; // AI generated content
  isGenerating?: boolean; // Loading state for AI generation
}

export type MessageCommand =
  | 'generateWithAI'
  | 'openAISettings'
  | 'openFile'
  | 'updateUsage'
  | 'updateAIGenerated'
  | 'appendAIGeneratedChunk'
  | 'setGenerating'
  | 'generationError';

export interface WebviewMessage {
  command: MessageCommand;
  filePath?: string;
  lineNumber?: number;
  usage?: string;
  aiGenerated?: string;
  chunk?: string;
  isGenerating?: boolean;
}
