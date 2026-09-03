import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronLeft, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import {
  ArchetypeIllustratedArtwork,
  DIMENSIONS,
  getArchetypeList,
} from '../lib/domain';
import type { Archetype } from '../lib/domain';
import { CAPITULOS } from '../lib/capitulos';
import { callar, decir, vibrar } from '../lib/voice';
import { SigiloVivo } from './SigiloVivo';

interface HistoriaScreenProps {
  silencio: boolean;
  onToggleSilencio: () => void;
  onCerrar: () => void;
  /** Al terminar el recorrido, lo natural es hacer el test. */
  onEmpezarTest: () => void;
}

/** El último tramo no es un capítulo: es la galería de los dieciocho. */
const TOTAL = CAPITULOS.length + 1;
const MS_POR_ROSTRO = 3600;

export const HistoriaScreen: React.FC<HistoriaScreenProps> = ({
  silencio,
  onToggleSilencio,
  onCerrar,
  onEmpezarTest,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [paso, setPaso] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [rostro, setRostro] = useState(0);
  const [galeria, setGaleria] = useState(0);
  const [desfilando, setDesfilando] = useState(true);
  const dijoRef = useRef<string | null>(null);
  // Espejos para el cierre de la promesa de la voz, que se crea antes de que
  // existan el paso siguiente y la funcion de avanzar.
  const pasoRef = useRef(0);
  const avanceRef = useRef<number | null>(null);

  const arquetipos: Archetype[] = useMemo(() => getArchetypeList('universal'), []);
  const enGaleria = paso === CAPITULOS.length;
  const capitulo = enGaleria ? null : CAPITULOS[paso];
  const actual = arquetipos[galeria];

  // ── La voz: cada capítulo se cuenta solo al entrar, una vez ───────────────
  //
  // Y al terminar de contarlo, pasa solo al siguiente: si te lo están contando,
  // no deberías tener que pedir permiso para seguir escuchando.
  useEffect(() => {
    const clave = enGaleria ? `galeria-${actual?.id}` : capitulo?.id;
    if (!clave || silencio || dijoRef.current === clave) return;
    dijoRef.current = clave;

    const guion = enGaleria
      ? `${actual.name}. ${actual.shortDescription}`
      : `${capitulo!.titulo}. ${capitulo!.texto}`;

    const desde = paso;
    const t0 = Date.now();
    setHablando(true);

    decir(guion, { rate: enGaleria ? 1 : 0.96 }).then(() => {
      setHablando(false);

      // Si no había voz, `decir` vuelve al instante. Avanzar entonces seria
      // pasar siete capitulos en un parpadeo sin que nadie haya oido nada.
      if (Date.now() - t0 < 1500) return;
      // De la galeria no se sale sola: ahi manda el desfile, y el final lleva
      // al test, que no es algo que deba empezar sin que lo pidas.
      if (enGaleria) return;
      // Si mientras hablaba te moviste tú, mandas tú.
      if (pasoRef.current !== desde) return;

      avanceRef.current = window.setTimeout(() => avanzarRef.current(), 900);
    });

    return () => {
      callar();
      if (avanceRef.current) window.clearTimeout(avanceRef.current);
    };
  }, [paso, enGaleria, capitulo, actual, silencio]);

  // ── Los rostros del capítulo se van turnando ─────────────────────────────
  useEffect(() => {
    if (enGaleria || !capitulo || capitulo.rostros.length < 2 || prefersReducedMotion) return;
    const t = window.setInterval(
      () => setRostro(r => (r + 1) % capitulo.rostros.length),
      MS_POR_ROSTRO
    );
    return () => window.clearInterval(t);
  }, [paso, enGaleria, capitulo, prefersReducedMotion]);

  useEffect(() => setRostro(0), [paso]);

  // ── El desfile de los dieciocho ──────────────────────────────────────────
  useEffect(() => {
    if (!enGaleria || !desfilando || prefersReducedMotion) return;
    const t = window.setInterval(() => setGaleria(g => (g + 1) % arquetipos.length), 4600);
    return () => window.clearInterval(t);
  }, [enGaleria, desfilando, arquetipos.length, prefersReducedMotion]);

  useEffect(() => {
    pasoRef.current = paso;
  }, [paso]);

  const avanzar = useCallback(() => {
    if (avanceRef.current) window.clearTimeout(avanceRef.current);
    callar();
    setHablando(false);
    vibrar(10);
    if (paso < TOTAL - 1) setPaso(p => p + 1);
    else onEmpezarTest();
  }, [paso, onEmpezarTest]);

  const avanzarRef = useRef(avanzar);
  useEffect(() => {
    avanzarRef.current = avanzar;
  }, [avanzar]);

  const retroceder = useCallback(() => {
    if (paso === 0) return;
    callar();
    setHablando(false);
    setPaso(p => p - 1);
  }, [paso]);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        avanzar();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        retroceder();
      } else if (e.key === 'Escape') {
        callar();
        onCerrar();
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [avanzar, retroceder, onCerrar]);

  const acento = enGaleria ? actual.colorHex : capitulo!.color;
  const rostroActual = enGaleria ? actual.id : capitulo!.rostros[rostro] ?? capitulo!.rostros[0];

  const entra = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 18, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -14, scale: 0.98 },
      };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#070C0B] text-[#F2EFE6] select-none overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* El aura toma el color del capítulo y cambia con él */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-3xl"
        animate={{ backgroundColor: `${acento}22` }}
        transition={{ duration: 1.1 }}
      />

      {/* ── Barra: progreso, voz y salida ─────────────────────────────────── */}
      <header className="relative z-10 shrink-0 px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            callar();
            onCerrar();
          }}
          aria-label="Cerrar"
          className="w-10 h-10 shrink-0 rounded-full bg-[#101917]/80 border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-1" aria-label="Progreso del recorrido">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-[#1A2521]"
            >
              <motion.span
                className="block h-full rounded-full"
                style={{ backgroundColor: acento }}
                animate={{ width: i < paso ? '100%' : i === paso ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            callar();
            setHablando(false);
            dijoRef.current = null;
            onToggleSilencio();
          }}
          aria-label={silencio ? 'Activar la voz' : 'Silenciar la voz'}
          className="w-10 h-10 shrink-0 rounded-full bg-[#101917]/80 border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
        >
          {silencio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* ── El cuerpo ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-4">
        <div className="max-w-lg mx-auto min-h-full flex flex-col items-center justify-center gap-5 py-2">
          {/* El rostro */}
          <div className="relative w-[210px] sm:w-[240px] shrink-0">
            <motion.span
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] blur-2xl"
              animate={{ backgroundColor: `${acento}33` }}
              transition={{ duration: 1.1 }}
            />
            <div
              className="relative aspect-square rounded-full overflow-hidden border shadow-2xl bg-[#0B1110]/60 transition-colors duration-700"
              style={{ borderColor: `${acento}66` }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={rostroActual}
                  className="absolute inset-0"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* El sigilo es la ilustracion, no un adorno encima de otra:
                      se traza solo al entrar, gira despues y late en el centro.
                      Es geometria generada del propio arquetipo, asi que los
                      dieciocho se leen como una familia. */}
                  <SigiloVivo
                    key={`sigilo-${rostroActual}`}
                    archetypeId={rostroActual}
                    dimension={arquetipos.find(a => a.id === rostroActual)?.dimension ?? 'mente'}
                    color={acento}
                    className="absolute inset-0"
                  />
                </motion.div>
              </AnimatePresence>

            </div>
          </div>

          {/* El texto */}
          <AnimatePresence mode="wait">
            <motion.div
              key={enGaleria ? `g-${actual.id}` : capitulo!.id}
              {...entra}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-3"
            >
              {enGaleria ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7B8880]">
                    {galeria + 1} de {arquetipos.length}
                  </p>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: actual.colorHex }}
                  >
                    {DIMENSIONS[actual.dimension].name}
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                    {actual.name}
                  </h1>
                  <p className="text-sm text-[#C5CFC7] leading-relaxed">
                    {actual.shortDescription}
                  </p>
                  <blockquote
                    className="font-serif italic text-sm text-[#E5D7B7] leading-relaxed px-3"
                    style={{ borderLeft: `2px solid ${actual.colorHex}` }}
                  >
                    «{actual.mantra}»
                  </blockquote>
                </>
              ) : (
                <>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                    {capitulo!.titulo}
                  </h1>
                  <p className="text-sm sm:text-base text-[#C5CFC7] leading-relaxed">
                    {capitulo!.texto}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* La tira de los dieciocho, solo en la galería */}
          {enGaleria && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E6C64]">Toca cualquiera</span>
                <button
                  type="button"
                  onClick={() => setDesfilando(d => !d)}
                  className="inline-flex items-center gap-1.5 min-h-[40px] text-[11px] text-[#8A968D] hover:text-[#F2EFE6] px-3 rounded-lg border border-[#1E2A25] transition-colors"
                >
                  {desfilando ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {desfilando ? 'Pausar' : 'Reanudar'}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto touch-scroll-x scrollbar-persona pb-2">
                {arquetipos.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setDesfilando(false);
                      setGaleria(i);
                    }}
                    aria-label={a.name}
                    className={`shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${
                      i === galeria
                        ? 'scale-110 bg-[#0E1513]'
                        : 'bg-[#101917] border-[#23332D] opacity-60 hover:opacity-100'
                    }`}
                    style={i === galeria ? { borderColor: a.colorHex } : undefined}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Señal de que la voz está hablando */}
          {hablando && !silencio && (
            <span className="flex items-center gap-1.5 text-[10px] text-[#5E6C64]" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full animate-orbSpeak" style={{ backgroundColor: acento }} />
              Contándotelo
            </span>
          )}
        </div>
      </div>

      {/* ── Pie: atrás y continuar ────────────────────────────────────────── */}
      <footer
        className="relative z-10 shrink-0 px-4 py-3 border-t border-[#141E1B] bg-[#070C0B]/90 backdrop-blur flex items-center gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={retroceder}
          disabled={paso === 0}
          aria-label="Anterior"
          className={`w-11 h-11 shrink-0 rounded-xl border border-[#1E2A25] flex items-center justify-center transition-all ${
            paso === 0 ? 'opacity-0 pointer-events-none' : 'text-[#8A968D] hover:text-[#F2EFE6]'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={avanzar}
          className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] border border-[#4E8B69] text-[#F2EFE6] font-semibold text-sm shadow-xl active:scale-95 transition-transform"
        >
          {paso === TOTAL - 1 ? 'Hacer mi test' : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
