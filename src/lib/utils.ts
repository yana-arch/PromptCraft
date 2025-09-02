import type { Goal, PromptObject } from '../types';

export const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const extractJsonFromString = (str: string): string | null => {
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

export const generateHistoryItemName = (goal: Goal | { id: string; nameKey: string }, formData: Record<string, string>, t: (key: string) => string): string => {
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
