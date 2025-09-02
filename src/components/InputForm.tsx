import React from 'react';
import type { Goal } from '../types';
import { Tooltip } from './common/Tooltip';
import { AiAssistIcon, LoadingSpinner } from './common/Icons';

interface InputFormProps {
  goal: Goal;
  formData: Record<string, string>;
  onChange: (id: string, value: string) => void;
  t: (key: string) => string;
  onGenerateTasks?: () => void;
  isGeneratingTasks?: boolean;
}
export const InputForm: React.FC<InputFormProps> = ({ goal, formData, onChange, t, onGenerateTasks, isGeneratingTasks }) => (
  <div className="space-y-4">
    {goal.inputFields.map(field => (
      <div key={field.id}>
        <div className="flex justify-between items-center mb-1">
            <Tooltip text={field.tooltipKey ? t(field.tooltipKey) : ''}>
              <label htmlFor={field.id} className="block text-sm font-medium text-text-secondary cursor-help">
                {t(field.labelKey)} {field.required && <span className="text-red-400">*</span>}
              </label>
            </Tooltip>
            {field.id === 'custom_tasks' && onGenerateTasks && (
                <Tooltip text={t('fields.custom_tasks.aiAssistTooltip')}>
                    <button
                        onClick={onGenerateTasks}
                        disabled={isGeneratingTasks || !formData.custom_target?.trim()}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors text-accent-secondary bg-accent-secondary/10 hover:bg-accent-secondary/20 disabled:bg-bg-tertiary disabled:text-text-tertiary disabled:cursor-not-allowed"
                    >
                         {isGeneratingTasks ? (
                             <>
                                <LoadingSpinner />
                                {t('buttons.aiGenerating')}
                             </>
                         ) : (
                             <>
                                <AiAssistIcon />
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
            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
          />
        ) : (
          <input
            id={field.id}
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={t(field.placeholderKey)}
            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
          />
        )}
      </div>
    ))}
  </div>
);
