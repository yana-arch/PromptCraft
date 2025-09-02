import React, { useState } from 'react';
import type { Language, Theme, HistoryItem, Category, Folder, AiConfig } from '../../types';

import { PromptHistory } from './PromptHistory';
import { AiConfigurationManager } from './AiConfigurationManager';
import { DisplaySettings } from './DisplaySettings';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
    // Display props
    language: Language;
    onLangChange: (lang: Language) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    // History props
    history: HistoryItem[];
    categories: Category[];
    onLoadHistory: (item: HistoryItem) => void;
    onDeleteHistory: (id: string) => void;
    onClearHistory: () => void;
    onRenameHistory: (id: string, newName: string) => void;
    // Folder props
    folders: Folder[];
    onAddFolder: () => void;
    onRenameFolder: (id: string, newName: string) => void;
    onDeleteFolder: (id: string) => void;
    onMoveItemToFolder: (itemId: string, folderId: string | 'uncategorized') => void;
    // AI Config props
    aiConfigs: AiConfig[];
    activeAiConfigId: string;
    onSetActiveAiConfig: (id: string) => void;
    onAddAiConfig: () => void;
    onEditAiConfig: (config: AiConfig) => void;
    onDeleteAiConfig: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
    const { isOpen, onClose, t } = props;
    const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

    return (
        <>
            <div className={`fixed inset-y-0 left-0 w-80 bg-bg-secondary border-r border-border-primary shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b border-border-primary flex-shrink-0">
                        <h2 className="text-xl font-bold text-text-primary">{t('sidebar.title')}</h2>
                        <button onClick={onClose} className="p-2 rounded-full text-text-tertiary hover:bg-bg-tertiary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="border-b border-border-primary flex-shrink-0">
                        <nav className="flex space-x-1 p-1" aria-label="Tabs">
                            <button onClick={() => setActiveTab('history')} className={`w-1/2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}>{t('sidebar.historyTab')}</button>
                            <button onClick={() => setActiveTab('settings')} className={`w-1/2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'settings' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}>{t('sidebar.settingsTab')}</button>
                        </nav>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        {activeTab === 'history' && (
                            <PromptHistory
                                history={props.history}
                                categories={props.categories}
                                onLoad={props.onLoadHistory}
                                onDelete={props.onDeleteHistory}
                                onClear={props.onClearHistory}
                                onRename={props.onRenameHistory}
                                folders={props.folders}
                                onAddFolder={props.onAddFolder}
                                onRenameFolder={props.onRenameFolder}
                                onDeleteFolder={props.onDeleteFolder}
                                onMoveItemToFolder={props.onMoveItemToFolder}
                                t={t}
                            />
                        )}
                        {activeTab === 'settings' && (
                            <AiConfigurationManager
                                configs={props.aiConfigs}
                                activeConfigId={props.activeAiConfigId}
                                onSetActive={props.onSetActiveAiConfig}
                                onAdd={props.onAddAiConfig}
                                onEdit={props.onEditAiConfig}
                                onDelete={props.onDeleteAiConfig}
                                t={t}
                            />
                        )}
                    </div>

                    <div className="flex-shrink-0 p-4 border-t border-border-primary bg-bg-primary/50">
                        <h4 className="text-sm font-semibold text-text-tertiary mb-3">{t('sidebar.controlsTitle')}</h4>
                        <DisplaySettings
                            language={props.language}
                            onLangChange={props.onLangChange}
                            theme={props.theme}
                            onThemeChange={props.onThemeChange}
                            t={t}
                        />
                    </div>
                </div>
            </div>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose}></div>}
        </>
    );
};
