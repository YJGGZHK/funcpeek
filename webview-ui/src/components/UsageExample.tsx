import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles, Settings, ExternalLink, Loader2 } from 'lucide-react';
import { useVSCodeApi } from '@/hooks/useVSCodeApi';
import { CodeBlock } from './CodeBlock';

interface UsageExampleProps {
  usage: string;
  aiEnabled: boolean;
  usageLocation?: {
    filePath: string;
    lineNumber: number;
  };
  aiGenerated?: string;
  isGenerating?: boolean;
}

type TabType = 'code' | 'ai';

export function UsageExample({ usage, aiEnabled, usageLocation, aiGenerated, isGenerating = false }: UsageExampleProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(aiGenerated ? 'ai' : 'code');
  const { copyToClipboard, generateWithAI, openAISettings, openFile } = useVSCodeApi();

  // Auto-switch to AI tab when generating starts
  useEffect(() => {
    if (isGenerating) {
      setActiveTab('ai');
    }
  }, [isGenerating]);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'ai' && aiGenerated ? aiGenerated : usage;
    await copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentContent = activeTab === 'ai' ? (aiGenerated || '') : usage;
  const showAITab = aiEnabled && (aiGenerated || isGenerating);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              Usage Example
            </CardTitle>
            {usageLocation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openFile(usageLocation.filePath, usageLocation.lineNumber)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                title="Go to source"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Source
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2 hover:bg-accent hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
            {aiEnabled ? (
              <Button
                size="sm"
                onClick={generateWithAI}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={openAISettings}
                className="flex items-center gap-2 hover:bg-secondary/80 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Configure AI
              </Button>
            )}
          </div>
        </div>
        {showAITab && (
          <div className="flex gap-1 border-b border-border mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'code'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Code Example
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'ai'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              <Sparkles className="w-4 h-4" />
              AI Generated
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isGenerating && activeTab === 'ai' && !currentContent ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating usage example with AI...</p>
            </div>
          </div>
        ) : activeTab === 'ai' ? (
          <div className="rounded-md bg-muted p-4 overflow-auto max-h-[500px] text-sm ai-content select-text cursor-text">
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  
                  if (match) {
                    return (
                      <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        className="my-4"
                      />
                    );
                  }
                  
                  return (
                    <code {...rest} className="bg-muted-foreground/20 rounded px-1.5 py-0.5 font-mono text-xs">
                      {children}
                    </code>
                  );
                },
                p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="mb-4 pl-6 list-disc space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 pl-6 list-decimal space-y-1">{children}</ol>,
                li: ({children}) => <li className="pl-1">{children}</li>,
                h1: ({children}) => <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 pb-2 border-b">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg font-bold mb-3 mt-5 pb-1 border-b border-border/50">{children}</h2>,
                h3: ({children}) => <h3 className="text-base font-bold mb-2 mt-4">{children}</h3>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">{children}</blockquote>,
              }}
            >
              {currentContent || ''}
            </ReactMarkdown>
            {isGenerating && <span className="inline-block w-2 h-4 ml-1 align-middle bg-primary animate-pulse"/>}
          </div>
        ) : (
          <CodeBlock code={currentContent} language="typescript" />
        )}
      </CardContent>
    </Card>
  );
}
