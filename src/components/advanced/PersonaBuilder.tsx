import React, { useState } from 'react';
import { AIPersona } from '../../types';
import { PRESET_PERSONAS } from '../../constants';
import { User, Briefcase, Brain, MessageSquare } from 'lucide-react';

interface PersonaBuilderProps {
  onPersonaSelect: (persona: AIPersona) => void;
  selectedPersona?: AIPersona;
}

export const PersonaBuilder: React.FC<PersonaBuilderProps> = ({
  onPersonaSelect,
  selectedPersona
}) => {
  const [customPersona, setCustomPersona] = useState<Partial<AIPersona>>({});
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleCustomPersonaSubmit = () => {
    const persona: AIPersona = {
      id: `custom-${Date.now()}`,
      name: customPersona.name || 'Custom Persona',
      role: customPersona.role || '',
      personality: customPersona.personality || '',
      expertise: customPersona.expertise || [],
      tone: customPersona.tone || '',
      constraints: customPersona.constraints,
      background: customPersona.background
    };
    onPersonaSelect(persona);
  };

  return (
    <div className="persona-builder p-4 border border-border-primary rounded-lg bg-bg-secondary shadow-sm text-text-primary">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary">
        <User className="w-5 h-5 text-accent-primary" />
        AI Persona Configuration
      </h3>

      <div className="mb-4">
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCustomMode}
            onChange={(e) => setIsCustomMode(e.target.checked)}
            className="rounded text-accent-primary focus:ring-accent-primary"
          />
          <span className="text-sm font-medium text-text-secondary">Tạo persona tùy chỉnh</span>
        </label>
      </div>

      {!isCustomMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedPersona?.id === persona.id
                  ? 'border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary'
                  : 'border-border-primary hover:border-accent-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className="font-medium flex items-center gap-2 text-text-primary">
                <Briefcase className="w-4 h-4 text-text-tertiary" />
                {persona.name}
              </div>
              <div className="text-sm text-text-secondary mt-1">{persona.role}</div>
              <div className="text-xs text-text-tertiary mt-2 flex flex-wrap gap-1">
                {persona.expertise.map((exp, idx) => (
                  <span key={idx} className="bg-bg-tertiary px-1.5 py-0.5 rounded border border-border-secondary">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 bg-bg-tertiary/30 p-4 rounded-lg border border-border-secondary">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Tên persona</label>
            <input
              type="text"
              value={customPersona.name || ''}
              onChange={(e) => setCustomPersona({ ...customPersona, name: e.target.value })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              placeholder="VD: Chuyên gia Marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Vai trò</label>
            <input
              type="text"
              value={customPersona.role || ''}
              onChange={(e) => setCustomPersona({ ...customPersona, role: e.target.value })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              placeholder="VD: Senior Marketing Manager với 10 năm kinh nghiệm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Tính cách</label>
            <textarea
              value={customPersona.personality || ''}
              onChange={(e) => setCustomPersona({ ...customPersona, personality: e.target.value })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              rows={2}
              placeholder="VD: Sáng tạo, phân tích, định hướng kết quả"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Chuyên môn (mỗi dòng một kỹ năng)</label>
            <textarea
              value={customPersona.expertise?.join('\n') || ''}
              onChange={(e) => setCustomPersona({
                ...customPersona,
                expertise: e.target.value.split('\n').filter(s => s.trim())
              })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              rows={3}
              placeholder="Digital Marketing&#10;Content Strategy&#10;Data Analysis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Giọng điệu</label>
            <input
              type="text"
              value={customPersona.tone || ''}
              onChange={(e) => setCustomPersona({ ...customPersona, tone: e.target.value })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              placeholder="VD: Chuyên nghiệp, thân thiện, dễ hiểu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Background (tùy chọn)</label>
            <textarea
              value={customPersona.background || ''}
              onChange={(e) => setCustomPersona({ ...customPersona, background: e.target.value })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              rows={2}
              placeholder="Thông tin về kinh nghiệm, học vấn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Ràng buộc (mỗi dòng một ý)</label>
            <textarea
              value={customPersona.constraints?.join('\n') || ''}
              onChange={(e) => setCustomPersona({
                ...customPersona,
                constraints: e.target.value.split('\n').filter(s => s.trim())
              })}
              className="w-full p-2 border border-border-secondary rounded bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              rows={2}
              placeholder="VD: Tuân thủ GDPR&#10;Không đưa lời khuyên y tế"
            />
          </div>

          <button
            onClick={handleCustomPersonaSubmit}
            className="w-full py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover transition-colors flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Áp dụng Persona
          </button>
        </div>
      )}
    </div>
  );
};
