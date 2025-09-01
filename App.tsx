

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, PROMPT_STYLES, TONES, FORMATS, LENGTHS, PROMPT_TECHNIQUES, CUSTOM_GOAL_FIELDS } from './constants';
import { translations } from './translations';
import type { Category, Goal, Customizations, PromptObject, HistoryItem, AiConfig, Folder } from './types';

type Language = 'en' | 'vi';

// Helper function to convert a string to title case
const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const DEFAULT_AI_CONFIG_ID = 'default-gemini';

// FIX: Converted AiSuggestionIcon to a functional component.
// It was defined as a JSX element but used as a component (<AiSuggestionIcon />), causing a type error.
const AiSuggestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a2.25 2.25 0 01-1.423-1.423L12.25 18.5l1.938-.648a2.25 2.25 0 011.423-1.423L17.75 15.75l.648 1.938a2.25 2.25 0 011.423 1.423L21.75 19.5l-1.938.648a2.25 2.25 0 01-1.423 1.423z" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);


const extractJsonFromString = (str: string): string | null => {
  const match = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1];
  }
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return str.substring(firstBrace, lastBrace + 1);
  }
  return null;
};

const generateHistoryItemName = (goal: Goal | { id: string; nameKey: string }, formData: Record<string, string>, t: (key: string) => string): string => {
    let name = t(goal.nameKey);
    let detail = '';

    switch (goal.id) {
        case 'facebook-post':
            detail = formData.product;
            break;
        case 'seo-plan':
            detail = formData.keyword;
            break;
        case 'explain-code':
        case 'write-docs':
            detail = formData.language;
            break;
        case 'git-commit':
            detail = formData['commit-type'];
            break;
        case 'pr-description':
            detail = formData['pr-title'];
            break;
        case 'story-idea':
            detail = formData.genre;
            break;
        case 'summarize-text':
            detail = formData.focus || t('history.textSummary');
            break;
        case 'custom':
            detail = formData.custom_target;
            break;
    }

    if (detail && detail.trim() !== '') {
        const truncatedDetail = detail.length > 30 ? `${detail.substring(0, 30)}...` : detail;
        return `${name}: ${truncatedDetail}`;
    }
    return name;
};


// Main App Component
export default function App() {
  const [language, setLanguage] = useState<Language>('en');
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
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // State for dynamic technique UI
  const [fewShotExamples, setFewShotExamples] = useState<{input: string; output: string}[]>([{ input: '', output: '' }]);
  const [ragContext, setRagContext] = useState<string>('');
  
  // AI Improvement State
  const [isImproving, setIsImproving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);


  // AI Configuration State
  const [aiConfigs, setAiConfigs] = useState<AiConfig[]>([]);
  const [activeAiConfigId, setActiveAiConfigId] = useState<string>(DEFAULT_AI_CONFIG_ID);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
  const [editingAiConfig, setEditingAiConfig] = useState<AiConfig | null>(null);

  // Reset technique-specific state when technique changes
  useEffect(() => {
    if (selectedTechniqueId !== 'few-shot') {
        setFewShotExamples([{ input: '', output: '' }]);
    }
    if (selectedTechniqueId !== 'rag') {
        setRagContext('');
    }
  }, [selectedTechniqueId]);


  // Load history and settings from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('promptHistory');
      if (storedHistory) setPromptHistory(JSON.parse(storedHistory));
      
      const storedFolders = localStorage.getItem('promptFolders');
      if (storedFolders) setFolders(JSON.parse(storedFolders));

      const storedConfigs = localStorage.getItem('aiConfigs');
      if(storedConfigs) setAiConfigs(JSON.parse(storedConfigs));

      const storedActiveConfigId = localStorage.getItem('activeAiConfigId');
      if(storedActiveConfigId) setActiveAiConfigId(storedActiveConfigId);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
      localStorage.setItem('promptFolders', JSON.stringify(folders));
      localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs));
      localStorage.setItem('activeAiConfigId', activeAiConfigId);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [promptHistory, folders, aiConfigs, activeAiConfigId]);

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
  const selectedStyle = useMemo(() => PROMPT_STYLES.find(s => s.id === selectedStyleId), [selectedStyleId]);

  const resetFlow = () => {
    setFormData({});
    setGeneratedPrompt(null);
    setAiSuggestion(null);
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

    return {
        role,
        task,
        context,
        style: { name: t(selectedStyle.nameKey), instruction: t(selectedStyle.descriptionKey) },
        customizations: customizationsList,
        technique: techniqueData
    };
  }, [selectedGoal, selectedStyle, formData, customizations, selectedCategory, selectedTechniqueId, t, fewShotExamples, ragContext]);

  const handleGenerateClick = () => {
      const promptObj = generatePromptObject();
      if (promptObj && selectedGoal && selectedCategoryId && selectedGoalId) {
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
      }
  };
  
   const handleGenerateCustomTasks = async () => {
    if (!formData.custom_target || !formData.custom_target.trim()) {
        alert(t('errors.targetRequiredForAssist'));
        return;
    }

    setIsGeneratingTasks(true);
    
    const systemInstruction = `You are an expert prompt engineer. Your job is to help users flesh out their prompt ideas.`;
    const userPrompt = `I am creating a prompt.
**The target for the prompt is:**
${formData.custom_target}

**Here is some background context/documentation:**
${formData.custom_context || "No additional context provided."}

Based on the target and context, generate a clear, structured, and actionable list of tasks for the prompt to perform.
- The tasks should be suitable for the specified target.
- List the tasks clearly, for example, using a numbered list.
- Return ONLY the list of tasks, without any introductory phrases like "Here is a list of tasks:".`;

    try {
        let generatedTasks = '';

        if (activeAiConfigId === DEFAULT_AI_CONFIG_ID) {
            const apiKey = process.env.API_KEY as string;
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction },
            });
            generatedTasks = response.text;
        } else {
            const activeConfig = aiConfigs.find(c => c.id === activeAiConfigId);
            if (!activeConfig || !activeConfig.baseURL || !activeConfig.modelId) {
                throw new Error(t('settings.customConfigMissing'));
            }

            const endpoint = `${activeConfig.baseURL.replace(/\/$/, '')}/chat/completions`;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (activeConfig.apiKey) {
                headers['Authorization'] = `Bearer ${activeConfig.apiKey}`;
            }

            const body = JSON.stringify({
                model: activeConfig.modelId,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userPrompt },
                ]
            });

            const response = await fetch(endpoint, { method: 'POST', headers, body });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`${t('errors.apiError')} ${response.status}: ${errorBody}`);
            }
            const data = await response.json();
            generatedTasks = data.choices[0]?.message?.content;
            if (!generatedTasks) {
                throw new Error(t('errors.noSuggestion'));
            }
        }
        
        setFormData(prev => ({
            ...prev,
            custom_tasks: (prev.custom_tasks ? prev.custom_tasks + '\n' : '') + generatedTasks.trim()
        }));

    } catch (error) {
        console.error("Error generating tasks with AI:", error);
        alert(`${t('errors.assistFailed')} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGeneratingTasks(false);
    }
  };


  const handleImproveWithAi = async () => {
    const promptObj = generatePromptObject();
    if (!promptObj || !selectedCategoryId || !selectedGoalId) return;

    setIsImproving(true);
    setAiSuggestion(null);
    
    const currentPromptText = buildTextPrompt(promptObj, t);
    const systemInstruction = `You are a world-class prompt engineering expert. Your task is to analyze and improve a user-provided prompt. You must respond with a JSON object containing two keys: "namePrompt" (a concise, descriptive title for the improved prompt) and "mainContentPrompt" (the full, rewritten prompt text).`;
    const userPrompt = `Analyze and improve the following prompt. Provide a concise title for it as well.

**Original Prompt:**
---
${currentPromptText}
---

**Your Instructions:**
1. Do not fulfill the user's original prompt. Instead, rewrite the prompt itself to be more effective.
2. Create a short, descriptive title for the new prompt (e.g., "Content Plan for Urban Gardening SEO").
3. Return a single, valid JSON object with the structure: {"namePrompt": "...", "mainContentPrompt": "..."}.
4. Do not include any text, notes, or markdown formatting outside of the JSON object itself.`;
      
    try {
      let suggestionText = '';
      let suggestionName = t('history.aiImprovedPrompt');

      const responseSchema = {
          type: Type.OBJECT,
          properties: {
            namePrompt: { type: Type.STRING, description: "A concise, descriptive title for the improved prompt." },
            mainContentPrompt: { type: Type.STRING, description: "The full, rewritten and improved prompt text." },
          },
          required: ["namePrompt", "mainContentPrompt"],
      };

      if (activeAiConfigId === DEFAULT_AI_CONFIG_ID) {
        const apiKey = process.env.API_KEY as string;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { 
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        
        const rawResponse = response.text;
        const jsonString = extractJsonFromString(rawResponse) || rawResponse;
        const parsed = JSON.parse(jsonString);
        suggestionName = parsed.namePrompt;
        suggestionText = parsed.mainContentPrompt;

      } else { 
        const activeConfig = aiConfigs.find(c => c.id === activeAiConfigId);
        if (!activeConfig || !activeConfig.baseURL || !activeConfig.modelId) {
            throw new Error(t('settings.customConfigMissing'));
        }

        const endpoint = `${activeConfig.baseURL.replace(/\/$/, '')}/chat/completions`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (activeConfig.apiKey) {
            headers['Authorization'] = `Bearer ${activeConfig.apiKey}`;
        }
        
        // Try to request JSON format from OpenAI-compatible APIs
        const body = JSON.stringify({
            model: activeConfig.modelId,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: "json_object" },
        });
        
        const response = await fetch(endpoint, { method: 'POST', headers, body }).catch(err => {
            throw new Error(`${t('errors.networkError')}: ${err.message}`);
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error(t('errors.authFailed'));
            if (response.status === 404) throw new Error(t('errors.endpointNotFound'));
            const errorBody = await response.text();
            throw new Error(`${t('errors.apiError')} ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content;
        if (!rawContent) {
            throw new Error(t('errors.noSuggestion'));
        }
        
        const jsonString = extractJsonFromString(rawContent) || rawContent;
        const parsed = JSON.parse(jsonString);
        suggestionName = parsed.namePrompt;
        suggestionText = parsed.mainContentPrompt;
      }
      
      setAiSuggestion(suggestionText);

      const aiPromptObject: PromptObject = {
          isAiSuggestion: true,
          role: '',
          task: suggestionText,
          context: [],
          customizations: [],
      };

      const newHistoryItem: HistoryItem = {
          id: new Date().toISOString() + '-ai',
          timestamp: Date.now(),
          customName: suggestionName,
          goalNameKey: 'history.aiImprovedPrompt',
          promptObject: aiPromptObject,
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

    } catch (error) {
        console.error("Error calling AI for improvement:", error);
        let errorMessage = t('errors.improveFailed');
        if (error instanceof SyntaxError) {
            errorMessage += ` ${t('errors.jsonParseFailed')}`;
        } else if (error instanceof Error) {
            errorMessage += ` ${error.message}`;
        } else {
            errorMessage += ` ${String(error)}`;
        }
        setAiSuggestion(errorMessage);
    } finally {
        setIsImproving(false);
    }
  };

  const handleImproveImportedPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    setIsImportModalOpen(false);
    setIsImproving(true);
    setAiSuggestion(null);
    setGeneratedPrompt(null);
    window.scrollTo(0, document.body.scrollHeight);
    
    const originalPromptObject: PromptObject = {
        role: t('history.importedPromptRole'),
        task: promptText,
        context: [],
        customizations: [],
    };
    const originalHistoryItem: HistoryItem = {
        id: new Date().toISOString() + '-imported',
        timestamp: Date.now(),
        customName: t('history.importedPrompt'),
        goalNameKey: 'history.importedPrompt',
        promptObject: originalPromptObject,
        generatorState: {
            selectedCategoryId: 'custom',
            selectedGoalId: 'custom',
            formData: {},
            selectedStyleId: '',
            selectedTechniqueId: '',
            customizations: { tone: '', format: '', length: '' },
        }
    };

    const systemInstruction = `You are a world-class prompt engineering expert. Your task is to analyze and improve a user-provided prompt. You must respond with a JSON object containing two keys: "namePrompt" (a concise, descriptive title for the improved prompt) and "mainContentPrompt" (the full, rewritten prompt text).`;
    const userPrompt = `Analyze and improve the following prompt. Provide a concise title for it as well.

**Original Prompt:**
---
${promptText}
---

**Your Instructions:**
1. Do not fulfill the user's original prompt. Instead, rewrite the prompt itself to be more effective.
2. Create a short, descriptive title for the new prompt (e.g., "Content Plan for Urban Gardening SEO").
3. Return a single, valid JSON object with the structure: {"namePrompt": "...", "mainContentPrompt": "..."}.
4. Do not include any text, notes, or markdown formatting outside of the JSON object itself.`;
      
    try {
      let suggestionText = '';
      let suggestionName = t('history.aiImprovedPrompt');

      const responseSchema = {
          type: Type.OBJECT,
          properties: {
            namePrompt: { type: Type.STRING, description: "A concise, descriptive title for the improved prompt." },
            mainContentPrompt: { type: Type.STRING, description: "The full, rewritten and improved prompt text." },
          },
          required: ["namePrompt", "mainContentPrompt"],
      };

      if (activeAiConfigId === DEFAULT_AI_CONFIG_ID) {
        const apiKey = process.env.API_KEY as string;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { 
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        
        const rawResponse = response.text;
        const jsonString = extractJsonFromString(rawResponse) || rawResponse;
        const parsed = JSON.parse(jsonString);
        suggestionName = parsed.namePrompt;
        suggestionText = parsed.mainContentPrompt;

      } else { 
        const activeConfig = aiConfigs.find(c => c.id === activeAiConfigId);
        if (!activeConfig || !activeConfig.baseURL || !activeConfig.modelId) {
            throw new Error(t('settings.customConfigMissing'));
        }
        const endpoint = `${activeConfig.baseURL.replace(/\/$/, '')}/chat/completions`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (activeConfig.apiKey) {
            headers['Authorization'] = `Bearer ${activeConfig.apiKey}`;
        }
        const body = JSON.stringify({
            model: activeConfig.modelId,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: "json_object" },
        });
        const response = await fetch(endpoint, { method: 'POST', headers, body });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`${t('errors.apiError')} ${response.status}: ${errorBody}`);
        }
        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content;
        if (!rawContent) throw new Error(t('errors.noSuggestion'));
        
        const jsonString = extractJsonFromString(rawContent) || rawContent;
        const parsed = JSON.parse(jsonString);
        suggestionName = parsed.namePrompt;
        suggestionText = parsed.mainContentPrompt;
      }
      
      setAiSuggestion(suggestionText);

      const aiPromptObject: PromptObject = {
          isAiSuggestion: true,
          role: '',
          task: suggestionText,
          context: [],
          customizations: [],
      };

      const aiHistoryItem: HistoryItem = {
          id: new Date().toISOString() + '-ai-imported',
          timestamp: Date.now(),
          customName: `${suggestionName} (${t('history.fromImport')})`,
          goalNameKey: 'history.aiImprovedPrompt',
          promptObject: aiPromptObject,
          generatorState: { ...originalHistoryItem.generatorState, ragContext: promptText }
      };
      setPromptHistory(prev => [aiHistoryItem, originalHistoryItem, ...prev]);

    } catch (error) {
        console.error("Error calling AI for improvement:", error);
        let errorMessage = t('errors.improveFailed');
        if (error instanceof SyntaxError) {
            errorMessage += ` ${t('errors.jsonParseFailed')}`;
        } else if (error instanceof Error) {
            errorMessage += ` ${error.message}`;
        }
        setAiSuggestion(errorMessage);
    } finally {
        setIsImproving(false);
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
        setPromptHistory([]);
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

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex">
       <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          t={t}
          // History Props
          history={promptHistory}
          categories={CATEGORIES}
          onLoadHistory={handleLoadFromHistory}
          onDeleteHistory={handleDeleteFromHistory}
          onClearHistory={handleClearHistory}
          onRenameHistory={handleRenameHistoryItem}
          // Folder Props
          folders={folders}
          onAddFolder={handleAddFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onMoveItemToFolder={handleMoveItemToFolder}
          // AI Config Props
          aiConfigs={aiConfigs}
          activeAiConfigId={activeAiConfigId}
          onSetActiveAiConfig={setActiveAiConfigId}
          onAddAiConfig={handleAddNewAiConfig}
          onEditAiConfig={handleEditAiConfig}
          onDeleteAiConfig={handleDeleteAiConfig}
       />

      <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Header t={t} language={language} onLangChange={setLanguage} onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            <WizardStep title={t('steps.step1')} isComplete={!!selectedCategoryId}>
            <CategorySelector selectedId={selectedCategoryId} onSelect={handleCategorySelect} t={t} />
            </WizardStep>
            
            {selectedCategory && (
            <WizardStep title={t('steps.step2')} isComplete={!!selectedGoalId}>
                <GoalSelector category={selectedCategory} selectedId={selectedGoalId} onSelect={handleGoalSelect} t={t} />
            </WizardStep>
            )}

            {selectedGoal && (
            <>
                <WizardStep title={selectedGoal.id === 'custom' ? t('steps.step3Custom') : t('steps.step3')} isComplete={isFormValid}>
                {selectedGoal.id === 'custom' ? (
                    <InputForm 
                        goal={{
                            id: 'custom', 
                            nameKey: 'goals.custom.name',
                            descriptionKey: 'goals.custom.description',
                            inputFields: CUSTOM_GOAL_FIELDS
                        }} 
                        formData={formData} 
                        onChange={handleFormChange} 
                        t={t} 
                        onGenerateTasks={handleGenerateCustomTasks}
                        isGeneratingTasks={isGeneratingTasks}
                    />
                ) : (
                    <InputForm goal={selectedGoal as Goal} formData={formData} onChange={handleFormChange} t={t} />
                )}
                </WizardStep>

                <WizardStep title={t('steps.step4')} isComplete={true}>
                <div className="space-y-6">
                    <StyleSelector 
                        title={t('styles.title')}
                        options={PROMPT_STYLES}
                        selectedId={selectedStyleId} 
                        onSelect={setSelectedStyleId} 
                        t={t}
                    />
                    <div>
                        <StyleSelector 
                            title={t('techniques.title')}
                            options={PROMPT_TECHNIQUES}
                            selectedId={selectedTechniqueId} 
                            onSelect={setSelectedTechniqueId} 
                            t={t}
                        />
                        {selectedTechniqueId === 'few-shot' && (
                            <FewShotEditor examples={fewShotExamples} setExamples={setFewShotExamples} t={t} />
                        )}
                        {selectedTechniqueId === 'rag' && (
                            <RAGContextEditor context={ragContext} setContext={setRagContext} t={t} />
                        )}
                    </div>
                    <CustomizationPanel customizations={customizations} onChange={setCustomizations} t={t} />
                </div>
                </WizardStep>

                <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleGenerateClick}
                    disabled={!isFormValid}
                    className={`w-full md:w-auto disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 ${isFormValid ? 'animate-pulse' : ''}`}
                >
                    {t('buttons.buildPrompt')}
                </button>
                <Tooltip text={t('output.aiSuggestionTooltip')}>
                    <button
                        onClick={handleImproveWithAi}
                        disabled={!isFormValid || isImproving}
                        className="w-full md:w-auto flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    >
                        {isImproving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('output.aiImproving')}
                            </>
                        ) : (
                            <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8 4.586V3a1 1 0 00-1-1H5zM2 5h8v.586L6.707 8.293a1 1 0 00-1.414 0L2 5.586V5zm6 5H4v4.586l2.293-2.293a1 1 0 011.414 0L10 15.586V10zm4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H13V9h1.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            {t('buttons.improveWithAI')}
                            </>
                        )}
                    </button>
                </Tooltip>
                 <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    {t('buttons.importAndImprove')}
                </button>
                </div>
            </>
            )}
            
            {generatedPrompt && (
            <div className="mt-10">
                <PromptOutput prompt={generatedPrompt} t={t} />
            </div>
            )}

            {aiSuggestion && (
            <div className="mt-6">
                <AiSuggestionOutput suggestion={aiSuggestion} t={t} />
            </div>
            )}
        </div>
      </main>
      
      <AiConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
        onSave={handleSaveAiConfig}
        config={editingAiConfig}
        t={t}
      />

       <ImportPromptModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImprove={handleImproveImportedPrompt}
        isImproving={isImproving}
        t={t}
      />
    </div>
  );
}

// Sub-components

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  if (!text) return <>{children}</>;
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute left-0 w-max max-w-xs bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-md p-2 border border-slate-600 shadow-lg z-10">
        {text}
      </div>
    </div>
  );
};

interface HeaderProps {
    t: (key: string) => string;
    language: Language;
    onLangChange: (lang: Language) => void;
    onSidebarToggle: () => void;
}
const Header: React.FC<HeaderProps> = ({ t, language, onLangChange, onSidebarToggle }) => (
  <header className="text-center mb-10 relative">
    <div className="absolute top-0 left-0">
         <button onClick={onSidebarToggle} className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" aria-label={t('sidebar.toggle')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
    </div>
    <div className="absolute top-0 right-0 flex items-center space-x-2">
      <button onClick={() => onLangChange('en')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${language === 'en' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>EN</button>
      <button onClick={() => onLangChange('vi')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${language === 'vi' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>VI</button>
    </div>
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 pt-10 md:pt-0">
      {t('app.title')}
    </h1>
    <p className="mt-3 text-lg text-slate-400">{t('app.subtitle')}</p>
  </header>
);

interface WizardStepProps {
  title: string;
  isComplete: boolean;
  children: React.ReactNode;
}
const WizardStep: React.FC<WizardStepProps> = ({ title, isComplete, children }) => (
  <section className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
    <div className="flex items-center mb-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isComplete ? 'bg-teal-500' : 'bg-slate-600'}`}>
        {isComplete && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <h2 className="text-2xl font-bold text-slate-200">{title}</h2>
    </div>
    <div className="pl-9">{children}</div>
  </section>
);


interface CategorySelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}
const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedId, onSelect, t }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {CATEGORIES.map(cat => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${selectedId === cat.id ? 'bg-teal-500/20 border-teal-500' : 'bg-slate-700/50 border-slate-600 hover:border-teal-400 hover:bg-slate-700'}`}
      >
        <div className="mx-auto text-teal-400">{cat.icon}</div>
        <p className="mt-2 font-semibold text-slate-200">{t(cat.nameKey)}</p>
      </button>
    ))}
  </div>
);

interface GoalSelectorProps {
  category: Category;
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}
const GoalSelector: React.FC<GoalSelectorProps> = ({ category, selectedId, onSelect, t }) => {
    const goalsWithCustom = [...category.goals, { id: 'custom', nameKey: 'goals.custom.name', descriptionKey: 'goals.custom.description' }];
    return (
      <div className="space-y-3">
        {goalsWithCustom.map(goal => (
          <button
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 flex items-center ${selectedId === goal.id ? 'bg-teal-500/20 border-teal-500' : 'bg-slate-700/50 border-slate-600 hover:border-teal-400 hover:bg-slate-700'}`}
          >
            <div className={`w-3 h-3 rounded-full mr-4 ${selectedId === goal.id ? 'bg-teal-400' : 'bg-slate-500'}`}></div>
            <div>
                <h3 className="font-bold text-slate-100">{t(goal.nameKey)}</h3>
                <p className="text-sm text-slate-400">{t(goal.descriptionKey)}</p>
            </div>
          </button>
        ))}
      </div>
    );
}

interface InputFormProps {
  goal: Goal;
  formData: Record<string, string>;
  onChange: (id: string, value: string) => void;
  t: (key: string) => string;
  onGenerateTasks?: () => void;
  isGeneratingTasks?: boolean;
}
const InputForm: React.FC<InputFormProps> = ({ goal, formData, onChange, t, onGenerateTasks, isGeneratingTasks }) => (
  <div className="space-y-4">
    {goal.inputFields.map(field => (
      <div key={field.id}>
        <div className="flex justify-between items-center mb-1">
            <Tooltip text={field.tooltipKey ? t(field.tooltipKey) : ''}>
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-300 cursor-help">
                {t(field.labelKey)} {field.required && <span className="text-red-400">*</span>}
              </label>
            </Tooltip>
            {field.id === 'custom_tasks' && onGenerateTasks && (
                <Tooltip text={t('fields.custom_tasks.aiAssistTooltip')}>
                    <button
                        onClick={onGenerateTasks}
                        disabled={isGeneratingTasks || !formData.custom_target?.trim()}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors text-indigo-300 bg-indigo-900/50 hover:bg-indigo-900/80 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                         {isGeneratingTasks ? (
                             <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {t('buttons.aiGenerating')}
                             </>
                         ) : (
                             <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8 4.586V3a1 1 0 00-1-1H5zM2 5h8v.586L6.707 8.293a1 1 0 00-1.414 0L2 5.586V5zm6 5H4v4.586l2.293-2.293a1 1 0 011.414 0L10 15.586V10zm4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H13V9h1.586l-1.293-1.293a1 1 0 010-1.414z" /></svg>
                                {t('buttons.aiAssist')}
                             </>
                         )}
                    </button>
                </Tooltip>
            )}
        </div>
        {field.type === 'textarea' ? (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={t(field.placeholderKey)}
            rows={field.id === 'custom_tasks' ? 8 : 4}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        ) : (
          <input
            id={field.id}
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={t(field.placeholderKey)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        )}
      </div>
    ))}
  </div>
);

interface StyleSelectorProps {
  title: string;
  options: {id: string, nameKey: string, descriptionKey: string}[];
  selectedId: string;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}
const StyleSelector: React.FC<StyleSelectorProps> = ({ title, options, selectedId, onSelect, t }) => (
    <div>
      <h3 className="text-lg font-semibold text-slate-200 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map(style => (
          <label key={style.id} className={`flex items-start p-3 rounded-md cursor-pointer transition-all border-2 ${selectedId === style.id ? 'bg-teal-500/10 border-teal-500' : 'border-slate-700 hover:border-slate-500'}`}>
            <input type="radio" name={title} checked={selectedId === style.id} onChange={() => onSelect(style.id)} className="mt-1 h-4 w-4 text-teal-600 bg-slate-600 border-slate-500 focus:ring-teal-500" />
            <div className="ml-3 text-sm">
                <Tooltip text={t(style.descriptionKey)}>
                    <span className="font-medium text-slate-100 cursor-help">{t(style.nameKey)}</span>
                </Tooltip>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
  
interface CustomizationPanelProps {
  customizations: Customizations;
  onChange: (customizations: Customizations) => void;
  t: (key: string) => string;
}
const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customizations, onChange, t }) => {
  const handleChange = <K extends keyof Customizations,>(key: K, value: Customizations[K]) => {
    onChange({ ...customizations, [key]: value });
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">{t('customizations.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select id="tone" label={t('customizations.tone')} options={TONES} value={customizations.tone} onChange={(val) => handleChange('tone', val)} />
          <Select id="format" label={t('customizations.format')} options={FORMATS} value={customizations.format} onChange={(val) => handleChange('format', val)} />
          <Select id="length" label={t('customizations.length')} options={LENGTHS} value={customizations.length} onChange={(val) => handleChange('length', val)} />
        </div>
    </div>
  );
};

interface SelectProps {
    id: string;
    label: string;
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
}
const Select: React.FC<SelectProps> = ({ id, label, options, value, onChange}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// ################# PROMPT OUTPUT AND EXPORT #################

interface PromptOutputProps {
    prompt: PromptObject;
    t: (key: string) => string;
}
const PromptOutput: React.FC<PromptOutputProps> = ({ prompt, t }) => {
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
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-200">{t('output.title')}</h2>
        <div className="flex items-center space-x-2 flex-wrap gap-1">
           <button onClick={() => handleDownload('txt')} className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition">TXT</button>
           <button onClick={() => handleDownload('md')} className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition">MD</button>
           <button onClick={() => handleDownload('xml')} className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition">XML</button>
           <button onClick={() => handleDownload('json')} className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition">JSON</button>
           <button onClick={() => handleDownload('yaml')} className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-700 rounded hover:bg-slate-600 transition">YAML</button>
        </div>
      </div>
      <div className="relative p-4">
        <button
          onClick={handleCopy}
          className="absolute top-6 right-4 p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition"
          aria-label={t('buttons.copy')}
        >
          {copied ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          )}
        </button>
        <pre className="whitespace-pre-wrap text-slate-300 text-sm bg-slate-900/50 p-4 rounded-md overflow-x-auto">
          <code>{textPrompt}</code>
        </pre>
      </div>
    </div>
  );
};


// ################# AI SUGGESTION OUTPUT #################
interface AiSuggestionOutputProps {
    suggestion: string;
    t: (key: string) => string;
}
const AiSuggestionOutput: React.FC<AiSuggestionOutputProps> = ({ suggestion, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-indigo-900/50 rounded-xl border border-indigo-700 shadow-lg">
            <div className="p-4 border-b border-indigo-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a1 1 0 00-1 1v1.586l-2.707 2.707a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414L8 4.586V3a1 1 0 00-1-1H5zM2 5h8v.586L6.707 8.293a1 1 0 00-1.414 0L2 5.586V5zm6 5H4v4.586l2.293-2.293a1 1 0 011.414 0L10 15.586V10zm4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H13V9h1.586l-1.293-1.293a1 1 0 010-1.414z" /></svg>
                    {t('output.aiSuggestionTitle')}
                </h2>
            </div>
            <div className="relative p-4">
                <button
                    onClick={handleCopy}
                    className="absolute top-6 right-4 p-2 bg-indigo-700 rounded-md hover:bg-indigo-600 transition"
                    aria-label={t('buttons.copy')}
                >
                    {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>
                <pre className="whitespace-pre-wrap text-slate-300 text-sm bg-slate-900/50 p-4 rounded-md overflow-x-auto">
                    <code>{suggestion}</code>
                </pre>
            </div>
        </div>
    );
};

// ################# DYNAMIC TECHNIQUE EDITORS #################
interface FewShotEditorProps {
    examples: { input: string; output: string }[];
    setExamples: React.Dispatch<React.SetStateAction<{ input: string; output: string }[]>>;
    t: (key: string) => string;
}
const FewShotEditor: React.FC<FewShotEditorProps> = ({ examples, setExamples, t }) => {
    const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
        const newExamples = [...examples];
        newExamples[index][field] = value;
        setExamples(newExamples);
    };

    const addExample = () => {
        setExamples([...examples, { input: '', output: '' }]);
    };
    
    const removeExample = (index: number) => {
        if (examples.length > 1) {
            setExamples(examples.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h4 className="text-md font-semibold text-slate-300 mb-3">{t('techniques.fewShotEditorTitle')}</h4>
            <div className="space-y-4">
                {examples.map((ex, index) => (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-md border border-slate-600 relative">
                        <div className="space-y-2">
                             <div>
                                <label className="text-xs font-medium text-slate-400">{t('techniques.inputLabel')}</label>
                                <textarea 
                                    value={ex.input} 
                                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)} 
                                    placeholder={t('techniques.inputPlaceholder')}
                                    rows={2}
                                    className="w-full text-sm bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400">{t('techniques.outputLabel')}</label>
                                <textarea 
                                    value={ex.output} 
                                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)} 
                                    placeholder={t('techniques.outputPlaceholder')}
                                    rows={3}
                                    className="w-full text-sm bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition"
                                />
                            </div>
                        </div>
                         {examples.length > 1 && (
                            <button onClick={() => removeExample(index)} className="absolute -top-2 -right-2 p-1 bg-red-800/80 rounded-full text-white hover:bg-red-700">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={addExample} className="mt-4 px-3 py-1 text-sm font-semibold text-teal-300 bg-teal-900/50 rounded hover:bg-teal-900/80 transition">{t('techniques.addExample')}</button>
        </div>
    );
};

interface RAGContextEditorProps {
    context: string;
    setContext: React.Dispatch<React.SetStateAction<string>>;
    t: (key: string) => string;
}
const RAGContextEditor: React.FC<RAGContextEditorProps> = ({ context, setContext, t }) => {
    return (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
             <h4 className="text-md font-semibold text-slate-300 mb-2">{t('techniques.ragEditorTitle')}</h4>
             <textarea 
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder={t('techniques.ragContextPlaceholder')}
                rows={8}
                className="w-full text-sm bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition"
             />
        </div>
    );
};


// ################# SIDEBAR #################
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
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
const Sidebar: React.FC<SidebarProps> = (props) => {
    const { isOpen, onClose, t } = props;
    const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

    return (
        <>
            <div className={`fixed inset-y-0 left-0 w-80 bg-slate-800 border-r border-slate-700 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">{t('sidebar.title')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-slate-700">
                    <nav className="flex space-x-1 p-1" aria-label="Tabs">
                        <button onClick={() => setActiveTab('history')} className={`w-1/2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>{t('sidebar.historyTab')}</button>
                        <button onClick={() => setActiveTab('settings')} className={`w-1/2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>{t('sidebar.settingsTab')}</button>
                    </nav>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100vh-117px)]">
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
                            // FIX: Corrected typo from `props.activeConfigId` to `props.activeAiConfigId`.
                            activeConfigId={props.activeAiConfigId}
                            onSetActive={props.onSetActiveAiConfig}
                            onAdd={props.onAddAiConfig}
                            onEdit={props.onEditAiConfig}
                            onDelete={props.onDeleteAiConfig}
                            t={t}
                        />
                    )}
                </div>
            </div>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose}></div>}
        </>
    );
};


// ################# PROMPT HISTORY #################

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
const PromptHistory: React.FC<PromptHistoryProps> = ({ history, categories, onLoad, onDelete, onClear, onRename, t, folders, onAddFolder, onRenameFolder, onDeleteFolder, onMoveItemToFolder }) => {
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
                 <h3 className="text-xl font-bold text-slate-200 mb-4">{t('history.title')}</h3>
                 <p className="text-center text-slate-400 py-4">{t('history.empty')}</p>
            </section>
        )
    }
    
    return (
        <section>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-slate-300">{t('history.foldersTitle')}</h4>
                    <button onClick={onAddFolder} className="px-2 py-1 text-xs font-semibold text-teal-300 bg-teal-900/50 rounded hover:bg-teal-900/80 transition">{t('history.addFolder')}</button>
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

            <div className="flex flex-col justify-between items-start mb-4 gap-4 border-t border-slate-700 pt-4">
                 <h3 className="text-xl font-bold text-slate-200">{t('history.title')}</h3>
                 <div className="w-full flex flex-col items-center gap-2">
                    <input 
                        type="text"
                        placeholder={t('history.searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                     <select 
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
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
                    <div key={item.id} className="bg-slate-900/70 rounded-lg border border-slate-700 transition-shadow hover:shadow-md hover:border-slate-600">
                        <div className="p-3 flex items-center gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.promptObject.isAiSuggestion ? 'bg-indigo-900/50 text-indigo-400' : item.goalNameKey === 'history.importedPrompt' ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-teal-400'}`}>
                                {item.promptObject.isAiSuggestion 
                                    ? <AiSuggestionIcon /> 
                                    : item.goalNameKey === 'history.importedPrompt' 
                                        ? <ImportIcon /> 
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
                                        className="w-full bg-slate-600 border border-slate-500 rounded px-1 py-0 text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <p className={`font-semibold truncate ${item.promptObject.isAiSuggestion ? 'text-indigo-400' : 'text-slate-100'}`} title={item.customName || t(item.goalNameKey)}>
                                        {item.customName || t(item.goalNameKey)}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-2">
                                <button onClick={() => handleRenameClick(item)} className="p-1 text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                <button onClick={() => toggleExpand(item.id)} className="p-1 text-slate-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                        </div>
                        {expandedId === item.id && (
                            <div className="p-3 border-t border-slate-700 bg-black/20">
                                <pre className="whitespace-pre-wrap text-slate-300 text-xs bg-slate-800 p-2 rounded-md overflow-x-auto mb-3">
                                  <code>{buildTextPrompt(item.promptObject, t)}</code>
                                </pre>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <button onClick={() => onLoad(item)} className="px-2 py-1 text-xs font-semibold text-teal-300 bg-teal-900/50 rounded hover:bg-teal-900/80 transition">{t('buttons.load')}</button>
                                    <button onClick={() => handleCopy(item)} className="px-2 py-1 text-xs font-semibold text-cyan-300 bg-cyan-900/50 rounded hover:bg-cyan-900/80 transition">{copiedId === item.id ? t('history.copied') : t('buttons.copy')}</button>
                                    <select
                                        value={item.folderId || 'uncategorized'}
                                        onChange={(e) => onMoveItemToFolder(item.id, e.target.value)}
                                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs font-semibold text-slate-200 focus:ring-1 focus:ring-teal-500"
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
                )) : <p className="text-center text-slate-400 py-4">{t('history.noResults')}</p>}
            </div>
        </section>
    );
};


interface FolderItemProps {
    name: string;
    isActive: boolean;
    onClick: () => void;
    isEditing?: boolean;
    editingValue?: string;
    onEditingChange?: (value: string) => void;
    onRename?: () => void;
    onSaveRename?: () => void;
    onDelete?: () => void;
}
const FolderItem: React.FC<FolderItemProps> = ({ name, isActive, onClick, isEditing, editingValue, onEditingChange, onRename, onSaveRename, onDelete }) => (
    <div className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
        {isEditing ? (
            <input
                type="text"
                value={editingValue}
                onChange={(e) => onEditingChange?.(e.target.value)}
                onBlur={onSaveRename}
                onKeyDown={(e) => e.key === 'Enter' && onSaveRename?.()}
                className="w-full bg-slate-600 border border-slate-500 rounded px-1 py-0 text-sm text-slate-100"
                autoFocus
            />
        ) : (
            <button onClick={onClick} className="flex-grow text-left text-sm font-medium text-slate-300 truncate">
                {name}
            </button>
        )}
        {onRename && onDelete && !isEditing && (
            <div className="hidden group-hover:flex items-center flex-shrink-0 ml-2">
                <button onClick={onRename} className="p-1 text-slate-400 hover:text-white" title="Rename Folder"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-400" title="Delete Folder"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
            </div>
        )}
    </div>
);


// ################# AI CONFIGURATION MANAGER #################

interface AiConfigurationManagerProps {
    configs: AiConfig[];
    activeConfigId: string;
    onSetActive: (id: string) => void;
    onAdd: () => void;
    onEdit: (config: AiConfig) => void;
    onDelete: (id: string) => void;
    t: (key: string) => string;
}
const AiConfigurationManager: React.FC<AiConfigurationManagerProps> = ({ configs, activeConfigId, onSetActive, onAdd, onEdit, onDelete, t}) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-200">{t('settings.title')}</h3>
                <button onClick={onAdd} className="px-3 py-1 text-sm font-semibold text-teal-300 bg-teal-900/50 rounded hover:bg-teal-900/80 transition">{t('aiConfig.add')}</button>
            </div>
            <div className="space-y-2">
                {/* Default Option */}
                <label className={`flex items-center p-3 rounded-md cursor-pointer transition-all border-2 ${activeConfigId === DEFAULT_AI_CONFIG_ID ? 'bg-teal-500/10 border-teal-500' : 'border-slate-700 hover:border-slate-500'}`}>
                    <input type="radio" name="ai-config" checked={activeConfigId === DEFAULT_AI_CONFIG_ID} onChange={() => onSetActive(DEFAULT_AI_CONFIG_ID)} className="h-4 w-4 text-teal-600 bg-slate-600 border-slate-500 focus:ring-teal-500"/>
                    <div className="ml-3 text-sm flex-grow">
                        <p className="font-medium text-slate-100">{t('settings.default')}</p>
                        <p className="text-xs text-slate-400">{t('settings.defaultDescription')}</p>
                    </div>
                </label>
                {/* Custom Configs */}
                {configs.map(config => (
                    <label key={config.id} className={`flex items-center p-3 rounded-md cursor-pointer transition-all border-2 ${activeConfigId === config.id ? 'bg-indigo-500/10 border-indigo-500' : 'border-slate-700 hover:border-slate-500'}`}>
                        <input type="radio" name="ai-config" checked={activeConfigId === config.id} onChange={() => onSetActive(config.id)} className="h-4 w-4 text-indigo-600 bg-slate-600 border-slate-500 focus:ring-indigo-500"/>
                        <div className="ml-3 text-sm flex-grow overflow-hidden">
                            <p className="font-medium text-slate-100 truncate">{config.name || t('aiConfig.unnamed')}</p>
                            <p className="text-xs text-slate-400 truncate">{config.modelId}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                             <button onClick={(e) => {e.preventDefault(); onEdit(config)}} className="p-1 text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                             <button onClick={(e) => {e.preventDefault(); onDelete(config.id)}} className="p-1 text-slate-400 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                        </div>
                    </label>
                ))}
            </div>
        </section>
    )
}

// ################# AI CONFIG MODAL #################

interface AiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: AiConfig) => void;
    config: AiConfig | null;
    t: (key: string) => string;
}
const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose, onSave, config, t }) => {
    const [name, setName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [modelId, setModelId] = useState('');

    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testError, setTestError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(config?.name || '');
            setBaseURL(config?.baseURL || '');
            setApiKey(config?.apiKey || '');
            setModelId(config?.modelId || '');
            setTestStatus('idle');
            setTestError(null);
        }
    }, [isOpen, config]);

    if (!isOpen) return null;

    const handleSave = () => { 
        const newConfig: AiConfig = {
            id: config?.id || new Date().toISOString(),
            name, baseURL, apiKey, modelId,
        };
        onSave(newConfig); 
    };

    const handleTest = async () => {
        setTestStatus('testing');
        setTestError(null);
        try {
            if (!baseURL || !modelId) throw new Error(t('errors.testFieldsMissing'));
            
            const endpoint = `${baseURL.replace(/\/$/, '')}/chat/completions`;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: 'test' }], max_tokens: 5 })
            }).catch(err => {
                throw new Error(`${t('errors.networkError')}: ${err.message}`);
            });

            if (!response.ok) {
                 if (response.status === 401) throw new Error(t('errors.authFailed'));
                 if (response.status === 404) throw new Error(t('errors.endpointNotFound'));
                 const errorBody = await response.text();
                 throw new Error(`${t('errors.apiError')} ${response.status}: ${errorBody}`);
            }

            await response.json();
            setTestStatus('success');
        } catch (error: any) {
            setTestStatus('error');
            setTestError(error.message || t('errors.unknown'));
            console.error("Connection test failed:", error);
        }
    };

    const TestStatusMessage = () => {
        if (testStatus === 'testing') return <p className="text-sm text-yellow-400 mt-2">{t('settings.testing')}</p>;
        if (testStatus === 'success') return <p className="text-sm text-green-400 mt-2">{t('settings.testSuccess')}</p>;
        if (testStatus === 'error') return <p className="text-sm text-red-400 mt-2">{t('settings.testError')} <br/> <span className="text-slate-400 text-xs">{testError}</span></p>;
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-slate-800 rounded-xl border border-slate-700 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">{config ? t('aiConfig.editTitle') : t('aiConfig.addTitle')}</h2>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label htmlFor="configName" className="block text-sm font-medium text-slate-300 mb-1">{t('aiConfig.nameLabel')}</label>
                        <input type="text" id="configName" value={name} onChange={e => setName(e.target.value)} placeholder={t('aiConfig.namePlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="baseURL" className="block text-sm font-medium text-slate-300 mb-1">{t('settings.customEndpoint')} <span className="text-red-400">*</span></label>
                        <input type="text" id="baseURL" value={baseURL} onChange={e => setBaseURL(e.target.value)} placeholder={t('settings.customEndpointPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-1">{t('settings.apiKey')}</label>
                        <input type="password" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={t('settings.apiKeyPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="modelId" className="block text-sm font-medium text-slate-300 mb-1">{t('settings.modelId')} <span className="text-red-400">*</span></label>
                        <input type="text" id="modelId" value={modelId} onChange={e => setModelId(e.target.value)} placeholder={t('settings.modelIdPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div>
                        <button onClick={handleTest} disabled={testStatus==='testing'} className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-600">
                            {t('settings.testConnection')}
                        </button>
                        <TestStatusMessage />
                    </div>
                </div>
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-600 hover:bg-slate-500 text-white">{t('settings.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-teal-600 hover:bg-teal-500 text-white">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    );
};

// ################# IMPORT PROMPT MODAL #################
interface ImportPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImprove: (promptText: string) => void;
    isImproving: boolean;
    t: (key: string) => string;
}
const ImportPromptModal: React.FC<ImportPromptModalProps> = ({ isOpen, onClose, onImprove, isImproving, t }) => {
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
            <div className="w-full max-w-2xl bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">{t('importModal.title')}</h2>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <button 
                        onClick={triggerFileInput}
                        className="w-full p-6 border-2 border-dashed border-slate-600 rounded-lg text-center text-slate-400 hover:border-teal-500 hover:text-teal-400 transition-colors"
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
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                </div>
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-600 hover:bg-slate-500 text-white">{t('settings.cancel')}</button>
                    <button 
                        onClick={() => onImprove(promptContent)} 
                        disabled={!promptContent.trim() || isImproving}
                        className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
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


// Prompt Building Utilities
const buildTextPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        return prompt.task;
    }

    let output = `${prompt.role} ${prompt.task}\n\n`;
    
    if (prompt.style) {
        output += `${t('output.style')}: ${prompt.style.name}. ${t('output.styleMeaning')}: ${prompt.style.instruction}\n\n`;
    }
    
    if (prompt.technique?.instruction) {
        output += `${t('output.technique')}: ${prompt.technique.name}. ${prompt.technique.instruction}\n\n`;
    }

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `EXAMPLES:\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `Example ${i + 1} Input:\n${ex.input}\n`;
            output += `Example ${i + 1} Output:\n${ex.output}\n\n`;
        });
    }

    if (prompt.technique?.ragContext) {
        output += `DOCUMENT TO USE:\n---\n${prompt.technique.ragContext}\n---\n\n`;
    }
    
    if (prompt.context.length > 0) {
        output += `${t('output.context')}:\n`;
        prompt.context.forEach(c => {
            output += `- ${c.label}: ${c.value}\n`;
        });
    }
    
    output += `\n${t('output.constraints')}:\n`;
    prompt.customizations.forEach(c => {
        output += `- ${c.label}: ${c.value}\n`;
    });

    return output;
};

const buildMarkdownPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        return prompt.task;
    }
    let output = `### ${t('output.role')}\n${prompt.role}\n\n`;
    output += `### ${t('output.task')}\n${prompt.task}\n\n`;

    if (prompt.style) {
        output += `### ${t('output.style')}: ${prompt.style.name}\n${prompt.style.instruction}\n\n`;
    }

    if (prompt.technique?.instruction) {
        output += `### ${t('output.technique')}: ${prompt.technique.name}\n${prompt.technique.instruction}\n\n`;
    }

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `### Examples\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `**Example ${i + 1} Input:**\n\`\`\`\n${ex.input}\n\`\`\`\n`;
            output += `**Example ${i + 1} Output:**\n\`\`\`\n${ex.output}\n\`\`\`\n\n`;
        });
    }

    if (prompt.technique?.ragContext) {
        output += `### Document to Use\n---\n${prompt.technique.ragContext}\n---\n\n`;
    }

    if(prompt.context.length > 0) {
        output += `### ${t('output.context')}\n`;
        prompt.context.forEach(c => {
            output += `*   **${c.label}:** ${c.value}\n`;
        });
    }

    output += `\n### ${t('output.constraints')}\n`;
    prompt.customizations.forEach(c => {
        output += `*   **${c.label}:** ${c.value}\n`;
    });

    return output;
};

const buildXmlPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });

    if (prompt.isAiSuggestion) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n  <ai_improved_prompt>\n    ${escapeXml(prompt.task)}\n  </ai_improved_prompt>\n</prompt>`;
    }

    let output = `<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n`;
    output += `  <instructions>\n`;
    output += `    <role>${escapeXml(prompt.role)}</role>\n`;
    output += `    <task>${escapeXml(prompt.task)}</task>\n`;
    if (prompt.style) {
        output += `    <style name="${escapeXml(prompt.style.name)}">${escapeXml(prompt.style.instruction)}</style>\n`;
    }
     if (prompt.technique) {
        output += `    <technique name="${escapeXml(prompt.technique.name)}">${escapeXml(prompt.technique.instruction)}</technique>\n`;
    }
    output += `  </instructions>\n`;

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `  <examples>\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `    <example number="${i + 1}">\n`;
            output += `      <input>${escapeXml(ex.input)}</input>\n`;
            output += `      <output>${escapeXml(ex.output)}</output>\n`;
            output += `    </example>\n`;
        });
        output += `  </examples>\n`;
    }

     if (prompt.technique?.ragContext) {
        output += `  <document_context>${escapeXml(prompt.technique.ragContext)}</document_context>\n`;
    }
    
    if(prompt.context.length > 0) {
      output += `  <context>\n`;
      prompt.context.forEach(c => {
          const tagName = toTitleCase(c.label).replace(/[^a-zA-Z0-9]/g, '');
          output += `    <${tagName}>${escapeXml(c.value)}</${tagName}>\n`;
      });
      output += `  </context>\n`;
    }
    
    output += `  <constraints>\n`;
    prompt.customizations.forEach(c => {
        const tagName = toTitleCase(c.label).replace(/[^a-zA-Z0-9]/g, '');
        output += `    <${tagName}>${escapeXml(c.value)}</${tagName}>\n`;
    });
    output += `  </constraints>\n`;
    
    output += `</prompt>`;
    return output;
};

const buildJsonPrompt = (prompt: PromptObject): string => {
    if (prompt.isAiSuggestion) {
        return JSON.stringify({ ai_improved_prompt: prompt.task }, null, 2);
    }
    return JSON.stringify(prompt, null, 2);
};

const buildYamlPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        const indentedText = prompt.task.split('\n').map(line => `  ${line}`).join('\n');
        return `ai_improved_prompt: |\n${indentedText}`;
    }

    const toYamlString = (value: any, indent = 0): string => {
        const indentStr = ' '.repeat(indent);
        if (Array.isArray(value)) {
            return value.map(item => `\n${indentStr}- ${toYamlString(item, indent + 2).trimStart()}`).join('');
        }
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([key, val]) => `\n${indentStr}${key}: ${toYamlString(val, indent + 2)}`).join('');
        }
        return value.toString();
    }
    let output = `role: "${prompt.role}"\n`;
    output += `task: "${prompt.task}"\n`;
    if (prompt.style) {
        output += `style:\n  name: "${prompt.style.name}"\n  instruction: "${prompt.style.instruction}"\n`;
    }
    if (prompt.technique) {
        output += `technique:\n  name: "${prompt.technique.name}"\n  instruction: "${prompt.technique.instruction}"\n`;
         if (prompt.technique.examples && prompt.technique.examples.length > 0) {
            output += `  examples:\n`;
            prompt.technique.examples.forEach(ex => {
                output += `    - input: "${ex.input.replace(/"/g, '\\"')}"\n      output: "${ex.output.replace(/"/g, '\\"')}"\n`;
            });
        }
        if (prompt.technique.ragContext) {
            const indentedContext = prompt.technique.ragContext.split('\n').map(line => `    ${line}`).join('\n');
            output += `  rag_context: |\n${indentedContext}\n`;
        }
    }
    if (prompt.context.length > 0) {
        output += `context:\n`;
        prompt.context.forEach(c => {
            output += `  - label: "${c.label}"\n    value: "${c.value}"\n`;
        });
    }
    if (prompt.customizations.length > 0) {
        output += `constraints:\n`;
        prompt.customizations.forEach(c => {
            output += `  - label: "${c.label}"\n    value: "${c.value}"\n`;
        });
    }
    return output;
};
