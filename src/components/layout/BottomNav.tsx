import React, { useState } from 'react';
import {
  Compass,
  LayoutDashboard,
  BookOpen,
  Bot,
  Grid,
  X,
  Sparkles,
  GitCompare,
  GitMerge,
  CheckCircle2,
  User,
  Sun,
  ClipboardList,
  ChevronRight,
  Cpu,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from './Sidebar';
import { AiModelStatusBadge } from '../common/AiModelStatusBadge';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDailyOracle?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAiSettings?: () => void;
  onStartTest?: (type?: 'full' | 'quick') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenDailyOracle,
  onOpenAuthModal,
  onOpenAiSettings,
  onStartTest,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Primary 4 tabs on the bottom bar
  const primaryTabs: Array<{ id: NavTab; label: string; icon: React.ElementType }> = [
    { id: 'landing', label: 'Inicio', icon: Compass },
    { id: 'dashboard', label: 'Mi Mapa', icon: LayoutDashboard },
    { id: 'archetypes', label: 'Arquetipos', icon: BookOpen },
    { id: 'ai', label: 'IA Chat', icon: Bot },
  ];

  // Secondary tools shown in the expanded drawer
  const moreTools: Array<{
    id: NavTab;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'journal',
      label: 'Diario de Reflexión',
      description: 'Preguntas profundas y registro personal',
      icon: Sparkles,
    },
    {
      id: 'challenges',
      label: 'Retos de Desarrollo',
      description: 'Hábitos diarios para integrar arquetipos',
      icon: CheckCircle2,
    },
    {
      id: 'compare',
      label: 'Comparador & Matriz',
      description: 'Contrasta 2 o 3 arquetipos frente a frente',
      icon: GitCompare,
      badge: 'Nuevo',
    },
    {
      id: 'synergies',
      label: 'Relaciones & Sinergias',
      description: 'Dinámicas vinculares, luces y tensiones',
      icon: GitMerge,
    },
    {
      id: 'profile',
      label: 'Mi Perfil & Cuentas',
      description: 'Historial, respaldo y cambio de usuario',
      icon: User,
    },
  ];

  // Check if current tab is one of the secondary items
  const isSecondaryActive = moreTools.some(t => t.id === currentTab);

  const handleSelect = (tab: NavTab) => {
    setIsMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <>
      {/* Expanded Navigation Drawer / Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0E1513] border-t border-[#23332D] rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Handle bar */}
              <div className="w-12 h-1.5 bg-[#23332D] rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2A25]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
                    Herramientas del Mapa
                  </h3>
                  <p className="text-[11px] text-[#9DA79F]">
                    Explora todas las áreas de autoconocimiento
                  </p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-[#16221E] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {onOpenDailyOracle && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDailyOracle();
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-br from-[#1A2822] to-[#121A17] border border-[#315C45] hover:border-[#D6A84F] flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#121A17] border border-[#315C45] flex items-center justify-center text-[#D6A84F] shrink-0">
                      <Sun className="w-4 h-4 text-[#D6A84F] group-hover:rotate-45 transition-transform" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F2EFE6] block leading-tight">
                        Carta del Día
                      </span>
                      <span className="text-[10px] text-[#86EFAC]">Oráculo diario</span>
                    </div>
                  </button>
                )}

                {onStartTest && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onStartTest('quick');
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-br from-[#1D2B24] to-[#14201A] border border-[#315C45] hover:border-[#86EFAC] flex items-center gap-2.5 text-left transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#315C45] flex items-center justify-center text-[#F2EFE6] shrink-0 font-bold text-xs">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F2EFE6] block leading-tight">
                        Hacer Test
                      </span>
                      <span className="text-[10px] text-[#9DA79F]">15 o 60 preguntas</span>
                    </div>
                  </button>
                )}
              </div>

              {/* AI Status Card inside Drawer */}
              {onOpenAiSettings && (
                <div className="mb-4">
                  <AiModelStatusBadge
                    onOpenSettings={() => {
                      setIsMenuOpen(false);
                      onOpenAiSettings();
                    }}
                    variant="compact"
                  />
                </div>
              )}

              {/* Tools List */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#6B7A72] uppercase tracking-wider px-1">
                  Módulos de Práctica & Análisis
                </div>

                {moreTools.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                        isActive
                          ? 'bg-[#16221E] border-[#315C45] text-[#F2EFE6] shadow-md'
                          : 'bg-[#121A17]/80 hover:bg-[#16221E] border-[#1E2A25] text-[#C5CFC7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#315C45] text-[#D6A84F]'
                              : 'bg-[#0E1513] text-[#9DA79F] border border-[#23332D]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#F2EFE6]">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#315C45] text-[#86EFAC] font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#9DA79F] block leading-tight mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B7A72] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Clean Floating Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1110]/95 backdrop-blur-md border-t border-[#1E2A25] px-3 py-2 flex items-center justify-around shadow-2xl"
      >
        {primaryTabs.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative min-h-[46px] ${
                isActive
                  ? 'text-[#D6A84F]'
                  : 'text-[#8A968D] hover:text-[#F2EFE6]'
              }`}
            >
              {/* Subtle active pill background */}
              {isActive && (
                <span className="absolute inset-0 bg-[#16221E] border border-[#315C45]/60 rounded-xl -z-10 animate-fadeIn" />
              )}
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  isActive ? 'text-[#D6A84F] scale-110' : 'text-[#7B8B82]'
                }`}
              />
              <span className={`text-[10px] tracking-tight font-medium ${isActive ? 'font-bold text-[#F2EFE6]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* "Más" / Tools Menu Button */}
        <button
          id="bottom-nav-more"
          onClick={() => setIsMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative min-h-[46px] ${
            isSecondaryActive || isMenuOpen
              ? 'text-[#D6A84F]'
              : 'text-[#8A968D] hover:text-[#F2EFE6]'
          }`}
        >
          {(isSecondaryActive || isMenuOpen) && (
            <span className="absolute inset-0 bg-[#16221E] border border-[#D6A84F]/50 rounded-xl -z-10" />
          )}
          <Grid
            className={`w-5 h-5 mb-0.5 transition-transform ${
              isSecondaryActive || isMenuOpen ? 'text-[#D6A84F] scale-110' : 'text-[#7B8B82]'
            }`}
          />
          <span className={`text-[10px] tracking-tight font-medium flex items-center gap-1 ${isSecondaryActive ? 'font-bold text-[#F2EFE6]' : ''}`}>
            <span>Más</span>
            {isSecondaryActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F] shrink-0" />
            )}
          </span>
        </button>
      </nav>
    </>
  );
};
