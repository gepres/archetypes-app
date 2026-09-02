import React from 'react';
import { Compass, Sparkles, Sun, User, Settings, Cpu } from 'lucide-react';
import { UserProfile } from '../../types';
import { NavTab } from './Sidebar';
import { BrandLogo } from '../common/BrandLogo';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onStartTest: (type?: 'full' | 'quick') => void;
  onOpenDailyOracle: () => void;
  onOpenAuthModal: () => void;
  onOpenAiSettings: () => void;
  userProfile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onStartTest,
  onOpenDailyOracle,
  onOpenAuthModal,
  onOpenAiSettings,
  userProfile,
}) => {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B1110] border-b border-[#1E2A25] sticky top-0 z-30">
      <div
        onClick={() => onSelectTab('landing')}
        className="cursor-pointer"
      >
        <BrandLogo size="sm" />
      </div>

      <div className="flex items-center gap-2">
        {/* AI Settings Button */}
        <button
          onClick={onOpenAiSettings}
          className="p-1.5 bg-[#121A17] hover:bg-[#1A2521] text-[#D6A84F] border border-[#315C45] rounded-lg transition-all"
          title="Ajustes de IA y Modelos"
        >
          <Cpu className="w-4 h-4 text-[#D6A84F]" />
        </button>

        {/* Daily Oracle trigger */}
        <button
          onClick={onOpenDailyOracle}
          className="p-1.5 bg-[#121A17] hover:bg-[#1A2521] text-[#D6A84F] border border-[#315C45] rounded-lg transition-all"
          title="Carta del Día"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* User Account / Guest */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121A17] border border-[#23332D] rounded-lg text-xs text-[#F2EFE6]"
          title="Perfil / Cuenta"
        >
          <span>{userProfile.avatarEmoji || '👑'}</span>
          <span className="text-[11px] font-medium hidden sm:inline">{userProfile.name}</span>
        </button>

        {currentTab !== 'test' && (
          <button
            onClick={() => onStartTest('quick')}
            className="text-xs bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            Test
          </button>
        )}
      </div>
    </header>
  );
};
