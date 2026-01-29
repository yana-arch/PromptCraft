import React, { useState, useEffect } from 'react';
import { PromptTemplate, PromptVariable } from '../../types';
import { PROMPT_TEMPLATES } from '../../constants';
import { FileText, Edit3, Save } from 'lucide-react';

interface TemplateEditorProps {
  onTemplateSelect: (template: PromptTemplate) => void;
  selectedTemplate?: PromptTemplate;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  onTemplateSelect,
  selectedTemplate
}) => {
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  useEffect(() => {
    if (selectedTemplate) {
      setEditingTemplate(JSON.parse(JSON.stringify(selectedTemplate))); // Deep copy
    }
  }, [selectedTemplate]);

  const handleVariableChange = (variableId: string, value: any) => {
    if (!editingTemplate) return;
    
    // In a real editor, we would update default values or structure
    // For now, let's just allow selecting a template
  };

  return (
    <div className="template-editor p-4 border border-border-primary rounded-lg bg-bg-secondary shadow-sm text-text-primary">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
        <FileText className="w-5 h-5 text-accent-secondary" />
        Chọn & Chỉnh sửa Template
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {PROMPT_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-accent-secondary bg-accent-secondary/10 ring-1 ring-accent-secondary'
                : 'border-border-primary hover:border-accent-primary hover:bg-bg-tertiary'
            }`}
          >
            <div className="font-medium">{template.name}</div>
            <div className="text-xs text-text-tertiary uppercase mt-1">{template.category}</div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-4 p-4 bg-bg-tertiary/30 rounded border border-border-secondary">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-sm text-text-primary">
            <Edit3 className="w-4 h-4" />
            Cấu trúc Template
          </h4>
          
          <div className="space-y-3">
             {selectedTemplate.structure.sections.sort((a,b) => a.order - b.order).map(section => (
               <div key={section.id} className="bg-bg-secondary p-3 rounded border border-border-secondary text-sm">
                 <div className="font-semibold text-text-primary mb-1">{section.label} ({section.type})</div>
                 <pre className="whitespace-pre-wrap text-text-secondary font-mono text-xs bg-bg-tertiary p-2 rounded">
                   {section.content}
                 </pre>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
