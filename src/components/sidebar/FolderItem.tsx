import React from 'react';

interface FolderItemProps {
    name: string;
    isActive: boolean;
    onClick: () => void;
    isEditing?: boolean;
    editingValue?: string;
    onEditingChange?: (value: string) => void;
    onRename?: () => void;
    onSaveRename?: () => void;
    onDelete?: () => void;
}

export const FolderItem: React.FC<FolderItemProps> = ({ name, isActive, onClick, isEditing, editingValue, onEditingChange, onRename, onSaveRename, onDelete }) => (
    <div className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-bg-tertiary' : 'hover:bg-bg-primary'}`}>
        {isEditing ? (
            <input
                type="text"
                value={editingValue}
                onChange={(e) => onEditingChange?.(e.target.value)}
                onBlur={onSaveRename}
                onKeyDown={(e) => e.key === 'Enter' && onSaveRename?.()}
                className="w-full bg-border-secondary border border-border-primary rounded px-1 py-0 text-sm text-text-primary"
                autoFocus
            />
        ) : (
            <button onClick={onClick} className="flex-grow text-left text-sm font-medium text-text-secondary truncate">
                {name}
            </button>
        )}
        {onRename && onDelete && !isEditing && (
            <div className="hidden group-hover:flex items-center flex-shrink-0 ml-2">
                <button onClick={onRename} className="p-1 text-text-tertiary hover:text-text-primary" title="Rename Folder"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={onDelete} className="p-1 text-text-tertiary hover:text-red-400" title="Delete Folder"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
            </div>
        )}
    </div>
);
