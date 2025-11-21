import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageExample } from '@/types';
import { useVSCodeApi } from '@/hooks/useVSCodeApi';
import { FileCode, ExternalLink } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface RealUsagesProps {
  realUsages: UsageExample[];
}

export function RealUsages({ realUsages }: RealUsagesProps) {
  const { openFile } = useVSCodeApi();

  if (realUsages.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          Real Usage Examples from Codebase ({realUsages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {realUsages.map((usage, index) => {
          const fileName = usage.filePath.split(/[\\/]/).pop() || usage.filePath;

          return (
            <div
              key={index}
              className="border border-border rounded-md overflow-hidden hover:border-primary transition-colors"
            >
              <button
                onClick={() => openFile(usage.filePath, usage.lineNumber)}
                className="w-full text-left px-4 py-2 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between group"
              >
                <span className="font-mono text-sm text-primary font-semibold">
                  {fileName}:{usage.lineNumber}
                </span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="p-2">
                <CodeBlock code={usage.context} language={usage.language || 'typescript'} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
