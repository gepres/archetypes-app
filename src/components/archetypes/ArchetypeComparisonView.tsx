import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Shield,
  Sun,
  Flame,
  Layers,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId, LifeDomainKey } from '../../types';
import { ArchetypePortraitCard } from './ArchetypePortraitCard';

interface ArchetypeComparisonViewProps {
  onGoToAiWithPrompt: (prompt: string, personaId: string) => void;
  onGoToDetail: (archetypeId: ArchetypeId) => void;
}

const DOMAIN_LABELS: Record<LifeDomainKey, string> = {
  liderazgo: 'Liderazgo & Dirección',
  relaciones: 'Relaciones & Vínculos',
  crisis: 'Crisis & Manejo del Estrés',
  creatividad: 'Creatividad & Obra',
  paternidad: 'Paternidad & Mentoría',
};

export const ArchetypeComparisonView: React.FC<ArchetypeComparisonViewProps> = ({
  onGoToAiWithPrompt,
  onGoToDetail,
}) => {
  const [selectedFirst, setSelectedFirst] = useState<ArchetypeId>('rey');
  const [selectedSecond, setSelectedSecond] = useState<ArchetypeId>('guerrero');
  const [selectedThird, setSelectedThird] = useState<ArchetypeId | 'none'>('mago');
  const [activeDomain, setActiveDomain] = useState<LifeDomainKey>('liderazgo');

  const arch1 = ARCHETYPES[selectedFirst];
  const arch2 = ARCHETYPES[selectedSecond];
  const arch3 = selectedThird !== 'none' ? ARCHETYPES[selectedThird] : null;

  const compareList = arch3 ? [arch1, arch2, arch3] : [arch1, arch2];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121A17] via-[#16221E] to-[#0F1714] border border-[#23332D] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-xs font-semibold uppercase tracking-widest">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Matriz de Contrastes & Alianzas</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F2EFE6] tracking-tight">
            Comparador & Simulador de Arquetipos
          </h1>
          <p className="text-sm text-[#9DA79F] leading-relaxed">
            Contrasta las dinámicas de 2 o 3 arquetipos frente a frente para comprender cómo dialogan sus luces, sombras y respuestas en cada ámbito vital.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-[#121A17] border border-[#23332D] rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selector 1 */}
          <div>
            <label className="block text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-2">
              Primer Arquetipo
            </label>
            <select
              value={selectedFirst}
              onChange={e => setSelectedFirst(e.target.value as ArchetypeId)}
              className="w-full bg-[#0E1513] border border-[#23332D] text-[#F2EFE6] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D6A84F]"
            >
              {ARCHETYPES_LIST.map(a => (
                <option key={`first-${a.id}`} value={a.id}>
                  {a.emoji} {a.name} ({a.dimension})
                </option>
              ))}
            </select>
          </div>

          {/* Selector 2 */}
          <div>
            <label className="block text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-2">
              Segundo Arquetipo
            </label>
            <select
              value={selectedSecond}
              onChange={e => setSelectedSecond(e.target.value as ArchetypeId)}
              className="w-full bg-[#0E1513] border border-[#23332D] text-[#F2EFE6] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D6A84F]"
            >
              {ARCHETYPES_LIST.map(a => (
                <option key={`second-${a.id}`} value={a.id}>
                  {a.emoji} {a.name} ({a.dimension})
                </option>
              ))}
            </select>
          </div>

          {/* Selector 3 (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-2">
              Tercer Arquetipo (Tríada)
            </label>
            <select
              value={selectedThird}
              onChange={e => setSelectedThird(e.target.value as ArchetypeId | 'none')}
              className="w-full bg-[#0E1513] border border-[#23332D] text-[#F2EFE6] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D6A84F]"
            >
              <option value="none">-- Sin tercer arquetipo --</option>
              {ARCHETYPES_LIST.map(a => (
                <option key={`third-${a.id}`} value={a.id}>
                  {a.emoji} {a.name} ({a.dimension})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Life domain filter tabs */}
        <div className="pt-3 border-t border-[#1E2A25]">
          <span className="text-xs text-[#9DA79F] font-semibold block mb-2">
            Ver respuesta comparada en el ámbito de:
          </span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DOMAIN_LABELS) as LifeDomainKey[]).map(domainKey => (
              <button
                key={domainKey}
                onClick={() => setActiveDomain(domainKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeDomain === domainKey
                    ? 'bg-[#315C45] text-[#F2EFE6] shadow-sm font-semibold border border-[#437A5C]'
                    : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D]'
                }`}
              >
                {DOMAIN_LABELS[domainKey]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className={`grid grid-cols-1 ${compareList.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
        {compareList.map((archetype, idx) => (
          <div
            key={archetype.id}
            className="bg-[#121A17] border border-[#23332D] rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-[#315C45]"
          >
            {/* Card Top with Character Portrait */}
            <div className="relative h-44 w-full overflow-hidden bg-[#0E1513]">
              <ArchetypePortraitCard
                archetype={archetype}
                size="md"
                showBadge={true}
                className="w-full h-full rounded-none border-0"
              />
            </div>
            <div className="p-4 border-b border-[#1E2A25] bg-gradient-to-b from-[#16221E] to-[#121A17] text-center">
              <span className="text-[10px] uppercase tracking-widest text-[#D6A84F] font-bold block">
                {ARCHETYPE_VISUALS[archetype.id]?.characterTitle || archetype.symbol}
              </span>
              <p className="text-xs italic text-[#C5CFC7] mt-1 font-serif px-2 line-clamp-2">
                "{archetype.mantra}"
              </p>
            </div>

            {/* Core Metrics */}
            <div className="p-5 flex-1 space-y-4">
              {/* Central Question */}
              <div className="p-3 bg-[#0E1513] rounded-xl border border-[#1E2A25]">
                <span className="text-[10px] uppercase font-bold text-[#9DA79F] block tracking-wider mb-1">
                  Pregunta Vital
                </span>
                <p className="text-xs font-semibold text-[#F2EFE6]">
                  {archetype.centralQuestion}
                </p>
              </div>

              {/* In the Selected Domain */}
              <div className="p-3 bg-[#16221E] rounded-xl border border-[#315C45]/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#86EFAC] block tracking-wider">
                  En {DOMAIN_LABELS[activeDomain]}
                </span>
                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {archetype.domains[activeDomain]}
                </p>
              </div>

              {/* Light Strength */}
              <div className="p-3 bg-[#0E1513] rounded-xl border border-[#1E2A25] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D6A84F]">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Virtud Luminosa</span>
                </div>
                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {archetype.strength}
                </p>
              </div>

              {/* Shadow Trap */}
              <div className="p-3 bg-[#1A1514] rounded-xl border border-[#452723] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Sombra: {archetype.shadow}</span>
                </div>
                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {archetype.shadowAntidote}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-[#0E1513] border-t border-[#1E2A25] flex gap-2">
              <button
                onClick={() => onGoToDetail(archetype.id)}
                className="flex-1 py-2 text-xs bg-[#1A2521] hover:bg-[#23332D] text-[#C5CFC7] rounded-xl transition-colors font-medium text-center"
              >
                Ficha Completa
              </button>
              <button
                onClick={() =>
                  onGoToAiWithPrompt(
                    `Hablemos desde la energía del ${archetype.name}. ¿Cómo responderías al dilema de equilibrar tu fuerza con otros arquetipos?`,
                    archetype.id
                  )
                }
                className="px-3 py-2 text-xs bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] rounded-xl transition-colors font-semibold flex items-center gap-1"
                title="Conversar con este arquetipo"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Synthesis Guidance Card */}
      <div className="bg-[#121A17] border border-[#315C45]/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-base font-bold text-[#F2EFE6]">
            ¿Deseas consultar cómo integrar esta combinación arquetípica?
          </h3>
          <p className="text-xs text-[#9DA79F]">
            El asistente filosófico puede ayudarte a diseñar un plan personalizado de armonización entre {arch1.name} y {arch2.name}.
          </p>
        </div>
        <button
          onClick={() =>
            onGoToAiWithPrompt(
              `¿Cómo puedo armonizar en mi vida cotidiana la alianza entre el ${arch1.name} y el ${arch2.name}${arch3 ? ` junto con el ${arch3.name}` : ''}?`,
              'general'
            )
          }
          className="px-5 py-2.5 bg-[#D6A84F] hover:bg-[#E5B962] text-[#0B1110] font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Reflexión de Tríada (IA)</span>
        </button>
      </div>
    </div>
  );
};
