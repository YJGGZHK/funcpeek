import { useEffect, useCallback } from 'react';
import { WebviewMessage } from '@/types';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: WebviewMessage) => void;
      setState: (state: any) => void;
      getState: () => any;
    };
  }
}

const vscode = window.acquireVsCodeApi();

export function useVSCodeApi() {
  const postMessage = useCallback((message: WebviewMessage) => {
    vscode.postMessage(message);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const generateWithAI = useCallback(() => {
    postMessage({ command: 'generateWithAI' });
  }, [postMessage]);

  const openAISettings = useCallback(() => {
    postMessage({ command: 'openAISettings' });
  }, [postMessage]);

  const openFile = useCallback(
    (filePath: string, lineNumber: number) => {
      postMessage({ command: 'openFile', filePath, lineNumber });
    },
    [postMessage]
  );

  return {
    postMessage,
    copyToClipboard,
    generateWithAI,
    openAISettings,
    openFile,
  };
}

export function useVSCodeMessage(
  handler: (message: MessageEvent<WebviewMessage>) => void
) {
  useEffect(() => {
    const messageHandler = (event: MessageEvent<WebviewMessage>) => {
      handler(event);
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [handler]);
}
