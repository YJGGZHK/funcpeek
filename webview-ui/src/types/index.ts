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
  history: HistoryEntry[];
  aiEnabled: boolean;
  realUsages: UsageExample[];
}

export type MessageCommand =
  | 'generateWithAI'
  | 'openAISettings'
  | 'openFile'
  | 'updateUsage'
  | 'generationError';

export interface WebviewMessage {
  command: MessageCommand;
  filePath?: string;
  lineNumber?: number;
  usage?: string;
}
