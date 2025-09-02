import React from 'react';
import { Tooltip } from '../common/Tooltip';
import type { Language, Theme } from '../../types';

const ThemeSelector: React.FC<{theme: Theme; onThemeChange: (theme: Theme) => void; t: (key: string) => string;}> = ({ theme, onThemeChange, t }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">{t('theme.title')}</label>
        <div className="p-1 bg-bg-primary rounded-lg flex items-center space-x-1">
            <Tooltip text={t('theme.slate')}>
                <button onClick={() => onThemeChange('slate')} className={`w-full p-1.5 rounded-md transition-colors text-sm font-semibold ${theme === 'slate' ? 'bg-accent-primary text-white' : 'hover:bg-bg-tertiary'}`}>
                    {t('theme.slate')}
                </button>
            </Tooltip>
            <Tooltip text={t('theme.midnight')}>
                <button onClick={() => onThemeChange('midnight')} className={`w-full p-1.5 rounded-md transition-colors text-sm font-semibold ${theme === 'midnight' ? 'bg-accent-primary text-white' : 'hover:bg-bg-tertiary'}`}>
                    {t('theme.midnight')}
                </button>
            </Tooltip>
        </div>
    </div>
);

interface DisplaySettingsProps {
    language: Language;
    onLangChange: (lang: Language) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    t: (key: string) => string;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({ language, onLangChange, theme, onThemeChange, t }) => (
    <div className="space-y-4">
        <ThemeSelector theme={theme} onThemeChange={onThemeChange} t={t} />
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{t('sidebar.language')}</label>
            <div className="flex items-center space-x-1 p-1 bg-bg-primary rounded-lg">
                <button onClick={() => onLangChange('en')} className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:bg-bg-tertiary'}`}>{t('sidebar.languageEnglish')}</button>
                <button onClick={() => onLangChange('vi')} className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:bg-bg-tertiary'}`}>{t('sidebar.languageVietnamese')}</button>
            </div>
        </div>
    </div>
);
