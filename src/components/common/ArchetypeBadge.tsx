import React from 'react';
import { ARCHETYPES, DIMENSIONS, getArchetypeName } from '../../data/archetypesData';
import { ArchetypeId, DimensionId, GenderMode } from '../../types';

interface ArchetypeBadgeProps {
  id: ArchetypeId;
  /** Perspectiva activa. Sin ella la insignia dice el nombre universal siempre. */
  gender?: GenderMode;
  size?: 'sm' | 'md' | 'lg';
  showDimension?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ArchetypeBadge: React.FC<ArchetypeBadgeProps> = ({
  id,
  gender = 'male',
  size = 'md',
  showDimension = false,
  onClick,
  className = '',
}) => {
  const archetype = ARCHETYPES[id];
  if (!archetype) return null;

  const dimension = DIMENSIONS[archetype.dimension];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full border border-[#23332D] bg-[#121A17] font-medium text-[#F2EFE6] transition-all whitespace-nowrap ${
        sizeClasses[size]
      } ${
        isInteractive
          ? 'cursor-pointer hover:border-[#D6A84F] hover:bg-[#1A2521] active:scale-95'
          : ''
      } ${className}`}
    >
      <span className="select-none">{archetype.emoji}</span>
      <span className="tracking-tight">{getArchetypeName(id, gender)}</span>
      {showDimension && (
        <span
          className="text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 rounded ml-1 bg-[#1E2A25] text-[#9DA79F]"
        >
          {dimension.name}
        </span>
      )}
    </span>
  );
};
