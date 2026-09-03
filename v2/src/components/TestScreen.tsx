import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, ChevronUp, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../lib/domain';
import type { AssessmentAnswer, Question } from '../lib/domain';
import { callar, decir, vibrar } from '../lib/voice';

interface TestScreenProps {
  silencio: boolean;
  onToggleSilencio: () => void;
  onTerminar: (respuestas: AssessmentAnswer[]) => void;
}

/** Si -> el extremo alto de la escala. No -> el extremo bajo. */
const VALOR_SI = 5;
const VALOR_NO = 1;

/** Cuanto hay que arrastrar para que cuente como respuesta. */
const UMBRAL_ARRASTRE = 70;

export const TestScreen: React.FC<TestScreenProps> = ({
  silencio,
  onToggleSilencio,
  onTerminar,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const preguntas: Question[] = useMemo(
    () => QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id)),
    []
  );

  const [indice, setIndice] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [saliendo, setSaliendo] = useState<'si' | 'no' | null>(null);

  const respuestasRef = useRef<AssessmentAnswer[]>([]);
  const bloqueadoRef = useRef(false);

  const pregunta = preguntas[indice];
  const total = preguntas.length;
  const progreso = total ? (indice / total) * 100 : 0;

  const leerActual = useCallback(
    (texto: string) => {
      if (silencio) return;
      setHablando(true);
      decir(texto).then(() => setHablando(false));
    },
    [silencio]
  );

  // Cada afirmacion se lee sola al entrar. Nadie tiene que pulsar "reproducir".
  useEffect(() => {
    if (!pregunta) return;
    leerActual(pregunta.text);
    return () => callar();
  }, [pregunta, leerActual]);

  const responder = useCallback(
    (respuesta: 'si' | 'no') => {
      if (bloqueadoRef.current || !pregunta) return;
      bloqueadoRef.current = true;

      // Responder corta la voz al instante: no hay que esperar a que termine.
      callar();
      setHablando(false);
      vibrar(respuesta === 'si' ? 14 : [10, 40, 10]);

      respuestasRef.current = [
        ...respuestasRef.current,
        { questionId: pregunta.id, value: respuesta === 'si' ? VALOR_SI : VALOR_NO },
      ];

      setSaliendo(respuesta);

      const esperar = prefersReducedMotion ? 60 : 260;
      window.setTimeout(() => {
        setSaliendo(null);
        bloqueadoRef.current = false;
        if (indice + 1 >= total) {
          onTerminar(respuestasRef.current);
        } else {
          setIndice(i => i + 1);
        }
      }, esperar);
    },
    [pregunta, indice, total, onTerminar, prefersReducedMotion]
  );

  // Teclado: las mismas flechas que el gesto, para quien esta en un ordenador.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        responder('si');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        responder('no');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (pregunta) leerActual(pregunta.text);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [responder, pregunta, leerActual]);

  if (!pregunta) return null;

  const salida =
    saliendo === 'si'
      ? { y: -420, opacity: 0, scale: 0.9, rotate: -4 }
      : saliendo === 'no'
      ? { y: 420, opacity: 0, scale: 0.9, rotate: 4 }
      : undefined;

  return (
    <div
      className="relative flex flex-col select-none"
      style={{ height: '100dvh', touchAction: 'none' }}
    >
      {/* Progreso: una linea, sin numeros que leer */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#14201C] z-30">
        <motion.div
          className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F]"
          animate={{ width: `${progreso}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Voz encendida o apagada: el unico ajuste del recorrido */}
      <button
        type="button"
        onClick={() => {
          callar();
          setHablando(false);
          onToggleSilencio();
        }}
        aria-label={silencio ? 'Activar la voz' : 'Silenciar la voz'}
        className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-[#101917]/80 backdrop-blur border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
      >
        {silencio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Decorativo: no debe tragarse toques que iban a la zona de "si". */}
      <span className="pointer-events-none absolute top-5 left-4 z-30 text-[11px] font-semibold tracking-widest text-[#4E5C55]">
        {indice + 1}/{total}
      </span>

      {/* Zona SI: toda la mitad de arriba */}
      <button
        type="button"
        onClick={() => responder('si')}
        aria-label="Sí, me pasa"
        className="group relative flex-1 flex items-start justify-center pt-14 sm:pt-16 outline-none"
      >
        <span className="flex flex-col items-center gap-1 text-[#4E8B69] group-hover:text-[#86EFAC] group-active:text-[#86EFAC] transition-colors">
          <ChevronUp className="w-8 h-8 animate-hintUp" strokeWidth={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Sí, me pasa</span>
        </span>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#4E8B69]/0 to-transparent group-active:from-[#4E8B69]/15 transition-colors" />
      </button>

      {/* Zona NO: toda la mitad de abajo */}
      <button
        type="button"
        onClick={() => responder('no')}
        aria-label="No, para nada"
        className="group relative flex-1 flex items-end justify-center pb-14 sm:pb-16 outline-none"
      >
        <span className="flex flex-col items-center gap-1 text-[#8B5A5A] group-hover:text-[#F4A4A4] group-active:text-[#F4A4A4] transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">No, para nada</span>
          <ChevronDown className="w-8 h-8 animate-hintDown" strokeWidth={2.5} />
        </span>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#8B5A5A]/0 to-transparent group-active:from-[#8B5A5A]/15 transition-colors" />
      </button>

      {/* La afirmacion, flotando en el centro y arrastrable */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pregunta.id}
            drag={prefersReducedMotion ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.55}
            onDragEnd={(_, info) => {
              if (info.offset.y < -UMBRAL_ARRASTRE) responder('si');
              else if (info.offset.y > UMBRAL_ARRASTRE) responder('no');
            }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={salida || { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            <div className="relative rounded-[2rem] bg-[#101917]/95 backdrop-blur border border-[#23332D] shadow-2xl px-6 py-7 sm:px-8 sm:py-9 text-center space-y-5">
              {/* El orbe: late despacio, y mas fuerte mientras la voz habla */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-full bg-[#D6A84F]/25 blur-md ${
                    hablando ? 'animate-orbSpeak' : 'animate-orbPulse'
                  }`}
                />
                <span
                  className={`absolute inset-2 rounded-full border ${
                    hablando ? 'border-[#D6A84F]' : 'border-[#315C45]'
                  } transition-colors`}
                />
                <span className="relative text-xl">✦</span>
              </div>

              <p
                className={`font-serif leading-snug text-[#F2EFE6] ${
                  silencio ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                {pregunta.text}
              </p>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  leerActual(pregunta.text);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#5E6C64] hover:text-[#D6A84F] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {silencio ? 'Activa la voz para escucharla' : 'Repetir'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
