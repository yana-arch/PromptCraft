import React from 'react';
import { AIModel } from '../../types';
import { AI_MODELS } from '../../constants';
import { Settings, Zap, CheckCircle2 } from 'lucide-react';

interface ModelSelectorProps {
  onModelSelect: (model: AIModel) => void;
  selectedModel?: AIModel;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelSelect,
  selectedModel
}) => {
  return (
    <div className="model-selector p-4 border border-border-primary rounded-lg bg-bg-secondary shadow-sm text-text-primary">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
        <Settings className="w-5 h-5 text-accent-secondary" />
        Chọn Mô hình AI
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {AI_MODELS.map((model) => (
          <div
            key={model.id}
            onClick={() => onModelSelect(model)}
            className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start justify-between ${
              selectedModel?.id === model.id
                ? 'border-accent-secondary bg-accent-secondary/10 ring-1 ring-accent-secondary'
                : 'border-border-primary hover:border-accent-primary hover:bg-bg-tertiary'
            }`}
          >
            <div>
              <div className="font-medium flex items-center gap-2 text-text-primary">
                <Zap className={`w-4 h-4 ${selectedModel?.id === model.id ? 'text-accent-secondary' : 'text-text-tertiary'}`} />
                {model.name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary uppercase">
                  {model.provider}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {model.capabilities.map((cap, idx) => (
                  <span key={idx} className="text-xs bg-bg-tertiary border border-border-secondary px-2 py-1 rounded text-text-secondary">
                    {cap}
                  </span>
                ))}
              </div>

              <div className="text-xs text-text-tertiary mt-2">
                Max Tokens: {model.maxTokens.toLocaleString()}
              </div>
            </div>

            {selectedModel?.id === model.id && (
              <CheckCircle2 className="w-5 h-5 text-accent-secondary" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
