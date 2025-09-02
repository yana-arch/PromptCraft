import { useState, useMemo, useCallback, useEffect } from 'react';
import { translations } from '../translations';
import { CATEGORIES, PROMPT_STYLES, TONES, FORMATS, LENGTHS, PROMPT_TECHNIQUES, DEFAULT_AI_CONFIG_ID } from '../constants';
import { useLocalStorage } from './useLocalStorage';
import { generateHistoryItemName } from '../lib/utils';
import type { Language, Theme, Customizations, PromptObject, HistoryItem, AiConfig, Folder, ChatMessage, ChatSession, AppState } from '../types';

export const useAppState = () => {
    const [language, setLanguage] = useLocalStorage<Language>('appLanguage', 'en');
    const [theme, setTheme] = useLocalStorage<Theme>('appTheme', 'slate');
    const [promptHistory, setPromptHistory] = useLocalStorage<HistoryItem[]>('promptHistory', []);
    const [folders, setFolders] = useLocalStorage<Folder[]>('promptFolders', []);
    const [aiConfigs, setAiConfigs] = useLocalStorage<AiConfig[]>('aiConfigs', []);
    const [activeAiConfigId, setActiveAiConfigId] = useLocalStorage<string>('activeAiConfigId', DEFAULT_AI_CONFIG_ID);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [selectedStyleId, setSelectedStyleId] = useState<string>(PROMPT_STYLES[0].id);
    const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>(PROMPT_TECHNIQUES[0].id);
    const [customizations, setCustomizations] = useState<Customizations>({
        tone: TONES[0],
        format: FORMATS[0],
        length: LENGTHS[1],
    });
    const [generatedPrompt, setGeneratedPrompt] = useState<PromptObject | null>(null);
    const [currentPromptHistoryId, setCurrentPromptHistoryId] = useState<string | null>(null);

    // Technique-specific state
    const [fewShotExamples, setFewShotExamples] = useState<{ input: string; output: string }[]>([{ input: '', output: '' }]);
    const [ragContext, setRagContext] = useState<string>('');
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
    const [editingAiConfig, setEditingAiConfig] = useState<AiConfig | null>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatSystemPrompt, setChatSystemPrompt] = useState('');
    const [testingHistoryItemId, setTestingHistoryItemId] = useState<string | null>(null);

    // Reset technique-specific state when technique changes
    useEffect(() => {
        if (selectedTechniqueId !== 'few-shot') {
            setFewShotExamples([{ input: '', output: '' }]);
        }
        if (selectedTechniqueId !== 'rag') {
            setRagContext('');
        }
    }, [selectedTechniqueId]);
    
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let result: any = translations[language];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }
        return result || key;
    }, [language]);

    const selectedCategory = useMemo(() => CATEGORIES.find(c => c.id === selectedCategoryId), [selectedCategoryId]);
    const selectedGoal = useMemo(() => {
        if (selectedGoalId === 'custom') {
            return { id: 'custom', nameKey: 'goals.custom.name', descriptionKey: 'goals.custom.description', inputFields: [] };
        }
        return selectedCategory?.goals.find(g => g.id === selectedGoalId);
    }, [selectedCategory, selectedGoalId]);

    const isFormValid = useMemo(() => {
        if (!selectedGoal) return false;
        if (selectedGoal.id === 'custom') {
            return !!(formData.custom_target?.trim() && formData.custom_tasks?.trim());
        }
        return selectedGoal.inputFields.every(field => {
            if (!field.required) return true;
            return formData[field.id] && formData[field.id].trim() !== '';
        });
    }, [selectedGoal, formData]);
    
    const generatePromptObject = useCallback((): PromptObject | null => {
        const selectedStyle = PROMPT_STYLES.find(s => s.id === selectedStyleId);
        if (!selectedGoal || !selectedStyle || !selectedCategory) return null;

        let task: string;
        let context: { label: string; value: string }[] = [];
        let role: string;

        if (selectedGoal.id === 'custom') {
            role = `You are to act as or respond to the following target: **${formData.custom_target || t('roles.default')}**.`;
            task = `Your task is to perform the following objectives:\n\n${formData.custom_tasks || ''}`;
            if (formData.custom_context && formData.custom_context.trim() !== '') {
                context.push({ label: t('fields.custom_context.label'), value: formData.custom_context });
            }
        } else {
            task = `Your task is to ${t(selectedGoal.descriptionKey).toLowerCase().replace('.', '')}.`;
            context = selectedGoal.inputFields
                .filter(field => formData[field.id])
                .map(field => ({ label: t(field.labelKey), value: formData[field.id] }));

            const roleMap: { [key: string]: string } = {
                'marketing': t('roles.marketing'),
                'programming': t('roles.programming'),
                'creative': t('roles.creative'),
                'academic': t('roles.academic'),
            };
            role = `You are ${roleMap[selectedCategory.id] || t('roles.default')}.`;
        }

        const customizationsList = [
            { label: t('customizations.tone'), value: customizations.tone },
            { label: t('customizations.format'), value: customizations.format },
            { label: t('customizations.length'), value: customizations.length },
        ];

        const technique = PROMPT_TECHNIQUES.find(t => t.id === selectedTechniqueId);
        let techniqueData: PromptObject['technique'] | undefined = undefined;

        if (technique) {
            const instructionKey = `techniques.${technique.id}.instruction`;
            const translatedInstruction = t(instructionKey);
            techniqueData = {
                name: t(technique.nameKey),
                instruction: translatedInstruction !== instructionKey ? translatedInstruction : '',
            };

            if (technique.id === 'few-shot') {
                techniqueData.examples = fewShotExamples.filter(ex => ex.input.trim() !== '' && ex.output.trim() !== '');
            }
            if (technique.id === 'rag' && ragContext.trim() !== '') {
                techniqueData.ragContext = ragContext;
            }
        }

        return { role, task, context, style: { name: t(selectedStyle.nameKey), instruction: t(selectedStyle.descriptionKey) }, customizations: customizationsList, technique: techniqueData };
    }, [selectedGoal, selectedStyleId, formData, customizations, selectedCategory, selectedTechniqueId, t, fewShotExamples, ragContext]);


    // Actions
    const resetFlow = () => {
        setFormData({});
        setGeneratedPrompt(null);
        setAiSuggestion(null);
        setCurrentPromptHistoryId(null);
        setFewShotExamples([{ input: '', output: '' }]);
        setRagContext('');
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedGoalId(null);
        resetFlow();
    };

    const handleGoalSelect = (goalId: string) => {
        setSelectedGoalId(goalId);
        resetFlow();
    };
    
    const handleFormChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerateClick = (promptObj: PromptObject) => {
        if (selectedGoal && selectedCategoryId && selectedGoalId) {
            setGeneratedPrompt(promptObj);
            setAiSuggestion(null);

            const newHistoryItem: HistoryItem = {
                id: new Date().toISOString(),
                timestamp: Date.now(),
                customName: generateHistoryItemName(selectedGoal, formData, t),
                goalNameKey: selectedGoal.nameKey,
                promptObject: promptObj,
                generatorState: {
                    selectedCategoryId,
                    selectedGoalId,
                    formData,
                    selectedStyleId,
                    selectedTechniqueId,
                    customizations,
                    fewShotExamples,
                    ragContext,
                }
            };
            setPromptHistory(prev => [newHistoryItem, ...prev]);
            setCurrentPromptHistoryId(newHistoryItem.id);
        }
    };

    const handleLoadFromHistory = (item: HistoryItem) => {
        const { generatorState } = item;
        setSelectedCategoryId(generatorState.selectedCategoryId);
        setSelectedGoalId(generatorState.selectedGoalId);
        setFormData(generatorState.formData);
        setSelectedStyleId(generatorState.selectedStyleId);
        setSelectedTechniqueId(generatorState.selectedTechniqueId);
        setCustomizations(generatorState.customizations);
        setFewShotExamples(generatorState.fewShotExamples || [{ input: '', output: '' }]);
        setRagContext(generatorState.ragContext || '');
        setGeneratedPrompt(item.promptObject);
        setAiSuggestion(null);
        setCurrentPromptHistoryId(item.id);
        window.scrollTo(0, 0);
        setIsSidebarOpen(false);
    };

    const handleDeleteFromHistory = (id: string) => {
        setPromptHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleRenameHistoryItem = (id: string, newName: string) => {
        setPromptHistory(prev => prev.map(item => item.id === id ? { ...item, customName: newName } : item));
    };

    const handleClearHistory = () => {
        if (window.confirm(t('buttons.clearAllConfirm'))) {
            setPromptHistory([]);
        }
    };

    // Folder Handlers
    const handleAddFolder = () => {
        const newFolderName = t('history.addFolder');
        const newFolder: Folder = {
            id: new Date().toISOString(),
            name: `${newFolderName} ${folders.filter(f => f.name.startsWith(newFolderName)).length + 1}`,
        };
        setFolders(prev => [...prev, newFolder]);
    };

    const handleRenameFolder = (id: string, newName: string) => {
        setFolders(prev => prev.map(folder => folder.id === id ? { ...folder, name: newName } : folder));
    };

    const handleDeleteFolder = (id: string) => {
        setPromptHistory(prev => prev.map(item => item.folderId === id ? { ...item, folderId: undefined } : item));
        setFolders(prev => prev.filter(folder => folder.id !== id));
    };

    const handleMoveItemToFolder = (itemId: string, folderId: string | 'uncategorized') => {
        const targetFolderId = folderId === 'uncategorized' ? undefined : folderId;
        setPromptHistory(prev => prev.map(item => item.id === itemId ? { ...item, folderId: targetFolderId } : item));
    };
    
    // AI Config Handlers
    const handleSaveAiConfig = (config: AiConfig) => {
        const exists = aiConfigs.some(c => c.id === config.id);
        if (exists) {
            setAiConfigs(aiConfigs.map(c => c.id === config.id ? config : c));
        } else {
            setAiConfigs([...aiConfigs, config]);
        }
        setIsAiConfigModalOpen(false);
    };

    const handleDeleteAiConfig = (id: string) => {
        setAiConfigs(aiConfigs.filter(c => c.id !== id));
        if (activeAiConfigId === id) {
            setActiveAiConfigId(DEFAULT_AI_CONFIG_ID);
        }
    };

    const handleAddNewAiConfig = () => {
        setEditingAiConfig(null);
        setIsAiConfigModalOpen(true);
    };

    const handleEditAiConfig = (config: AiConfig) => {
        setEditingAiConfig(config);
        setIsAiConfigModalOpen(true);
    };

    // Chat Test Handlers
    const handleOpenChatTest = (historyId: string, promptText: string) => {
        setChatSystemPrompt(promptText);
        setTestingHistoryItemId(historyId);
        setIsChatModalOpen(true);
    };

    const handleSaveChat = (messages: ChatMessage[]) => {
        if (!testingHistoryItemId) return;
        
        setPromptHistory(prev => prev.map(item => {
            if (item.id === testingHistoryItemId) {
                const newSession: ChatSession = {
                    id: new Date().toISOString(),
                    timestamp: Date.now(),
                    messages: messages,
                };
                const updatedSessions = item.chatSessions ? [...item.chatSessions, newSession] : [newSession];
                return { ...item, chatSessions: updatedSessions };
            }
            return item;
        }));
    };

    return {
        state: {
            language,
            theme,
            promptHistory,
            folders,
            aiConfigs,
            activeAiConfigId,
            selectedCategoryId,
            selectedGoalId,
            formData,
            selectedStyleId,
            selectedTechniqueId,
            customizations,
            generatedPrompt,
            currentPromptHistoryId,
            fewShotExamples,
            ragContext,
            aiSuggestion,
            isSidebarOpen,
            isImportModalOpen,
            isAiConfigModalOpen,
            editingAiConfig,
            isChatModalOpen,
            chatSystemPrompt,
        } as AppState,
        t,
        actions: {
            setLanguage,
            setTheme,
            setPromptHistory,
            setFolders,
            setAiConfigs,
            setActiveAiConfigId,
            setSelectedCategoryId,
            setSelectedGoalId,
            setFormData,
            setSelectedStyleId,
            setSelectedTechniqueId,
            setCustomizations,
            setGeneratedPrompt,
            setCurrentPromptHistoryId,
            setFewShotExamples,
            setRagContext,
            setAiSuggestion,
            setIsSidebarOpen,
            setIsImportModalOpen,
            setIsAiConfigModalOpen,
            setEditingAiConfig,
            setIsChatModalOpen,
            setChatSystemPrompt,
            handleCategorySelect,
            handleGoalSelect,
            handleFormChange,
            handleGenerateClick,
            handleLoadFromHistory,
            handleDeleteFromHistory,
            handleRenameHistoryItem,
            handleClearHistory,
            handleAddFolder,
            handleRenameFolder,
            handleDeleteFolder,
            handleMoveItemToFolder,
            handleSaveAiConfig,
            handleDeleteAiConfig,
            handleAddNewAiConfig,
            handleEditAiConfig,
            handleOpenChatTest,
            handleSaveChat,
        },
        computed: {
            selectedCategory,
            selectedGoal,
            isFormValid,
            generatePromptObject
        }
    };
};
