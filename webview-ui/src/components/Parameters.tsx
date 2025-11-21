import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';

interface ParametersProps {
  parameters: string[];
}

export function Parameters({ parameters }: ParametersProps) {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {parameters.map((param, index) => (
            <div
              key={index}
              className="rounded-md bg-muted p-3 font-mono text-sm"
            >
              <code>{param}</code>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
