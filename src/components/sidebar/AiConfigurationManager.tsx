import React from 'react';
import type { AiConfig } from '../../types';
import { DEFAULT_AI_CONFIG_ID } from '../../constants';

interface AiConfigurationManagerProps {
    configs: AiConfig[];
    activeConfigId: string;
    onSetActive: (id: string) => void;
    onAdd: () => void;
    onEdit: (config: AiConfig) => void;
    onDelete: (id: string) => void;
    t: (key: string) => string;
}

export const AiConfigurationManager: React.FC<AiConfigurationManagerProps> = ({ configs, activeConfigId, onSetActive, onAdd, onEdit, onDelete, t}) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">{t('settings.title')}</h3>
                <button onClick={onAdd} className="px-3 py-1 text-sm font-semibold text-accent-primary bg-accent-primary/10 rounded hover:bg-accent-primary/20 transition">{t('aiConfig.add')}</button>
            </div>
            <div className="space-y-2">
                {/* Default Option */}
                <label className={`flex items-center p-3 rounded-md cursor-pointer transition-all border-2 ${activeConfigId === DEFAULT_AI_CONFIG_ID ? 'bg-accent-primary/10 border-accent-primary' : 'border-border-primary hover:border-border-secondary'}`}>
                    <input type="radio" name="ai-config" checked={activeConfigId === DEFAULT_AI_CONFIG_ID} onChange={() => onSetActive(DEFAULT_AI_CONFIG_ID)} className="h-4 w-4 text-accent-primary bg-bg-tertiary border-border-secondary focus:ring-accent-primary"/>
                    <div className="ml-3 text-sm flex-grow">
                        <p className="font-medium text-text-primary">{t('settings.default')}</p>
                        <p className="text-xs text-text-tertiary">{t('settings.defaultDescription')}</p>
                    </div>
                </label>
                {/* Custom Configs */}
                {configs.map(config => (
                    <label key={config.id} className={`flex items-center p-3 rounded-md cursor-pointer transition-all border-2 ${activeConfigId === config.id ? 'bg-accent-secondary/10 border-accent-secondary' : 'border-border-primary hover:border-border-secondary'}`}>
                        <input type="radio" name="ai-config" checked={activeConfigId === config.id} onChange={() => onSetActive(config.id)} className="h-4 w-4 text-accent-secondary bg-bg-tertiary border-border-secondary focus:ring-accent-secondary"/>
                        <div className="ml-3 text-sm flex-grow overflow-hidden">
                            <p className="font-medium text-text-primary truncate">{config.name || t('aiConfig.unnamed')}</p>
                            <p className="text-xs text-text-tertiary truncate">{config.modelId}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                             <button onClick={(e) => {e.preventDefault(); onEdit(config)}} className="p-1 text-text-tertiary hover:text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                             <button onClick={(e) => {e.preventDefault(); onDelete(config.id)}} className="p-1 text-text-tertiary hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                        </div>
                    </label>
                ))}
            </div>
        </section>
    )
}