import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ArchetypeIllustratedArtwork, DIMENSIONS, getArchetype } from '../lib/domain';
import type { AssessmentResult } from '../lib/domain';
import { callar, decir, vibrar } from '../lib/voice';

interface RevealScreenProps {
  resultado: AssessmentResult;
  silencio: boolean;
  onToggleSilencio: () => void;
  onRepetir: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  resultado,
  silencio,
  onToggleSilencio,
  onRepetir,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [revelado, setRevelado] = useState(false);
  const yaHabloRef = useRef(false);

  const dominante = getArchetype(resultado.dominantArchetype.archetypeId, 'universal');
  const segundo = getArchetype(resultado.ranking[1].archetypeId, 'universal');
  const dimension = DIMENSIONS[dominante.dimension];

  const guion = `Tu arquetipo dominante es ${dominante.name}. ${dominante.shortDescription} Tu mantra: ${dominante.mantra}`;

  useEffect(() => {
    const t = window.setTimeout(() => setRevelado(true), prefersReducedMotion ? 0 : 220);
    return () => window.clearTimeout(t);
  }, [prefersReducedMotion]);

  // La revelacion se cuenta sola, una vez.
  useEffect(() => {
    if (silencio || yaHabloRef.current) return;
    yaHabloRef.current = true;
    vibrar([18, 60, 24]);
    const t = window.setTimeout(() => decir(guion, { rate: 0.94 }), 500);
    return () => {
      window.clearTimeout(t);
      callar();
    };
  }, [silencio, guion]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center px-5 py-8 overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: dominante.colorHex }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          callar();
          onToggleSilencio();
        }}
        aria-label={silencio ? 'Activar la voz' : 'Silenciar la voz'}
        className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-[#101917]/80 backdrop-blur border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
      >
        {silencio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      <div className="relative z-10 w-full max-w-sm space-y-6 pb-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: revelado ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-[#8A968D] pt-2"
        >
          Tu arquetipo dominante
        </motion.p>

        {/* El rostro */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 22 }}
          animate={revelado ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[260px]"
        >
          <div
            className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden border-2 shadow-2xl bg-[#0B1110]"
            style={{ borderColor: `${dominante.colorHex}80` }}
          >
            <ArchetypeIllustratedArtwork
              archetypeId={dominante.id}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#070C0B] via-[#070C0B]/85 to-transparent">
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: dominante.colorHex }}
              >
                {dimension.name}
              </p>
              <h1 className="font-serif text-2xl font-bold leading-tight">
                {dominante.emoji} {dominante.name}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Lo justo: una frase y un mantra */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revelado ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.3 }}
          className="space-y-4 text-center"
        >
          <p className="text-sm text-[#C5CFC7] leading-relaxed">{dominante.shortDescription}</p>

          <blockquote
            className="font-serif italic text-base text-[#E5D7B7] leading-relaxed px-3 py-3 rounded-2xl bg-[#101917]/70 border-l-2"
            style={{ borderColor: dominante.colorHex }}
          >
            «{dominante.mantra}»
          </blockquote>

          <p className="text-xs text-[#7B8880]">
            Te acompaña <span className="text-[#C5CFC7] font-semibold">{segundo.emoji} {segundo.name}</span>
          </p>
        </motion.div>

        {/* Un solo camino hacia adelante */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={revelado ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.5 }}
          className="space-y-3 pt-1"
        >
          <a
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] border border-[#4E8B69] text-[#F2EFE6] font-semibold shadow-xl active:scale-95 transition-transform"
          >
            Ver mi mapa completo
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#4E5C55]">
            <button
              type="button"
              onClick={() => {
                callar();
                onRepetir();
              }}
              className="inline-flex items-center gap-1.5 hover:text-[#8A968D] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Repetir el test
            </button>
            {!silencio && (
              <button
                type="button"
                onClick={() => decir(guion, { rate: 0.94 })}
                className="inline-flex items-center gap-1.5 hover:text-[#8A968D] transition-colors"
              >
                <Volume2 className="w-3 h-3" />
                Escuchar de nuevo
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
