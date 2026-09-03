import React from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Bot,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Plus,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { getArchetype, getArchetypeName } from '../../data/archetypesData';
import { ArchetypeId, AssessmentResult, Challenge, GenderMode, JournalEntry } from '../../types';
import { DimensionBar } from '../common/DimensionBar';
import { RadarChartComponent } from '../common/RadarChartComponent';
import { NavTab } from '../layout/Sidebar';
import { AiModelStatusBadge } from '../common/AiModelStatusBadge';
import { PerspectiveSwitcher } from '../common/PerspectiveSwitcher';

interface DashboardViewProps {
  currentResult: AssessmentResult | null;
  history: AssessmentResult[];
  challenges: Challenge[];
  journalEntries: JournalEntry[];
  onSelectTab: (tab: NavTab) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
  onStartTest: (type?: 'full' | 'quick') => void;
  onToggleChallenge: (id: string) => void;
  onOpenAiSettings?: () => void;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentResult,
  history,
  challenges,
  journalEntries,
  onSelectTab,
  onSelectArchetype,
  onStartTest,
  onToggleChallenge,
  onOpenAiSettings,
  gender = 'male',
  onGenderChange,
}) => {
  const currentGender = gender || 'male';

  if (!currentResult) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        {onGenderChange && (
          <div className="flex justify-center mb-4">
            <PerspectiveSwitcher
              gender={currentGender}
              onGenderChange={onGenderChange}
              size="sm"
              showLabel={true}
            />
          </div>
        )}
        <div className="w-16 h-16 rounded-2xl bg-[#121A17] border border-[#315C45] flex items-center justify-center mx-auto text-[#D6A84F]">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#F2EFE6]">
            Tu mapa aún está sin trazar
          </h2>
          <p className="text-sm text-[#9DA79F] max-w-md mx-auto">
            Completa la evaluación de arquetipos para descubrir tus inclinaciones dominantes, tu perfil compuesto y tus áreas de desarrollo personal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onStartTest('full')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            Iniciar Evaluación Completa (60)
          </button>
          <button
            onClick={() => onStartTest('quick')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-[#C5CFC7] font-medium text-sm transition-all"
          >
            Test Rápido (24)
          </button>
        </div>
      </div>
    );
  }

  const completedChallenges = challenges.filter(c => c.completed).length;
  const recentEntries = journalEntries.slice(0, 3);
  const activeChallenges = challenges.slice(0, 4);

  const dominantName = getArchetypeName(currentResult.dominantArchetype.archetypeId, currentGender);

  // Past comparison result if multiple evaluations exist
  const previousResult = history.length > 1 ? history[1] : undefined;

  return (
    <div id="dashboard-view" className="max-w-5xl mx-auto space-y-8 pb-24 pt-2">
      {/* Top Perspective Switcher Banner */}
      {onGenderChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#121A17] border border-[#23332D] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#D6A84F]">✦</span>
            <span className="text-xs text-[#C5CFC7] font-medium">
              Perspectiva de tu Mapa Arquetípico:
            </span>
          </div>
          <PerspectiveSwitcher
            gender={currentGender}
            onGenderChange={onGenderChange}
            size="sm"
            showLabel={false}
          />
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2A25] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D6A84F] font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mi Mapa Personal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6] mt-1">
            {currentResult.compositeProfile.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#9DA79F] mt-0.5">
            Dominante: <strong className="text-[#F2EFE6] font-serif">{dominantName}</strong> ({currentResult.dominantArchetype.normalizedScore}%) · Actualizado en {new Date(currentResult.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectTab('result')}
            className="px-4 py-2 bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] text-xs font-semibold text-[#F2EFE6] rounded-xl transition-all"
          >
            Ver Mapa Completo
          </button>
          <button
            onClick={() => onStartTest('full')}
            className="px-4 py-2 bg-[#315C45] hover:bg-[#3D7055] text-xs font-semibold text-[#F2EFE6] rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reevaluar</span>
          </button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dominant Card */}
        <div
          onClick={() => onSelectArchetype(currentResult.dominantArchetype.archetypeId)}
          className="p-5 rounded-2xl bg-[#121A17] border border-[#315C45] hover:border-[#D6A84F] transition-all cursor-pointer space-y-2"
        >
          <span className="text-xs uppercase tracking-wider text-[#9DA79F] font-medium">
            Arquetipo Dominante
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl">{currentResult.dominantArchetype.emoji}</span>
            <span className="font-mono text-xl font-bold text-[#D6A84F]">
              {currentResult.dominantArchetype.normalizedScore}%
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-[#F2EFE6]">
            {dominantName}
          </h3>
        </div>

        {/* Top 3 Archetypes */}
        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-2">
          <span className="text-xs uppercase tracking-wider text-[#9DA79F] font-medium">
            Tríada Nuclear
          </span>
          <div className="space-y-1 pt-1">
            {currentResult.top3.map((a, i) => (
              <div key={a.archetypeId} className="flex items-center justify-between text-xs">
                <span className="text-[#F2EFE6] font-medium flex items-center gap-1.5">
                  <span>{a.emoji}</span> {getArchetypeName(a.archetypeId, currentGender)}
                </span>
                <span className="font-mono text-[#D6A84F]">{a.normalizedScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Development Focus */}
        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-2">
          <span className="text-xs uppercase tracking-wider text-[#D6A84F] font-medium">
            Para Desarrollar
          </span>
          <div className="space-y-1.5 pt-1">
            {currentResult.developmentArchetypes.slice(0, 2).map(a => (
              <div
                key={a.archetypeId}
                onClick={() => onSelectArchetype(a.archetypeId)}
                className="flex items-center justify-between text-xs cursor-pointer hover:text-[#D6A84F]"
              >
                <span className="text-[#C5CFC7] flex items-center gap-1.5">
                  <span>{a.emoji}</span> {getArchetypeName(a.archetypeId, currentGender)}
                </span>
                <span className="text-[10px] text-[#9DA79F] px-1.5 py-0.5 rounded bg-[#1A2521]">
                  Activar
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges Completed */}
        <div
          onClick={() => onSelectTab('challenges')}
          className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] hover:border-[#315C45] transition-all cursor-pointer space-y-2"
        >
          <span className="text-xs uppercase tracking-wider text-[#9DA79F] font-medium">
            Retos Completados
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-3xl font-bold text-[#10B981]">
              {completedChallenges}
            </span>
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <p className="text-[11px] text-[#9DA79F]">de {challenges.length} prácticas disponibles</p>
        </div>
      </div>

      {/* Main Visuals: Radar Chart & Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visual */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
              Mapa Arquetípico
            </h3>
            {previousResult && (
              <span className="text-xs text-[#9DA79F] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D6A84F]" /> Actual vs{' '}
                <span className="w-2 h-2 rounded-full bg-[#6B7A72]" /> Anterior
              </span>
            )}
          </div>

          <RadarChartComponent
            ranking={currentResult.ranking}
            compareRanking={previousResult?.ranking}
            compareLabel="Evaluación previa"
            size="md"
            gender={currentGender}
          />
        </div>

        {/* Dimensions & Quick Reflection AI prompt */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
              Balance de las 4 Dimensiones
            </h3>
            <DimensionBar scores={currentResult.dimensionScores} compact={true} />
          </div>

          {/* AI Banner Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#16201D] to-[#121A17] border border-[#315C45] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D6A84F]">
                <Bot className="w-4 h-4" />
                <span>Asistente de Reflexión IA</span>
              </div>
              {onOpenAiSettings && (
                <button
                  onClick={onOpenAiSettings}
                  className="text-[11px] text-[#86EFAC] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Ajustes IA</span>
                </button>
              )}
            </div>
            <h4 className="font-serif font-bold text-base text-[#F2EFE6]">
              ¿Tienes dudas sobre cómo equilibrar tus arquetipos?
            </h4>
            <p className="text-xs text-[#9DA79F] leading-relaxed">
              Consulta a la IA con el contexto de tu mapa arquetípico para explorar decisiones, sombras y ejercicios prácticos.
            </p>

            {onOpenAiSettings && (
              <div className="pt-1">
                <AiModelStatusBadge onOpenSettings={onOpenAiSettings} variant="pill" />
              </div>
            )}

            <button
              onClick={() => onSelectTab('ai')}
              className="w-full py-2 px-3 rounded-xl bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 mt-2"
            >
              <span>Abrir diálogo de reflexión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Evolution Over Time Section (if history > 1 or simulation) */}
      {history.length > 1 && (
        <section className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D6A84F]" />
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
                Tu Evolución en el Tiempo
              </h3>
            </div>
            <span className="text-xs text-[#9DA79F]">{history.length} evaluaciones registradas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {history.slice(0, 3).map((h, i) => (
              <div key={h.id} className="p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DA79F] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(h.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="font-bold text-[#D6A84F]">
                    {getArchetypeName(h.dominantArchetype.archetypeId, currentGender)}
                  </span>
                </div>
                <p className="font-serif font-bold text-sm text-[#F2EFE6]">
                  {h.compositeProfile.title}
                </p>
                <div className="text-[11px] text-[#9DA79F] flex items-center justify-between pt-1 border-t border-[#1E2A25]">
                  <span>Mente: {h.dimensionScores.mente}%</span>
                  <span>Acción: {h.dimensionScores.accion}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Challenges and Journal Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retos activos */}
        <div className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
                Prácticas Recomendadas
              </h3>
              <button
                onClick={() => onSelectTab('challenges')}
                className="text-xs text-[#D6A84F] hover:underline"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2">
              {activeChallenges.map(c => {
                const arch = getArchetype(c.archetypeId, currentGender);
                return (
                  <div
                    key={c.id}
                    onClick={() => onToggleChallenge(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      c.completed
                        ? 'bg-[#15201C] border-[#315C45] text-[#9DA79F]'
                        : 'bg-[#16201D] border-[#1E2A25] text-[#F2EFE6] hover:border-[#23332D]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c.completed}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-[#315C45] focus:ring-0 cursor-pointer accent-[#315C45]"
                    />
                    <div className="min-w-0 flex-1 text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{arch.emoji}</span>
                        <span className="font-semibold">{c.title}</span>
                      </div>
                      <p className={`text-[11px] line-clamp-1 ${c.completed ? 'line-through text-[#6B7A72]' : 'text-[#9DA79F]'}`}>
                        {c.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reflexiones recientes */}
        <div className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
                Diario de Reflexión
              </h3>
              <button
                onClick={() => onSelectTab('journal')}
                className="text-xs text-[#D6A84F] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva entrada</span>
              </button>
            </div>

            <div className="space-y-2">
              {recentEntries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => onSelectTab('journal')}
                  className="p-3 rounded-xl bg-[#16201D] border border-[#1E2A25] hover:border-[#23332D] cursor-pointer space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#F2EFE6] truncate max-w-[200px]">
                      {entry.title}
                    </span>
                    <span className="text-[10px] text-[#6B7A72]">
                      {new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9DA79F] line-clamp-2">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('journal')}
            className="w-full py-2 rounded-xl bg-[#1A2521] hover:bg-[#23332D] text-xs font-semibold text-[#F2EFE6] transition-colors text-center"
          >
            Abrir Diario Completo
          </button>
        </div>
      </div>
    </div>
  );
};
