import type React from 'react';

export type Language = 'en' | 'vi';
export type Theme = 'slate' | 'midnight';

export interface InputField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  tooltipKey?: string;
  type: 'text' | 'textarea';
  required: boolean;
}

export interface Goal {
  id:string;
  nameKey: string;
  descriptionKey: string;
  inputFields: InputField[];
}

export interface Category {
  id: string;
  nameKey: string;
  icon: React.ReactNode;
  goals: Goal[];
}

export interface PromptStyle {
  id: string;
  nameKey: string;
  descriptionKey: string;
}

export interface Customizations {
  tone: string;
  format: string;
  length: string;
}

export interface PromptObject {
  isAiSuggestion?: boolean;
  role: string;
  task: string;
  context: { label: string; value: string }[];
  style?: { name: string; instruction: string };
  customizations: { label: string; value: string }[];
  technique?: {
    name: string;
    instruction: string;
    examples?: { input: string; output: string }[];
    ragContext?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
    id: string;
    timestamp: number;
    messages: ChatMessage[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  goalNameKey: string;
  customName?: string;
  folderId?: string;
  promptObject: PromptObject;
  chatSessions?: ChatSession[];
  generatorState: {
    selectedCategoryId: string;
    selectedGoalId: string;
    formData: Record<string, string>;
    selectedStyleId: string;
    selectedTechniqueId: string;
    customizations: Customizations;
    fewShotExamples?: { input: string; output: string }[];
    ragContext?: string;
  };
}

export interface AiConfig {
    id: string;
    name: string;
    baseURL: string;
    apiKey: string;
    modelId: string;
}

export interface Folder {
    id: string;
    name: string;
}

export interface AppState {
    language: Language;
    theme: Theme;
    promptHistory: HistoryItem[];
    folders: Folder[];
    aiConfigs: AiConfig[];
    activeAiConfigId: string;
    selectedCategoryId: string | null;
    selectedGoalId: string | null;
    formData: Record<string, string>;
    selectedStyleId: string;
    selectedTechniqueId: string;
    customizations: Customizations;
    generatedPrompt: PromptObject | null;
    currentPromptHistoryId: string | null;
    fewShotExamples: { input: string; output: string }[];
    ragContext: string;
    aiSuggestion: string | null;
    isSidebarOpen: boolean;
    isImportModalOpen: boolean;
    isAiConfigModalOpen: boolean;
    editingAiConfig: AiConfig | null;
    isChatModalOpen: boolean;
    chatSystemPrompt: string;
    chatMessages: ChatMessage[];
}
