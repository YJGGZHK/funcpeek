import { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { HistoryEntry } from '@/types';
import { History as HistoryIcon, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HistoryProps {
  history: HistoryEntry[];
}

export function History({ history }: HistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="border border-border rounded-md bg-card text-card-foreground shadow-sm"
    >
      <div className="flex items-center justify-between p-6 pb-0">
         <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
          <HistoryIcon className="w-5 h-5" />
          Recent Usage History
         </div>
         <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle History</span>
            </Button>
         </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-6">
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
      </CollapsibleContent>
      {!isExpanded && (
        <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground">
          {history.length} items hidden
        </div>
      )}
    </Collapsible>
  );
}
