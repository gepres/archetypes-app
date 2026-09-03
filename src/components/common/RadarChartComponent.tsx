import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ARCHETYPES, DIMENSIONS, getArchetypeName } from '../../data/archetypesData';
import { ArchetypeId, ArchetypeScore, DimensionId, GenderMode } from '../../types';

interface RadarChartComponentProps {
  ranking: ArchetypeScore[];
  compareRanking?: ArchetypeScore[];
  compareLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Perspectiva activa: los nombres del gráfico la siguen, como el resto de la app. */
  gender?: GenderMode;
}

/**
 * Los ejes se recorren dimensión a dimensión, así que cada cuadrante del polígono
 * es un territorio: mente, acción, corazón y construcción. El orden sale de
 * DIMENSIONS, no de una lista escrita a mano: así un arquetipo nuevo aparece solo
 * en el gráfico en vez de quedarse fuera en silencio, que es lo que pasó al pasar
 * de doce a dieciocho.
 */
const ORDEN_DIMENSIONES: DimensionId[] = ['mente', 'accion', 'corazon', 'construccion'];

/**
 * El eje se identifica por el id del arquetipo, que es unico por definicion, y no
 * por su emblema: dos arquetipos pueden compartir emoji y entonces el grafico los
 * fusiona en un solo eje sin avisar. Paso de verdad -rey y soberano llevaban los
 * dos la corona- y el radar dibujaba diecisiete de dieciocho.
 */
const EjeEmblema = (props: any) => {
  const { x, y, textAnchor, payload } = props;
  const arch = ARCHETYPES[payload?.value as ArchetypeId];
  if (!arch) return null;
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={15}
      fill="#C5CFC7"
    >
      {arch.emoji}
    </text>
  );
};

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  ranking,
  compareRanking,
  compareLabel = 'Anterior',
  size = 'md',
  gender = 'male',
}) => {
  const orden = useMemo<ArchetypeId[]>(
    () => ORDEN_DIMENSIONES.flatMap(d => DIMENSIONS[d].archetypes),
    []
  );

  const scoreMap = new Map<ArchetypeId, number>();
  ranking.forEach(r => scoreMap.set(r.archetypeId, r.normalizedScore));

  const compareScoreMap = new Map<ArchetypeId, number>();
  if (compareRanking) {
    compareRanking.forEach(r => compareScoreMap.set(r.archetypeId, r.normalizedScore));
  }

  const chartData = orden.map(id => {
    const arch = ARCHETYPES[id];
    return {
      // Con dieciocho ejes los nombres se pisan unos a otros, así que en el eje va
      // el emblema y el nombre completo se lee al posarse encima.
      emoji: arch.emoji,
      nombre: getArchetypeName(id, gender),
      dimension: DIMENSIONS[arch.dimension].name,
      archetypeId: id,
      // Un resultado guardado con la versión de doce no trae los seis nuevos:
      // se dibujan en el centro neutro en vez de romper el polígono.
      score: scoreMap.get(id) ?? 40,
      compareScore: compareRanking ? compareScoreMap.get(id) ?? 40 : undefined,
      fullMark: 100,
    };
  });

  const heightClass = size === 'sm' ? 'h-64' : size === 'lg' ? 'h-96 md:h-[420px]' : 'h-80 md:h-96';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#121A17] border border-[#23332D] p-3 rounded-lg shadow-xl text-xs space-y-1 z-50">
          <p className="font-semibold text-[#F2EFE6] text-sm">
            {data.emoji} {data.nombre}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#718277]">{data.dimension}</p>
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
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="#1E2A25" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="archetypeId" tick={<EjeEmblema />} />
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
