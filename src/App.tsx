import React, { useState } from 'react';

import { useAppState } from './hooks/useAppState';
import { useAiApi } from './hooks/useAiApi';
import { usePromptTemplates } from './hooks/usePromptTemplates'; // Import hook
import { AdvancedPromptConfig } from './types'; // Import types

import { CATEGORIES, CUSTOM_GOAL_FIELDS, PROMPT_STYLES, PROMPT_TECHNIQUES } from './constants';

import { Sidebar } from './components/sidebar/Sidebar';
import { Header } from './components/Header';
import { WizardStep } from './components/WizardStep';
import { CategorySelector } from './components/CategorySelector';
import { GoalSelector } from './components/GoalSelector';
import { InputForm } from './components/InputForm';
import { StyleAndTechnique } from './components/StyleAndTechnique';
import { PromptOutput } from './components/PromptOutput';
import { AiSuggestionOutput } from './components/AiSuggestionOutput';
import { AiConfigModal } from './components/modals/AiConfigModal';
import { ImportPromptModal } from './components/modals/ImportPromptModal';
import { ChatModal } from './components/modals/ChatModal';
import { AdvancedPromptBuilder } from './components/AdvancedPromptBuilder'; // Import component
import { Tooltip } from './components/common/Tooltip';
import { ImproveWithAIIcon, ImportIcon, SettingsIcon } from './components/common/Icons';
import { Sparkles, Zap } from 'lucide-react'; // Import icons

export default function App() {
  const {
    state,
    t,
    actions,
    computed,
  } = useAppState();

  const {
    aiState,
    aiActions,
  } = useAiApi(
    t,
    state.activeAiConfigId,
    state.aiConfigs,
    actions.setGeneratedPrompt,
    actions.setAiSuggestion,
    actions.setPromptHistory,
    actions.setCurrentPromptHistoryId,
    actions.setFormData,
  );

  const { generateAdvancedPrompt } = usePromptTemplates(); // Init hook
  const [isAdvancedMode, setIsAdvancedMode] = useState(false); // Local state for mode

  const handleGenerateClick = () => {
    const promptObj = computed.generatePromptObject();
    if (promptObj) {
      actions.handleGenerateClick(promptObj);
    }
  };

  const handleAdvancedBuild = (config: AdvancedPromptConfig) => {
      const promptString = generateAdvancedPrompt(config);
      // Create a PromptObject that wraps the generated string
      // Since generateAdvancedPrompt already includes role, context, etc., we put everything in 'task'
      // and leave others empty to avoid duplication in PromptOutput
      actions.handleGenerateClick({
          role: '', 
          task: promptString,
          context: [],
          customizations: [
              { label: 'Mode', value: 'Advanced' },
              { label: 'Model', value: config.targetModel.name },
              ...(config.persona ? [{ label: 'Persona', value: config.persona.name }] : [])
          ],
          style: { name: 'Advanced Custom', instruction: '' }
      });
  };

  const handleImproveClick = () => {
    const promptObj = computed.generatePromptObject();
    if (promptObj) {
        aiActions.handleImproveWithAi(promptObj, state);
    }
  };

  return (
    <div className={`theme-${state.theme} min-h-screen bg-bg-primary text-text-primary font-sans flex`}>
      <Sidebar
        isOpen={state.isSidebarOpen}
        onClose={() => actions.setIsSidebarOpen(false)}
        t={t}
        language={state.language}
        onLangChange={actions.setLanguage}
        theme={state.theme}
        onThemeChange={actions.setTheme}
        history={state.promptHistory}
        categories={CATEGORIES}
        onLoadHistory={actions.handleLoadFromHistory}
        onDeleteHistory={actions.handleDeleteFromHistory}
        onClearHistory={actions.handleClearHistory}
        onRenameHistory={actions.handleRenameHistoryItem}
        folders={state.folders}
        onAddFolder={actions.handleAddFolder}
        onRenameFolder={actions.handleRenameFolder}
        onDeleteFolder={actions.handleDeleteFolder}
        onMoveItemToFolder={actions.handleMoveItemToFolder}
        aiConfigs={state.aiConfigs}
        activeAiConfigId={state.activeAiConfigId}
        onSetActiveAiConfig={actions.setActiveAiConfigId}
        onAddAiConfig={actions.handleAddNewAiConfig}
        onEditAiConfig={actions.handleEditAiConfig}
        onDeleteAiConfig={actions.handleDeleteAiConfig}
      />

      <main className={`flex-grow transition-all duration-300 ${state.isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        <div className="max-w-5xl mx-auto p-4 md:p-12">
          <Header t={t} />

          {/* Mode Selector Toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center border border-border-secondary rounded-lg bg-bg-primary overflow-hidden shadow-sm">
                <button
                    onClick={() => setIsAdvancedMode(false)}
                    className={`px-8 py-2.5 h-full flex items-center justify-center min-w-[140px] transition-colors text-sm font-medium ${
                        !isAdvancedMode 
                        ? 'bg-bg-secondary text-text-primary shadow-inner' 
                        : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                >
                   {/* Emulating the empty/basic look from screenshot */}
                   <span className={!isAdvancedMode ? 'opacity-100' : 'opacity-70'}>Basic Mode</span>
                </button>
                
                <div className="w-px h-6 bg-border-secondary"></div>

                <button
                    onClick={() => setIsAdvancedMode(true)}
                    className={`px-6 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors ${
                        isAdvancedMode 
                        ? 'bg-bg-secondary text-text-primary shadow-inner' 
                        : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Advanced Mode
                </button>
            </div>
          </div>

          {isAdvancedMode ? (
            <div className="animate-fade-in-up">
                 <AdvancedPromptBuilder onBuildPrompt={handleAdvancedBuild} />
            </div>
          ) : (
            <>
              {/* Category Step - Custom styled to match screenshot */}
              <div className="bg-bg-primary border border-text-primary rounded-xl p-8 max-w-3xl mx-auto shadow-sm mb-8 transition-all duration-300">
                <h2 className="text-xl font-bold mb-6 text-text-primary text-left">{t('steps.step1')}</h2>
                <CategorySelector selectedId={state.selectedCategoryId} onSelect={actions.handleCategorySelect} t={t} />
              </div>

              {computed.selectedCategory && (
                <WizardStep title={t('steps.step2')} isComplete={!!state.selectedGoalId}>
                  <GoalSelector category={computed.selectedCategory} selectedId={state.selectedGoalId} onSelect={actions.handleGoalSelect} t={t} />
                </WizardStep>
              )}

              {computed.selectedGoal && (
                <>
                  <WizardStep title={computed.selectedGoal.id === 'custom' ? t('steps.step3Custom') : t('steps.step3')} isComplete={computed.isFormValid}>
                    {computed.selectedGoal.id === 'custom' ? (
                      <InputForm
                        goal={{
                          id: 'custom',
                          nameKey: 'goals.custom.name',
                          descriptionKey: 'goals.custom.description',
                          inputFields: CUSTOM_GOAL_FIELDS
                        }}
                        formData={state.formData}
                        onChange={actions.handleFormChange}
                        t={t}
                        onGenerateTasks={() => aiActions.handleGenerateCustomTasks(state.formData)}
                        isGeneratingTasks={aiState.isGeneratingTasks}
                      />
                    ) : (
                      <InputForm goal={computed.selectedGoal} formData={state.formData} onChange={actions.handleFormChange} t={t} />
                    )}
                  </WizardStep>

                  <WizardStep title={t('steps.step4')} isComplete={true}>
                    <StyleAndTechnique
                      selectedStyleId={state.selectedStyleId}
                      onSelectStyle={actions.setSelectedStyleId}
                      selectedTechniqueId={state.selectedTechniqueId}
                      onSelectTechnique={actions.setSelectedTechniqueId}
                      fewShotExamples={state.fewShotExamples}
                      setFewShotExamples={actions.setFewShotExamples}
                      ragContext={state.ragContext}
                      setRagContext={actions.setRagContext}
                      customizations={state.customizations}
                      setCustomizations={actions.setCustomizations}
                      t={t}
                    />
                  </WizardStep>

                  <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
                    <button
                      onClick={handleGenerateClick}
                      disabled={!computed.isFormValid}
                      className={`w-full md:w-auto disabled:bg-bg-tertiary disabled:cursor-not-allowed disabled:text-text-tertiary bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent-primary/50 ${computed.isFormValid ? 'animate-pulse' : ''}`}
                    >
                      {t('buttons.buildPrompt')}
                    </button>
                    <Tooltip text={t('output.aiSuggestionTooltip')}>
                      <button
                        onClick={handleImproveClick}
                        disabled={!computed.isFormValid || aiState.isImproving}
                        className="w-full md:w-auto flex items-center justify-center gap-2 disabled:bg-bg-tertiary disabled:cursor-not-allowed disabled:text-text-tertiary bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent-secondary/50"
                      >
                        {aiState.isImproving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('output.aiImproving')}
                          </>
                        ) : (
                          <>
                            <ImproveWithAIIcon />
                            {t('buttons.improveWithAI')}
                          </>
                        )}
                      </button>
                    </Tooltip>
                    <button
                      onClick={() => actions.setIsImportModalOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-bg-tertiary hover:bg-border-secondary text-text-secondary font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-border-secondary/50"
                    >
                      <ImportIcon />
                      {t('buttons.importAndImprove')}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {state.generatedPrompt && (
            <div className="mt-10">
              <PromptOutput prompt={state.generatedPrompt} t={t} onTestInChat={actions.handleOpenChatTest} historyId={state.currentPromptHistoryId} />
            </div>
          )}

          {state.aiSuggestion && (
            <div className="mt-6">
              <AiSuggestionOutput suggestion={state.aiSuggestion} t={t} onTestInChat={actions.handleOpenChatTest} historyId={state.currentPromptHistoryId} />
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => actions.setIsSidebarOpen(true)}
          className="bg-accent-primary hover:bg-accent-primary-hover text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-accent-primary/50"
          aria-label={t('sidebar.toggle')}
        >
          <SettingsIcon />
        </button>
      </div>

      <AiConfigModal
        isOpen={state.isAiConfigModalOpen}
        onClose={() => actions.setIsAiConfigModalOpen(false)}
        onSave={actions.handleSaveAiConfig}
        config={state.editingAiConfig}
        t={t}
      />

      <ImportPromptModal
        isOpen={state.isImportModalOpen}
        onClose={() => actions.setIsImportModalOpen(false)}
        onImprove={(promptText) => aiActions.handleImproveImportedPrompt(promptText, () => actions.setIsImportModalOpen(false))}
        isImproving={aiState.isImproving}
        t={t}
      />

      <ChatModal
        isOpen={state.isChatModalOpen}
        onClose={() => actions.setIsChatModalOpen(false)}
        systemPrompt={state.chatSystemPrompt}
        activeAiConfigId={state.activeAiConfigId}
        aiConfigs={state.aiConfigs}
        onSaveChat={actions.handleSaveChat}
        messages={state.chatMessages}
        setMessages={actions.setChatMessages}
        t={t}
      />
    </div>
  );
}
