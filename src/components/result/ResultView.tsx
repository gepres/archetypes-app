import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Share2,
  Download,
  RotateCcw,
  Bot,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Compass,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { ARCHETYPES, getArchetype } from '../../data/archetypesData';
import { ArchetypeId, AssessmentResult, GenderMode } from '../../types';
import { ArchetypeBadge } from '../common/ArchetypeBadge';
import { DimensionBar } from '../common/DimensionBar';
import { RadarChartComponent } from '../common/RadarChartComponent';
import { NavTab } from '../layout/Sidebar';
import { ShareResultImageModal } from './ShareResultImageModal';

interface ResultViewProps {
  result: AssessmentResult;
  onSelectTab: (tab: NavTab) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
  onRetakeTest: () => void;
  gender?: GenderMode;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onSelectTab,
  onSelectArchetype,
  onRetakeTest,
  gender = 'male',
}) => {
  useEffect(() => {
    // Elegant subtle confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D6A84F', '#315C45', '#F2EFE6'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dominant = getArchetype(result.dominantArchetype.archetypeId, gender);
  const { compositeProfile } = result;

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div id="result-view" className="max-w-4xl mx-auto space-y-12 pb-24 pt-2">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A17] border border-[#23332D] text-xs text-[#D6A84F]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evaluación completada · {new Date(result.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F2EFE6] tracking-tight">
          Tu Mapa Arquetípico
        </h1>
        <p className="text-sm text-[#9DA79F] max-w-xl mx-auto font-light">
          Un modelo de autoconocimiento sobre tus tendencias predominantes, dinámicas combinadas y oportunidades de integración consciente.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2822] hover:bg-[#23382D] border border-[#315C45] text-xs font-semibold text-[#D6A84F] hover:text-[#FFE898] transition-all shadow-md active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Compartir Resumen como Imagen para Redes</span>
          </button>
        </div>
      </div>

      {/* Dominant Profile & Radar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dominant Hero Card */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#121A17] border border-[#315C45] flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#315C45]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#D6A84F]">
                Arquetipo Dominante
              </span>
              <span className="font-mono text-xl font-bold text-[#D6A84F]">
                {result.dominantArchetype.normalizedScore}%
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-4xl sm:text-5xl">{dominant.emoji}</span>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
                  {dominant.name}
                </h2>
                <p className="text-xs text-[#9DA79F] capitalize">
                  Dimensión: {dominant.dimension}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#C5CFC7] leading-relaxed italic font-serif">
              "{dominant.centralQuestion}"
            </p>

            <div className="pt-3 border-t border-[#1E2A25] space-y-2 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-[#F2EFE6] block">Fortaleza nuclear:</span>
                <p className="text-[#9DA79F]">{dominant.strength}</p>
              </div>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-[#EF4444] block">Posible sombra a vigilar:</span>
                <p className="text-[#9DA79F]">{dominant.shadow}: {dominant.shadowDescription.split('.')[0]}.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectArchetype(dominant.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-semibold text-[#F2EFE6] transition-all flex items-center justify-center gap-2"
          >
            <span>Ver perfil completo de {dominant.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F]" />
          </button>
        </div>

        {/* Radar Chart Visual */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
              Geometría de tus 12 Arquetipos
            </h3>
            <span className="text-[11px] text-[#9DA79F]">0 a 100% normalizado</span>
          </div>

          <RadarChartComponent ranking={result.ranking} size="md" />

          <p className="text-[11px] text-[#6B7A72] text-center italic">
            El polígono refleja la distribución energética actual entre Mente, Acción, Corazón y Construcción.
          </p>
        </div>
      </div>

      {/* Composite Profile Dynamic Interpretation Section */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D6A84F] font-bold">
              Perfil Compuesto Dinámico
            </span>
            <span className="text-[#6B7A72]">·</span>
            <span className="text-xs text-[#9DA79F]">{compositeProfile.archetypeCombination}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
            {compositeProfile.title}
          </h2>
          <p className="text-sm sm:text-base text-[#C5CFC7] leading-relaxed font-light pt-1">
            {compositeProfile.synthesis}
          </p>
        </div>

        {/* Strengths & Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1E2A25]">
          {/* Fortalezas */}
          <div className="p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#10B981] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fortalezas Clave</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#C5CFC7]">
              {compositeProfile.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Riesgos y Sombras */}
          <div className="p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#EF4444] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Puntos Ciegos y Riesgos de Sombra</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#C5CFC7]">
              {compositeProfile.risksAndShadows.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Dimensions Balance */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#F2EFE6]">
              Balance de las 4 Dimensiones
            </h3>
            <p className="text-xs text-[#9DA79F]">
              Puntuación agregada por áreas psicológicas funcionales
            </p>
          </div>
        </div>

        <DimensionBar scores={result.dimensionScores} />
      </section>

      {/* Complete Ranking of the 12 Archetypes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#F2EFE6]">
              Ranking Completo de los 12 Arquetipos
            </h3>
            <p className="text-xs text-[#9DA79F]">
              Haz clic en cualquier arquetipo para explorar su simbolismo y ejercicios
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {result.ranking.map((item, index) => {
            const arch = ARCHETYPES[item.archetypeId];
            const isTop3 = index < 3;
            return (
              <div
                key={item.archetypeId}
                onClick={() => onSelectArchetype(item.archetypeId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.02] ${
                  isTop3
                    ? 'bg-[#15201C] border-[#315C45] hover:border-[#D6A84F]'
                    : 'bg-[#121A17] border-[#1E2A25] hover:border-[#23332D]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-[#6B7A72] w-4">
                    #{item.rank}
                  </span>
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-sm text-[#F2EFE6] truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#9DA79F] capitalize truncate">
                      {arch.dimension}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-mono text-sm font-bold ${
                      isTop3 ? 'text-[#D6A84F]' : 'text-[#C5CFC7]'
                    }`}
                  >
                    {item.normalizedScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggested Development Archetypes */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-5">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#D6A84F] font-bold">
            Equilibrio e Integración
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F2EFE6]">
            Arquetipos de Desarrollo Consciente
          </h3>
          <p className="text-xs text-[#9DA79F] max-w-2xl leading-relaxed">
            Tener una menor puntuación en un arquetipo no es una debilidad, sino una oportunidad de oro para incorporar nuevas herramientas que equilibren tus tendencias dominantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {compositeProfile.developmentArchetypes.map(dev => {
            const arch = ARCHETYPES[dev.archetypeId];
            return (
              <div
                key={dev.archetypeId}
                className="p-5 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{arch.emoji}</span>
                    <span className="font-serif font-bold text-base text-[#F2EFE6]">
                      {arch.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E2A25] text-[#D6A84F] uppercase tracking-wider font-semibold">
                    Para Desarrollar
                  </span>
                </div>

                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {dev.reason}
                </p>

                <div className="pt-2 border-t border-[#1E2A25] space-y-1">
                  <span className="text-[11px] font-semibold text-[#D6A84F] block">
                    Práctica recomendada:
                  </span>
                  <p className="text-xs text-[#9DA79F] italic font-serif">
                    "{dev.activationPractice}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Next Steps CTA Cards */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#F2EFE6] text-center">
          ¿Cómo deseas continuar tu proceso?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSelectTab('ai')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#315C45] flex items-center justify-center group-hover:text-[#D6A84F]">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">
              Habla con tu Mapa (IA)
            </h4>
            <p className="text-xs text-[#9DA79F]">
              Conversa con el asistente Gemini sobre tus sombras y retos actuales.
            </p>
          </button>

          <button
            onClick={() => onSelectTab('challenges')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#315C45] flex items-center justify-center group-hover:text-[#D6A84F]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">
              Retos de Desarrollo
            </h4>
            <p className="text-xs text-[#9DA79F]">
              Ejecuta micro-prácticas para activar tus arquetipos en la vida cotidiana.
            </p>
          </button>

          <button
            onClick={() => onSelectTab('journal')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#315C45] flex items-center justify-center group-hover:text-[#D6A84F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">
              Diario de Reflexión
            </h4>
            <p className="text-xs text-[#9DA79F]">
              Escribe sobre tus decisiones e identifica qué arquetipo estás encarnando.
            </p>
          </button>
        </div>
      </section>

      {/* Share / Retake actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#1E2A25]">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] border border-[#4E8B69]/50 text-xs font-semibold text-[#F2EFE6] transition-all shadow-lg active:scale-95"
        >
          <Share2 className="w-4 h-4 text-[#D6A84F]" />
          <span>Compartir resumen como imagen</span>
        </button>

        <button
          onClick={onRetakeTest}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-xs font-semibold text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Repetir evaluación</span>
        </button>
      </div>

      {/* Social Image Share Modal */}
      <ShareResultImageModal
        result={result}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
