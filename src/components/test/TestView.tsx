import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, CheckCircle2, Scale } from 'lucide-react';
import { OpcionDilema } from '../../data/dilemasData';
import {
  barajar,
  calcularResultadoDilemas,
  candidatosDesempate,
  dilemaDeDesempate,
  dilemasDelTest,
} from '../../services/dilemas';
import { StorageService } from '../../services/storageService';
import { ArchetypeId, AssessmentResult, RespuestaDilema, DEFAULT_GENDER } from '../../types';

interface TestViewProps {
  testType: 'full' | 'quick';
  onComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

const nuevaSemilla = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * El test por dilemas: una situación por pantalla y cuatro maneras de responder; se elige la que
 * más se parece a ti. Si al final quedan figuras igualadas en cabeza, unas pocas pantallas más
 * para desempatar. El progreso se guarda y se retoma donde se dejó.
 */
export const TestView: React.FC<TestViewProps> = ({ testType: initialTestType, onComplete, onCancel }) => {
  const [testType, setTestType] = useState<'full' | 'quick'>(initialTestType);
  const [respuestas, setRespuestas] = useState<Record<string, ArchetypeId>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [semilla, setSemilla] = useState<string>(nuevaSemilla);
  const [fase, setFase] = useState<'dilemas' | 'desempate' | 'calculando'>('dilemas');
  const [desempates, setDesempates] = useState<RespuestaDilema[]>([]);
  const desempatesRespondidos = useRef(new Set<string>());
  // Tras elegir, medio segundo sin aceptar otra elección: el segundo toque de un doble toque
  // caería ya en la pantalla siguiente (otra situación u otro desempate) y la respondería.
  const bloqueoHasta = useRef(0);
  const bloquear = () => {
    if (Date.now() < bloqueoHasta.current) return false;
    bloqueoHasta.current = Date.now() + 500;
    return true;
  };
  const reiniciarDesempates = () => {
    desempatesRespondidos.current = new Set();
    setDesempates([]);
  };

  const dilemas = useMemo(() => dilemasDelTest(testType), [testType]);

  // Retomar lo guardado. Las respuestas van por situación, así que pasar del rápido al completo
  // conserva las dieciocho ya respondidas.
  useEffect(() => {
    const saved = StorageService.getTestProgress();
    if (!saved) return;
    setRespuestas(Object.fromEntries(saved.respuestas.map(r => [r.dilemaId, r.arquetipo])));
    setSemilla(saved.semilla);
    const propias = dilemasDelTest(testType);
    if (saved.testType === testType) setCurrentIndex(Math.min(saved.currentIndex, propias.length - 1));
    else setCurrentIndex(Math.max(0, propias.findIndex(d => !saved.respuestas.some(r => r.dilemaId === d.id))));
  }, []);

  const lista: RespuestaDilema[] = useMemo(
    () => Object.entries(respuestas).map(([dilemaId, arquetipo]) => ({ dilemaId, arquetipo })),
    [respuestas]
  );

  useEffect(() => {
    if (lista.length > 0) StorageService.saveTestProgress({ instrumento: 'dilemas', testType, respuestas: lista, currentIndex, semilla });
  }, [lista, currentIndex, testType, semilla]);

  const dilema = dilemas[currentIndex] ?? dilemas[0];
  const opciones = useMemo(() => barajar(dilema.opciones, `${semilla}:${dilema.id}`), [dilema, semilla]);
  const elegida = respuestas[dilema.id];
  const respondidas = dilemas.filter(d => respuestas[d.id]).length;
  const todasRespondidas = respondidas === dilemas.length;
  const ultimo = currentIndex === dilemas.length - 1;

  const candidatos = fase === 'desempate' ? candidatosDesempate([...lista, ...desempates], testType) : null;
  const desempate = candidatos ? dilemaDeDesempate(candidatos, desempates.length + 1) : null;
  const opcionesDesempate = useMemo(
    () => (desempate ? barajar(desempate.opciones, `${semilla}:${desempate.id}`) : []),
    [desempate?.id, candidatos?.join(','), semilla]
  );

  const calcular = (todas: RespuestaDilema[]) => {
    setFase('calculando');
    window.setTimeout(() => {
      const gender = StorageService.getUserProfile().gender || DEFAULT_GENDER;
      const result = calcularResultadoDilemas(todas, testType, gender);
      StorageService.saveCurrentResult(result);
      StorageService.clearTestProgress();
      onComplete(result);
    }, 900);
  };

  const terminar = () => {
    if (!todasRespondidas) {
      // Si quedó alguna sin responder, se va a la primera pendiente.
      const pendiente = dilemas.findIndex(d => !respuestas[d.id]);
      if (pendiente >= 0) setCurrentIndex(pendiente);
      return;
    }
    if (candidatosDesempate(lista, testType)) {
      reiniciarDesempates();
      setFase('desempate');
    } else calcular(lista);
  };

  const elegir = (o: OpcionDilema) => {
    if (!bloquear()) return;
    setRespuestas(prev => ({ ...prev, [dilema.id]: o.arquetipo }));
    reiniciarDesempates();
    // Avanza solo si sigue en esta misma pantalla: un doble toque no se salta la siguiente.
    const desde = currentIndex;
    if (!ultimo) window.setTimeout(() => setCurrentIndex(i => (i === desde ? Math.min(desde + 1, dilemas.length - 1) : i)), 260);
  };

  const elegirDesempate = (o: OpcionDilema) => {
    if (!desempate || !candidatos) return;
    // Un doble toque no responde dos veces al mismo desempate (el estado aún no se ha
    // actualizado entre los dos toques: por eso una ref).
    if (desempatesRespondidos.current.has(desempate.id) || !bloquear()) return;
    desempatesRespondidos.current.add(desempate.id);
    const nuevos = [...desempates, { dilemaId: desempate.id, arquetipo: o.arquetipo, entre: candidatos }];
    setDesempates(nuevos);
    if (!candidatosDesempate([...lista, ...nuevos], testType)) calcular([...lista, ...nuevos]);
  };

  const anterior = () => {
    if (fase === 'desempate') {
      reiniciarDesempates();
      setFase('dilemas');
      return;
    }
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const siguiente = () => {
    if (currentIndex < dilemas.length - 1) setCurrentIndex(i => i + 1);
  };

  const cambiarTipo = (tipo: 'full' | 'quick') => {
    if (tipo === testType) return;
    setTestType(tipo);
    setFase('dilemas');
    reiniciarDesempates();
    // A la primera pendiente del nuevo test.
    const nuevos = dilemasDelTest(tipo);
    setCurrentIndex(Math.max(0, nuevos.findIndex(d => !respuestas[d.id])));
  };

  const reiniciar = () => {
    if (window.confirm('¿Quieres borrar tus respuestas y empezar de nuevo?')) {
      setRespuestas({});
      reiniciarDesempates();
      setFase('dilemas');
      setCurrentIndex(0);
      setSemilla(nuevaSemilla());
      StorageService.clearTestProgress();
    }
  };

  // Teclado: 1 a 4 para elegir, flechas para moverse.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (fase === 'calculando') return;
      const n = Number(e.key);
      const visibles = fase === 'desempate' ? opcionesDesempate : opciones;
      if (n >= 1 && n <= visibles.length) {
        if (fase === 'desempate') elegirDesempate(visibles[n - 1]);
        else elegir(visibles[n - 1]);
      } else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'ArrowRight' && fase === 'dilemas') siguiente();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  });

  if (fase === 'calculando') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center text-center gap-6 p-6 bg-[#0B1110]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[#1E2A25] border-t-[#D6A84F] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#D6A84F]" />
          </div>
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="font-serif text-2xl font-bold text-[#F2EFE6]">Dibujando tu mapa…</h2>
          <p className="text-xs text-[#9DA79F] leading-relaxed">Juntando lo que elegiste en cada situación.</p>
        </div>
      </div>
    );
  }

  const progreso = fase === 'desempate' ? 100 : Math.round((respondidas / dilemas.length) * 100);

  return (
    <div id="assessment-container" className="fixed inset-0 z-40 flex flex-col bg-[#0B1110] text-[#F2EFE6]" style={{ height: '100dvh' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-52 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full blur-3xl bg-[#D6A84F]/[0.07]" />
      </div>

      {/* Barra superior */}
      <div className="relative z-10 shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-[#141E1B] bg-[#0B1110]/80 backdrop-blur">
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-xs text-[#9DA79F] hover:text-[#F2EFE6] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>

        <div className="inline-flex rounded-lg bg-[#121A17] p-1 border border-[#1E2A25] text-xs" role="group" aria-label="Versión del test">
          {(['quick', 'full'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => cambiarTipo(tipo)}
              aria-pressed={testType === tipo}
              className={`px-3 py-1 rounded-md transition-all ${
                testType === tipo ? 'bg-[#315C45] text-[#F2EFE6] font-semibold' : 'text-[#9DA79F] hover:text-[#F2EFE6]'
              }`}
            >
              <span className="hidden sm:inline">{tipo === 'quick' ? 'Rápido ' : 'Completo '}</span>
              {dilemasDelTest(tipo).length}
            </button>
          ))}
        </div>

        <button onClick={reiniciar} title="Empezar de nuevo" className="text-xs text-[#6B7A72] hover:text-[#EF4444] transition-colors flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      <div className="relative z-10 shrink-0 h-1 bg-[#121A17]" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F] transition-all duration-300" style={{ width: `${progreso}%` }} />
      </div>

      {/* Cuerpo */}
      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain flex flex-col">
        {fase === 'desempate' && desempate ? (
          <div key={desempate.id} className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 my-auto space-y-6 animate-fadeIn">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A17] border border-[#D6A84F]/40 text-xs text-[#E5D7B7]">
                <Scale className="w-3.5 h-3.5 text-[#D6A84F]" />
                Un último paso
              </span>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-[#9DA79F] leading-relaxed">
                Tus respuestas dejan a varias figuras igualadas. Para afinar tu mapa:
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-snug">{desempate.pregunta}</h2>
            </div>
            <Opciones opciones={opcionesDesempate} onElegir={elegirDesempate} />
          </div>
        ) : (
          <div key={dilema.id} className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 my-auto space-y-6 animate-fadeIn">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A17] border border-[#23332D] text-xs text-[#C5CFC7]">
                <span className="text-[#D6A84F] font-semibold">{dilema.ambito}</span>
                <span className="text-[#6B7A72]">·</span>
                <span className="text-[#9DA79F]">
                  {currentIndex + 1} de {dilemas.length}
                </span>
              </span>
            </div>
            <div className="space-y-3 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-snug">{dilema.situacion}</h2>
              <p className="text-sm text-[#9DA79F]">{dilema.pregunta}</p>
            </div>
            <Opciones opciones={opciones} elegida={elegida} onElegir={elegir} />
            <p className="text-[11px] text-[#6B7A72] text-center">Elige la que más se parece a ti, aunque ninguna encaje del todo.</p>
          </div>
        )}
      </div>

      {/* Pie */}
      <div
        className="relative z-10 shrink-0 border-t border-[#141E1B] bg-[#0B1110]/90 backdrop-blur px-4 sm:px-6 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={anterior}
            disabled={fase === 'dilemas' && currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all border-[#23332D] bg-[#121A17] text-[#C5CFC7] hover:bg-[#1A2521] disabled:border-[#1E2A25] disabled:text-[#4A5550] disabled:bg-transparent disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          {fase === 'dilemas' &&
            (ultimo || todasRespondidas ? (
              // Con alguna sin responder, el botón no se bloquea: lleva a la primera que falta.
              <button
                id="finish-assessment-btn"
                onClick={terminar}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D6A84F] hover:bg-[#E5BE72] text-[#0B1110] text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {todasRespondidas
                  ? 'Ver mi mapa'
                  : `Te falta${dilemas.length - respondidas === 1 ? '' : 'n'} ${dilemas.length - respondidas}: ir`}
              </button>
            ) : (
              <button
                onClick={siguiente}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] transition-all"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ))}
        </div>
        <p className="hidden sm:block text-[11px] text-[#4E5C55] text-center pt-2">Pulsa 1 a 4 para elegir, y las flechas para moverte</p>
      </div>
    </div>
  );
};

/** Las cuatro (o las del desempate) maneras de responder, grandes y fáciles de tocar. */
const Opciones: React.FC<{ opciones: OpcionDilema[]; elegida?: ArchetypeId; onElegir: (o: OpcionDilema) => void }> = ({
  opciones,
  elegida,
  onElegir,
}) => (
  <div className="space-y-2.5" role="radiogroup">
    {opciones.map((o, i) => {
      const activa = elegida === o.arquetipo;
      return (
        <button
          key={o.arquetipo}
          type="button"
          role="radio"
          aria-checked={activa}
          onClick={() => onElegir(o)}
          className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.99] ${
            activa
              ? 'bg-[#1E2C26] border-[#D6A84F] ring-1 ring-[#D6A84F] text-[#F2EFE6]'
              : 'bg-[#121A17] border-[#1E2A25] text-[#D5DCD6] hover:border-[#315C45] hover:bg-[#16201D]'
          }`}
        >
          <span
            className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border ${
              activa ? 'bg-[#D6A84F] border-[#D6A84F] text-[#0B1110]' : 'border-[#315C45] text-[#9DA79F]'
            }`}
          >
            {i + 1}
          </span>
          <span className="text-[15px] leading-snug">{o.texto}</span>
        </button>
      );
    })}
  </div>
);
