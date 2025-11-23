import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Code } from 'lucide-react';

interface ParametersProps {
  parameters: string[];
  signature?: string;
}

export function Parameters({ parameters, signature }: ParametersProps) {
  if (parameters.length === 0 && !signature) {
    return null;
  }

  // Try to extract parameter types from the full signature if available
  // This is a simple heuristic and might not work for all languages/complex types
  const getParameterDisplay = (param: string) => {
    // If the parameter string already contains type info (e.g. "name: string"), return as is
    if (param.includes(':') || param.includes('=')) {
      return param;
    }
    return param;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Parameters & Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {signature && (
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Code className="w-4 h-4" />
                <span>Full Signature</span>
             </div>
             <div className="rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto">
                <code>{signature}</code>
             </div>
          </div>
        )}
        
        {parameters.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">Parameters List</div>
            {parameters.map((param, index) => (
              <div
                key={index}
                className="rounded-md bg-muted p-3 font-mono text-sm"
              >
                <code>{getParameterDisplay(param)}</code>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
