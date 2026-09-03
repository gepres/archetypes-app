import React from 'react';
import { GenderMode } from '../../types';

interface PerspectiveSwitcherProps {
  gender: GenderMode;
  onGenderChange: (newGender: GenderMode) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const OPTIONS: {
  id: GenderMode;
  glyph: string;
  glyphColor: string;
  label: string;
  title: string;
  activeClasses: string;
}[] = [
  {
    id: 'male',
    glyph: '♂',
    glyphColor: 'text-[#86EFAC]',
    label: 'Masculina',
    title: 'Perspectiva Masculina (El Rey, El Guerrero, El Mago, El Padre...)',
    activeClasses: 'bg-[#315C45] text-[#F2EFE6] border-[#437A5C] shadow-md ring-1 ring-[#86EFAC]/30',
  },
  {
    id: 'female',
    glyph: '♀',
    glyphColor: 'text-[#F472B6]',
    label: 'Femenina',
    title: 'Perspectiva Femenina (La Reina, La Guerrera, La Maga, La Madre...)',
    activeClasses: 'bg-[#7C3AED] text-[#F2EFE6] border-[#9061F9] shadow-md ring-1 ring-[#C084FC]/30',
  },
  {
    id: 'universal',
    glyph: '☯',
    glyphColor: 'text-[#D6A84F]',
    label: 'Universal',
    title: 'Perspectiva Universal (Rey/Reina, Guerrero/Guerrera, Padre/Madre...)',
    activeClasses: 'bg-[#D6A84F] text-[#0E1513] font-bold border-[#E5C278] shadow-md ring-1 ring-[#D6A84F]/40',
  },
];

/**
 * Selector de perspectiva. En movil ocupa el ancho disponible y reparte las tres
 * opciones en columnas iguales; desde sm vuelve a ser la pastilla en linea.
 */
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

  const sizeClasses = isSmall
    ? 'px-1.5 sm:px-2.5 py-1.5 sm:py-1 text-[11px]'
    : isLarge
    ? 'px-2 sm:px-4 py-2 text-xs sm:text-sm'
    : 'px-2 sm:px-3 py-1.5 text-xs';

  return (
    <div
      role="group"
      aria-label="Perspectiva de exploración"
      className={`grid grid-cols-3 gap-1 w-full sm:inline-flex sm:w-auto sm:items-center bg-[#0E1513] p-1 rounded-2xl border border-[#23332D] shadow-sm select-none ${className}`}
    >
      {showLabel && (
        <span
          className={`hidden sm:inline font-bold text-[#8A968D] uppercase tracking-wider px-2.5 whitespace-nowrap ${
            isSmall ? 'text-[9px]' : 'text-[10px]'
          }`}
        >
          Perspectiva Activa:
        </span>
      )}

      {OPTIONS.map(opt => {
        const isOn = current === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            id={`perspective-btn-${opt.id}`}
            onClick={() => onGenderChange(opt.id)}
            aria-pressed={isOn}
            title={opt.title}
            className={`min-w-0 rounded-xl border font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[38px] sm:min-h-0 ${sizeClasses} ${
              isOn
                ? opt.activeClasses
                : 'border-transparent text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#16221E]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`shrink-0 ${isOn && opt.id === 'universal' ? 'text-[#0E1513]' : opt.glyphColor}`}
            >
              {opt.glyph}
            </span>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
