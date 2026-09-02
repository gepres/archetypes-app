import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Filter,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST } from '../../data/archetypesData';
import { ArchetypeId, Challenge } from '../../types';
import { ArchetypeBadge } from '../common/ArchetypeBadge';

interface ChallengesViewProps {
  challenges: Challenge[];
  onToggleChallenge: (id: string) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  onToggleChallenge,
  onSelectArchetype,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendientes' | 'completados'>('todos');
  const [selectedArchetypeFilter, setSelectedArchetypeFilter] = useState<string>('todos');

  const completedCount = challenges.filter(c => c.completed).length;
  const progressPercent = Math.round((completedCount / challenges.length) * 100);

  const filteredChallenges = challenges.filter(c => {
    const matchesStatus =
      filterStatus === 'todos' ||
      (filterStatus === 'completados' && c.completed) ||
      (filterStatus === 'pendientes' && !c.completed);

    const matchesArchetype =
      selectedArchetypeFilter === 'todos' || c.archetypeId === selectedArchetypeFilter;

    return matchesStatus && matchesArchetype;
  });

  const getDifficultyColor = (diff: Challenge['difficulty']) => {
    switch (diff) {
      case 'accesible':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
      case 'intermedio':
        return 'text-[#D6A84F] bg-[#D6A84F]/10 border-[#D6A84F]/20';
      case 'profundo':
        return 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20';
    }
  };

  return (
    <div id="challenges-view" className="max-w-4xl mx-auto space-y-8 pb-24 pt-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A17] border border-[#23332D] text-xs text-[#D6A84F]">
          <Flame className="w-3.5 h-3.5" />
          <span>Micro-Prácticas Cotidianas</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6] tracking-tight">
          Retos de Integración Arquetípica
        </h1>
        <p className="text-sm text-[#9DA79F] max-w-xl mx-auto font-light">
          Los arquetipos se fortalecen mediante la acción deliberada en el mundo real. Elige una práctica para expandir tus capacidades.
        </p>
      </div>

      {/* Progress Card */}
      <div className="p-6 rounded-2xl bg-[#121A17] border border-[#315C45] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-[#D6A84F] tracking-wider">
              Tu Progreso de Prácticas
            </span>
            <h3 className="font-serif font-bold text-xl text-[#F2EFE6]">
              {completedCount} de {challenges.length} retos completados ({progressPercent}%)
            </h3>
          </div>
          <span className="text-xs text-[#9DA79F]">
            {challenges.length - completedCount} retos disponibles por explorar
          </span>
        </div>

        {/* Bar */}
        <div className="h-2 w-full bg-[#16201D] rounded-full overflow-hidden border border-[#1E2A25]">
          <div
            className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-y border-[#1E2A25] py-3">
        {/* Status Toggle */}
        <div className="flex items-center gap-1 bg-[#121A17] p-1 rounded-lg border border-[#1E2A25] text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              filterStatus === 'todos'
                ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                : 'text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Todos ({challenges.length})
          </button>
          <button
            onClick={() => setFilterStatus('pendientes')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              filterStatus === 'pendientes'
                ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                : 'text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Pendientes ({challenges.length - completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('completados')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition-all ${
              filterStatus === 'completados'
                ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                : 'text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Completados ({completedCount})
          </button>
        </div>

        {/* Archetype Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#9DA79F]">Arquetipo:</span>
          <select
            value={selectedArchetypeFilter}
            onChange={e => setSelectedArchetypeFilter(e.target.value)}
            className="p-1.5 rounded-lg bg-[#121A17] border border-[#1E2A25] text-xs text-[#F2EFE6] focus:outline-none"
          >
            <option value="todos">Todos los arquetipos</option>
            {ARCHETYPES_LIST.map(a => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.map(challenge => {
          const arch = ARCHETYPES[challenge.archetypeId];
          return (
            <div
              key={challenge.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                challenge.completed
                  ? 'bg-[#121A17]/70 border-[#315C45]/60 text-[#9DA79F]'
                  : 'bg-[#121A17] border-[#1E2A25] hover:border-[#23332D]'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{arch.emoji}</span>
                    <div>
                      <span className="font-serif font-bold text-xs text-[#F2EFE6] block">
                        {arch.name}
                      </span>
                      <span className="text-[10px] text-[#9DA79F] uppercase tracking-wider">
                        {arch.dimension}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getDifficultyColor(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                    <span className="text-[10px] text-[#9DA79F] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {challenge.timeEstimate}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3
                    className={`font-serif font-bold text-base ${
                      challenge.completed ? 'line-through text-[#6B7A72]' : 'text-[#F2EFE6]'
                    }`}
                  >
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-[#9DA79F] mt-1 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {/* Action guidance */}
                <div className="p-3 rounded-xl bg-[#16201D] border border-[#1E2A25] text-xs space-y-1">
                  <span className="text-[#D6A84F] font-semibold block text-[11px]">
                    Instrucción concreta:
                  </span>
                  <p className="text-[#C5CFC7] italic font-serif">
                    "{challenge.actionGuidance}"
                  </p>
                </div>
              </div>

              {/* Action toggle */}
              <div className="pt-3 border-t border-[#1E2A25] flex items-center justify-between">
                <button
                  onClick={() => onSelectArchetype(challenge.archetypeId)}
                  className="text-[11px] text-[#9DA79F] hover:text-[#D6A84F] transition-colors"
                >
                  Ver arquetipo {arch.name} →
                </button>

                <button
                  id={`challenge-toggle-${challenge.id}`}
                  onClick={() => onToggleChallenge(challenge.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    challenge.completed
                      ? 'bg-[#315C45] text-[#F2EFE6]'
                      : 'bg-[#16201D] hover:bg-[#1E2A25] text-[#C5CFC7] border border-[#23332D]'
                  }`}
                >
                  {challenge.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Completado</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-[#6B7A72]" />
                      <span>Marcar como hecho</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
