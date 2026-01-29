import { useState, useCallback } from 'react';
import { PromptTemplate, AIPersona, AdvancedPromptConfig } from '../types';

export const usePromptTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);

  const buildPromptFromTemplate = useCallback((
    template: PromptTemplate,
    variables: Record<string, any>,
    persona?: AIPersona
  ): string => {
    let prompt = '';

    // Add persona if provided
    if (persona) {
      prompt += `# Role\nYou are ${persona.role}.\n\n`;
      prompt += `## Personality\n${persona.personality}\n\n`;
      prompt += `## Expertise\n${persona.expertise.join(', ')}\n\n`;
      prompt += `## Communication Style\n${persona.tone}\n\n`;
      
      if (persona.constraints && persona.constraints.length > 0) {
        prompt += `## Constraints\n${persona.constraints.map(c => `- ${c}`).join('\n')}\n\n`;
      }
    }

    // Build prompt from template sections
    const sortedSections = [...template.structure.sections].sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
      let sectionContent = section.content;
      
      // Replace variables
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        sectionContent = sectionContent.replace(regex, variables[key]);
      });

      if (sectionContent.trim()) {
        prompt += `# ${section.label}\n${sectionContent}\n\n`;
      }
    });

    return prompt.trim();
  }, []);

  const saveCustomTemplate = useCallback((template: PromptTemplate) => {
    setCustomTemplates(prev => [...prev, template]);
    // Note: In a real app, you might want to debounce this or handle errors
    try {
      localStorage.setItem('customTemplates', JSON.stringify([...customTemplates, template]));
    } catch (e) {
      console.error('Failed to save custom template', e);
    }
  }, [customTemplates]);

  const loadCustomTemplates = useCallback(() => {
    try {
      const saved = localStorage.getItem('customTemplates');
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom templates', e);
    }
  }, []);

  const createDefaultTemplate = (): PromptTemplate => ({
    id: 'default',
    name: 'Default Template',
    category: 'general',
    structure: {
      sections: [
        {
          id: 'task',
          type: 'task',
          label: 'Task',
          content: 'Please help with the following task',
          editable: true,
          required: true,
          order: 1
        }
      ],
      variables: []
    }
  });

  const generateAdvancedPrompt = useCallback((config: AdvancedPromptConfig): string => {
    let prompt = '';

    // Model-specific optimizations
    if (config.targetModel.provider === 'openai') {
      prompt = '# Instructions\n';
    } else if (config.targetModel.provider === 'anthropic') {
      prompt = 'Human: ';
    }

    // Add persona
    if (config.persona) {
      // If we have a template, use it combined with persona
      // Otherwise just use persona info
      if (config.template) {
         // Logic to combine template + persona would be here or called via buildPromptFromTemplate
         // For now, let's assume we construct it manually or reuse logic
          prompt += `# Role\nYou are ${config.persona.role}.\n\n`;
          prompt += `## Personality\n${config.persona.personality}\n\n`;
      } else {
           prompt += `# Role\nYou are ${config.persona.role}.\n\n`;
      }
    }
    
    // Simple template application if available
    if (config.template) {
         const sortedSections = [...config.template.structure.sections].sort((a, b) => a.order - b.order);
         sortedSections.forEach(section => {
             prompt += `\n# ${section.label}\n${section.content}\n`;
         });
    }


    // Add Chain of Thought if enabled
    if (config.chainOfThought) {
      prompt += '\n\nPlease think through this step-by-step:\n';
      prompt += '1. First, understand the problem\n';
      prompt += '2. Break it down into components\n';
      prompt += '3. Analyze each component\n';
      prompt += '4. Synthesize the solution\n';
      prompt += '5. Verify the result\n';
    }

    // Add few-shot examples
    if (config.fewShotExamples && config.fewShotExamples.length > 0) {
      prompt += '\n\n## Examples:\n';
      config.fewShotExamples.forEach((example, index) => {
        prompt += `\nExample ${index + 1}:\n`;
        prompt += `Input: ${example.input}\n`;
        prompt += `Output: ${example.output}\n`;
      });
    }

    // Add output format instructions
    if (config.outputFormat !== 'text') {
      prompt += `\n\nPlease format your response as ${config.outputFormat}`;
      if (config.outputFormat === 'json') {
        prompt += ' with proper structure and valid syntax';
      }
      prompt += '.';
    }

    return prompt;
  }, []);

  return {
    templates,
    customTemplates,
    buildPromptFromTemplate,
    saveCustomTemplate,
    loadCustomTemplates,
    generateAdvancedPrompt
  };
};
