import { useState, useCallback } from 'react';
import { WebviewState, WebviewMessage } from './types';
import { useVSCodeMessage } from './hooks/useVSCodeApi';
import { FunctionInfo } from './components/FunctionInfo';
import { UsageExample } from './components/UsageExample';
import { RealUsages } from './components/RealUsages';
import { History } from './components/History';
import './index.css';

// Get initial state from VSCode
declare global {
  interface Window {
    initialState?: WebviewState;
  }
}

function App() {
  const [state, setState] = useState<WebviewState | null>(window.initialState || null);

  const handleMessage = useCallback((event: MessageEvent<WebviewMessage>) => {
    const message = event.data;
    switch (message.command) {
      case 'updateUsage':
        setState(prevState => {
          if (!prevState || !message.usage) return prevState;
          return { ...prevState, usage: message.usage };
        });
        break;
      case 'updateAIGenerated':
        setState(prevState => {
          if (!prevState) return prevState;
          return { 
            ...prevState, 
            aiGenerated: message.aiGenerated || '',
            isGenerating: true
          };
        });
        break;
      case 'appendAIGeneratedChunk':
        setState(prevState => {
          if (!prevState || !message.chunk) return prevState;
          return { 
            ...prevState, 
            aiGenerated: (prevState.aiGenerated || '') + message.chunk,
            isGenerating: true
          };
        });
        break;
      case 'setGenerating':
        setState(prevState => {
          if (!prevState) return prevState;
          return { ...prevState, isGenerating: message.isGenerating ?? false };
        });
        break;
      case 'generationError':
        setState(prevState => {
          if (!prevState) return prevState;
          return { ...prevState, isGenerating: false };
        });
        console.error('AI generation error');
        break;
    }
  }, []);

  useVSCodeMessage(handleMessage);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <FunctionInfo functionInfo={state.functionInfo} />
      <UsageExample 
        usage={state.usage} 
        aiEnabled={state.aiEnabled} 
        usageLocation={state.usageLocation}
        aiGenerated={state.aiGenerated}
        isGenerating={state.isGenerating}
      />
      <RealUsages realUsages={state.realUsages} />
      <History history={state.history} />
    </div>
  );
}

export default App;
