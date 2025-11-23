import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'typescript', className = '' }: CodeBlockProps) {
  return (
    <div className={`rounded-md overflow-hidden select-text cursor-text ${className}`}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          background: '#1e1e1e',
        }}
        wrapLongLines
        lineProps={() => ({
          style: {
            backgroundColor: 'transparent',
            display: 'block',
            width: '100%',
          },
        })}
        codeTagProps={{
          style: {
            backgroundColor: 'transparent',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
