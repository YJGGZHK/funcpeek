import { useState, useCallback } from 'react';
import { WebviewState, WebviewMessage } from './types';
import { useVSCodeMessage } from './hooks/useVSCodeApi';
import { FunctionInfo } from './components/FunctionInfo';
import { UsageExample } from './components/UsageExample';
import { Parameters } from './components/Parameters';
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
        if (message.usage && state) {
          setState({ ...state, usage: message.usage });
        }
        break;
      case 'generationError':
        // Handle error state if needed
        console.error('AI generation error');
        break;
    }
  }, [state]);

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
      <UsageExample usage={state.usage} aiEnabled={state.aiEnabled} />
      <Parameters parameters={state.functionInfo.parameters} />
      <RealUsages realUsages={state.realUsages} />
      <History history={state.history} />
    </div>
  );
}

export default App;
