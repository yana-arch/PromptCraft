import React from 'react';

export const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  if (!text) return <>{children}</>;
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute left-0 w-max max-w-xs bottom-full mb-2 hidden group-hover:block bg-bg-primary text-text-primary text-xs rounded-md p-2 border border-border-primary shadow-lg z-10">
        {text}
      </div>
    </div>
  );
};
