import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { barajar, candidatosDesempate, dilemaDeDesempate, dilemasDelTest } from '../lib/domain';
import type { OpcionDilema, RespuestaDilema } from '../lib/domain';
import { callar, decir, vibrar } from '../lib/voice';

export type TipoTest = 'quick' | 'full';

interface TestScreenProps {
  tipo: TipoTest;
  silencio: boolean;
  onToggleSilencio: () => void;
  onTerminar: (respuestas: RespuestaDilema[]) => void;
}

/** Lo que se ve y se oye en una pantalla: una situación o un desempate. */
interface Pantalla {
  id: string;
  /** Arriba, pequeño: el ámbito o «Un último paso». */
  cabecera: string;
  situacion?: string;
  pregunta: string;
  opciones: OpcionDilema[];
  /** Solo en los desempates: entre quiénes se elige. */
  entre?: RespuestaDilema['entre'];
}

const NUMEROS = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis'];

/**
 * El test por dilemas, contado en voz alta: la voz lee la situación y luego cada respuesta,
 * iluminando la que está leyendo. Se elige tocando (o con las teclas 1 a 4) en cualquier
 * momento: la voz se calla al instante. Las mismas situaciones que la V1, barajadas igual.
 */
export const TestScreen: React.FC<TestScreenProps> = ({ tipo, silencio, onToggleSilencio, onTerminar }) => {
  const prefersReducedMotion = useReducedMotion();
  const dilemas = useMemo(() => dilemasDelTest(tipo), [tipo]);
  // Una semilla por recorrido: el orden de las respuestas no lo decide la posición.
  const [semilla] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

  const [indice, setIndice] = useState(0);
  const [desempate, setDesempate] = useState<Pantalla | null>(null);
  const [leyendo, setLeyendo] = useState<number | null>(null);
  const [hablando, setHablando] = useState(false);
  const [elegida, setElegida] = useState<string | null>(null);

  const respuestasRef = useRef<RespuestaDilema[]>([]);
  const bloqueadoRef = useRef(false);
  // La pantalla que está de verdad delante. Durante la animación de salida, la anterior sigue
  // visible unos milisegundos con sus botones: un toque en ella no debe contar.
  const vigenteRef = useRef<string | null>(null);
  // Tras elegir, medio segundo sin aceptar otra elección, dure lo que dure la animación (con
  // movimiento reducido la pantalla cambia a los 80 ms y el segundo toque caería en la siguiente).
  const bloqueoHasta = useRef(0);

  const pantalla: Pantalla | null = useMemo(() => {
    if (desempate) return desempate;
    const d = dilemas[indice];
    if (!d) return null;
    return {
      id: d.id,
      cabecera: d.ambito,
      situacion: d.situacion,
      pregunta: d.pregunta,
      opciones: barajar(d.opciones, `${semilla}:${d.id}`),
    };
  }, [desempate, dilemas, indice, semilla]);

  // Se lee la situación y después cada respuesta, una a una. Si se corta (porque se eligió,
  // se repite o se silencia), la lectura se detiene ahí.
  const leer = useCallback(
    async (p: Pantalla) => {
      if (silencio) return;
      setHablando(true);
      const intro = p.situacion ? `${p.situacion} ${p.pregunta}` : p.pregunta;
      let fin = await decir(intro);
      for (let i = 0; i < p.opciones.length && fin === 'fin'; i++) {
        setLeyendo(i);
        fin = await decir(`${NUMEROS[i]}. ${p.opciones[i].texto}`);
      }
      // Si la cortaron, quien la cortó ya puso su estado (otra lectura, o una elección).
      if (fin !== 'cortada') {
        setLeyendo(null);
        setHablando(false);
      }
    },
    [silencio]
  );

  useEffect(() => {
    if (!pantalla) return;
    vigenteRef.current = pantalla.id;
    setLeyendo(null);
    leer(pantalla);
    return () => {
      callar();
      setHablando(false);
      setLeyendo(null);
    };
  }, [pantalla, leer]);

  const siguientePantalla = useCallback(() => {
    const todas = respuestasRef.current;
    // No se termina con situaciones sin responder: se vuelve a la primera que falte.
    const pendiente = dilemas.findIndex(d => !todas.some(r => r.dilemaId === d.id));
    if (pendiente >= 0) {
      setDesempate(null);
      setIndice(pendiente);
      return;
    }
    const candidatos = candidatosDesempate(todas, tipo);
    if (candidatos) {
      const numero = todas.filter(r => r.dilemaId.startsWith('desempate')).length + 1;
      const d = dilemaDeDesempate(candidatos, numero);
      setDesempate({
        id: d.id,
        cabecera: 'Un último paso',
        situacion: 'Tus respuestas dejan a varias figuras igualadas.',
        pregunta: d.pregunta,
        opciones: barajar(d.opciones, `${semilla}:${d.id}`),
        entre: candidatos,
      });
      return;
    }
    onTerminar(todas);
  }, [dilemas, tipo, semilla, onTerminar]);

  const responder = useCallback(
    (o: OpcionDilema) => {
      if (bloqueadoRef.current || !pantalla) return;
      // Solo cuenta un toque en la pantalla vigente, y una sola respuesta por situación.
      if (vigenteRef.current !== pantalla.id || respuestasRef.current.some(r => r.dilemaId === pantalla.id)) return;
      if (Date.now() < bloqueoHasta.current) return;
      bloqueoHasta.current = Date.now() + 500;
      bloqueadoRef.current = true;
      // Elegir corta la voz al instante: no hay que esperar a que termine.
      callar();
      setHablando(false);
      setLeyendo(null);
      vibrar(14);
      setElegida(o.arquetipo);
      respuestasRef.current = [
        ...respuestasRef.current,
        { dilemaId: pantalla.id, arquetipo: o.arquetipo, ...(pantalla.entre ? { entre: pantalla.entre } : {}) },
      ];

      window.setTimeout(
        () => {
          setElegida(null);
          bloqueadoRef.current = false;
          if (pantalla.entre || indice + 1 >= dilemas.length) siguientePantalla();
          else setIndice(i => i + 1);
        },
        prefersReducedMotion ? 80 : 320
      );
    },
    [pantalla, indice, dilemas.length, siguientePantalla, prefersReducedMotion]
  );

  // Teclado: 1 a 4 (o hasta 6 en un desempate) para elegir; espacio o Intro para repetir.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (!pantalla) return;
      const n = Number(e.key);
      if (n >= 1 && n <= pantalla.opciones.length) {
        e.preventDefault();
        responder(pantalla.opciones[n - 1]);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        callar();
        leer(pantalla);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [pantalla, responder, leer]);

  if (!pantalla) return null;

  const total = dilemas.length;
  const progreso = desempate ? 100 : (indice / total) * 100;

  return (
    <div className="relative flex flex-col select-none overflow-hidden" style={{ height: '100dvh' }}>
      <div className="absolute top-0 inset-x-0 h-1 bg-[#14201C] z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F]"
          animate={{ width: `${progreso}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
        />
      </div>

      <span className="pointer-events-none absolute top-4 left-4 z-40 text-[11px] font-semibold tracking-widest text-[#4E5C55]">
        {desempate ? '✦' : `${indice + 1}/${total}`}
      </span>

      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            callar();
            leer(pantalla);
          }}
          aria-label="Repetir"
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
            setLeyendo(null);
            onToggleSilencio();
          }}
          aria-label={silencio ? 'Activar la voz' : 'Silenciar la voz'}
          className="w-10 h-10 rounded-full bg-[#101917]/85 backdrop-blur border border-[#23332D] flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
        >
          {silencio ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col px-5 pt-16 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pantalla.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="my-auto mx-auto w-full max-w-md space-y-5"
          >
            <div className="text-center space-y-3">
              {/* El orbe: late despacio, y más fuerte mientras la voz habla */}
              <span className="relative mx-auto w-12 h-12 flex items-center justify-center">
                <span className={`absolute inset-0 rounded-full bg-[#D6A84F]/25 blur-md ${hablando ? 'animate-orbSpeak' : 'animate-orbPulse'}`} />
                <span className={`absolute inset-2 rounded-full border ${hablando ? 'border-[#D6A84F]' : 'border-[#315C45]'} transition-colors`} />
                <span className="relative text-base">✦</span>
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D6A84F]">{pantalla.cabecera}</p>
              {pantalla.situacion && <h2 className="font-serif text-xl sm:text-2xl leading-snug text-[#F2EFE6]">{pantalla.situacion}</h2>}
              <p className={pantalla.situacion ? 'text-sm text-[#8A968D]' : 'font-serif text-xl sm:text-2xl leading-snug text-[#F2EFE6]'}>
                {pantalla.pregunta}
              </p>
            </div>

            <div className="space-y-2" role="radiogroup" aria-label={pantalla.pregunta}>
              {pantalla.opciones.map((o, i) => {
                const activa = elegida === o.arquetipo;
                const enVoz = leyendo === i;
                return (
                  <button
                    key={o.arquetipo}
                    type="button"
                    role="radio"
                    aria-checked={activa}
                    onClick={() => responder(o)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                      activa
                        ? 'bg-[#1C3529] border-[#86EFAC] text-[#F2EFE6]'
                        : enVoz
                          ? 'bg-[#15221D] border-[#D6A84F]/70 text-[#F2EFE6]'
                          : 'bg-[#101917]/90 border-[#1E2A25] text-[#C5CFC7] hover:border-[#315C45]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors ${
                        enVoz || activa ? 'border-[#D6A84F] text-[#D6A84F]' : 'border-[#315C45] text-[#8A968D]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px] leading-snug">{o.texto}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E6C64]">
              Toca la que más se parece a ti
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
