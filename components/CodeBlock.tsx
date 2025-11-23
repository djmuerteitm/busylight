import React from 'react';

interface CodeBlockProps {
  code: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, title }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-inner flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400">{title || 'Generated Firmware'}</span>
        <button 
          onClick={copyToClipboard}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Copy Code
        </button>
      </div>
      <div className="overflow-auto p-4 flex-1">
        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};