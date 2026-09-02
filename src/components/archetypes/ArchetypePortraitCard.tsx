import React from 'react';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { Archetype, ArchetypeId } from '../../types';
import { DIMENSIONS } from '../../data/archetypesData';
import { Sparkles } from 'lucide-react';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';

interface ArchetypePortraitCardProps {
  archetype: Archetype;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'avatar';
  showBadge?: boolean;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ArchetypePortraitCard: React.FC<ArchetypePortraitCardProps> = ({
  archetype,
  size = 'md',
  showBadge = true,
  showDetails = false,
  className = '',
  onClick,
}) => {
  const visual = ARCHETYPE_VISUALS[archetype.id] || {
    portraitUrl: '',
    avatarUrl: '',
    characterTitle: archetype.name,
    badgeSymbol: archetype.emoji,
    elementAura: archetype.colorHex || '#D6A84F',
    characterClass: 'Arquetipo',
    vibeSummary: archetype.shortDescription,
  };

  const dim = DIMENSIONS[archetype.dimension];
  const auraColor = visual.elementAura || archetype.colorHex || '#D6A84F';

  // Size styles
  const sizeConfig = {
    avatar: 'w-10 h-10 rounded-xl',
    sm: 'w-16 h-16 rounded-2xl',
    md: 'w-full h-44 rounded-2xl',
    lg: 'w-full h-64 rounded-3xl',
    hero: 'w-full sm:w-72 h-72 rounded-3xl',
  }[size];

  if (size === 'avatar') {
    return (
      <div
        className={`relative shrink-0 overflow-hidden border border-[#315C45] ${sizeConfig} ${className}`}
        style={{ borderColor: `${auraColor}80` }}
        onClick={onClick}
      >
        <ArchetypeIllustratedArtwork archetypeId={archetype.id} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden group select-none border transition-all duration-300 ${sizeConfig} ${className}`}
      style={{
        borderColor: `${auraColor}40`,
        boxShadow: `0 10px 30px -10px ${auraColor}25`,
      }}
    >
      {/* Background Character Illustrated Artwork */}
      <div className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
        <ArchetypeIllustratedArtwork archetypeId={archetype.id} className="w-full h-full object-cover" />
      </div>

      {/* Atmospheric dark gradient overlays to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1110] via-[#0B1110]/40 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

      {/* Top badges */}
      {showBadge && (
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Dimension pill */}
          <span
            className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border shadow-md"
            style={{
              backgroundColor: '#0E1513D9',
              color: auraColor,
              borderColor: `${auraColor}60`,
            }}
          >
            {dim.name}
          </span>

          {/* Emoji Badge */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base backdrop-blur-md border shadow-md"
            style={{
              backgroundColor: '#0E1513D9',
              borderColor: `${auraColor}50`,
            }}
          >
            {archetype.emoji}
          </div>
        </div>
      )}

      {/* Bottom Info Bar inside Character Visual */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles className="w-3 h-3 text-[#D6A84F]" />
          <span className="text-[10px] font-bold text-[#E5D7B7] uppercase tracking-wider">
            {visual.characterClass}
          </span>
        </div>
        <h4 className="font-serif text-lg font-bold text-[#F2EFE6] tracking-tight leading-tight group-hover:text-[#D6A84F] transition-colors drop-shadow-sm">
          {archetype.name}
        </h4>
        <p className="text-[11px] text-[#A6B2A8] font-medium leading-tight line-clamp-1 mt-0.5">
          {visual.characterTitle}
        </p>

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#C5CFC7]">
            <span>Símbolo: {archetype.symbol}</span>
            <span className="text-[#D6A84F] font-bold">Ver Ficha →</span>
          </div>
        )}
      </div>

      {/* Subtle glowing ring on hover */}
      <div
        className="absolute inset-0 border-2 border-transparent group-hover:border-[#D6A84F]/60 rounded-inherit transition-colors pointer-events-none"
      />
    </div>
  );
};

