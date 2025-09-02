import React, { useState, useMemo } from 'react';
import type { PromptObject } from '../types';
import { buildTextPrompt, buildMarkdownPrompt, buildXmlPrompt, buildJsonPrompt, buildYamlPrompt } from '../lib/promptBuilder';
import { CopyIcon, CheckIcon, TestInChatIcon } from './common/Icons';

interface PromptOutputProps {
    prompt: PromptObject;
    t: (key: string) => string;
    onTestInChat: (historyId: string, promptText: string) => void;
    historyId: string | null;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ prompt, t, onTestInChat, historyId }) => {
  const [copied, setCopied] = useState(false);

  const textPrompt = useMemo(() => buildTextPrompt(prompt, t), [prompt, t]);
  const markdownPrompt = useMemo(() => buildMarkdownPrompt(prompt, t), [prompt, t]);
  const xmlPrompt = useMemo(() => buildXmlPrompt(prompt, t), [prompt, t]);
  const jsonPrompt = useMemo(() => buildJsonPrompt(prompt), [prompt]);
  const yamlPrompt = useMemo(() => buildYamlPrompt(prompt, t), [prompt, t]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md' | 'xml' | 'json' | 'yaml') => {
    let content = '';
    let mimeType = '';
    let extension = '';

    switch(format) {
        case 'txt':
            content = textPrompt; mimeType = 'text/plain'; extension = 'txt'; break;
        case 'md':
            content = markdownPrompt; mimeType = 'text/markdown'; extension = 'md'; break;
        case 'xml':
            content = xmlPrompt; mimeType = 'application/xml'; extension = 'xml'; break;
        case 'json':
            content = jsonPrompt; mimeType = 'application/json'; extension = 'json'; break;
        case 'yaml':
            content = yamlPrompt; mimeType = 'application/x-yaml'; extension = 'yaml'; break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcraft_prompt.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary shadow-lg">
      <div className="p-4 border-b border-border-primary flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-text-primary">{t('output.title')}</h2>
        <div className="flex items-center space-x-2 flex-wrap gap-1">
           <button onClick={() => handleDownload('txt')} className="px-3 py-1 text-xs font-semibold text-text-secondary bg-bg-tertiary rounded hover:bg-border-secondary transition">TXT</button>
           <button onClick={() => handleDownload('md')} className="px-3 py-1 text-xs font-semibold text-text-secondary bg-bg-tertiary rounded hover:bg-border-secondary transition">MD</button>
           <button onClick={() => handleDownload('xml')} className="px-3 py-1 text-xs font-semibold text-text-secondary bg-bg-tertiary rounded hover:bg-border-secondary transition">XML</button>
           <button onClick={() => handleDownload('json')} className="px-3 py-1 text-xs font-semibold text-text-secondary bg-bg-tertiary rounded hover:bg-border-secondary transition">JSON</button>
           <button onClick={() => handleDownload('yaml')} className="px-3 py-1 text-xs font-semibold text-text-secondary bg-bg-tertiary rounded hover:bg-border-secondary transition">YAML</button>
        </div>
      </div>
      <div className="relative p-4">
        <div className="absolute top-6 right-4 flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className="p-2 bg-bg-tertiary rounded-md hover:bg-border-secondary transition"
              aria-label={t('buttons.copy')}
            >
              {copied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
            </button>
        </div>
        <pre className="whitespace-pre-line font-mono text-text-secondary text-sm bg-bg-primary/50 p-4 rounded-md overflow-x-auto">
          <code>{textPrompt}</code>
        </pre>
      </div>
      <div className="p-4 border-t border-border-primary">
        <button
            onClick={() => historyId && onTestInChat(historyId, textPrompt)}
            disabled={!historyId}
            className="w-full flex items-center justify-center gap-2 bg-accent-primary/80 hover:bg-accent-primary text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:bg-bg-tertiary disabled:cursor-not-allowed"
        >
             <TestInChatIcon />
            {t('buttons.testInChat')}
        </button>
      </div>
    </div>
  );
};
