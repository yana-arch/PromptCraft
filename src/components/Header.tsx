import React from 'react';

export const Header: React.FC<{ t: (key: string) => string; }> = ({ t }) => (
  <header className="text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
      {t('app.title')}
    </h1>
    <p className="mt-3 text-lg text-text-tertiary">{t('app.subtitle')}</p>
  </header>
);
