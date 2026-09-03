import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { decir, prepararVoz, vibrar } from '../lib/voice';

interface WelcomeScreenProps {
  onEmpezar: () => void;
}

/**
 * Una pantalla, un boton. El toque hace tres cosas a la vez: empezar, desbloquear
 * la voz -los navegadores moviles exigen un gesto antes de dejar hablar- y dar
 * la unica instruccion que hace falta, que ademas se dice en voz alta.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEmpezar }) => {
  const prefersReducedMotion = useReducedMotion();
  const [arrancando, setArrancando] = useState(false);

  const empezar = async () => {
    if (arrancando) return;
    setArrancando(true);
    vibrar(18);
    await prepararVoz();
    // Se dice dentro del gesto: es lo que desbloquea la voz en iOS.
    decir('Arriba es sí. Abajo es no. Empezamos.', { rate: 1.02 });
    window.setTimeout(onEmpezar, prefersReducedMotion ? 60 : 420);
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
            Te digo una frase. Si te pasa, arriba. Si no, abajo.
            <br />
            Dos minutos y sabes cuál es tu arquetipo.
          </p>
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

        {/* La instruccion, dibujada en vez de explicada */}
        <div className="flex items-center justify-center gap-8 text-[11px] font-semibold uppercase tracking-widest animate-riseIn">
          <span className="flex flex-col items-center gap-1 text-[#4E8B69]">
            <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
            Sí
          </span>
          <span className="text-[#2B3833]">·</span>
          <span className="flex flex-col items-center gap-1 text-[#8B5A5A]">
            No
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      <a
        href="/"
        className="absolute bottom-6 z-10 text-[11px] text-[#4E5C55] hover:text-[#8A968D] transition-colors"
      >
        Ir a la versión completa
      </a>
    </div>
  );
};
