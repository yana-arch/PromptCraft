import React from 'react';
import type { Category } from '../types';

interface GoalSelectorProps {
  category: Category;
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({ category, selectedId, onSelect, t }) => {
    const goalsWithCustom = [...category.goals, { id: 'custom', nameKey: 'goals.custom.name', descriptionKey: 'goals.custom.description' }];
    return (
      <div className="space-y-3">
        {goalsWithCustom.map(goal => (
          <button
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 flex items-center ${selectedId === goal.id ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-tertiary/50 border-border-secondary hover:border-accent-primary hover:bg-bg-tertiary'}`}
          >
            <div className={`w-3 h-3 rounded-full mr-4 transition-colors ${selectedId === goal.id ? 'bg-accent-primary' : 'bg-text-tertiary'}`}></div>
            <div>
                <h3 className="font-bold text-text-primary">{t(goal.nameKey)}</h3>
                <p className="text-sm text-text-tertiary">{t(goal.descriptionKey)}</p>
            </div>
          </button>
        ))}
      </div>
    );
}
