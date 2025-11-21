import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles, Settings } from 'lucide-react';
import { useVSCodeApi } from '@/hooks/useVSCodeApi';
import { CodeBlock } from './CodeBlock';

interface UsageExampleProps {
  usage: string;
  aiEnabled: boolean;
}

export function UsageExample({ usage, aiEnabled }: UsageExampleProps) {
  const [copied, setCopied] = useState(false);
  const { copyToClipboard, generateWithAI, openAISettings } = useVSCodeApi();

  const handleCopy = async () => {
    await copyToClipboard(usage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            Usage Example
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
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
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={openAISettings}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure AI
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CodeBlock code={usage} language="typescript" />
      </CardContent>
    </Card>
  );
}
