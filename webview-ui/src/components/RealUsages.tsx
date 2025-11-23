import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageExample } from '@/types';
import { useVSCodeApi } from '@/hooks/useVSCodeApi';
import { FileCode, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
        {realUsages.map((usage, index) => (
          <UsageItem 
            key={index} 
            usage={usage} 
            onOpenFile={() => openFile(usage.filePath, usage.lineNumber)} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

function UsageItem({ usage, onOpenFile }: { usage: UsageExample; onOpenFile: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const fileName = usage.filePath.split(/[\\/]/).pop() || usage.filePath;
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-border rounded-md overflow-hidden hover:border-primary transition-colors"
    >
      <div className="w-full text-left px-4 py-2 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between group">
        <button
          onClick={onOpenFile}
          className="flex-1 text-left font-mono text-sm text-primary font-semibold hover:underline flex items-center gap-2"
        >
          {fileName}:{usage.lineNumber}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </button>
        
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="p-2">
        <CodeBlock code={usage.context} language={usage.language || 'typescript'} />
      </CollapsibleContent>
    </Collapsible>
  );
}
