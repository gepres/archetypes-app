import React from 'react';
import { GenderMode } from '../../types';

interface PerspectiveSwitcherProps {
  gender: GenderMode;
  onGenderChange: (newGender: GenderMode) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PerspectiveSwitcher: React.FC<PerspectiveSwitcherProps> = ({
  gender = 'male',
  onGenderChange,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const current = gender || 'male';

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div
      className={`inline-flex items-center gap-1 bg-[#0E1513] p-1 rounded-2xl border border-[#23332D] shadow-sm select-none ${className}`}
    >
      {showLabel && (
        <span
          className={`font-bold text-[#8A968D] uppercase tracking-wider px-2.5 ${
            isSmall ? 'text-[9px]' : 'text-[10px]'
          }`}
        >
          Perspectiva Activa:
        </span>
      )}

      {/* Masculina */}
      <button
        type="button"
        id="perspective-btn-male"
        onClick={() => onGenderChange('male')}
        className={`rounded-xl font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
          isSmall ? 'px-2.5 py-1 text-[11px]' : isLarge ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
        } ${
          current === 'male'
            ? 'bg-[#315C45] text-[#F2EFE6] border border-[#437A5C] shadow-md ring-1 ring-[#86EFAC]/30'
            : 'text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#16221E]'
        }`}
        title="Perspectiva Masculina (El Rey, El Guerrero, El Mago, El Padre...)"
      >
        <span className="text-[#86EFAC]">♂</span>
        <span>Masculina</span>
      </button>

      {/* Femenina */}
      <button
        type="button"
        id="perspective-btn-female"
        onClick={() => onGenderChange('female')}
        className={`rounded-xl font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
          isSmall ? 'px-2.5 py-1 text-[11px]' : isLarge ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
        } ${
          current === 'female'
            ? 'bg-[#7C3AED] text-[#F2EFE6] border border-[#9061F9] shadow-md ring-1 ring-[#C084FC]/30'
            : 'text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#16221E]'
        }`}
        title="Perspectiva Femenina (La Reina, La Guerrera, La Maga, La Madre...)"
      >
        <span className="text-[#F472B6]">♀</span>
        <span>Femenina</span>
      </button>

      {/* Universal */}
      <button
        type="button"
        id="perspective-btn-universal"
        onClick={() => onGenderChange('universal')}
        className={`rounded-xl font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
          isSmall ? 'px-2.5 py-1 text-[11px]' : isLarge ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
        } ${
          current === 'universal'
            ? 'bg-[#D6A84F] text-[#0E1513] font-bold border border-[#E5C278] shadow-md ring-1 ring-[#D6A84F]/40'
            : 'text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#16221E]'
        }`}
        title="Perspectiva Universal (Rey/Reina, Guerrero/Guerrera, Padre/Madre...)"
      >
        <span className={current === 'universal' ? 'text-[#0E1513]' : 'text-[#D6A84F]'}>☯</span>
        <span>Universal</span>
      </button>
    </div>
  );
};
