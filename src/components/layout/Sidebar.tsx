import React from 'react';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bot,
  User,
  ShieldAlert,
  GitMerge,
  GitCompare,
  Sun,
  LogIn,
} from 'lucide-react';
import { AssessmentResult, UserProfile } from '../../types';

export type NavTab =
  | 'landing'
  | 'test'
  | 'result'
  | 'dashboard'
  | 'archetypes'
  | 'compare'
  | 'synergies'
  | 'journal'
  | 'challenges'
  | 'ai'
  | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentResult: AssessmentResult | null;
  onStartTest: (type?: 'full' | 'quick') => void;
  onOpenDailyOracle: () => void;
  onOpenAuthModal: () => void;
  userProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentResult,
  onStartTest,
  onOpenDailyOracle,
  onOpenAuthModal,
  userProfile,
}) => {
  const mainNavItems = [
    { id: 'landing', label: 'Inicio', icon: Compass },
    { id: 'dashboard', label: 'Mi Mapa', icon: LayoutDashboard },
    { id: 'archetypes', label: 'Los 12 Arquetipos', icon: BookOpen },
    { id: 'compare', label: 'Comparador & Matriz', icon: GitCompare },
    { id: 'synergies', label: 'Relaciones & Sinergias', icon: GitMerge },
    { id: 'journal', label: 'Diario de Reflexión', icon: Sparkles },
    { id: 'challenges', label: 'Retos de Desarrollo', icon: CheckCircle2 },
    { id: 'ai', label: 'Habla con tu Mapa (IA)', icon: Bot },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 bg-[#0B1110] border-r border-[#1E2A25] h-screen sticky top-0 shrink-0 select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2A25] flex flex-col gap-1">
        <div
          onClick={() => onSelectTab('landing')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#121A17] border border-[#315C45] flex items-center justify-center text-[#D6A84F] group-hover:border-[#D6A84F] transition-all">
            <span className="font-serif text-xl font-bold">A</span>
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-[#F2EFE6] leading-none">
              Arquetipos
            </h1>
            <p className="text-[10px] text-[#9DA79F] tracking-widest uppercase mt-1">
              Mapa Simbólico
            </p>
          </div>
        </div>
      </div>

      {/* Daily Oracle Trigger Banner */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenDailyOracle}
          className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-[#14221C] to-[#121A17] border border-[#315C45] hover:border-[#D6A84F]/60 text-left transition-all shadow-md group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#1A2521] border border-[#315C45] flex items-center justify-center text-[#D6A84F] text-xs">
              <Sun className="w-4 h-4 text-[#D6A84F] group-hover:rotate-45 transition-transform" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#F2EFE6] block leading-none">
                Carta del Día
              </span>
              <span className="text-[10px] text-[#86EFAC] mt-0.5 block">
                Oráculo Arquetípico
              </span>
            </div>
          </div>
          <span className="text-xs text-[#D6A84F]">✦</span>
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#121A17] text-[#D6A84F] border border-[#23332D] shadow-sm font-semibold'
                  : 'text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#121A17]/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#D6A84F]' : 'text-[#6B7A72]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current Result Highlight or CTA */}
      <div className="p-4 border-t border-[#1E2A25] bg-[#0E1513] space-y-2">
        {currentResult ? (
          <div className="bg-[#121A17] border border-[#23332D] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9DA79F]">Arquetipo central</span>
              <span className="font-bold text-[#D6A84F]">
                {currentResult.dominantArchetype.normalizedScore}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentResult.dominantArchetype.emoji}</span>
              <span className="font-serif font-bold text-sm text-[#F2EFE6]">
                {currentResult.dominantArchetype.name}
              </span>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onSelectTab('result')}
                className="flex-1 py-1 text-[11px] bg-[#1A2521] hover:bg-[#23332D] text-[#C5CFC7] rounded-lg text-center transition-colors font-medium"
              >
                Ver mapa
              </button>
              <button
                onClick={() => onStartTest('full')}
                className="px-2 py-1 text-[11px] bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] rounded-lg transition-colors font-medium"
                title="Reevaluar"
              >
                Reevaluar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-[#9DA79F] leading-tight">
              Descubre tus arquetipos dominantes y áreas de desarrollo.
            </p>
            <button
              id="sidebar-start-test-btn"
              onClick={() => onStartTest('full')}
              className="w-full py-2 px-3 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              Realizar Test (60)
            </button>
          </div>
        )}

        {/* User Account / Guest Status Bar */}
        <div
          onClick={onOpenAuthModal}
          className="p-2.5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] cursor-pointer flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-lg shrink-0">{userProfile.avatarEmoji || '👑'}</span>
            <div className="truncate">
              <span className="text-xs font-semibold text-[#F2EFE6] block truncate">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-[#9DA79F] block">
                {userProfile.isGuest ? 'Invitado (Guardar)' : 'Cuenta Activa'}
              </span>
            </div>
          </div>
          <User className="w-3.5 h-3.5 text-[#6B7A72]" />
        </div>
      </div>
    </aside>
  );
};
