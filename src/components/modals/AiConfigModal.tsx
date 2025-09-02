import React, { useState, useEffect } from 'react';
import type { AiConfig } from '../../types';

interface AiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: AiConfig) => void;
    config: AiConfig | null;
    t: (key: string) => string;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose, onSave, config, t }) => {
    const [name, setName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [modelId, setModelId] = useState('');

    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testError, setTestError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(config?.name || '');
            setBaseURL(config?.baseURL || '');
            setApiKey(config?.apiKey || '');
            setModelId(config?.modelId || '');
            setTestStatus('idle');
            setTestError(null);
        }
    }, [isOpen, config]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newConfig: AiConfig = {
            id: config?.id || new Date().toISOString(),
            name, baseURL, apiKey, modelId,
        };
        onSave(newConfig);
    };

    const handleTest = async () => {
        setTestStatus('testing');
        setTestError(null);
        try {
            if (!baseURL || !modelId) throw new Error(t('errors.testFieldsMissing'));

            const endpoint = `${baseURL.replace(/\/$/, '')}/chat/completions`;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: 'test' }], max_tokens: 5 })
            }).catch(err => {
                throw new Error(`${t('errors.networkError')}: ${err.message}`);
            });

            if (!response.ok) {
                 if (response.status === 401) throw new Error(t('errors.authFailed'));
                 if (response.status === 404) throw new Error(t('errors.endpointNotFound'));
                 const errorBody = await response.text();
                 throw new Error(`${t('errors.apiError')} ${response.status}: ${errorBody}`);
            }

            await response.json();
            setTestStatus('success');
        } catch (error: any) {
            setTestStatus('error');
            setTestError(error.message || t('errors.unknown'));
            console.error("Connection test failed:", error);
        }
    };

    const TestStatusMessage = () => {
        if (testStatus === 'testing') return <p className="text-sm text-yellow-400 mt-2">{t('settings.testing')}</p>;
        if (testStatus === 'success') return <p className="text-sm text-green-400 mt-2">{t('settings.testSuccess')}</p>;
        if (testStatus === 'error') return <p className="text-sm text-red-400 mt-2">{t('settings.testError')} <br/> <span className="text-text-tertiary text-xs">{testError}</span></p>;
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-bg-secondary/80 backdrop-blur-sm rounded-xl border border-border-primary shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-border-primary">
                    <h2 className="text-xl font-bold text-text-primary">{config ? t('aiConfig.editTitle') : t('aiConfig.addTitle')}</h2>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label htmlFor="configName" className="block text-sm font-medium text-text-secondary mb-1">{t('aiConfig.nameLabel')}</label>
                        <input type="text" id="configName" value={name} onChange={e => setName(e.target.value)} placeholder={t('aiConfig.namePlaceholder')} className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-secondary focus:border-accent-secondary transition" />
                    </div>
                    <div>
                        <label htmlFor="baseURL" className="block text-sm font-medium text-text-secondary mb-1">{t('settings.customEndpoint')} <span className="text-red-400">*</span></label>
                        <input type="text" id="baseURL" value={baseURL} onChange={e => setBaseURL(e.target.value)} placeholder={t('settings.customEndpointPlaceholder')} className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-secondary focus:border-accent-secondary transition" />
                    </div>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-1">{t('settings.apiKey')}</label>
                        <input type="password" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={t('settings.apiKeyPlaceholder')} className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-secondary focus:border-accent-secondary transition" />
                    </div>
                    <div>
                        <label htmlFor="modelId" className="block text-sm font-medium text-text-secondary mb-1">{t('settings.modelId')} <span className="text-red-400">*</span></label>
                        <input type="text" id="modelId" value={modelId} onChange={e => setModelId(e.target.value)} placeholder={t('settings.modelIdPlaceholder')} className="w-full bg-bg-tertiary border border-border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent-secondary focus:border-accent-secondary transition" />
                    </div>
                    <div>
                        <button onClick={handleTest} disabled={testStatus==='testing'} className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-accent-secondary hover:bg-accent-secondary-hover text-white disabled:bg-bg-tertiary">
                            {t('settings.testConnection')}
                        </button>
                        <TestStatusMessage />
                    </div>
                </div>
                <div className="p-4 bg-bg-secondary/50 border-t border-border-primary flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-bg-tertiary hover:bg-border-secondary text-text-primary">{t('settings.cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-accent-primary hover:bg-accent-primary-hover text-white">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    );
};
