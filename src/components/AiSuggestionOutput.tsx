import React, { useState } from 'react';
import { ImproveWithAIIcon, CopyIcon, CheckIcon, TestInChatIcon } from './common/Icons';

interface AiSuggestionOutputProps {
    suggestion: string;
    t: (key: string) => string;
    onTestInChat: (historyId: string, promptText: string) => void;
    historyId: string | null;
}

export const AiSuggestionOutput: React.FC<AiSuggestionOutputProps> = ({ suggestion, t, onTestInChat, historyId }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-accent-secondary/10 rounded-xl border border-accent-secondary/30 shadow-lg">
            <div className="p-4 border-b border-accent-secondary/30 flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <ImproveWithAIIcon />
                    {t('output.aiSuggestionTitle')}
                </h2>
            </div>
            <div className="relative p-4">
                <button
                    onClick={handleCopy}
                    className="absolute top-6 right-4 p-2 bg-accent-secondary/20 rounded-md hover:bg-accent-secondary/30 transition"
                    aria-label={t('buttons.copy')}
                >
                    {copied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
                </button>
                <pre className="whitespace-pre-line font-mono text-text-secondary text-sm bg-bg-primary/50 p-4 rounded-md overflow-x-auto">
                    <code>{suggestion}</code>
                </pre>
            </div>
             <div className="p-4 border-t border-accent-secondary/30">
                <button
                    onClick={() => historyId && onTestInChat(historyId, suggestion)}
                    disabled={!historyId}
                    className="w-full flex items-center justify-center gap-2 bg-accent-secondary/80 hover:bg-accent-secondary text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:bg-bg-tertiary disabled:cursor-not-allowed"
                >
                     <TestInChatIcon />
                    {t('buttons.testInChat')}
                </button>
            </div>
        </div>
    );
};
