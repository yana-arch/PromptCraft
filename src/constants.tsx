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
    { id: 'zero-shot', nameKey: 'techniques.zero-shot.name', descriptionKey: 'techniques.zero-shot.description' },
    { id: 'few-shot', nameKey: 'techniques.few-shot.name', descriptionKey: 'techniques.few-shot.description' },
    { id: 'chain-of-thought', nameKey: 'techniques.chain-of-thought.name', descriptionKey: 'techniques.chain-of-thought.description' },
    { id: 'self-consistency', nameKey: 'techniques.self-consistency.name', descriptionKey: 'techniques.self-consistency.description' },
    { id: 'rag', nameKey: 'techniques.rag.name', descriptionKey: 'techniques.rag.description' },
]

export const TONES = ['Professional', 'Friendly', 'Humorous', 'Formal', 'Casual', 'Persuasive'];
export const FORMATS = ['Plain Text', 'Markdown', 'JSON', 'HTML', 'Bulleted List', 'Numbered List'];
export const LENGTHS = ['Very Short (~50 words)', 'Short (~150 words)', 'Medium (~300 words)', 'Long (500+ words)'];

export const CUSTOM_GOAL_FIELDS: InputField[] = [
  { id: 'custom_target', labelKey: 'fields.custom_target.label', placeholderKey: 'fields.custom_target.placeholder', tooltipKey: 'fields.custom_target.tooltip', type: 'text', required: true },
  { id: 'custom_context', labelKey: 'fields.custom_context.label', placeholderKey: 'fields.custom_context.placeholder', tooltipKey: 'fields.custom_context.tooltip', type: 'textarea', required: false },
  { id: 'custom_tasks', labelKey: 'fields.custom_tasks.label', placeholderKey: 'fields.custom_tasks.placeholder', tooltipKey: 'fields.custom_tasks.tooltip', type: 'textarea', required: true },
];

export const DEFAULT_AI_CONFIG_ID = 'default-gemini';
