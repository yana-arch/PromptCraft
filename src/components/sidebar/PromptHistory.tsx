import React, { useState, useMemo } from 'react';
import { buildTextPrompt } from '../../lib/promptBuilder';
import type { HistoryItem, Category, Folder } from '../../types';
import { FolderItem } from './FolderItem';
import { AiSuggestionIcon, SidebarImportIcon } from '../common/Icons';


interface SavedChatItemProps {
    session: any; // Using 'any' for ChatSession to avoid circular dependency issues
    t: (key: string) => string;
}

const SavedChatItem: React.FC<SavedChatItemProps> = ({ session, t }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="bg-bg-primary/50 rounded-md border border-border-secondary">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-2 text-left">
                <span className="text-xs font-medium text-text-secondary">{new Date(session.timestamp).toLocaleString()}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isExpanded && (
                <div className="p-2 border-t border-border-secondary max-h-48 overflow-y-auto">
                    {session.messages.map((msg: any, index: number) => (
                         <div key={index} className={`flex items-start gap-2 my-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-bg-tertiary text-text-tertiary' : 'bg-accent-secondary/20 text-accent-secondary'}`}>
                                {msg.role === 'user'
                                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    : <AiSuggestionIcon />
                                }
                            </div>
                             <div className={`p-2 rounded-lg text-xs ${msg.role === 'user' ? 'bg-accent-primary/80 text-white' : 'bg-bg-tertiary text-text-primary'}`}>
                                <pre className="whitespace-pre-line font-sans">{msg.content}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


interface PromptHistoryProps {
    history: HistoryItem[];
    categories: Category[];
    onLoad: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
    onRename: (id: string, newName: string) => void;
    t: (key: string) => string;
    folders: Folder[];
    onAddFolder: () => void;
    onRenameFolder: (id: string, newName: string) => void;
    onDeleteFolder: (id: string) => void;
    onMoveItemToFolder: (itemId: string, folderId: string | 'uncategorized') => void;
}

export const PromptHistory: React.FC<PromptHistoryProps> = ({ history, categories, onLoad, onDelete, onClear, onRename, t, folders, onAddFolder, onRenameFolder, onDeleteFolder, onMoveItemToFolder }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<'all' | 'uncategorized' | string>('all');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');

    const categoryIconMap = useMemo(() => {
        const map = new Map<string, React.ReactNode>();
        categories.forEach(cat => map.set(cat.id, cat.icon));
        return map;
    }, [categories]);

    const filteredHistory = useMemo(() => {
        return history
            .filter(item => {
                if (selectedFolderId === 'all') return true;
                if (selectedFolderId === 'uncategorized') return !item.folderId;
                return item.folderId === selectedFolderId;
            })
            .filter(item => {
                if (filterCategory === 'all') return true;
                if (item.promptObject.isAiSuggestion) return true;
                return item.generatorState.selectedCategoryId === filterCategory;
            })
            .filter(item => {
                const query = searchQuery.toLowerCase();
                if (!query) return true;
                const goalName = (item.customName || t(item.goalNameKey)).toLowerCase();
                const promptText = buildTextPrompt(item.promptObject, t).toLowerCase();
                return goalName.includes(query) || promptText.includes(query);
            });
    }, [history, searchQuery, filterCategory, t, selectedFolderId]);

    const toggleExpand = (id: string) => { setExpandedId(prevId => (prevId === id ? null : id)); };
    const handleCopy = (item: HistoryItem) => {
        const textPrompt = buildTextPrompt(item.promptObject, t);
        navigator.clipboard.writeText(textPrompt);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRenameClick = (item: HistoryItem) => {
        setEditingId(item.id);
        setEditingName(item.customName || t(item.goalNameKey));
    };

    const handleRenameSave = (id: string) => {
        onRename(id, editingName);
        setEditingId(null);
    };

    const handleRenameFolderClick = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditingFolderName(folder.name);
    };

    const handleRenameFolderSave = (id: string) => {
        if (editingFolderName.trim()) {
            onRenameFolder(id, editingFolderName.trim());
        }
        setEditingFolderId(null);
    };

    const handleDeleteFolderClick = (id: string) => {
        if (window.confirm(t('history.deleteFolderConfirm'))) {
            onDeleteFolder(id);
        }
    };

    if (history.length === 0) {
        return (
            <section>
                 <h3 className="text-xl font-bold text-text-primary mb-4">{t('history.title')}</h3>
                 <p className="text-center text-text-tertiary py-4">{t('history.empty')}</p>
            </section>
        )
    }

    return (
        <section>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-text-secondary">{t('history.foldersTitle')}</h4>
                    <button onClick={onAddFolder} className="px-2 py-1 text-xs font-semibold text-accent-primary bg-accent-primary/10 rounded hover:bg-accent-primary/20 transition">{t('history.addFolder')}</button>
                </div>
                <div className="space-y-1">
                    <FolderItem name={t('history.allPrompts')} isActive={selectedFolderId === 'all'} onClick={() => setSelectedFolderId('all')} />
                    <FolderItem name={t('history.uncategorized')} isActive={selectedFolderId === 'uncategorized'} onClick={() => setSelectedFolderId('uncategorized')} />
                    {folders.map(folder => (
                        <FolderItem
                           key={folder.id}
                           name={folder.name}
                           isActive={selectedFolderId === folder.id}
                           onClick={() => setSelectedFolderId(folder.id)}
                           isEditing={editingFolderId === folder.id}
                           editingValue={editingFolderName}
                           onEditingChange={setEditingFolderName}
                           onRename={() => handleRenameFolderClick(folder)}
                           onSaveRename={() => handleRenameFolderSave(folder.id)}
                           onDelete={() => handleDeleteFolderClick(folder.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-col justify-between items-start mb-4 gap-4 border-t border-border-primary pt-4">
                 <h3 className="text-xl font-bold text-text-primary">{t('history.title')}</h3>
                 <div className="w-full flex flex-col items-center gap-2">
                    <input
                        type="text"
                        placeholder={t('history.searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                    />
                     <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                    >
                        <option value="all">{t('history.allCategories')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{t(cat.nameKey)}</option>
                        ))}
                    </select>
                    <button onClick={onClear} className="w-full px-3 py-2 text-xs font-semibold text-red-400 bg-red-900/50 rounded hover:bg-red-900/80 transition">{t('buttons.clearAll')}</button>
                 </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {filteredHistory.length > 0 ? filteredHistory.map(item => (
                    <div key={item.id} className="bg-bg-primary/70 rounded-lg border border-border-primary transition-shadow hover:shadow-md hover:border-border-secondary">
                        <div className="p-3 flex items-center gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.promptObject.isAiSuggestion ? 'bg-accent-secondary/20 text-accent-secondary' : item.goalNameKey === 'history.importedPrompt' ? 'bg-bg-tertiary text-text-tertiary' : 'bg-bg-secondary text-accent-primary'}`}>
                                {item.promptObject.isAiSuggestion
                                    ? <AiSuggestionIcon />
                                    : item.goalNameKey === 'history.importedPrompt'
                                        ? <SidebarImportIcon />
                                        : categoryIconMap.get(item.generatorState.selectedCategoryId)
                                }
                            </div>
                            <div className="flex-grow overflow-hidden">
                                {editingId === item.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleRenameSave(item.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(item.id)}
                                        className="w-full bg-border-secondary border border-border-primary rounded px-1 py-0 text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <p className={`font-semibold truncate ${item.promptObject.isAiSuggestion ? 'text-accent-secondary' : 'text-text-primary'}`} title={item.customName || t(item.goalNameKey)}>
                                        {item.customName || t(item.goalNameKey)}
                                    </p>
                                )}
                                <p className="text-xs text-text-tertiary flex items-center gap-1.5">
                                  {new Date(item.timestamp).toLocaleString()}
                                  {item.chatSessions && item.chatSessions.length > 0 && (
                                    <span className="flex items-center gap-1 text-accent-primary/80" title={`${item.chatSessions.length} saved chat(s)`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                                      {item.chatSessions.length}
                                    </span>
                                  )}
                                </p>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-2">
                                <button onClick={() => handleRenameClick(item)} className="p-1 text-text-tertiary hover:text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                <button onClick={() => toggleExpand(item.id)} className="p-1 text-text-tertiary hover:text-text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                        </div>
                        {expandedId === item.id && (
                            <div className="p-3 border-t border-border-primary bg-black/20">
                                <pre className="whitespace-pre-line font-mono text-text-secondary text-xs bg-bg-secondary p-2 rounded-md overflow-x-auto mb-3">
                                  <code>{buildTextPrompt(item.promptObject, t)}</code>
                                </pre>
                                {item.chatSessions && item.chatSessions.length > 0 && (
                                    <div className="my-3">
                                        <h5 className="text-xs font-bold uppercase text-text-tertiary mb-2">{t('history.savedSessionsTitle')}</h5>
                                        <div className="space-y-2">
                                            {item.chatSessions.map(session => <SavedChatItem key={session.id} session={session} t={t} />)}
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-border-secondary/50">
                                    <button onClick={() => onLoad(item)} className="px-2 py-1 text-xs font-semibold text-accent-primary bg-accent-primary/10 rounded hover:bg-accent-primary/20 transition">{t('buttons.load')}</button>
                                    <button onClick={() => handleCopy(item)} className="px-2 py-1 text-xs font-semibold text-cyan-300 bg-cyan-900/50 rounded hover:bg-cyan-900/80 transition">{copiedId === item.id ? t('history.copied') : t('buttons.copy')}</button>
                                    <select
                                        value={item.folderId || 'uncategorized'}
                                        onChange={(e) => onMoveItemToFolder(item.id, e.target.value)}
                                        className="bg-bg-tertiary border border-border-secondary rounded px-2 py-1 text-xs font-semibold text-text-primary focus:ring-1 focus:ring-accent-primary"
                                    >
                                        <option value="uncategorized">{t('history.uncategorized')}</option>
                                        {folders.map(folder => (
                                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => onDelete(item.id)} className="px-2 py-1 text-xs font-semibold text-red-400 bg-red-900/50 rounded hover:bg-red-900/80 transition">{t('buttons.delete')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                )) : <p className="text-center text-text-tertiary py-4">{t('history.noResults')}</p>}
            </div>
        </section>
    );
};