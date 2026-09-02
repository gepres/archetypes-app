import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ARCHETYPES } from '../../data/archetypesData';
import { ArchetypeId, ArchetypeScore } from '../../types';

interface RadarChartComponentProps {
  ranking: ArchetypeScore[];
  compareRanking?: ArchetypeScore[];
  compareLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  ranking,
  compareRanking,
  compareLabel = 'Anterior',
  size = 'md',
}) => {
  // Sort in a stable archetypal order so the polygon has a harmonious geometric shape
  const order: ArchetypeId[] = [
    'rey',
    'padre',
    'creador',
    'mago',
    'sabio',
    'explorador',
    'rebelde',
    'guerrero',
    'heroe',
    'amante',
    'cuidador',
    'bufon',
  ];

  const scoreMap = new Map<ArchetypeId, number>();
  ranking.forEach(r => scoreMap.set(r.archetypeId, r.normalizedScore));

  const compareScoreMap = new Map<ArchetypeId, number>();
  if (compareRanking) {
    compareRanking.forEach(r => compareScoreMap.set(r.archetypeId, r.normalizedScore));
  }

  const chartData = order.map(id => {
    const arch = ARCHETYPES[id];
    return {
      subject: `${arch.emoji} ${arch.name}`,
      archetypeId: id,
      score: scoreMap.get(id) || 40,
      compareScore: compareRanking ? compareScoreMap.get(id) || 40 : undefined,
      fullMark: 100,
    };
  });

  const heightClass = size === 'sm' ? 'h-64' : size === 'lg' ? 'h-96 md:h-[420px]' : 'h-80 md:h-96';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#121A17] border border-[#23332D] p-3 rounded-lg shadow-xl text-xs space-y-1 z-50">
          <p className="font-semibold text-[#F2EFE6] text-sm">{data.subject}</p>
          <p className="text-[#D6A84F]">
            Puntuación actual: <span className="font-bold">{payload[0].value}%</span>
          </p>
          {compareRanking && payload[1] && (
            <p className="text-[#9DA79F]">
              {compareLabel}: <span className="font-bold">{payload[1].value}%</span>
            </p>
          )}
          <p className="text-[#9DA79F] italic pt-1 text-[11px]">
            {ARCHETYPES[data.archetypeId as ArchetypeId]?.concepts.slice(0, 3).join(' · ')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${heightClass} flex items-center justify-center relative`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#1E2A25" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#C5CFC7', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#23332D"
            tick={{ fill: '#6B7A72', fontSize: 9 }}
          />
          {compareRanking && (
            <Radar
              name={compareLabel}
              dataKey="compareScore"
              stroke="#6B7A72"
              fill="#6B7A72"
              fillOpacity={0.15}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
          <Radar
            name="Puntuación actual"
            dataKey="score"
            stroke="#D6A84F"
            fill="#315C45"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
