import type { PromptObject } from '../types';
import { toTitleCase } from './utils';

export const buildTextPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        return prompt.task;
    }

    let output = `${prompt.role} ${prompt.task}\n\n`;

    if (prompt.style) {
        output += `${t('output.style')}: ${prompt.style.name}. ${t('output.styleMeaning')}: ${prompt.style.instruction}\n\n`;
    }

    if (prompt.technique?.instruction) {
        output += `${t('output.technique')}: ${prompt.technique.name}. ${prompt.technique.instruction}\n\n`;
    }

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `EXAMPLES:\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `Example ${i + 1} Input:\n${ex.input}\n`;
            output += `Example ${i + 1} Output:\n${ex.output}\n\n`;
        });
    }

    if (prompt.technique?.ragContext) {
        output += `DOCUMENT TO USE:\n---\n${prompt.technique.ragContext}\n---\n\n`;
    }

    if (prompt.context.length > 0) {
        output += `${t('output.context')}:\n`;
        prompt.context.forEach(c => {
            output += `- ${c.label}: ${c.value}\n`;
        });
    }

    output += `\n${t('output.constraints')}:\n`;
    prompt.customizations.forEach(c => {
        output += `- ${c.label}: ${c.value}\n`;
    });

    return output;
};

export const buildMarkdownPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        return prompt.task;
    }
    let output = `### ${t('output.role')}\n${prompt.role}\n\n`;
    output += `### ${t('output.task')}\n${prompt.task}\n\n`;

    if (prompt.style) {
        output += `### ${t('output.style')}: ${prompt.style.name}\n${prompt.style.instruction}\n\n`;
    }

    if (prompt.technique?.instruction) {
        output += `### ${t('output.technique')}: ${prompt.technique.name}\n${prompt.technique.instruction}\n\n`;
    }

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `### Examples\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `**Example ${i + 1} Input:**\n\`\`\`\n${ex.input}\n\`\`\`\n`;
            output += `**Example ${i + 1} Output:**\n\`\`\`\n${ex.output}\n\`\`\`\n\n`;
        });
    }

    if (prompt.technique?.ragContext) {
        output += `### Document to Use\n---\n${prompt.technique.ragContext}\n---\n\n`;
    }

    if(prompt.context.length > 0) {
        output += `### ${t('output.context')}\n`;
        prompt.context.forEach(c => {
            output += `*   **${c.label}:** ${c.value}\n`;
        });
    }

    output += `\n### ${t('output.constraints')}\n`;
    prompt.customizations.forEach(c => {
        output += `*   **${c.label}:** ${c.value}\n`;
    });

    return output;
};

export const buildXmlPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });

    if (prompt.isAiSuggestion) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n  <ai_improved_prompt>\n    ${escapeXml(prompt.task)}\n  </ai_improved_prompt>\n</prompt>`;
    }

    let output = `<?xml version="1.0" encoding="UTF-8"?>\n<prompt>\n`;
    output += `  <instructions>\n`;
    output += `    <role>${escapeXml(prompt.role)}</role>\n`;
    output += `    <task>${escapeXml(prompt.task)}</task>\n`;
    if (prompt.style) {
        output += `    <style name="${escapeXml(prompt.style.name)}">${escapeXml(prompt.style.instruction)}</style>\n`;
    }
     if (prompt.technique) {
        output += `    <technique name="${escapeXml(prompt.technique.name)}">${escapeXml(prompt.technique.instruction)}</technique>\n`;
    }
    output += `  </instructions>\n`;

    if (prompt.technique?.examples && prompt.technique.examples.length > 0) {
        output += `  <examples>\n`;
        prompt.technique.examples.forEach((ex, i) => {
            output += `    <example number="${i + 1}">\n`;
            output += `      <input>${escapeXml(ex.input)}</input>\n`;
            output += `      <output>${escapeXml(ex.output)}</output>\n`;
            output += `    </example>\n`;
        });
        output += `  </examples>\n`;
    }

     if (prompt.technique?.ragContext) {
        output += `  <document_context>${escapeXml(prompt.technique.ragContext)}</document_context>\n`;
    }

    if(prompt.context.length > 0) {
      output += `  <context>\n`;
      prompt.context.forEach(c => {
          const tagName = toTitleCase(c.label).replace(/[^a-zA-Z0-9]/g, '');
          output += `    <${tagName}>${escapeXml(c.value)}</${tagName}>\n`;
      });
      output += `  </context>\n`;
    }

    output += `  <constraints>\n`;
    prompt.customizations.forEach(c => {
        const tagName = toTitleCase(c.label).replace(/[^a-zA-Z0-9]/g, '');
        output += `    <${tagName}>${escapeXml(c.value)}</${tagName}>\n`;
    });
    output += `  </constraints>\n`;

    output += `</prompt>`;
    return output;
};

export const buildJsonPrompt = (prompt: PromptObject): string => {
    if (prompt.isAiSuggestion) {
        return JSON.stringify({ ai_improved_prompt: prompt.task }, null, 2);
    }
    return JSON.stringify(prompt, null, 2);
};

export const buildYamlPrompt = (prompt: PromptObject, t: (key: string) => string): string => {
    if (prompt.isAiSuggestion) {
        const indentedText = prompt.task.split('\n').map(line => `  ${line}`).join('\n');
        return `ai_improved_prompt: |\n${indentedText}`;
    }

    let output = `role: "${prompt.role}"\n`;
    output += `task: "${prompt.task}"\n`;
    if (prompt.style) {
        output += `style:\n  name: "${prompt.style.name}"\n  instruction: "${prompt.style.instruction}"\n`;
    }
    if (prompt.technique) {
        output += `technique:\n  name: "${prompt.technique.name}"\n  instruction: "${prompt.technique.instruction}"\n`;
         if (prompt.technique.examples && prompt.technique.examples.length > 0) {
            output += `  examples:\n`;
            prompt.technique.examples.forEach(ex => {
                output += `    - input: "${ex.input.replace(/"/g, '\\"')}"\n      output: "${ex.output.replace(/"/g, '\\"')}"\n`;
            });
        }
        if (prompt.technique.ragContext) {
            const indentedContext = prompt.technique.ragContext.split('\n').map(line => `    ${line}`).join('\n');
            output += `  rag_context: |\n${indentedContext}\n`;
        }
    }
    if (prompt.context.length > 0) {
        output += `context:\n`;
        prompt.context.forEach(c => {
            output += `  - label: "${c.label}"\n    value: "${c.value}"\n`;
        });
    }
    if (prompt.customizations.length > 0) {
        output += `constraints:\n`;
        prompt.customizations.forEach(c => {
            output += `  - label: "${c.label}"\n    value: "${c.value}"\n`;
        });
    }
    return output;
};
