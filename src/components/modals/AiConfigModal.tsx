import React, { useState, useEffect } from 'react';
import type { AiConfig } from '../../types';
import { PREDEFINED_BASE_URLS } from '../../constants';

interface AiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: AiConfig) => void;
    config: AiConfig | null;
    t: (key: string) => string;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose, onSave, config, t }) => {
    const [name, setName] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('custom');
    const [customBaseURL, setCustomBaseURL] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [modelId, setModelId] = useState('');

    // Computed baseURL based on selected provider
    const baseURL = selectedProvider === 'custom' ? customBaseURL : PREDEFINED_BASE_URLS.find(p => p.id === selectedProvider)?.url || '';

    useEffect(() => {
        if (isOpen) {
            setName(config?.name || '');
            setApiKey(config?.apiKey || '');
            setModelId(config?.modelId || '');

            // Initialize provider selection based on baseURL
            if (config?.baseURL) {
                const provider = PREDEFINED_BASE_URLS.find(p => p.url === config.baseURL);
                if (provider) {
                    setSelectedProvider(provider.id);
                    setCustomBaseURL('');
                } else {
                    setSelectedProvider('custom');
                    setCustomBaseURL(config.baseURL);
                }
            } else {
                setSelectedProvider('custom');
                setCustomBaseURL('');
            }
        }
    }, [isOpen, config]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        const newConfig: AiConfig = {
            id: config?.id || new Date().toISOString(),
            name: name.trim(),
            baseURL: baseURL.trim(),
            apiKey: apiKey.trim(),
            modelId: modelId.trim(),
        };
        onSave(newConfig);
    };

    const isFormValid = name.trim() && modelId.trim() && (
        selectedProvider === 'custom' ? customBaseURL.trim() : true
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-bg-secondary/80 backdrop-blur-sm rounded-xl border border-border-primary shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-border-primary">
                    <h2 className="text-xl font-bold text-text-primary">{config ? t('aiConfig.editTitle') : t('aiConfig.addTitle')}</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="config-name" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.name')}</label>
                        <input
                            id="config-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('aiConfig.namePlaceholder')}
                            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                        />
                    </div>
                     <div>
                        <label htmlFor="config-model" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.modelId')}</label>
                        <input
                            id="config-model"
                            type="text"
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            placeholder={t('aiConfig.modelIdPlaceholder')}
                            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="config-provider" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.baseURLSelect')}</label>
                        <select
                            id="config-provider"
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                        >
                            {PREDEFINED_BASE_URLS.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                    {t(`aiConfig.providers.${provider.id}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedProvider === 'custom' && (
                        <div>
                            <label htmlFor="config-custom-baseurl" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.baseURLCustom')}</label>
                            <input
                                id="config-custom-baseurl"
                                type="text"
                                value={customBaseURL}
                                onChange={(e) => setCustomBaseURL(e.target.value)}
                                placeholder={t('aiConfig.baseURLPlaceholder')}
                                className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                            />
                        </div>
                    )}
                    {selectedProvider === 'azure-openai' && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-sm text-amber-800">
                                <strong>Note:</strong> For Azure OpenAI, replace "your-resource-name" in the URL with your actual Azure resource name.
                            </p>
                        </div>
                    )}
                     <div>
                        <label htmlFor="config-apikey" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.apiKey')}</label>
                        <input
                            id="config-apikey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={t('aiConfig.apiKeyPlaceholder')}
                            className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
                        />
                         <p className="mt-1 text-xs text-text-tertiary">{t('aiConfig.apiKeyDescription')}</p>
                    </div>
                </div>
                <div className="p-4 bg-bg-secondary/50 border-t border-border-primary flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-bg-tertiary hover:bg-border-secondary text-text-primary">{t('settings.cancel')}</button>
                    <button onClick={handleSave} disabled={!isFormValid} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-accent-primary hover:bg-accent-primary-hover text-white disabled:bg-bg-tertiary disabled:cursor-not-allowed">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    );
};
