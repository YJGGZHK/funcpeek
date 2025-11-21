import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunctionInfo as FunctionInfoType } from '@/types';
import { Code } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface FunctionInfoProps {
  functionInfo: FunctionInfoType;
}

export function FunctionInfo({ functionInfo }: FunctionInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Function Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeBlock code={functionInfo.signature} language={functionInfo.language} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Language:</span>{' '}
            <span className="text-muted-foreground">{functionInfo.language}</span>
          </div>
          <div>
            <span className="font-semibold">Return Type:</span>{' '}
            <span className="text-muted-foreground">{functionInfo.returnType}</span>
          </div>
          <div className="col-span-full">
            <span className="font-semibold">Location:</span>{' '}
            <span className="text-muted-foreground font-mono text-sm">
              {functionInfo.filePath}:{functionInfo.lineNumber}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
