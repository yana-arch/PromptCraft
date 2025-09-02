import React, { useState, useEffect } from 'react';

interface ImportPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImprove: (promptText: string) => void;
    isImproving: boolean;
    t: (key: string) => string;
}

export const ImportPromptModal: React.FC<ImportPromptModalProps> = ({ isOpen, onClose, onImprove, isImproving, t }) => {
    const [promptContent, setPromptContent] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPromptContent('');
            setFileName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setPromptContent(text);
            };
            reader.onerror = () => {
                alert(t('errors.fileReadError'));
                setFileName('');
                setPromptContent('');
            };
            reader.readAsText(file);
        }
    };

    const triggerFileInput = () => {
        const fileInput = document.getElementById('file-importer');
        if (fileInput) {
           fileInput.click();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-bg-secondary/80 backdrop-blur-sm rounded-xl border border-border-primary shadow-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-border-primary">
                    <h2 className="text-xl font-bold text-text-primary">{t('importModal.title')}</h2>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <button
                        onClick={triggerFileInput}
                        className="w-full p-6 border-2 border-dashed border-border-secondary rounded-lg text-center text-text-tertiary hover:border-accent-primary hover:text-accent-primary transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mt-2 font-semibold">{fileName || t('importModal.fileLabel')}</p>
                        <p className="text-xs text-slate-500">{t('importModal.fileTypes')}</p>
                    </button>
                    <input
                        type="file"
                        id="file-importer"
                        className="hidden"
                        accept=".txt,.md,.json,.xml,.yaml"
                        onChange={handleFileChange}
                    />
                    <textarea
                        value={promptContent}
                        onChange={(e) => setPromptContent(e.target.value)}
                        rows={10}
                        placeholder={t('importModal.pastePlaceholder')}
                        className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                    />
                </div>
                <div className="p-4 bg-bg-secondary/50 border-t border-border-primary flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-bg-tertiary hover:bg-border-secondary text-text-primary">{t('settings.cancel')}</button>
                    <button
                        onClick={() => onImprove(promptContent)}
                        disabled={!promptContent.trim() || isImproving}
                        className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-accent-secondary hover:bg-accent-secondary-hover text-white disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center gap-2"
                    >
                         {isImproving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {t('output.aiImproving')}
                            </>
                        ) : (
                           t('importModal.improveButton')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
