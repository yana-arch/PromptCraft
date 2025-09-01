// FIX: Add missing import for React to resolve "Cannot find namespace 'React'" error.
import type React from 'react';

export interface InputField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  tooltipKey?: string; // Added for tooltips
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
  isAiSuggestion?: boolean; // Flag for AI-improved prompts
  role: string;
  task: string;
  context: { label: string; value: string }[];
  style?: { name: string; instruction: string };
  customizations: { label: string; value: string }[];
  technique?: {
    name: string;
    instruction: string;
    examples?: { input: string; output: string }[]; // For Few-shot
    ragContext?: string; // For RAG
  };
}

// Added for prompt history
export interface HistoryItem {
  id: string;
  timestamp: number;
  goalNameKey: string;
  customName?: string; // Allow user to rename history items
  folderId?: string; // Added for folder categorization
  promptObject: PromptObject;
  // Store the state required to reload the prompt.
  // For imported prompts, this state might be minimal.
  generatorState: {
    selectedCategoryId: string;
    selectedGoalId: string;
    formData: Record<string, string>;
    selectedStyleId: string;
    selectedTechniqueId: string;
    customizations: Customizations;
    fewShotExamples?: { input: string; output: string }[];
    // Also used to store original prompt for AI-improved imported prompts
    ragContext?: string;
  };
}

// Added for multi-AI configuration
export interface AiConfig {
    id: string;
    name: string;
    baseURL: string;
    apiKey: string;
    modelId: string;
}

// Added for prompt history folders
export interface Folder {
    id: string;
    name: string;
}
