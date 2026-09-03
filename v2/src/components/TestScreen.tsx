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

/**
 * Los cinco grados de la escala, de arriba abajo en la pantalla. Sigue siendo un
 * solo gesto —tocar, o arrastrar la frase— y sigue siendo arriba o abajo: lo que
 * anade la franja es cuanto. Cuanto mas lejos del centro, mas fuerte.
 */
const NIVELES = [
  { valor: 5, etiqueta: 'Sí, totalmente', color: '#86EFAC', flechas: 2, dir: 'arriba' as const },
  { valor: 4, etiqueta: 'Sí, me pasa', color: '#4E8B69', flechas: 1, dir: 'arriba' as const },
  { valor: 3, etiqueta: 'A veces', color: '#8A968D', flechas: 0, dir: 'centro' as const },
  { valor: 2, etiqueta: 'No, la verdad', color: '#8B5A5A', flechas: 1, dir: 'abajo' as const },
  { valor: 1, etiqueta: 'No, para nada', color: '#E06B6B', flechas: 2, dir: 'abajo' as const },
];

const ARRIBA = NIVELES.filter(n => n.dir === 'arriba');
const ABAJO = NIVELES.filter(n => n.dir === 'abajo');
const NEUTRO = NIVELES.find(n => n.dir === 'centro')!;

/** Umbrales de arrastre: un tiron corto es el grado suave, uno largo el extremo. */
const ARRASTRE_SUAVE = 55;
const ARRASTRE_FUERTE = 135;

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
  const [saliendo, setSaliendo] = useState<number | null>(null);

  const respuestasRef = useRef<AssessmentAnswer[]>([]);
  const bloqueadoRef = useRef(false);
  const arrastroRef = useRef(false);

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
    (valor: number) => {
      if (bloqueadoRef.current || !pregunta) return;
      bloqueadoRef.current = true;

      // Responder corta la voz al instante: no hay que esperar a que termine.
      callar();
      setHablando(false);
      // La intensidad del aviso acompana a la de la respuesta.
      if (valor === 5) vibrar([14, 30, 14]);
      else if (valor === 1) vibrar([10, 40, 10, 40, 10]);
      else if (valor === 3) vibrar(8);
      else vibrar(14);

      respuestasRef.current = [
        ...respuestasRef.current,
        { questionId: pregunta.id, value: valor },
      ];

      setSaliendo(valor);

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

  // Teclado, para quien esta en un ordenador: flechas para los grados suaves,
  // con mayusculas para los extremos, y los numeros del 1 al 5 directos.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        responder(e.shiftKey ? 5 : 4);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        responder(e.shiftKey ? 1 : 2);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        responder(Number(e.key));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (pregunta) leerActual(pregunta.text);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [responder, pregunta, leerActual]);

  if (!pregunta) return null;

  const desplazamientoSalida =
    saliendo === 5 ? -520 : saliendo === 4 ? -300 : saliendo === 2 ? 300 : saliendo === 1 ? 520 : 0;

  const salida = saliendo
    ? {
        y: desplazamientoSalida,
        opacity: 0,
        scale: saliendo === 3 ? 0.86 : 0.9,
        rotate: desplazamientoSalida === 0 ? 0 : desplazamientoSalida < 0 ? -4 : 4,
      }
    : { opacity: 0 };

  const renderFranja = (n: (typeof NIVELES)[number]) => {
    const Flecha = n.dir === 'arriba' ? ChevronUp : ChevronDown;
    const iconos = (
      <span className="flex flex-col items-center -space-y-2.5" aria-hidden="true">
        {Array.from({ length: n.flechas }).map((_, i) => (
          <Flecha key={i} className="w-6 h-6" strokeWidth={2.5} />
        ))}
      </span>
    );

    return (
      <button
        key={n.valor}
        type="button"
        onClick={() => responder(n.valor)}
        aria-label={n.etiqueta}
        className="group relative flex-1 min-h-0 flex items-center justify-center outline-none transition-colors"
        style={{ color: n.color }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(${n.dir === 'arriba' ? '180deg' : '0deg'}, ${n.color}1F, transparent)`,
          }}
        />
        <span className="relative flex flex-col items-center gap-0.5 opacity-70 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
          {n.dir === 'arriba' && iconos}
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] whitespace-nowrap">
            {n.etiqueta}
          </span>
          {n.dir === 'abajo' && iconos}
        </span>
      </button>
    );
  };

  return (
    <div
      className="relative flex flex-col select-none overflow-hidden"
      style={{ height: '100dvh', touchAction: 'none' }}
    >
      {/* Progreso: una linea, sin numeros que leer */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#14201C] z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F]"
          animate={{ width: `${progreso}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Decorativo: no debe tragarse toques que iban a la franja de arriba. */}
      <span className="pointer-events-none absolute top-4 left-4 z-40 text-[11px] font-semibold tracking-widest text-[#4E5C55]">
        {indice + 1}/{total}
      </span>

      {/* Los dos unicos controles del recorrido */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => leerActual(pregunta.text)}
          aria-label="Repetir la frase"
          disabled={silencio}
          className="w-10 h-10 rounded-full bg-[#101917]/85 backdrop-blur border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            callar();
            setHablando(false);
            onToggleSilencio();
          }}
          aria-label={silencio ? 'Activar la voz' : 'Silenciar la voz'}
          className="w-10 h-10 rounded-full bg-[#101917]/85 backdrop-blur border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
        >
          {silencio ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Las dos franjas del sí */}
      {ARRIBA.map(renderFranja)}

      {/* El centro: la frase. Tocarla es "a veces"; arrastrarla, cualquier grado. */}
      <div className="relative shrink-0 px-5 py-1 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pregunta.id}
            drag={prefersReducedMotion ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragStart={() => {
              arrastroRef.current = true;
            }}
            onDragEnd={(_, info) => {
              const dy = info.offset.y;
              if (dy < -ARRASTRE_FUERTE) responder(5);
              else if (dy < -ARRASTRE_SUAVE) responder(4);
              else if (dy > ARRASTRE_FUERTE) responder(1);
              else if (dy > ARRASTRE_SUAVE) responder(2);
              // Un tiron corto no responde: la frase vuelve a su sitio.
              window.setTimeout(() => {
                arrastroRef.current = false;
              }, 60);
            }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={salida}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            <button
              type="button"
              onClick={() => {
                if (arrastroRef.current) return;
                responder(NEUTRO.valor);
              }}
              aria-label={NEUTRO.etiqueta}
              className="w-full text-left rounded-[2rem] bg-[#101917]/95 backdrop-blur border border-[#23332D] shadow-2xl px-6 py-6 sm:px-8 sm:py-7 space-y-4"
            >
              {/* El orbe: late despacio, y mas fuerte mientras la voz habla */}
              <span className="relative mx-auto w-14 h-14 flex items-center justify-center">
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
                <span className="relative text-lg">✦</span>
              </span>

              <span
                className={`block text-center font-serif leading-snug text-[#F2EFE6] ${
                  silencio ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                {pregunta.text}
              </span>

              <span className="block text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E6C64]">
                Toca aquí · {NEUTRO.etiqueta}
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Las dos franjas del no */}
      {ABAJO.map(renderFranja)}
    </div>
  );
};
