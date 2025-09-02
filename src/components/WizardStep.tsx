import React from 'react';
import { CheckIcon } from './common/Icons';

interface WizardStepProps {
  title: string;
  isComplete: boolean;
  children: React.ReactNode;
}
export const WizardStep: React.FC<WizardStepProps> = ({ title, isComplete, children }) => (
  <section className="mb-8 p-6 bg-bg-secondary/50 rounded-xl border border-border-primary shadow-lg transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-colors ${isComplete ? 'bg-accent-primary' : 'bg-bg-tertiary'}`}>
        {isComplete && <CheckIcon />}
      </div>
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
    </div>
    <div className="pl-9">{children}</div>
  </section>
);
