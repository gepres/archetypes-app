/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArchetypeId, AssessmentResult, Challenge, DailyOracleCard, GenderMode, JournalEntry, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { adaptAssessmentResultToGender } from './services/scoringEngine';
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
import { AiSettingsModal } from './components/ai/AiSettingsModal';
import { InstallAppBanner } from './components/pwa/InstallAppBanner';
import { OnboardingView } from './components/onboarding/OnboardingView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [testType, setTestType] = useState<'full' | 'quick'>('full');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<ArchetypeId | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [aiInitialPersona, setAiInitialPersona] = useState<string>('general');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDailyOracleOpen, setIsDailyOracleOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  // Bienvenida a pantalla completa: se muestra hasta que se elige perspectiva.
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('archetype_perspective_selected');
    } catch {
      return false;
    }
  });

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

  // Quien llega desde la V2 acaba de hacer el test: tiene que aterrizar en su
  // mapa, no en la portada. Sin esto el resultado queda guardado pero invisible,
  // que para quien lo acaba de ganar es lo mismo que perderlo.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ver') !== 'mapa') return;
      // La direccion se limpia para que recargar no vuelva a forzar la pestana.
      window.history.replaceState({}, '', window.location.pathname);
      setCurrentTab(StorageService.getCurrentResult() ? 'result' : 'landing');
    } catch {}
  }, []);

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

  const handleGenderChange = (newGender: GenderMode) => {
    try {
      localStorage.setItem('archetype_perspective_selected', 'true');
    } catch {}

    const updatedProfile: UserProfile = {
      ...userProfile,
      gender: newGender,
    };
    StorageService.saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);

    // If there is an active assessment result, re-adapt its labels and composite profile
    if (currentResult) {
      const adapted = adaptAssessmentResultToGender(currentResult, newGender);
      setCurrentResult(adapted);
      StorageService.saveCurrentResult(adapted);
    }

    // Also re-adapt history
    const currentHistory = StorageService.getAssessmentHistory();
    if (currentHistory.length > 0) {
      const adaptedHistory = currentHistory.map(item => adaptAssessmentResultToGender(item, newGender));
      setHistory(adaptedHistory);
      StorageService.saveAssessmentHistory(adaptedHistory);
    }
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    const genderChanged = profile.gender !== userProfile.gender;
    StorageService.saveUserProfile(profile);
    setUserProfile(profile);

    let res = StorageService.getCurrentResult();
    let hist = StorageService.getAssessmentHistory();

    if (genderChanged && profile.gender) {
      if (res) {
        res = adaptAssessmentResultToGender(res, profile.gender);
        StorageService.saveCurrentResult(res);
      }
      if (hist.length > 0) {
        hist = hist.map(item => adaptAssessmentResultToGender(item, profile.gender!));
        StorageService.saveAssessmentHistory(hist);
      }
    }

    setCurrentResult(res);
    setHistory(hist);
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

  const handleFinishOnboarding = (gender: GenderMode) => {
    handleGenderChange(gender);
    setIsOnboardingOpen(false);
    setCurrentTab('landing');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // El test se hace a pantalla completa, sin barra lateral, cabecera ni
  // navegacion inferior. Responder sesenta afirmaciones con el menu de la app
  // alrededor invita a irse; sin el, lo unico que hay que hacer es contestar.
  if (currentTab === 'test') {
    return (
      <TestView
        testType={testType}
        onComplete={handleCompleteTest}
        onCancel={() => setCurrentTab(currentResult ? 'dashboard' : 'landing')}
      />
    );
  }

  // La bienvenida es una página completa, no una ventana sobre la app.
  if (isOnboardingOpen) {
    return (
      <OnboardingView
        initialGender={userProfile.gender || 'universal'}
        onComplete={handleFinishOnboarding}
      />
    );
  }

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
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
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
          onOpenAiSettings={() => setIsAiSettingsOpen(true)}
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
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
              onOpenIntro={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'result' && currentResult && (
            <ResultView
              result={currentResult}
              onSelectTab={setCurrentTab}
              onSelectArchetype={handleSelectArchetype}
              onRetakeTest={() => handleStartTest('full')}
              gender={userProfile.gender || 'male'}
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
              onOpenAiSettings={() => setIsAiSettingsOpen(true)}
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
            />
          )}

          {currentTab === 'archetypes' && (
            <ArchetypesListView
              selectedArchetypeId={selectedArchetypeId}
              onSelectArchetype={setSelectedArchetypeId}
              onSelectTab={setCurrentTab}
              onDiscussWithAi={handleDiscussWithAi}
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
            />
          )}

          {currentTab === 'compare' && (
            <ArchetypeComparisonView
              onGoToAiWithPrompt={handleDiscussWithAi}
              onGoToDetail={handleSelectArchetype}
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
            />
          )}

          {currentTab === 'synergies' && (
            <SynergiesExplorerView
              onSelectArchetype={handleSelectArchetype}
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
            />
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
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
            />
          )}

          {currentTab === 'ai' && (
            <AiReflectionView
              currentResult={currentResult}
              initialPrompt={aiInitialPrompt}
              initialPersona={aiInitialPersona}
              gender={userProfile.gender || 'male'}
              onGenderChange={handleGenderChange}
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
          onOpenAiSettings={() => setIsAiSettingsOpen(true)}
          onStartTest={handleStartTest}
        />
      </div>

      {/* Ofrecimiento de instalar la app; se oculta solo si ya está instalada */}
      <InstallAppBanner />

      {/* Global Modals */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

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
