import React from 'react';
import { AdvancedPromptConfig } from '../../types';
import { PROMPT_TECHNIQUES_ADVANCED } from '../../constants';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

interface TechniqueSelectorProps {
  config: Partial<AdvancedPromptConfig>;
  onConfigChange: (config: Partial<AdvancedPromptConfig>) => void;
}

export const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({
  config,
  onConfigChange
}) => {
  const toggleTechnique = (techId: string) => {
    // Handle toggling boolean flags based on ID
    if (techId === 'chain-of-thought') {
      onConfigChange({ ...config, chainOfThought: !config.chainOfThought });
    }
    // Other techniques might need more complex logic or UI
  };

  const addExample = () => {
    const examples = config.fewShotExamples || [];
    onConfigChange({
      ...config,
      fewShotExamples: [...examples, { input: '', output: '' }]
    });
  };

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    const examples = [...(config.fewShotExamples || [])];
    examples[index] = { ...examples[index], [field]: value };
    onConfigChange({ ...config, fewShotExamples: examples });
  };

  const removeExample = (index: number) => {
    const examples = [...(config.fewShotExamples || [])];
    examples.splice(index, 1);
    onConfigChange({ ...config, fewShotExamples: examples });
  };

  return (
    <div className="technique-selector p-4 border border-border-primary rounded-lg bg-bg-secondary shadow-sm text-text-primary">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
        <Sparkles className="w-5 h-5 text-accent-secondary" />
        Kỹ thuật Prompting
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {PROMPT_TECHNIQUES_ADVANCED.map((tech) => (
          <div
            key={tech.id}
            onClick={() => toggleTechnique(tech.id)}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              (tech.id === 'chain-of-thought' && config.chainOfThought)
                ? 'border-accent-secondary bg-accent-secondary/10 ring-1 ring-accent-secondary'
                : 'border-border-primary hover:border-accent-primary hover:bg-bg-tertiary'
            }`}
          >
            <div className="font-medium">{tech.name}</div>
            <div className="text-xs text-text-tertiary mt-1">{tech.description}</div>
          </div>
        ))}
      </div>

      <div className="few-shot-section mt-6 pt-4 border-t border-border-secondary">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-text-secondary">Few-shot Examples</h4>
          <button
            onClick={addExample}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-accent-primary/10 text-accent-primary rounded hover:bg-accent-primary/20"
          >
            <Plus className="w-3 h-3" /> Thêm ví dụ
          </button>
        </div>

        <div className="space-y-4">
          {config.fewShotExamples?.map((example, idx) => (
            <div key={idx} className="p-3 bg-bg-tertiary/30 rounded border border-border-secondary relative group">
              <button
                onClick={() => removeExample(idx)}
                className="absolute top-2 right-2 text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="mb-2">
                <label className="text-xs font-semibold text-text-tertiary uppercase">Input</label>
                <textarea
                  value={example.input}
                  onChange={(e) => updateExample(idx, 'input', e.target.value)}
                  className="w-full mt-1 p-2 text-sm bg-bg-tertiary border border-border-secondary rounded focus:ring-1 focus:ring-accent-primary outline-none text-text-primary"
                  rows={2}
                  placeholder="Ví dụ đầu vào..."
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-text-tertiary uppercase">Output</label>
                <textarea
                  value={example.output}
                  onChange={(e) => updateExample(idx, 'output', e.target.value)}
                  className="w-full mt-1 p-2 text-sm bg-bg-tertiary border border-border-secondary rounded focus:ring-1 focus:ring-accent-primary outline-none text-text-primary"
                  rows={2}
                  placeholder="Ví dụ đầu ra mong muốn..."
                />
              </div>
            </div>
          ))}
          
          {(!config.fewShotExamples || config.fewShotExamples.length === 0) && (
            <div className="text-sm text-text-tertiary italic text-center py-4">
              Chưa có ví dụ nào. Thêm ví dụ để giúp AI hiểu rõ hơn context.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
