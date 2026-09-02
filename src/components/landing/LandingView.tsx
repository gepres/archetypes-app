import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Brain,
  Zap,
  Heart,
  Hammer,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Eye,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST, DIMENSIONS } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId, AssessmentResult } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { ArchetypePortraitCard } from '../archetypes/ArchetypePortraitCard';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';

interface LandingViewProps {
  onStartTest: (type: 'full' | 'quick') => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
  currentResult: AssessmentResult | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartTest,
  onSelectTab,
  onSelectArchetype,
  currentResult,
}) => {
  const [activeSpotlight, setActiveSpotlight] = useState<ArchetypeId>('rey');

  const spotlightArchetype = ARCHETYPES[activeSpotlight];
  const spotlightVisual = ARCHETYPE_VISUALS[activeSpotlight];

  return (
    <div id="landing-view" className="space-y-16 pb-20 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D6A84F]/40 bg-[#121A17] text-xs text-[#D6A84F] tracking-wide shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
          <span>Psicología Simbólica · Ilustraciones Arquetípicas · Autoconocimiento</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F2EFE6] leading-[1.15]">
            Conócete desde otra perspectiva.
          </h1>
          <p className="text-base sm:text-lg text-[#9DA79F] leading-relaxed max-w-2xl mx-auto font-light">
            Explora los 12 arquetipos míticos y sus fuerzas universales. Descubre tu mapa de personalidad mediante símbolos, indagación psicológica y arte arquetípico.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            id="landing-cta-full-test"
            onClick={() => onStartTest('full')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-sm transition-all shadow-xl hover:shadow-2xl active:scale-95 border border-[#4E8B69]/40"
          >
            <span>Descubrir mis arquetipos (60 preguntas)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="landing-cta-quick-test"
            onClick={() => onStartTest('quick')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-[#C5CFC7] hover:text-[#F2EFE6] font-medium text-sm transition-all shadow-sm"
          >
            <span>Test Rápido (24 preguntas)</span>
          </button>

          <button
            id="landing-cta-explore"
            onClick={() => onSelectTab('archetypes')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#23332D] bg-transparent hover:bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] font-medium text-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#D6A84F]" />
            <span>Explorar los 12 arquetipos</span>
          </button>
        </div>

        {/* Current Result banner if exists */}
        {currentResult && (
          <div className="mt-8 max-w-xl mx-auto p-4 rounded-2xl bg-[#121A17] border border-[#315C45] flex items-center justify-between text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D6A84F]/60 shrink-0">
                <ArchetypeIllustratedArtwork archetypeId={currentResult.dominantArchetype.archetypeId} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs text-[#9DA79F]">Tu mapa activo guardado:</p>
                <p className="font-serif font-bold text-[#F2EFE6] text-base">
                  {currentResult.compositeProfile.title} ({currentResult.dominantArchetype.name})
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('result')}
              className="px-3.5 py-1.5 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-colors"
            >
              Ver mapa
            </button>
          </div>
        )}
      </section>

      {/* Featured Archetype Illustrated Spotlight */}
      <section className="p-5 sm:p-8 rounded-3xl bg-[#121A17] border border-[#23332D] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8">
          {/* Illustrated Card Preview */}
          <div className="w-full max-w-[280px] sm:max-w-xs lg:w-72 h-72 sm:h-80 mx-auto lg:mx-0 shrink-0 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D6A84F]/60 relative">
            <ArchetypePortraitCard
              archetype={spotlightArchetype}
              size="hero"
              showBadge={true}
              className="w-full h-full rounded-3xl"
            />
          </div>

          {/* Archetype Description & Selector */}
          <div className="flex-1 w-full space-y-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-[#D6A84F]">
                  Panteón Ilustrado
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1A2822] text-[#86EFAC] border border-[#315C45] font-semibold">
                  {spotlightVisual.characterClass}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
                {spotlightArchetype.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#D6A84F] font-medium">
                {spotlightVisual.characterTitle}
              </p>
            </div>

            <blockquote className="p-3 sm:p-3.5 rounded-2xl bg-[#0E1513] border border-[#1E2A25] font-serif italic text-xs sm:text-sm text-[#E5D7B7] leading-relaxed">
              "{spotlightArchetype.mantra}"
            </blockquote>

            {/* Fortaleza Central & Sombra a Integrar Enhanced Cards - Stacked Vertically */}
            <div className="flex flex-col gap-3.5 pt-1 w-full">
              {/* Fortaleza Central Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#13221C] to-[#0E1714] border border-[#2B4E3C] shadow-sm flex flex-col justify-start space-y-2 text-left">
                <div className="flex items-center gap-2 text-[#86EFAC] text-xs font-bold uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-[#1D3629] border border-[#315C45] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-[#86EFAC]" />
                  </div>
                  <span>Fortaleza Central</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F2EFE6] leading-relaxed font-normal">
                  {spotlightArchetype.strength}
                </p>
              </div>

              {/* Sombra a Integrar Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1114] to-[#120A0D] border border-[#52242C] shadow-sm flex flex-col justify-start space-y-2.5 text-left">
                <div className="flex items-center gap-2 text-[#FCA5A5] text-xs font-bold uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-[#381B20] border border-[#632933] flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3 h-3 text-[#F87171]" />
                  </div>
                  <span>Sombra a Integrar</span>
                </div>
                <div className="space-y-1.5">
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-[#33141B] border border-[#5A222D] text-xs font-bold text-[#FCA5A5]">
                    {spotlightArchetype.shadow}
                  </div>
                  <p className="text-xs text-[#E5B8BF] leading-relaxed font-light">
                    {spotlightArchetype.shadowDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick selector buttons - Fully visible responsive grid */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#D6A84F] font-bold uppercase tracking-wider block">
                  Selecciona un arquetipo para visualizar:
                </span>
                <span className="text-[10px] text-[#86968D]">12 de 12 arquetipos</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {ARCHETYPES_LIST.map(arch => {
                  const isSel = arch.id === activeSpotlight;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => setActiveSpotlight(arch.id)}
                      className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border select-none active:scale-95 ${
                        isSel
                          ? 'bg-[#315C45] text-[#F2EFE6] border-[#D6A84F] shadow-lg ring-1 ring-[#D6A84F]/60'
                          : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border-[#1E2A25] hover:border-[#315C45]/60'
                      }`}
                    >
                      <span className="text-sm shrink-0">{arch.emoji}</span>
                      <span className="truncate">{arch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onSelectArchetype(spotlightArchetype.id)}
                className="px-4 py-2 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver ficha completa de {spotlightArchetype.name}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophical Foundations Banner */}
      <section className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] flex flex-col md:flex-row items-start md:items-center gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-[#1E2A25] border border-[#23332D] flex items-center justify-center shrink-0 text-[#D6A84F]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-bold text-[#F2EFE6]">
            Un modelo de reflexión, no un diagnóstico clínico
          </h2>
          <p className="text-xs sm:text-sm text-[#9DA79F] leading-relaxed">
            Tu mapa no te define ni te encasilla. Te muestra tendencias, fortalezas naturales y áreas de desarrollo para que tomes conciencia de qué partes de ti necesitan mayor espacio y contención.
          </p>
        </div>
      </section>

      {/* 4 Dimensions Showcase */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs text-[#D6A84F] uppercase tracking-widest font-semibold">
            Estructura Psíquica
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
            El Modelo de las 4 Dimensiones
          </h2>
          <p className="text-sm text-[#9DA79F] max-w-xl mx-auto">
            Los 12 arquetipos se articulan en cuatro energías fundamentales para sostener una vida integrada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mente */}
          <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 hover:border-[#3B82F6]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">Mente</h3>
              <p className="text-xs text-[#9DA79F] mt-1">{DIMENSIONS.mente.subtitle}</p>
            </div>
            <div className="pt-2 border-t border-[#1E2A25] flex gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🧙 Mago</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">📚 Sabio</span>
            </div>
          </div>

          {/* Acción */}
          <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 hover:border-[#EF4444]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">Acción</h3>
              <p className="text-xs text-[#9DA79F] mt-1">{DIMENSIONS.accion.subtitle}</p>
            </div>
            <div className="pt-2 border-t border-[#1E2A25] flex flex-wrap gap-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">⚔️ Guerrero</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🦸 Héroe</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🔥 Rebelde</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🧭 Explorador</span>
            </div>
          </div>

          {/* Corazón */}
          <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 hover:border-[#10B981]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">Corazón</h3>
              <p className="text-xs text-[#9DA79F] mt-1">{DIMENSIONS.corazon.subtitle}</p>
            </div>
            <div className="pt-2 border-t border-[#1E2A25] flex flex-wrap gap-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">❤️ Amante</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🌱 Cuidador</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🃏 Bufón</span>
            </div>
          </div>

          {/* Construcción */}
          <div className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 hover:border-[#D6A84F]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#D6A84F]/10 text-[#D6A84F] flex items-center justify-center">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">Construcción</h3>
              <p className="text-xs text-[#9DA79F] mt-1">{DIMENSIONS.construccion.subtitle}</p>
            </div>
            <div className="pt-2 border-t border-[#1E2A25] flex flex-wrap gap-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">👑 Rey</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🛡️ Padre</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]">🎨 Creador</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Archetypes Illustrated Gallery on Home Screen */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#D6A84F] uppercase tracking-widest font-semibold">
              El Panteón Ilustrado
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
              Los 12 Arquetipos Ilustrados
            </h2>
            <p className="text-xs sm:text-sm text-[#9DA79F] mt-1">
              Haz clic en cualquier carta ilustrada para explorar su análisis y lecciones.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('archetypes')}
            className="text-xs font-semibold text-[#D6A84F] hover:text-[#E5BE72] inline-flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl bg-[#121A17] border border-[#23332D]"
          >
            <span>Ver detalles completos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {ARCHETYPES_LIST.map(arch => {
            const visual = ARCHETYPE_VISUALS[arch.id];
            return (
              <div
                key={arch.id}
                onClick={() => onSelectArchetype(arch.id)}
                className="group bg-[#121A17] border border-[#23332D] hover:border-[#D6A84F] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Illustrated Portrait Header */}
                <div className="relative h-44 w-full overflow-hidden bg-[#0E1513]">
                  <ArchetypePortraitCard
                    archetype={arch}
                    size="md"
                    showBadge={true}
                    className="w-full h-full rounded-none border-0"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs italic text-[#E5D7B7] font-serif line-clamp-2 leading-relaxed bg-[#0B1110] p-2.5 rounded-xl border border-[#1E2A25]">
                      "{arch.mantra}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1E2A25] flex items-center justify-between text-xs text-[#9DA79F] group-hover:text-[#D6A84F] transition-colors">
                    <span className="text-[11px] font-medium text-[#A6B2A8] truncate max-w-[130px]">
                      {arch.strength.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-xs text-[#D6A84F]">
                      <span>Ver Ficha</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Microcopy & Call to Action */}
      <section className="p-8 rounded-3xl bg-gradient-to-b from-[#121A17] to-[#0E1513] border border-[#23332D] text-center space-y-6 shadow-2xl">
        <blockquote className="font-serif text-xl sm:text-2xl text-[#F2EFE6] italic max-w-2xl mx-auto leading-relaxed">
          "No se trata de convertirte en alguien diferente, sino de integrar partes de ti que ya existen pero reclaman luz y orden."
        </blockquote>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onStartTest('full')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-sm transition-all shadow-lg active:scale-95 border border-[#4E8B69]/40"
          >
            Iniciar Evaluación Completa
          </button>
          <button
            onClick={() => onSelectTab('ai')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-[#C5CFC7] font-medium text-sm transition-all shadow-sm"
          >
            Habla con el Asistente IA
          </button>
        </div>
      </section>
    </div>
  );
};

