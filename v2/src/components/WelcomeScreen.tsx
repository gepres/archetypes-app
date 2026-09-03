import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { VozPicker } from './VozPicker';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../lib/domain';
import type { TipoTest } from './TestScreen';
import { decir, prepararVoz, vibrar } from '../lib/voice';

/** Los mismos cinco colores que las franjas del test, de si a no. */
const ESCALA = ['#86EFAC', '#4E8B69', '#8A968D', '#8B5A5A', '#E06B6B'];

interface WelcomeScreenProps {
  onEmpezar: (tipo: TipoTest) => void;
  /** Para quien prefiere saber de que va antes de empezar a responder. */
  onConocerlos: () => void;
}

const CUANTAS = {
  quick: QUICK_QUESTION_IDS.length,
  full: QUESTIONS_DATA.length,
};

/**
 * Una pantalla, un boton. El toque hace tres cosas a la vez: empezar, desbloquear
 * la voz -los navegadores moviles exigen un gesto antes de dejar hablar- y dar
 * la unica instruccion que hace falta, que ademas se dice en voz alta.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEmpezar, onConocerlos }) => {
  const prefersReducedMotion = useReducedMotion();
  const [arrancando, setArrancando] = useState(false);
  // El corto por defecto: quien llega aqui viene de "no quiero leer".
  const [tipo, setTipo] = useState<TipoTest>('quick');
  const [eligiendoVoz, setEligiendoVoz] = useState(false);

  const empezar = async () => {
    if (arrancando) return;
    setArrancando(true);
    vibrar(18);
    await prepararVoz();
    // Se dice dentro del gesto: es lo que desbloquea la voz en iOS.
    decir('Arriba es sí, abajo es no. Cuanto más lejos del centro, más fuerte. Empezamos.', {
      rate: 1.02,
    });
    window.setTimeout(() => onEmpezar(tipo), prefersReducedMotion ? 60 : 420);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center px-6 text-center"
      style={{ height: '100dvh' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#315C45]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#D6A84F]/10 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-9 max-w-sm w-full">
        <div className="space-y-3 animate-riseIn">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D6A84F]">
            Arquetipos en voz
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-[1.1]">
            No lo leas.
            <br />
            Escúchalo.
          </h1>
          <p className="text-sm text-[#8A968D] leading-relaxed">
            Te digo una frase. Arriba si te pasa, abajo si no.
            <br />
            Cuanto más lejos del centro, más fuerte.
          </p>
        </div>

        {/* Cuanto quieres darle. El corto responde a la promesa de dos minutos;
            el completo mide mejor, y quien lo pide ya sabe lo que cuesta. */}
        <div
          role="group"
          aria-label="Duración del test"
          className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#101917] border border-[#1E2A25] max-w-xs mx-auto"
        >
          {([
            { id: 'quick' as TipoTest, titulo: 'Rápido', detalle: `${CUANTAS.quick} frases · 2 min` },
            { id: 'full' as TipoTest, titulo: 'Completo', detalle: `${CUANTAS.full} frases · 5 min` },
          ]).map(op => {
            const activo = tipo === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setTipo(op.id)}
                aria-pressed={activo}
                className={`rounded-xl px-3 py-2.5 transition-all min-h-[52px] ${
                  activo
                    ? 'bg-[#1C3529] border border-[#4E8B69] shadow-inner'
                    : 'border border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`block text-sm font-semibold ${activo ? 'text-[#F2EFE6]' : 'text-[#9DA79F]'}`}>
                  {op.titulo}
                </span>
                <span className="block text-[10px] text-[#7B8880] mt-0.5">{op.detalle}</span>
              </button>
            );
          })}
        </div>

        {/* El boton. Lo que late es el halo de detras, nunca el boton: un blanco
            que se mueve es mas dificil de acertar, y con el dedo se nota. */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto">
          {!prefersReducedMotion && !arrancando && (
            <motion.span
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-[#86EFAC]/15 blur-xl"
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <button
            type="button"
            onClick={empezar}
            disabled={arrancando}
            className="relative w-full h-full rounded-full bg-gradient-to-br from-[#315C45] to-[#1B3427] border-2 border-[#4E8B69] shadow-[0_0_60px_-12px_rgba(134,239,172,0.45)] flex flex-col items-center justify-center gap-1 text-[#F2EFE6] disabled:opacity-70 active:scale-95 transition-transform"
          >
            <span className="font-serif text-2xl font-bold">
              {arrancando ? 'Vamos' : 'Empezar'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9FD9B8]">
              un solo toque
            </span>
          </button>
        </div>

        {/* La escala, dibujada en vez de explicada: cinco pasos, un solo gesto */}
        <div className="flex flex-col items-center gap-1 animate-riseIn">
          <ChevronUp className="w-4 h-4 text-[#86EFAC]" strokeWidth={2.5} />
          <div className="flex items-center gap-1.5">
            {ESCALA.map(c => (
              <span
                key={c}
                className="w-7 h-1.5 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <ChevronDown className="w-4 h-4 text-[#E06B6B]" strokeWidth={2.5} />
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#4E5C55] pt-1">
            Cinco grados · un solo toque
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 z-10 flex flex-col items-center gap-3">
        {/* Antes de responder nada, hay quien quiere saber de que va. Se cuenta
            en voz, con los rostros, y termina llevando al test igualmente. */}
        <button
          type="button"
          onClick={onConocerlos}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-2xl border border-[#23332D] bg-[#101917]/70 text-xs text-[#C5CFC7] hover:text-[#F2EFE6] hover:border-[#D6A84F]/50 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-[#D6A84F]" />
          ¿Qué es un arquetipo? Te lo cuento
        </button>
        <div className="flex items-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => setEligiendoVoz(true)}
            className="inline-flex items-center gap-1.5 text-[#4E5C55] hover:text-[#D6A84F] transition-colors"
          >
            <Wand2 className="w-3 h-3" />
            Cambiar la voz
          </button>
          <span className="text-[#23332D]">·</span>
          <a href="/" className="text-[#4E5C55] hover:text-[#8A968D] transition-colors">
            Versión completa
          </a>
        </div>
      </div>

      <VozPicker abierto={eligiendoVoz} onCerrar={() => setEligiendoVoz(false)} />
    </div>
  );
};
