import React from 'react';
import { CATEGORIES } from '../constants';

interface CategorySelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedId, onSelect, t }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {CATEGORIES.map(cat => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${selectedId === cat.id ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-tertiary/50 border-border-secondary hover:border-accent-primary hover:bg-bg-tertiary'}`}
      >
        <div className="mx-auto text-accent-primary">{cat.icon}</div>
        <p className="mt-2 font-semibold text-text-primary">{t(cat.nameKey)}</p>
      </button>
    ))}
  </div>
);
