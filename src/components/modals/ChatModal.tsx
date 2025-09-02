import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, AiConfig } from '../../types';
import { AiSuggestionIcon } from '../common/Icons';
import { DEFAULT_AI_CONFIG_ID } from '../../constants';

// Markdown Renderer
const parseMarkdownToHtml = (markdown: string): string => {
    const escapeHtml = (unsafe: string) => unsafe.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c] || c);

    const processInline = (line: string) => {
        return line
            .replace(/\*\*([^\s].*?[^\s])\*\*/g, '<strong>$1</strong>')
            .replace(/__([^\s].*?[^\s])__/g, '<strong>$1</strong>')
            .replace(/\*([^\s].*?[^\s])\*/g, '<em>$1</em>')
            .replace(/_([^\s].*?[^\s])_/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    };

    const lines = markdown.split('\n');
    let html = '';
    let inCodeBlock = false;
    let inList: 'ul' | 'ol' | null = null;
    let codeContent = '';
    let codeLang = '';

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                html += `<pre><code class="language-${codeLang}">${escapeHtml(codeContent.trim())}</code></pre>`;
                inCodeBlock = false;
                codeContent = '';
                codeLang = '';
            } else {
                if (inList) {
                    html += `</${inList}>\n`;
                    inList = null;
                }
                inCodeBlock = true;
                codeLang = line.substring(3).trim();
            }
            continue;
        }
        if (inCodeBlock) {
            codeContent += line + '\n';
            continue;
        }

        const ulMatch = line.match(/^\s*[-*]\s+(.*)/);
        const olMatch = !ulMatch && line.match(/^\s*(\d+)\.\s+(.*)/);

        if (!ulMatch && !olMatch && inList) {
            html += `</${inList}>\n`;
            inList = null;
        }

        if (ulMatch) {
            if (inList !== 'ul') {
                if (inList) html += `</${inList}>\n`;
                html += '<ul>\n';
                inList = 'ul';
            }
            html += `  <li>${processInline(ulMatch[1])}</li>\n`;
        } else if (olMatch) {
             if (inList !== 'ol') {
                if (inList) html += `</${inList}>\n`;
                html += '<ol>\n';
                inList = 'ol';
            }
            html += `  <li>${processInline(olMatch[2])}</li>\n`;
        } else if (line.trim()) {
             html += `<p>${processInline(line)}</p>\n`;
        }
    }

    if (inCodeBlock) html += `<pre><code class="language-${codeLang}">${escapeHtml(codeContent.trim())}</code></pre>\n`;
    if (inList) html += `</${inList}>\n`;

    return html.trim();
};

const MarkdownRenderer: React.FC<{ content: string; isStreaming?: boolean }> = ({ content, isStreaming = false }) => {
    const htmlContent = parseMarkdownToHtml(content);
    const finalHtml = isStreaming ? `${htmlContent}<span class="inline-block w-2 h-4 bg-text-primary ml-1 animate-pulse"></span>` : htmlContent;

    return (
        <div
            className="prose-styles text-sm"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
    );
};

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    systemPrompt: string;
    activeAiConfigId: string;
    aiConfigs: AiConfig[];
    onSaveChat: (messages: ChatMessage[]) => void;
    t: (key: string) => string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, systemPrompt, activeAiConfigId, aiConfigs, onSaveChat, t }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSystemPromptCollapsed, setSystemPromptCollapsed] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const geminiChatInstance = useRef<Chat | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMessages([]);
            setInput('');
            setIsSending(false);
            setSaveStatus('idle');
            geminiChatInstance.current = null;
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleClearChat = () => {
        if (window.confirm(t('chatModal.clearChatConfirm'))) {
            setMessages([]);
            geminiChatInstance.current = null; // Reset Gemini chat history
        }
    };

    const handleSaveSession = () => {
        if (messages.length > 0) {
            onSaveChat(messages);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const newUserMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        setInput('');
        setIsSending(true);
        controllerRef.current = new AbortController();

        try {
            if (activeAiConfigId === DEFAULT_AI_CONFIG_ID) {
                await handleGeminiStream(input, systemPrompt);
            } else {
                const activeConfig = aiConfigs.find(c => c.id === activeAiConfigId);
                if (!activeConfig) throw new Error(t('settings.customConfigMissing'));
                await handleOpenAiStream(input, systemPrompt, activeConfig);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Chat request aborted.");
                 setMessages(prev => [...prev.slice(0, -1), { role: 'model', content: 'Request cancelled.' }]);
            } else {
                console.error("Chat error:", error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                setMessages(prev => [...prev.slice(0, -1), { role: 'model', content: `Error: ${errorMessage}` }]);
            }
        } finally {
            setIsSending(false);
            controllerRef.current = null;
        }
    };

    const handleGeminiStream = async (message: string, systemInstruction: string) => {
        const apiKey = process.env.API_KEY as string;
        const ai = new GoogleGenAI({ apiKey });

        if (!geminiChatInstance.current) {
            geminiChatInstance.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
        }

        const result = await geminiChatInstance.current.sendMessageStream({ message });

        for await (const chunk of result) {
            if (controllerRef.current?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            const chunkText = chunk.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'model') {
                    return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + chunkText }];
                }
                return prev;
            });
        }
    };

    const handleOpenAiStream = async (message: string, systemInstruction: string, config: AiConfig) => {
        const endpoint = `${config.baseURL.replace(/\/$/, '')}/chat/completions`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

        const body = JSON.stringify({
            model: config.modelId,
            messages: [
                { role: 'system', content: systemInstruction },
                ...messages.filter(m => m.role === 'user' || (m.role === 'model' && m.content.trim() !== '')).slice(0,-1), // History
                { role: 'user', content: message } // Current message
            ],
            stream: true,
        });

        const response = await fetch(endpoint, { method: 'POST', headers, body, signal: controllerRef.current?.signal });

        if (!response.ok || !response.body) {
            const errorBody = await response.text();
            throw new Error(`API Error ${response.status}: ${errorBody}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data.trim() === '[DONE]') return;
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices[0]?.delta?.content || '';
                        if (content) {
                            setMessages(prev => {
                                const lastMessage = prev[prev.length - 1];
                                if (lastMessage.role === 'model') {
                                    return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + content }];
                                }
                                return prev;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk:", data);
                    }
                }
            }
        }
    };

    const handleStop = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        setIsSending(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-bg-primary/90 z-50 flex flex-col p-2 sm:p-4 md:p-8" onClick={onClose}>
            <div className="w-full h-full max-w-4xl mx-auto bg-bg-secondary/80 backdrop-blur-sm rounded-xl border border-border-primary shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border-primary">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                        {t('chatModal.title')}
                    </h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleSaveSession} disabled={messages.length === 0 || saveStatus === 'saved'} className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-bg-tertiary hover:bg-border-secondary text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                           {saveStatus === 'saved' ? t('chatModal.saved') : t('chatModal.saveSession')}
                        </button>
                         <button onClick={handleClearChat} className="p-2 rounded-md text-text-tertiary hover:bg-bg-tertiary hover:text-red-400 transition-colors" title={t('chatModal.clearChat')}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-md text-text-tertiary hover:bg-bg-tertiary transition-colors" title={t('chatModal.close')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>

                <div className="p-4 border-b border-border-primary flex-shrink-0">
                    <button onClick={() => setSystemPromptCollapsed(p => !p)} className="w-full flex justify-between items-center text-left">
                        <span className="text-sm font-semibold text-text-tertiary">{t('chatModal.systemPrompt')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-text-tertiary transition-transform ${!isSystemPromptCollapsed && 'rotate-180'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {!isSystemPromptCollapsed && (
                         <pre className="mt-2 text-xs font-mono text-text-secondary bg-bg-primary/50 p-3 rounded-md max-h-32 overflow-y-auto"><code>{systemPrompt}</code></pre>
                    )}
                </div>

                <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-secondary/20 text-accent-secondary flex items-center justify-center"><AiSuggestionIcon /></div>}
                            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-bg-tertiary text-text-primary rounded-bl-none'}`}>
                                {msg.role === 'user' ? (
                                    <pre className="whitespace-pre-line font-sans text-sm">{msg.content}</pre>
                                ) : (
                                    <MarkdownRenderer
                                        content={msg.content}
                                        isStreaming={isSending && msg.role === 'model' && index === messages.length - 1}
                                    />
                                )}
                            </div>
                           {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-tertiary text-text-tertiary flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div>}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-border-primary bg-bg-secondary/50">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); }}
                            placeholder={t('chatModal.placeholder')}
                            rows={1}
                            disabled={isSending}
                            className="w-full bg-bg-tertiary border border-border-secondary rounded-lg p-3 pr-24 text-text-primary focus:ring-2 focus:ring-accent-primary transition resize-none"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                         {isSending ? (
                             <button type="button" onClick={handleStop} className="p-2 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10" title="Stop">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                             </button>
                         ) : (
                            <button type="submit" className="p-2 rounded-md text-text-tertiary hover:text-accent-primary disabled:opacity-50" disabled={!input.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                            </button>
                         )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};