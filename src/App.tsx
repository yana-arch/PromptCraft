import React from 'react';

import { useAppState } from './hooks/useAppState';
import { useAiApi } from './hooks/useAiApi';

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
import { Tooltip } from './components/common/Tooltip';
import { ImproveWithAIIcon, ImportIcon, SettingsIcon } from './components/common/Icons';

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

  const handleGenerateClick = () => {
    const promptObj = computed.generatePromptObject();
    if (promptObj) {
      actions.handleGenerateClick(promptObj);
    }
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
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Header t={t} />

          <WizardStep title={t('steps.step1')} isComplete={!!state.selectedCategoryId}>
            <CategorySelector selectedId={state.selectedCategoryId} onSelect={actions.handleCategorySelect} t={t} />
          </WizardStep>

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
