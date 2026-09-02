/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArchetypeId, AssessmentResult, Challenge, DailyOracleCard, JournalEntry, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { LandingView } from './components/landing/LandingView';
import { TestView } from './components/test/TestView';
import { ResultView } from './components/result/ResultView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ArchetypesListView } from './components/archetypes/ArchetypesListView';
import { ArchetypeComparisonView } from './components/archetypes/ArchetypeComparisonView';
import { SynergiesExplorerView } from './components/archetypes/SynergiesExplorerView';
import { JournalView } from './components/journal/JournalView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { AiReflectionView } from './components/ai/AiReflectionView';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { DailyOracleModal } from './components/archetypes/DailyOracleModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [testType, setTestType] = useState<'full' | 'quick'>('full');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<ArchetypeId | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [aiInitialPersona, setAiInitialPersona] = useState<string>('general');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDailyOracleOpen, setIsDailyOracleOpen] = useState(false);

  // Persistent States
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(() =>
    StorageService.getCurrentResult()
  );
  const [history, setHistory] = useState<AssessmentResult[]>(() =>
    StorageService.getAssessmentHistory()
  );
  const [challenges, setChallenges] = useState<Challenge[]>(() =>
    StorageService.getChallenges()
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    StorageService.getJournalEntries()
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    StorageService.getUserProfile()
  );
  const [dailyCard] = useState<DailyOracleCard>(() =>
    StorageService.getDailyOracleCard()
  );

  // Sync state helpers
  const handleStartTest = (type: 'full' | 'quick' = 'full') => {
    setTestType(type);
    setCurrentTab('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteTest = (result: AssessmentResult) => {
    setCurrentResult(result);
    setHistory(StorageService.getAssessmentHistory());
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArchetype = (id: ArchetypeId | null) => {
    setSelectedArchetypeId(id);
    if (id) {
      setCurrentTab('archetypes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDiscussWithAi = (prompt: string, personaId?: string) => {
    setAiInitialPrompt(prompt);
    setAiInitialPersona(personaId || 'general');
    setCurrentTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleChallenge = (id: string) => {
    const updated = StorageService.toggleChallenge(id);
    setChallenges([...updated]);
  };

  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    StorageService.addJournalEntry(entry);
    setJournalEntries(StorageService.getJournalEntries());
  };

  const handleDeleteJournalEntry = (id: string) => {
    StorageService.deleteJournalEntry(id);
    setJournalEntries(StorageService.getJournalEntries());
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    StorageService.saveUserProfile(profile);
    setUserProfile(profile);
    // Refresh states in case account switched
    setCurrentResult(StorageService.getCurrentResult());
    setHistory(StorageService.getAssessmentHistory());
    setJournalEntries(StorageService.getJournalEntries());
    setChallenges(StorageService.getChallenges());
  };

  const handleResetAllData = () => {
    if (
      window.confirm(
        '¿Estás seguro de que deseas reiniciar tus datos locales de la sesión activa?'
      )
    ) {
      localStorage.clear();
      setCurrentResult(null);
      setHistory([]);
      setChallenges(StorageService.getChallenges());
      setJournalEntries(StorageService.getJournalEntries());
      setUserProfile(StorageService.getUserProfile());
      setCurrentTab('landing');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1110] text-[#F2EFE6] font-sans antialiased flex flex-col md:flex-row selection:bg-[#315C45] selection:text-[#F2EFE6]">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab !== 'archetypes') setSelectedArchetypeId(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentResult={currentResult}
        onStartTest={handleStartTest}
        onOpenDailyOracle={() => setIsDailyOracleOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={tab => {
            if (tab !== 'archetypes') setSelectedArchetypeId(null);
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStartTest={handleStartTest}
          onOpenDailyOracle={() => setIsDailyOracleOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          userProfile={userProfile}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-10 max-w-7xl mx-auto w-full">
          {currentTab === 'landing' && (
            <LandingView
              onStartTest={handleStartTest}
              onSelectTab={setCurrentTab}
              onSelectArchetype={handleSelectArchetype}
              currentResult={currentResult}
            />
          )}

          {currentTab === 'test' && (
            <TestView
              testType={testType}
              onComplete={handleCompleteTest}
              onCancel={() => setCurrentTab(currentResult ? 'dashboard' : 'landing')}
            />
          )}

          {currentTab === 'result' && currentResult && (
            <ResultView
              result={currentResult}
              onSelectTab={setCurrentTab}
              onSelectArchetype={handleSelectArchetype}
              onRetakeTest={() => handleStartTest('full')}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              currentResult={currentResult}
              history={history}
              challenges={challenges}
              journalEntries={journalEntries}
              onSelectTab={setCurrentTab}
              onSelectArchetype={handleSelectArchetype}
              onStartTest={handleStartTest}
              onToggleChallenge={handleToggleChallenge}
            />
          )}

          {currentTab === 'archetypes' && (
            <ArchetypesListView
              selectedArchetypeId={selectedArchetypeId}
              onSelectArchetype={setSelectedArchetypeId}
              onSelectTab={setCurrentTab}
              onDiscussWithAi={handleDiscussWithAi}
            />
          )}

          {currentTab === 'compare' && (
            <ArchetypeComparisonView
              onGoToAiWithPrompt={handleDiscussWithAi}
              onGoToDetail={handleSelectArchetype}
            />
          )}

          {currentTab === 'synergies' && (
            <SynergiesExplorerView onSelectArchetype={handleSelectArchetype} />
          )}

          {currentTab === 'journal' && (
            <JournalView
              entries={journalEntries}
              onAddEntry={handleAddJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
            />
          )}

          {currentTab === 'challenges' && (
            <ChallengesView
              challenges={challenges}
              onToggleChallenge={handleToggleChallenge}
              onSelectArchetype={handleSelectArchetype}
            />
          )}

          {currentTab === 'ai' && (
            <AiReflectionView
              currentResult={currentResult}
              initialPrompt={aiInitialPrompt}
              initialPersona={aiInitialPersona}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              history={history}
              onUpdateProfile={handleUpdateProfile}
              onSelectResult={res => {
                setCurrentResult(res);
                StorageService.saveCurrentResult(res);
              }}
              onSelectTab={setCurrentTab}
              onResetAllData={handleResetAllData}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={tab => {
            if (tab !== 'archetypes') setSelectedArchetypeId(null);
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDailyOracle={() => setIsDailyOracleOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onStartTest={handleStartTest}
        />
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onUserChange={handleUpdateProfile}
      />

      <DailyOracleModal
        isOpen={isDailyOracleOpen}
        onClose={() => setIsDailyOracleOpen(false)}
        card={dailyCard}
        onGoToJournalWithPrompt={(prompt, archId) => {
          handleAddJournalEntry({
            title: `Reflexión: Carta del Día`,
            content: `Pregunta de indagación: "${prompt}"\n\n`,
            relatedArchetypes: [archId as ArchetypeId],
            promptUsed: prompt,
            mood: 'Reflexivo',
          });
          setCurrentTab('journal');
        }}
        onGoToAiWithPrompt={(prompt, personaId) => {
          handleDiscussWithAi(prompt, personaId);
        }}
      />
    </div>
  );
}
