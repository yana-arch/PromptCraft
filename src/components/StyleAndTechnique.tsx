import React, { useState } from 'react';
import { PROMPT_STYLES, PROMPT_TECHNIQUES, TONES, FORMATS, LENGTHS } from '../constants';
import type { Customizations } from '../types';
import { Tooltip } from './common/Tooltip';
import { InfoIcon } from './common/Icons';
import { TechniqueInfoModal } from './modals/TechniqueInfoModal';

interface StyleSelectorProps {
  title: string;
  options: {id: string, nameKey: string, descriptionKey: string}[];
  selectedId: string;
  onSelect: (id: string) => void;
  onInfoClick?: (id: string) => void;
  t: (key: string) => string;
}
const StyleSelector: React.FC<StyleSelectorProps> = ({ title, options, selectedId, onSelect, onInfoClick, t }) => (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map(style => (
          <label key={style.id} className={`flex items-start p-3 rounded-md cursor-pointer transition-all border-2 ${selectedId === style.id ? 'bg-accent-primary/10 border-accent-primary' : 'border-border-primary hover:border-border-secondary'}`}>
            <input type="radio" name={title} checked={selectedId === style.id} onChange={() => onSelect(style.id)} className="mt-1 h-4 w-4 text-accent-primary bg-bg-tertiary border-border-secondary focus:ring-accent-primary" />
            <div className="ml-3 text-sm flex-1 flex items-center justify-between">
                <div>
                    <Tooltip text={t(style.descriptionKey)}>
                        <span className="font-medium text-text-primary cursor-help">{t(style.nameKey)}</span>
                    </Tooltip>
                </div>
                {onInfoClick && (
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInfoClick(style.id); }}
                        className="text-text-tertiary hover:text-accent-primary transition-colors p-1"
                        title="Learn more"
                    >
                        <InfoIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
          </label>
        ))}
      </div>
    </div>
);

interface CustomizationPanelProps {
  customizations: Customizations;
  onChange: (customizations: Customizations) => void;
  t: (key: string) => string;
}
const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customizations, onChange, t }) => {
  const handleChange = <K extends keyof Customizations,>(key: K, value: Customizations[K]) => {
    onChange({ ...customizations, [key]: value });
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">{t('customizations.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select id="tone" label={t('customizations.tone')} options={TONES} value={customizations.tone} onChange={(val) => handleChange('tone', val)} />
          <Select id="format" label={t('customizations.format')} options={FORMATS} value={customizations.format} onChange={(val) => handleChange('format', val)} />
          <Select id="length" label={t('customizations.length')} options={LENGTHS} value={customizations.length} onChange={(val) => handleChange('length', val)} />
        </div>
    </div>
  );
};

interface SelectProps {
    id: string;
    label: string;
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
}
const Select: React.FC<SelectProps> = ({ id, label, options, value, onChange}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

interface FewShotEditorProps {
    examples: { input: string; output: string }[];
    setExamples: React.Dispatch<React.SetStateAction<{ input: string; output: string }[]>>;
    t: (key: string) => string;
}
const FewShotEditor: React.FC<FewShotEditorProps> = ({ examples, setExamples, t }) => {
    const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
        const newExamples = [...examples];
        newExamples[index][field] = value;
        setExamples(newExamples);
    };

    const addExample = () => {
        setExamples([...examples, { input: '', output: '' }]);
    };
    
    const removeExample = (index: number) => {
        if (examples.length > 1) {
            setExamples(examples.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="mt-4 p-4 bg-bg-primary/50 rounded-lg border border-border-primary">
            <h4 className="text-md font-semibold text-text-secondary mb-3">{t('techniques.fewShotEditorTitle')}</h4>
            <div className="space-y-4">
                {examples.map((ex, index) => (
                    <div key={index} className="p-3 bg-bg-tertiary/50 rounded-md border border-border-secondary relative">
                        <div className="space-y-2">
                             <div>
                                <label className="text-xs font-medium text-text-tertiary">{t('techniques.inputLabel')}</label>
                                <textarea
                                    value={ex.input}
                                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                                    placeholder={t('techniques.inputPlaceholder')}
                                    rows={2}
                                    className="w-full text-sm bg-bg-secondary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-tertiary">{t('techniques.outputLabel')}</label>
                                <textarea
                                    value={ex.output}
                                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                                    placeholder={t('techniques.outputPlaceholder')}
                                    rows={3}
                                    className="w-full text-sm bg-bg-secondary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition"
                                />
                            </div>
                        </div>
                         {examples.length > 1 && (
                            <button onClick={() => removeExample(index)} className="absolute -top-2 -right-2 p-1 bg-red-800/80 rounded-full text-white hover:bg-red-700">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={addExample} className="mt-4 px-3 py-1 text-sm font-semibold text-accent-primary bg-accent-primary/10 rounded hover:bg-accent-primary/20 transition">{t('techniques.addExample')}</button>
        </div>
    );
};

interface RAGContextEditorProps {
    context: string;
    setContext: React.Dispatch<React.SetStateAction<string>>;
    t: (key: string) => string;
}
const RAGContextEditor: React.FC<RAGContextEditorProps> = ({ context, setContext, t }) => {
    return (
        <div className="mt-4 p-4 bg-bg-primary/50 rounded-lg border border-border-primary">
             <h4 className="text-md font-semibold text-text-secondary mb-2">{t('techniques.ragEditorTitle')}</h4>
             <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder={t('techniques.ragContextPlaceholder')}
                rows={8}
                className="w-full text-sm bg-bg-secondary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition"
             />
        </div>
    );
};


interface StyleAndTechniqueProps {
    selectedStyleId: string;
    onSelectStyle: (id: string) => void;
    selectedTechniqueId: string;
    onSelectTechnique: (id: string) => void;
    fewShotExamples: { input: string, output: string }[];
    setFewShotExamples: React.Dispatch<React.SetStateAction<{ input: string, output: string }[]>>;
    ragContext: string;
    setRagContext: React.Dispatch<React.SetStateAction<string>>;
    customizations: Customizations;
    setCustomizations: (customizations: Customizations) => void;
    t: (key: string) => string;
}

export const StyleAndTechnique: React.FC<StyleAndTechniqueProps> = ({
    selectedStyleId,
    onSelectStyle,
    selectedTechniqueId,
    onSelectTechnique,
    fewShotExamples,
    setFewShotExamples,
    ragContext,
    setRagContext,
    customizations,
    setCustomizations,
    t
}) => {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [activeInfoTechniqueId, setActiveInfoTechniqueId] = useState<string | null>(null);

    const handleOpenInfo = (id: string) => {
        setActiveInfoTechniqueId(id);
        setInfoModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <StyleSelector
                title={t('styles.title')}
                options={PROMPT_STYLES}
                selectedId={selectedStyleId}
                onSelect={onSelectStyle}
                t={t}
            />
            <div>
                <StyleSelector
                    title={t('techniques.title')}
                    options={PROMPT_TECHNIQUES}
                    selectedId={selectedTechniqueId}
                    onSelect={onSelectTechnique}
                    onInfoClick={handleOpenInfo}
                    t={t}
                />
                {selectedTechniqueId === 'few-shot' && (
                    <FewShotEditor examples={fewShotExamples} setExamples={setFewShotExamples} t={t} />
                )}
                {selectedTechniqueId === 'rag' && (
                    <RAGContextEditor context={ragContext} setContext={setRagContext} t={t} />
                )}
            </div>
            <CustomizationPanel customizations={customizations} onChange={setCustomizations} t={t} />
            
            <TechniqueInfoModal 
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                techniqueId={activeInfoTechniqueId || ''}
                t={t}
            />
        </div>
    )
}
