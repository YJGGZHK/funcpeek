import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunctionInfo as FunctionInfoType } from '@/types';
import { Code, Braces, FileType, Variable, Box, LayoutGrid } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface FunctionInfoProps {
  functionInfo: FunctionInfoType;
}

export function FunctionInfo({ functionInfo }: FunctionInfoProps) {
  // Determine the type of information based on the returnType or signature
  const isType = functionInfo.signature.startsWith('type ') || functionInfo.signature.startsWith('interface ');
  const isClass = functionInfo.signature.startsWith('class ');
  const isEnum = functionInfo.signature.startsWith('enum ');
  const isVariable = functionInfo.returnType === 'any' && !functionInfo.signature.includes('(');
  const isFunction = functionInfo.signature.includes('(');
  
  let title = "Function Information";
  let Icon = Code;
  
  if (isType) {
    title = "Type Definition";
    Icon = FileType;
  } else if (isClass) {
    title = "Class Information";
    Icon = Box;
  } else if (isEnum) {
    title = "Enum Information";
    Icon = LayoutGrid;
  } else if (isVariable) {
    title = "Variable Information";
    Icon = Variable;
  } else if (!isFunction) {
    // Fallback for other symbols
    title = "Symbol Information";
    Icon = Braces;
  }

  const showReturnType = functionInfo.returnType && 
                         functionInfo.returnType !== 'unknown' && 
                         functionInfo.returnType !== 'void' &&
                         functionInfo.returnType !== 'any' &&
                         !isClass && !isEnum;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeBlock code={functionInfo.signature} language={functionInfo.language} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Language:</span>{' '}
            <span className="text-muted-foreground">{functionInfo.language}</span>
          </div>
          {showReturnType && (
            <div>
              <span className="font-semibold">Return Type:</span>{' '}
              <span className="text-muted-foreground">{functionInfo.returnType}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
