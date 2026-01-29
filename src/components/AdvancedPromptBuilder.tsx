import React, { useState } from 'react';
import { AdvancedPromptConfig } from '../types';
import { PersonaBuilder } from './advanced/PersonaBuilder';
import { ModelSelector } from './advanced/ModelSelector';
import { TemplateEditor } from './advanced/TemplateEditor';
import { TechniqueSelector } from './advanced/TechniqueSelector';
import { Settings, Wand2, FileText, Sparkles } from 'lucide-react';

interface AdvancedPromptBuilderProps {
  onBuildPrompt: (config: AdvancedPromptConfig) => void;
}

export const AdvancedPromptBuilder: React.FC<AdvancedPromptBuilderProps> = ({
  onBuildPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'persona' | 'template' | 'technique'>('model');
  const [config, setConfig] = useState<Partial<AdvancedPromptConfig>>({
    outputFormat: 'text',
    chainOfThought: false,
    fewShotExamples: [],
    temperature: 0.7,
    maxTokens: 2048
  });

  const tabs = [
    { id: 'model', label: 'Mô hình AI', icon: Settings },
    { id: 'persona', label: 'Vai trò', icon: Wand2 },
    { id: 'template', label: 'Template', icon: FileText },
    { id: 'technique', label: 'Kỹ thuật', icon: Sparkles }
  ];

  const handleBuildPrompt = () => {
    if (config.targetModel) {
      onBuildPrompt(config as AdvancedPromptConfig);
    }
  };

  return (
    <div className="advanced-prompt-builder bg-bg-secondary rounded-xl shadow-lg overflow-hidden border border-border-primary text-text-primary">
      <div className="flex border-b border-border-primary bg-bg-tertiary/30 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent-primary text-accent-primary bg-bg-secondary font-medium'
                  : 'border-transparent text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content p-6 min-h-[400px]">
        {activeTab === 'model' && (
          <ModelSelector
            onModelSelect={(model) => setConfig({ ...config, targetModel: model })}
            selectedModel={config.targetModel}
          />
        )}

        {activeTab === 'persona' && (
          <PersonaBuilder
            onPersonaSelect={(persona) => setConfig({ ...config, persona })}
            selectedPersona={config.persona}
          />
        )}

        {activeTab === 'template' && (
          <TemplateEditor
            onTemplateSelect={(template) => setConfig({ ...config, template })}
            selectedTemplate={config.template}
          />
        )}

        {activeTab === 'technique' && (
          <TechniqueSelector
            config={config}
            onConfigChange={setConfig}
          />
        )}
      </div>

      <div className="p-6 bg-bg-tertiary/30 border-t border-border-primary">
        <h4 className="font-medium mb-3 text-text-primary">Cấu hình Output</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Format</label>
            <select
              value={config.outputFormat}
              onChange={(e) => setConfig({ ...config, outputFormat: e.target.value as any })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="code">Code</option>
              <option value="structured">Structured</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Max Tokens</label>
            <input
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              min="100"
              max="32000"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.chainOfThought}
                onChange={(e) => setConfig({ ...config, chainOfThought: e.target.checked })}
                className="rounded text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-sm text-text-primary">Chain of Thought</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleBuildPrompt}
          disabled={!config.targetModel}
          className="w-full mt-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all transform hover:scale-[1.01]"
        >
          {config.targetModel ? 'Tạo Prompt Nâng Cao' : 'Vui lòng chọn Model để tiếp tục'}
        </button>
      </div>
    </div>
  );
};
