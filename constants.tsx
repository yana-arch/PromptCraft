import React from 'react';
import type { Category, PromptStyle } from './types';

// SVG Icons
const MarketingIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const CodeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const CreativeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const AcademicIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
  </svg>
);

// App Data
export const CATEGORIES: Category[] = [
  {
    id: 'marketing',
    nameKey: 'categories.marketing.name',
    icon: MarketingIcon,
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
    icon: CodeIcon,
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
    icon: CreativeIcon,
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
    icon: AcademicIcon,
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