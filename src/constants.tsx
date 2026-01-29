import React from 'react';
import type { Category, PromptStyle, InputField } from './types';
import { MarketingIcon, CodeIcon, CreativeIcon, AcademicIcon } from './components/common/Icons';

// App Data
export const CATEGORIES: Category[] = [
  {
    id: 'marketing',
    nameKey: 'categories.marketing.name',
    icon: <MarketingIcon />,
    goals: [
      {
        id: 'facebook-post',
        nameKey: 'goals.facebook-post.name',
        descriptionKey: 'goals.facebook-post.description',
        inputFields: [
          { id: 'product', labelKey: 'fields.product.label', placeholderKey: 'fields.product.placeholder', tooltipKey: 'fields.product.tooltip', type: 'text', required: true },
          { id: 'audience', labelKey: 'fields.audience.label', placeholderKey: 'fields.audience.placeholder', tooltipKey: 'fields.audience.tooltip', type: 'textarea', required: true },
          { id: 'benefits', labelKey: 'fields.benefits.label', placeholderKey: 'fields.benefits.placeholder', tooltipKey: 'fields.benefits.tooltip', type: 'textarea', required: true },
          { id: 'cta', labelKey: 'fields.cta.label', placeholderKey: 'fields.cta.placeholder', tooltipKey: 'fields.cta.tooltip', type: 'text', required: true },
          { id: 'promo', labelKey: 'fields.promo.label', placeholderKey: 'fields.promo.placeholder', tooltipKey: 'fields.promo.tooltip', type: 'text', required: false },
        ],
      },
      {
        id: 'seo-plan',
        nameKey: 'goals.seo-plan.name',
        descriptionKey: 'goals.seo-plan.description',
        inputFields: [
          { id: 'keyword', labelKey: 'fields.keyword.label', placeholderKey: 'fields.keyword.placeholder', tooltipKey: 'fields.keyword.tooltip', type: 'text', required: true },
          { id: 'domain', labelKey: 'fields.domain.label', placeholderKey: 'fields.domain.placeholder', tooltipKey: 'fields.domain.tooltip', type: 'text', required: true },
          { id: 'competitors', labelKey: 'fields.competitors.label', placeholderKey: 'fields.competitors.placeholder', tooltipKey: 'fields.competitors.tooltip', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    id: 'programming',
    nameKey: 'categories.programming.name',
    icon: <CodeIcon />,
    goals: [
      {
        id: 'explain-code',
        nameKey: 'goals.explain-code.name',
        descriptionKey: 'goals.explain-code.description',
        inputFields: [
          { id: 'code', labelKey: 'fields.code.label', placeholderKey: 'fields.code.placeholder', tooltipKey: 'fields.code.tooltip', type: 'textarea', required: true },
          { id: 'language', labelKey: 'fields.language.label', placeholderKey: 'fields.language.placeholder', tooltipKey: 'fields.language.tooltip', type: 'text', required: true },
          { id: 'level', labelKey: 'fields.level.label', placeholderKey: 'fields.level.placeholder', tooltipKey: 'fields.level.tooltip', type: 'text', required: true },
        ],
      },
      {
        id: 'write-docs',
        nameKey: 'goals.write-docs.name',
        descriptionKey: 'goals.write-docs.description',
        inputFields: [
          { id: 'code', labelKey: 'fields.functionCode.label', placeholderKey: 'fields.functionCode.placeholder', tooltipKey: 'fields.functionCode.tooltip', type: 'textarea', required: true },
          { id: 'language', labelKey: 'fields.language.label', placeholderKey: 'fields.language.placeholderTS', tooltipKey: 'fields.language.tooltip', type: 'text', required: true },
          { id: 'doc-format', labelKey: 'fields.docFormat.label', placeholderKey: 'fields.docFormat.placeholder', tooltipKey: 'fields.docFormat.tooltip', type: 'text', required: true },
        ],
      },
       {
        id: 'git-commit',
        nameKey: 'goals.git-commit.name',
        descriptionKey: 'goals.git-commit.description',
        inputFields: [
          { id: 'commit-type', labelKey: 'fields.commitType.label', placeholderKey: 'fields.commitType.placeholder', tooltipKey: 'fields.commitType.tooltip', type: 'text', required: true },
          { id: 'changes', labelKey: 'fields.changes.label', placeholderKey: 'fields.changes.placeholder', tooltipKey: 'fields.changes.tooltip', type: 'textarea', required: true },
        ],
      },
      {
        id: 'pr-description',
        nameKey: 'goals.pr-description.name',
        descriptionKey: 'goals.pr-description.description',
        inputFields: [
          { id: 'pr-title', labelKey: 'fields.prTitle.label', placeholderKey: 'fields.prTitle.placeholder', tooltipKey: 'fields.prTitle.tooltip', type: 'text', required: true },
          { id: 'changes-summary', labelKey: 'fields.changesSummary.label', placeholderKey: 'fields.changesSummary.placeholder', tooltipKey: 'fields.changesSummary.tooltip', type: 'textarea', required: true },
          { id: 'testing-done', labelKey: 'fields.testingDone.label', placeholderKey: 'fields.testingDone.placeholder', tooltipKey: 'fields.testingDone.tooltip', type: 'textarea', required: false },
        ],
      }
    ]
  },
  {
    id: 'creative',
    nameKey: 'categories.creative.name',
    icon: <CreativeIcon />,
    goals: [
      {
        id: 'story-idea',
        nameKey: 'goals.story-idea.name',
        descriptionKey: 'goals.story-idea.description',
        inputFields: [
          { id: 'genre', labelKey: 'fields.genre.label', placeholderKey: 'fields.genre.placeholder', tooltipKey: 'fields.genre.tooltip', type: 'text', required: true },
          { id: 'theme', labelKey: 'fields.theme.label', placeholderKey: 'fields.theme.placeholder', tooltipKey: 'fields.theme.tooltip', type: 'text', required: true },
          { id: 'character', labelKey: 'fields.character.label', placeholderKey: 'fields.character.placeholder', tooltipKey: 'fields.character.tooltip', type: 'text', required: false },
        ]
      }
    ]
  },
  {
    id: 'academic',
    nameKey: 'categories.academic.name',
    icon: <AcademicIcon />,
    goals: [
      {
        id: 'summarize-text',
        nameKey: 'goals.summarize-text.name',
        descriptionKey: 'goals.summarize-text.description',
        inputFields: [
          { id: 'text', labelKey: 'fields.textToSummarize.label', placeholderKey: 'fields.textToSummarize.placeholder', tooltipKey: 'fields.textToSummarize.tooltip', type: 'textarea', required: true },
          { id: 'summary-length', labelKey: 'fields.summaryLength.label', placeholderKey: 'fields.summaryLength.placeholder', tooltipKey: 'fields.summaryLength.tooltip', type: 'text', required: true },
          { id: 'focus', labelKey: 'fields.focus.label', placeholderKey: 'fields.focus.placeholder', tooltipKey: 'fields.focus.tooltip', type: 'text', required: false },
        ]
      }
    ]
  }
];

export const PROMPT_STYLES: PromptStyle[] = [
    { id: 'expert', nameKey: 'styles.expert.name', descriptionKey: 'styles.expert.description' },
    { id: 'storytelling', nameKey: 'styles.storytelling.name', descriptionKey: 'styles.storytelling.description' },
    { id: 'step-by-step', nameKey: 'styles.step-by-step.name', descriptionKey: 'styles.step-by-step.description' },
    { id: 'comparison', nameKey: 'styles.comparison.name', descriptionKey: 'styles.comparison.description' },
];

export const PROMPT_TECHNIQUES = [
    { 
        id: 'zero-shot', 
        nameKey: 'techniques.zero-shot.name', 
        descriptionKey: 'techniques.zero-shot.description',
        explanationKey: 'techniques.zero-shot.explanation',
        exampleKey: 'techniques.zero-shot.example'
    },
    { 
        id: 'few-shot', 
        nameKey: 'techniques.few-shot.name', 
        descriptionKey: 'techniques.few-shot.description',
        explanationKey: 'techniques.few-shot.explanation',
        exampleKey: 'techniques.few-shot.example'
    },
    { 
        id: 'chain-of-thought', 
        nameKey: 'techniques.chain-of-thought.name', 
        descriptionKey: 'techniques.chain-of-thought.description',
        explanationKey: 'techniques.chain-of-thought.explanation',
        exampleKey: 'techniques.chain-of-thought.example'
    },
    { 
        id: 'self-consistency', 
        nameKey: 'techniques.self-consistency.name', 
        descriptionKey: 'techniques.self-consistency.description',
        explanationKey: 'techniques.self-consistency.explanation',
        exampleKey: 'techniques.self-consistency.example'
    },
    { 
        id: 'rag', 
        nameKey: 'techniques.rag.name', 
        descriptionKey: 'techniques.rag.description',
        explanationKey: 'techniques.rag.explanation',
        exampleKey: 'techniques.rag.example'
    },
    {
        id: 'tree-of-thoughts',
        nameKey: 'techniques.tree-of-thoughts.name',
        descriptionKey: 'techniques.tree-of-thoughts.description',
        explanationKey: 'techniques.tree-of-thoughts.explanation',
        exampleKey: 'techniques.tree-of-thoughts.example'
    },
    {
        id: 'react',
        nameKey: 'techniques.react.name',
        descriptionKey: 'techniques.react.description',
        explanationKey: 'techniques.react.explanation',
        exampleKey: 'techniques.react.example'
    },
    {
        id: 'self-refine',
        nameKey: 'techniques.self-refine.name',
        descriptionKey: 'techniques.self-refine.description',
        explanationKey: 'techniques.self-refine.explanation',
        exampleKey: 'techniques.self-refine.example'
    },
    {
        id: 'least-to-most',
        nameKey: 'techniques.least-to-most.name',
        descriptionKey: 'techniques.least-to-most.description',
        explanationKey: 'techniques.least-to-most.explanation',
        exampleKey: 'techniques.least-to-most.example'
    },
    {
        id: 'generated-knowledge',
        nameKey: 'techniques.generated-knowledge.name',
        descriptionKey: 'techniques.generated-knowledge.description',
        explanationKey: 'techniques.generated-knowledge.explanation',
        exampleKey: 'techniques.generated-knowledge.example'
    },
    {
        id: 'skeleton-of-thought',
        nameKey: 'techniques.skeleton-of-thought.name',
        descriptionKey: 'techniques.skeleton-of-thought.description',
        explanationKey: 'techniques.skeleton-of-thought.explanation',
        exampleKey: 'techniques.skeleton-of-thought.example'
    }
];

export const TONES = ['Professional', 'Friendly', 'Humorous', 'Formal', 'Casual', 'Persuasive'];
export const FORMATS = ['Plain Text', 'Markdown', 'JSON', 'HTML', 'Bulleted List', 'Numbered List'];
export const LENGTHS = ['Very Short (~50 words)', 'Short (~150 words)', 'Medium (~300 words)', 'Long (500+ words)'];

export const CUSTOM_GOAL_FIELDS: InputField[] = [
  { id: 'custom_target', labelKey: 'fields.custom_target.label', placeholderKey: 'fields.custom_target.placeholder', tooltipKey: 'fields.custom_target.tooltip', type: 'text', required: true },
  { id: 'custom_context', labelKey: 'fields.custom_context.label', placeholderKey: 'fields.custom_context.placeholder', tooltipKey: 'fields.custom_context.tooltip', type: 'textarea', required: false },
  { id: 'custom_tasks', labelKey: 'fields.custom_tasks.label', placeholderKey: 'fields.custom_tasks.placeholder', tooltipKey: 'fields.custom_tasks.tooltip', type: 'textarea', required: true },
];

export const DEFAULT_AI_CONFIG_ID = 'default-gemini';

export const PREDEFINED_BASE_URLS = [
    { id: 'gemini', name: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta' },
    { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com/v1' },
    { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
    { id: 'grok', name: 'Grok (xAI)', url: 'https://api.x.ai/v1' },
    { id: 'anthropic', name: 'Anthropic Claude', url: 'https://api.anthropic.com/v1' },
    { id: 'azure-openai', name: 'Azure OpenAI', url: 'https://your-resource-name.openai.azure.com' },
    { id: 'local-ollama', name: 'Local Ollama', url: 'http://localhost:11434/v1' },
    { id: 'custom', name: 'Custom URL', url: '' },
];

// Advanced Mode Constants
import { AIModel, AIPersona, PromptTemplate } from './types';

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    capabilities: ['reasoning', 'coding', 'creative-writing', 'analysis'],
    maxTokens: 8192,
    specialFeatures: ['vision', 'function-calling']
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'anthropic',
    capabilities: ['reasoning', 'coding', 'analysis', 'summarization'],
    maxTokens: 100000,
    specialFeatures: ['constitutional-ai', 'long-context']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    capabilities: ['multimodal', 'reasoning', 'coding'],
    maxTokens: 32768,
    specialFeatures: ['vision', 'audio']
  }
];

export const PRESET_PERSONAS: AIPersona[] = [
  {
    id: 'teacher',
    name: 'Giáo viên',
    role: 'Giáo viên chuyên nghiệp',
    personality: 'Kiên nhẫn, tận tâm, dễ hiểu',
    expertise: ['Giáo dục', 'Sư phạm', 'Giải thích khái niệm'],
    tone: 'Thân thiện và khuyến khích',
    constraints: ['Phù hợp với độ tuổi học sinh', 'Sử dụng ví dụ thực tế']
  },
  {
    id: 'developer',
    name: 'Lập trình viên',
    role: 'Senior Software Developer',
    personality: 'Logic, chi tiết, thực tế',
    expertise: ['Coding', 'System Design', 'Best Practices'],
    tone: 'Chuyên nghiệp và kỹ thuật',
    constraints: ['Code phải clean và có comment', 'Tuân thủ SOLID principles']
  },
  {
    id: 'analyst',
    name: 'Nhà phân tích',
    role: 'Data Analyst',
    personality: 'Phân tích, khách quan, dựa trên dữ liệu',
    expertise: ['Data Analysis', 'Statistics', 'Visualization'],
    tone: 'Chính xác và khoa học',
    constraints: ['Dựa trên evidence', 'Trình bày số liệu rõ ràng']
  }
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'role-based',
    name: 'Role-based Prompt',
    category: 'general',
    structure: {
      sections: [
        {
          id: 'role',
          type: 'role',
          label: 'Vai trò',
          content: 'You are {role}',
          editable: true,
          required: true,
          order: 1
        },
        {
          id: 'context',
          type: 'context',
          label: 'Ngữ cảnh',
          content: '{context}',
          editable: true,
          required: false,
          order: 2
        },
        {
          id: 'task',
          type: 'task',
          label: 'Nhiệm vụ',
          content: '{task}',
          editable: true,
          required: true,
          order: 3
        }
      ],
      variables: [
        {
          id: 'role',
          name: 'role',
          type: 'text',
          validation: { required: true }
        },
        {
          id: 'context',
          name: 'context',
          type: 'text'
        },
        {
          id: 'task',
          name: 'task',
          type: 'text',
          validation: { required: true }
        }
      ]
    }
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    category: 'reasoning',
    structure: {
      sections: [
        {
          id: 'task',
          type: 'task',
          label: 'Vấn đề',
          content: '{problem}',
          editable: true,
          required: true,
          order: 1
        },
        {
          id: 'constraints',
          type: 'constraints',
          label: 'Yêu cầu',
          content: 'Let\'s think step by step:\n{requirements}',
          editable: true,
          required: false,
          order: 2
        }
      ],
      variables: [
        {
          id: 'problem',
          name: 'problem',
          type: 'text',
          validation: { required: true }
        },
        {
          id: 'requirements',
          name: 'requirements',
          type: 'text'
        }
      ]
    }
  }
];

export const PROMPT_TECHNIQUES_ADVANCED = [
  {
    id: 'few-shot',
    name: 'Few-shot Learning',
    description: 'Cung cấp ví dụ để AI học pattern'
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    description: 'Yêu cầu AI giải thích từng bước suy nghĩ'
  },
  {
    id: 'tree-of-thought',
    name: 'Tree of Thought',
    description: 'Khám phá nhiều hướng suy nghĩ'
  },
  {
    id: 'self-consistency',
    name: 'Self-Consistency',
    description: 'Tạo nhiều câu trả lời và chọn tốt nhất'
  },
  {
    id: 'constitutional-ai',
    name: 'Constitutional AI',
    description: 'AI tự đánh giá và cải thiện câu trả lời'
  }
];
