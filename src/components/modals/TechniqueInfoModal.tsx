
import React from 'react';
import { PROMPT_TECHNIQUES } from '../../constants';

interface TechniqueInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  techniqueId: string;
  t: (key: string) => string;
}

export const TechniqueInfoModal: React.FC<TechniqueInfoModalProps> = ({ isOpen, onClose, techniqueId, t }) => {
  if (!isOpen) return null;

  const technique = PROMPT_TECHNIQUES.find(tech => tech.id === techniqueId);
  if (!technique) return null;

  // Type assertion for the new keys since we haven't updated the type definition yet,
  // but we know they exist in constants.tsx
  const tech = technique as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-bg-primary rounded-xl shadow-2xl max-w-2xl w-full border border-border-primary transform transition-all animate-scaleIn max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-secondary">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {t(tech.nameKey)}
          </h2>
          <button 
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-bg-tertiary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Explanation */}
          <div>
            <h3 className="text-lg font-semibold text-accent-primary mb-2">
              {t('output.styleMeaning')} {/* Using 'Meaning' as a proxy for Explanation header if none exists, or just hardcode/add key */}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {tech.explanationKey ? t(tech.explanationKey) : t(tech.descriptionKey)}
            </p>
          </div>

          {/* Example */}
          <div className="bg-bg-tertiary rounded-lg p-4 border border-border-secondary">
            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-3">
              {t('techniques.fewShotEditorTitle').split(' ')[0]} {t('techniques.example')} {/* Attempting to construct 'Example' */}
            </h3>
            {/* If translation key missing, fallback to hardcoded header */}
             <h3 className="text-md font-semibold text-text-primary mb-2">Example</h3>
             
            <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary bg-bg-secondary p-3 rounded border border-border-primary overflow-x-auto">
              {tech.exampleKey ? t(tech.exampleKey) : 'No example available.'}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-secondary flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            {t('chatModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
