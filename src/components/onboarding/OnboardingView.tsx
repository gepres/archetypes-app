import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Compass,
  Hammer,
  Heart,
  Layers,
  Moon,
  Pause,
  Play,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { DimensionId, GenderMode } from '../../types';
import { DIMENSIONS, getArchetype, getArchetypeList } from '../../data/archetypesData';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { BrandLogo } from '../common/BrandLogo';

interface OnboardingViewProps {
  initialGender?: GenderMode;
  /** Se llama al terminar (o al saltar): aplica la perspectiva y cierra la bienvenida. */
  onComplete: (gender: GenderMode) => void;
}

type StepId = 'perspectiva' | 'que-son' | 'dimensiones' | 'personajes';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'perspectiva', label: 'Perspectiva' },
  { id: 'que-son', label: 'Qué son' },
  { id: 'dimensiones', label: 'Dimensiones' },
  { id: 'personajes', label: 'Los 18' },
];

const PERSPECTIVE_OPTIONS: {
  id: GenderMode;
  glyph: string;
  title: string;
  examples: string;
  blurb: string;
  accent: string;
  softBg: string;
  ring: string;
}[] = [
  {
    id: 'male',
    glyph: '♂',
    title: 'Masculina',
    examples: 'El Rey · El Guerrero · El Mago · El Padre',
    blurb: 'Iniciación, soberanía del reino interior y disciplina de propósito.',
    accent: '#86EFAC',
    softBg: '#14231D',
    ring: '#4E8B69',
  },
  {
    id: 'female',
    glyph: '♀',
    title: 'Femenina',
    examples: 'La Reina · La Guerrera · La Maga · La Madre',
    blurb: 'Intuición profunda, soberanía nutricia, coraje y sabiduría cíclica.',
    accent: '#F472B6',
    softBg: '#231526',
    ring: '#A855F7',
  },
  {
    id: 'universal',
    glyph: '☯',
    title: 'Universal',
    examples: 'Rey / Reina · Guerrero / Guerrera · Mago / Maga',
    blurb: 'Abordaje integrador que contempla ambas energías a la vez.',
    accent: '#D6A84F',
    softBg: '#221F14',
    ring: '#D6A84F',
  },
];

const DIMENSION_ICONS: Record<DimensionId, React.ElementType> = {
  mente: Brain,
  accion: Zap,
  corazon: Heart,
  construccion: Hammer,
};

const IDEAS: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Layers,
    title: 'Energías, no etiquetas',
    text: 'Un arquetipo no es un tipo de persona ni una casilla. Es un patrón de conducta y sentido que todos llevamos dentro y que se activa según el momento de la vida.',
  },
  {
    icon: Sun,
    title: 'Cada uno tiene su luz',
    text: 'En equilibrio, cada arquetipo aporta un don concreto: el Rey ordena, el Guerrero sostiene el límite, el Sanador repara. Ahí es donde se vuelve una fuerza.',
  },
  {
    icon: Moon,
    title: 'Y su sombra',
    text: 'Desbordado o negado, el mismo patrón se vuelve contra ti: la autoridad se hace tiranía, el coraje se hace dureza. Reconocer la sombra es la mitad del trabajo.',
  },
  {
    icon: Compass,
    title: 'Se pueden desarrollar',
    text: 'Ninguno viene dado de por vida. El test dibuja tu mapa de hoy y señala qué energías conviene activar; los retos y el diario son el camino para hacerlo.',
  },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialGender = 'universal',
  onComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<GenderMode>(initialGender || 'universal');
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  // La galería habla ya en la perspectiva recién elegida.
  const archetypes = useMemo(() => getArchetypeList(selected), [selected]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const active = archetypes[activeIndex] || archetypes[0];

  // Cada paso empieza arriba del todo
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [stepIndex]);

  // Desfile automático de personajes, solo mientras se está en ese paso
  useEffect(() => {
    if (step.id !== 'personajes' || !autoplay || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex(i => (i + 1) % archetypes.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [step.id, autoplay, archetypes.length, prefersReducedMotion]);

  const pickArchetype = useCallback((index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  }, []);

  const goNext = () => {
    if (isLast) {
      onComplete(selected);
      return;
    }
    setStepIndex(i => i + 1);
  };

  const goBack = () => setStepIndex(i => Math.max(0, i - 1));

  const fade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div
      id="onboarding-view"
      className="fixed inset-0 z-50 flex flex-col bg-[#0B1110] text-[#F2EFE6] antialiased"
      style={{ height: '100dvh' }}
    >
      {/* Halo de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-[#315C45]/20 blur-3xl" />
        <div className="absolute -bottom-52 -right-32 w-[520px] h-[520px] rounded-full bg-[#D6A84F]/10 blur-3xl" />
      </div>

      {/* Cabecera fija */}
      <header className="relative z-10 shrink-0 border-b border-[#1B2723] bg-[#0B1110]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <BrandLogo size="sm" />

          <div className="flex items-center gap-3">
            {/* Pasos: puntos en móvil, etiquetas en escritorio */}
            <ol className="hidden md:flex items-center gap-1.5" aria-label="Progreso de la bienvenida">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => i <= stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                    aria-current={i === stepIndex ? 'step' : undefined}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-colors ${
                      i === stepIndex
                        ? 'bg-[#1A2521] text-[#D6A84F] border border-[#315C45]'
                        : i < stepIndex
                        ? 'text-[#7F8C84] hover:text-[#C5CFC7]'
                        : 'text-[#4B5852] cursor-default'
                    }`}
                  >
                    {i + 1}. {s.label}
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex md:hidden items-center gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? 'w-5 bg-[#D6A84F]' : i < stepIndex ? 'w-1.5 bg-[#4E8B69]' : 'w-1.5 bg-[#23332D]'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => onComplete(selected)}
              className="text-[11px] sm:text-xs text-[#8A968D] hover:text-[#F2EFE6] transition-colors px-2 py-1 rounded-lg"
            >
              Saltar
            </button>
          </div>
        </div>
      </header>

      {/* Contenido que se desplaza */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto overscroll-contain flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 my-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step.id} {...fade}>
              {step.id === 'perspectiva' && (
                <section className="space-y-6">
                  <div className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2521] border border-[#315C45] text-[11px] font-semibold text-[#D6A84F] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Bienvenido a tu mapa arquetípico
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      Elige tu perspectiva de exploración
                    </h1>
                    <p className="text-sm text-[#9DA79F] max-w-xl mx-auto leading-relaxed">
                      Define los nombres, el lenguaje simbólico y las preguntas de toda la plataforma.
                      Puedes cambiarla cuando quieras.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {PERSPECTIVE_OPTIONS.map((opt, i) => {
                      const isOn = selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelected(opt.id)}
                          aria-pressed={isOn}
                          style={{
                            animationDelay: `${i * 80}ms`,
                            ...(isOn
                              ? { backgroundColor: opt.softBg, borderColor: opt.accent }
                              : {}),
                          }}
                          className={`group relative text-left rounded-2xl border-2 p-4 sm:p-5 transition-all animate-fadeInUp ${
                            isOn
                              ? 'shadow-xl'
                              : 'bg-[#121A17] border-[#23332D] hover:border-[#315C45] opacity-90 hover:opacity-100'
                          } flex md:flex-col items-start gap-4 md:gap-3`}
                        >
                          <span
                            className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 text-xl md:text-2xl font-bold border transition-colors"
                            style={
                              isOn
                                ? { color: opt.accent, borderColor: opt.ring, backgroundColor: '#0E1513' }
                                : { color: '#9DA79F', borderColor: '#23332D', backgroundColor: '#1A2521' }
                            }
                          >
                            {opt.glyph}
                          </span>

                          <span className="flex-1 space-y-1.5 min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="font-serif font-bold text-base sm:text-lg">
                                Perspectiva {opt.title}
                              </span>
                              {isOn && (
                                <span
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                                  style={{ backgroundColor: opt.accent, color: '#0B1110' }}
                                >
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                </span>
                              )}
                            </span>
                            <span className="block text-xs text-[#E5D7B7] leading-relaxed">
                              {opt.examples}
                            </span>
                            <span className="block text-[11px] text-[#8A968D] leading-relaxed">
                              {opt.blurb}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step.id === 'que-son' && (
                <section className="space-y-6">
                  <div className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2521] border border-[#315C45] text-[11px] font-semibold text-[#D6A84F] uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5" />
                      Antes de empezar
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      ¿Qué es un arquetipo?
                    </h1>
                    <p className="text-sm text-[#9DA79F] max-w-2xl mx-auto leading-relaxed">
                      Son figuras que la humanidad lleva contando desde siempre —el que gobierna, el que
                      protege, el que sana, el que se ríe de todo— y que Carl Jung describió como patrones
                      compartidos de la psique. No los inventas: los reconoces, porque ya estaban actuando
                      en cómo decides, amas y te enfrentas a lo difícil.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {IDEAS.map((idea, i) => {
                      const Icon = idea.icon;
                      return (
                        <div
                          key={idea.title}
                          className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 animate-fadeInUp"
                          style={{ animationDelay: `${i * 90}ms` }}
                        >
                          <span className="w-9 h-9 rounded-lg bg-[#1A2521] border border-[#23332D] text-[#D6A84F] flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </span>
                          <h2 className="font-serif text-lg font-bold">{idea.title}</h2>
                          <p className="text-xs text-[#9DA79F] leading-relaxed">{idea.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-[#718277] max-w-xl mx-auto leading-relaxed">
                    Esto no es un test de personalidad que te encasilla. Es un mapa de energías en el que
                    todas están presentes, unas más despiertas que otras.
                  </p>
                </section>
              )}

              {step.id === 'dimensiones' && (
                <section className="space-y-6">
                  <div className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2521] border border-[#315C45] text-[11px] font-semibold text-[#D6A84F] uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      Cómo se ordena el mapa
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      Cuatro dimensiones cardinales
                    </h1>
                    <p className="text-sm text-[#9DA79F] max-w-2xl mx-auto leading-relaxed">
                      Los 18 arquetipos se agrupan en cuatro territorios. Tu resultado no es un único
                      nombre: es el equilibrio entre estas cuatro fuerzas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.values(DIMENSIONS).map((dim, i) => {
                      const Icon = DIMENSION_ICONS[dim.id];
                      return (
                        <div
                          key={dim.id}
                          className="p-5 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3 animate-fadeInUp transition-colors"
                          style={{ animationDelay: `${i * 90}ms`, borderColor: `${dim.color}33` }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${dim.color}1A`, color: dim.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <h2 className="font-serif text-lg font-bold leading-tight">{dim.name}</h2>
                              <p className="text-[11px] text-[#9DA79F]">{dim.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#8A968D] leading-relaxed">{dim.description}</p>
                          <div className="pt-2 border-t border-[#1E2A25] flex flex-wrap gap-1.5">
                            {dim.archetypes.map(id => {
                              const arch = getArchetype(id, selected);
                              return (
                                <span
                                  key={id}
                                  className="text-[11px] px-2 py-0.5 rounded bg-[#1A2521] text-[#C5CFC7]"
                                >
                                  {arch.emoji} {arch.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {step.id === 'personajes' && active && (
                <section className="space-y-5">
                  <div className="text-center space-y-2">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2521] border border-[#315C45] text-[11px] font-semibold text-[#D6A84F] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Representación y significado
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      Los 18 arquetipos
                    </h1>
                    <p className="text-sm text-[#9DA79F] max-w-xl mx-auto leading-relaxed">
                      Cada uno tiene un rostro, un símbolo y un mantra. Déjalos pasar o toca cualquiera
                      para detenerte en él.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 md:gap-8 items-center justify-center">
                    {/* Escena del personaje */}
                    <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[290px]">
                      <div
                        className="absolute inset-0 rounded-[2rem] blur-2xl animate-auraPulse"
                        style={{ backgroundColor: `${active.colorHex}33` }}
                        aria-hidden="true"
                      />
                      <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden border-2 shadow-2xl bg-[#0E1513]"
                           style={{ borderColor: `${active.colorHex}66` }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={active.id}
                            className="absolute inset-0"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06, y: 18 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -14 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <ArchetypeIllustratedArtwork
                              archetypeId={active.id}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </AnimatePresence>

                        {/* Símbolo flotante */}
                        <div className="absolute top-3 right-3 w-11 h-11 rounded-xl bg-[#0B1110]/80 backdrop-blur border flex items-center justify-center text-xl animate-floatSoft"
                             style={{ borderColor: `${active.colorHex}66` }}>
                          {active.emoji}
                        </div>

                        {/* Nombre sobre la ilustración */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0B1110] via-[#0B1110]/80 to-transparent">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${active.id}-name`}
                              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                              transition={{ duration: 0.4, delay: 0.12 }}
                            >
                              <p className="text-[10px] uppercase tracking-widest font-bold"
                                 style={{ color: active.colorHex }}>
                                {DIMENSIONS[active.dimension].name}
                              </p>
                              <h2 className="font-serif text-2xl font-bold leading-tight">
                                {active.emoji} {active.name}
                              </h2>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Significado */}
                    <div className="space-y-3">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${active.id}-info`}
                          initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-3"
                        >
                          {active.characterTitle && (
                            <p className="text-xs uppercase tracking-widest text-[#8A968D] font-semibold">
                              {active.characterTitle}
                            </p>
                          )}
                          <p className="flex items-start gap-1.5 text-[11px] leading-snug text-[#8A968D]">
                            <span style={{ color: active.colorHex }}>✦</span>
                            <span>
                              <span className="text-[#718277]">Símbolo: </span>
                              {active.symbol}
                            </span>
                          </p>
                          <p className="text-sm text-[#C5CFC7] leading-relaxed">
                            {active.shortDescription}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {active.concepts.slice(0, 5).map(c => (
                              <span
                                key={c}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-[#1A2521] border border-[#23332D] text-[#C5CFC7]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>

                          <blockquote
                            className="pl-3 border-l-2 text-sm font-serif italic text-[#E5D7B7] leading-relaxed"
                            style={{ borderColor: active.colorHex }}
                          >
                            «{active.mantra}»
                          </blockquote>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="p-3 rounded-xl bg-[#121A17] border border-[#1E2A25] space-y-1">
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[#86EFAC]">
                                <Sun className="w-3 h-3" /> Su luz
                              </span>
                              <p className="text-[11px] text-[#9DA79F] leading-snug">{active.strength}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#121A17] border border-[#1E2A25] space-y-1">
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[#F472B6]">
                                <Moon className="w-3 h-3" /> Su sombra
                              </span>
                              <p className="text-[11px] text-[#9DA79F] leading-snug">{active.shadow}</p>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Desfile: miniaturas + control de reproducción */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#718277]">
                        {activeIndex + 1} de {archetypes.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAutoplay(a => !a)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#8A968D] hover:text-[#F2EFE6] transition-colors px-2 py-1 rounded-lg border border-[#1E2A25]"
                      >
                        {autoplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {autoplay ? 'Pausar desfile' : 'Reanudar'}
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto touch-scroll-x scrollbar-persona pb-2">
                      {archetypes.map((a, i) => {
                        const isOn = i === activeIndex;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => pickArchetype(i)}
                            title={a.name}
                            aria-label={a.name}
                            aria-current={isOn ? 'true' : undefined}
                            className={`shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${
                              isOn ? 'scale-110 bg-[#0E1513]' : 'bg-[#121A17] border-[#23332D] opacity-60 hover:opacity-100'
                            }`}
                            style={isOn ? { borderColor: a.colorHex } : undefined}
                          >
                            {a.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pie fijo: siempre alcanzable, también en pantallas cortas */}
      <footer
        className="relative z-10 shrink-0 border-t border-[#1B2723] bg-[#0B1110]/90 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              stepIndex === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#121A17]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>

          <span className="hidden sm:block text-[11px] text-[#718277] text-center flex-1 px-2">
            {stepIndex === 0
              ? '✦ Podrás cambiar la perspectiva cuando quieras desde la barra superior'
              : `Paso ${stepIndex + 1} de ${STEPS.length} · ${step.label}`}
          </span>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-sm shadow-xl transition-all active:scale-95 border border-[#4E8B69]/50"
          >
            {isLast ? 'Comenzar mi mapa' : 'Continuar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
