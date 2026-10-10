import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Heart,
  Hammer,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { getArchetype, getArchetypeList, DIMENSIONS } from '../../data/archetypesData';
import { ArchetypeId, AssessmentResult, DimensionId, GenderMode, DEFAULT_GENDER } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { PerspectiveSwitcher } from '../common/PerspectiveSwitcher';

interface LandingViewProps {
  onStartTest: (type: 'full' | 'quick') => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
  currentResult: AssessmentResult | null;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
  /** Vuelve a abrir la bienvenida con la introducción a los arquetipos. */
  onOpenIntro?: () => void;
}

/** Las cuatro dimensiones, con su icono y su color. */
const DIMENSIONES: { id: DimensionId; nombre: string; Icono: typeof Brain; color: string }[] = [
  { id: 'mente', nombre: 'Mente & Trascendencia', Icono: Brain, color: '#3B82F6' },
  { id: 'accion', nombre: 'Acción & Coraje', Icono: Zap, color: '#EF4444' },
  { id: 'corazon', nombre: 'Corazón & Conexión', Icono: Heart, color: '#10B981' },
  { id: 'construccion', nombre: 'Construcción & Soberanía', Icono: Hammer, color: '#D6A84F' },
];

/**
 * La portada. Cabe en unas cuatro pantallas de móvil: antes eran unas trece (un panteón con
 * selector de los 18 y, además, la galería entera de los 18), y la acción principal era el test
 * de 60 preguntas. Ahora lo primero es el test rápido, con el completo al lado y la versión con
 * voz bien visible; los arquetipos se asoman en una tira que lleva a su ficha.
 */
export const LandingView: React.FC<LandingViewProps> = ({
  onStartTest,
  onSelectTab,
  onSelectArchetype,
  currentResult,
  gender = DEFAULT_GENDER,
  onGenderChange,
  onOpenIntro,
}) => {
  const currentGender = gender || DEFAULT_GENDER;
  const archetypesList = getArchetypeList(currentGender);

  return (
    <div id="landing-view" className="space-y-12 pb-20 max-w-5xl mx-auto">
      {/* Hero. La perspectiva ya se eligió en la bienvenida: no se vuelve a preguntar aquí
          arriba, se puede cambiar al final de la página o en el perfil. */}
      <section className="relative pt-4 md:pt-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D6A84F]/40 bg-[#121A17] text-xs text-[#D6A84F] tracking-wide shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
          <span>Autoconocimiento simbólico · 18 arquetipos</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F2EFE6] leading-[1.15]">
            Conócete desde otra perspectiva.
          </h1>
          <p className="text-base sm:text-lg text-[#9DA79F] leading-relaxed max-w-2xl mx-auto font-light">
            Responde unas preguntas y descubre qué arquetipos encabezan tu mapa y cuáles piden más
            espacio en tu vida.
          </p>
        </div>

        {/* El test rápido es la puerta de entrada; el completo, al lado, para quien quiera más. */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-xl mx-auto">
          <button
            id="landing-cta-quick-test"
            onClick={() => onStartTest('quick')}
            className="flex-1 inline-flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] transition-all shadow-xl hover:shadow-2xl active:scale-95 border border-[#4E8B69]/40"
          >
            <span className="inline-flex items-center gap-2 font-semibold text-sm">
              Descubrir mi mapa
              <ArrowRight className="w-4 h-4" />
            </span>
            <span className="text-[11px] text-[#C5CFC7] font-normal">Test rápido · 24 preguntas · unos 5 minutos</span>
          </button>

          <button
            id="landing-cta-full-test"
            onClick={() => onStartTest('full')}
            className="sm:w-auto inline-flex flex-col items-center justify-center px-5 py-3 rounded-2xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-[#C5CFC7] hover:text-[#F2EFE6] transition-all shadow-sm"
          >
            <span className="font-medium text-sm">Test completo</span>
            <span className="text-[11px] text-[#8A968D]">60 preguntas, más matices</span>
          </button>
        </div>

        {/* Puente a la versión en voz. No es otro botón más: es otra forma de hacer lo mismo,
            para quien no quiere leer. Por eso va aparte. */}
        <a
          href="/v2/"
          id="landing-cta-voz"
          className="group block max-w-xl mx-auto text-left rounded-2xl border border-[#D6A84F]/30 bg-gradient-to-r from-[#141F1A] to-[#121A17] hover:border-[#D6A84F]/60 transition-colors p-4 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-[#1A2521] border border-[#D6A84F]/40 flex items-center justify-center text-[#D6A84F]">
              <Headphones className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base sm:text-lg font-bold text-[#F2EFE6] leading-tight">
                ¿Prefieres no leer? Escúchalo.
              </p>
              <p className="text-xs text-[#9DA79F] leading-relaxed mt-0.5">
                Una frase, un gesto. La misma evaluación, sin leer nada.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-[#D6A84F] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {onOpenIntro && (
          <button
            type="button"
            onClick={onOpenIntro}
            className="inline-flex items-center gap-1.5 text-xs text-[#8A968D] hover:text-[#D6A84F] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            ¿Qué es un arquetipo? Ver la introducción
          </button>
        )}

        {/* Quien ya tiene un mapa, a un toque de él. */}
        {currentResult && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#121A17] border border-[#315C45] flex items-center justify-between gap-3 text-left shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D6A84F]/60 shrink-0">
                <ArchetypeIllustratedArtwork archetypeId={currentResult.dominantArchetype.archetypeId} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#9DA79F]">Tu mapa guardado</p>
                <p className="font-serif font-bold text-[#F2EFE6] text-base truncate">
                  {currentResult.compositeProfile.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('result')}
              className="shrink-0 px-3.5 py-1.5 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-colors"
            >
              Ver mapa
            </button>
          </div>
        )}
      </section>

      {/* Los 18, en una tira: se asoman y llevan a su ficha, en vez de una galería que ocupaba
          ocho pantallas por sí sola. */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#D6A84F] uppercase tracking-widest font-semibold">El panteón</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">Conoce a los 18</h2>
          </div>
          <button
            onClick={() => onSelectTab('archetypes')}
            className="shrink-0 text-xs font-semibold text-[#D6A84F] hover:text-[#E5BE72] inline-flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl bg-[#121A17] border border-[#23332D]"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 overflow-x-auto touch-scroll-x scrollbar-persona pb-2 snap-x">
          {archetypesList.map(arch => (
            <button
              key={arch.id}
              type="button"
              onClick={() => onSelectArchetype(arch.id)}
              className="group shrink-0 w-28 snap-start text-left rounded-2xl overflow-hidden bg-[#121A17] border border-[#23332D] hover:border-[#D6A84F] transition-colors"
            >
              <div className="h-32 bg-[#0E1513] overflow-hidden">
                <ArchetypeIllustratedArtwork archetypeId={arch.id} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-[11px] font-semibold text-[#F2EFE6] leading-tight line-clamp-2">
                  <span aria-hidden="true">{arch.emoji}</span> {arch.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Las cuatro dimensiones, compactas. */}
      <section className="space-y-4">
        <div>
          <p className="text-xs text-[#D6A84F] uppercase tracking-widest font-semibold">Cómo se ordenan</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">Cuatro dimensiones</h2>
          <p className="text-sm text-[#9DA79F] mt-1">
            Los 18 se agrupan en cuatro energías. Tu mapa dice cuánto pesa cada una en ti.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DIMENSIONES.map(({ id, nombre, Icono, color }) => (
            <div key={id} className="p-3.5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
                  <Icono className="w-3.5 h-3.5" />
                </span>
                <h3 className="font-serif text-sm font-bold text-[#F2EFE6] leading-tight">{nombre}</h3>
              </div>
              <p className="text-[11px] text-[#9DA79F] leading-snug">{DIMENSIONS[id].subtitle}</p>
              {/* Los emojis, a la vista; los nombres, para quien usa un lector de pantalla. */}
              <p className="text-base leading-none tracking-wide">
                <span aria-hidden="true">{DIMENSIONS[id].archetypes.map(a => getArchetype(a, currentGender).emoji).join(' ')}</span>
                <span className="sr-only">{DIMENSIONS[id].archetypes.map(a => getArchetype(a, currentGender).name).join(', ')}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Lo que es y lo que no. */}
      <section className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] flex items-start gap-4 text-left">
        <div className="w-10 h-10 rounded-xl bg-[#1E2A25] border border-[#23332D] flex items-center justify-center shrink-0 text-[#D6A84F]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-bold text-[#F2EFE6]">Un modelo de reflexión, no un diagnóstico</h2>
          <p className="text-xs sm:text-sm text-[#9DA79F] leading-relaxed">
            Tu mapa no te define ni te encasilla: muestra tendencias de tus respuestas para que
            pienses qué partes de ti quieres cuidar o hacer crecer.
          </p>
        </div>
      </section>

      {/* La perspectiva, al final: se elige en la bienvenida y aquí solo se cambia. */}
      {onGenderChange && (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] text-[#8A968D]">Explora los arquetipos en otra perspectiva</span>
          <PerspectiveSwitcher gender={currentGender} onGenderChange={onGenderChange} size="sm" showLabel={true} />
        </div>
      )}
    </div>
  );
};
