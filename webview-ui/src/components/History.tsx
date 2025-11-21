import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryEntry } from '@/types';
import { History as HistoryIcon, Clock } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface HistoryProps {
  history: HistoryEntry[];
}

export function History({ history }: HistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5" />
          Recent Usage History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="border-l-2 border-primary pl-4 py-2 space-y-2"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-primary">
                {item.functionName}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
            <CodeBlock code={item.usage} language="typescript" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
