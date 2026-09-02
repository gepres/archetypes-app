import React from 'react';
import { DIMENSIONS } from '../../data/archetypesData';
import { DimensionId } from '../../types';

interface DimensionBarProps {
  scores: Record<DimensionId, number>;
  compact?: boolean;
}

export const DimensionBar: React.FC<DimensionBarProps> = ({ scores, compact = false }) => {
  const dimensionsList: DimensionId[] = ['mente', 'accion', 'corazon', 'construccion'];

  return (
    <div className={`space-y-3.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      {dimensionsList.map(dimId => {
        const info = DIMENSIONS[dimId];
        const score = scores[dimId] || 50;

        return (
          <div key={dimId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="font-medium text-[#F2EFE6] tracking-wide">{info.name}</span>
                {!compact && (
                  <span className="text-xs text-[#9DA79F] hidden sm:inline">
                    ({info.archetypes.join(', ')})
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-[#D6A84F]">{score}%</span>
            </div>
            {/* Progress bar container */}
            <div className="h-2 w-full bg-[#1A2521] rounded-full overflow-hidden border border-[#23332D]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${score}%`,
                  backgroundColor: info.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
