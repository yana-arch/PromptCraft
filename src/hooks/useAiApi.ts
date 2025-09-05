import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { extractJsonFromString } from '../lib/utils';
import { DEFAULT_AI_CONFIG_ID } from '../constants';
import type { PromptObject, HistoryItem, AiConfig, AppState } from '../types';

export const useAiApi = (
    t: (key: string) => string,
    activeAiConfigId: string,
    aiConfigs: AiConfig[],
    setGeneratedPrompt: (prompt: PromptObject | null) => void,
    setAiSuggestion: (suggestion: string | null) => void,
    setPromptHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>,
    setCurrentPromptHistoryId: (id: string | null) => void,
    setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
    const [isImproving, setIsImproving] = useState(false);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

    const handleGenerateCustomTasks = async (formData: Record<string, string>) => {
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
                const content = data.choices[0]?.message?.content;
                
                if (typeof content !== 'string' || !content.trim()) {
                    throw new Error(t('errors.noSuggestion'));
                }
                generatedTasks = content;
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

    const callAiImprovementApi = async (promptText: string) => {
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
            return JSON.parse(jsonString);

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
            return JSON.parse(jsonString);
        }
    };

    const handleImproveWithAi = async (promptObj: PromptObject, generatorState: AppState) => {
        setIsImproving(true);
        setAiSuggestion(null);

        const currentPromptText = extractJsonFromString(JSON.stringify(promptObj, null, 2)) || '';

        try {
            const parsed = await callAiImprovementApi(currentPromptText);
            const { namePrompt: suggestionName, mainContentPrompt: suggestionText } = parsed;

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
                    selectedCategoryId: generatorState.selectedCategoryId!,
                    selectedGoalId: generatorState.selectedGoalId!,
                    formData: generatorState.formData,
                    selectedStyleId: generatorState.selectedStyleId,
                    selectedTechniqueId: generatorState.selectedTechniqueId,
                    customizations: generatorState.customizations,
                    fewShotExamples: generatorState.fewShotExamples,
                    ragContext: generatorState.ragContext,
                }
            };
            setPromptHistory(prev => [newHistoryItem, ...prev]);
            setCurrentPromptHistoryId(newHistoryItem.id);

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

    const handleImproveImportedPrompt = async (promptText: string, closeModal: () => void) => {
        if (!promptText.trim()) return;

        closeModal();
        setIsImproving(true);
        setAiSuggestion(null);
        setGeneratedPrompt(null);
        window.scrollTo(0, document.body.scrollHeight);

        try {
            const parsed = await callAiImprovementApi(promptText);
            const { namePrompt: suggestionName, mainContentPrompt: suggestionText } = parsed;

            setAiSuggestion(suggestionText);

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
            setCurrentPromptHistoryId(aiHistoryItem.id);

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

    return {
        aiState: {
            isImproving,
            isGeneratingTasks,
        },
        aiActions: {
            handleGenerateCustomTasks,
            handleImproveWithAi,
            handleImproveImportedPrompt,
        }
    };
};
