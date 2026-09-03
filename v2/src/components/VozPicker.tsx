import React, { useEffect, useState } from 'react';
import { Check, Play, Wand2, Wifi, X } from 'lucide-react';
import { decir, elegirVoz, nombreDeLaVoz, prepararVoz, vocesDisponibles } from '../lib/voice';

interface VozPickerProps {
  abierto: boolean;
  onCerrar: () => void;
}

const MUESTRA = 'Habito mi soberanía con calma, límites firmes y dignidad.';

/**
 * Elegir la voz oyéndola.
 *
 * La calidad de la síntesis la pone el sistema de cada quien, y ninguna
 * heurística sobre nombres acierta siempre: en un aparato la mejor es de red y
 * en otro no hay ninguna decente. Lo único que resuelve esto de verdad es
 * dejar escucharlas y que decida quien oye.
 */
export const VozPicker: React.FC<VozPickerProps> = ({ abierto, onCerrar }) => {
  const [voces, setVoces] = useState<{ nombre: string; lang: string; deRed: boolean }[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  const [probando, setProbando] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let vivo = true;
    prepararVoz().then(() => {
      if (!vivo) return;
      setVoces(vocesDisponibles());
      setActiva(nombreDeLaVoz());
    });
    return () => {
      vivo = false;
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const probar = (nombre: string) => {
    elegirVoz(nombre);
    setActiva(nombre);
    setProbando(nombre);
    decir(MUESTRA).then(() => setProbando(p => (p === nombre ? null : p)));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md max-h-[85dvh] flex flex-col bg-[#0E1513] border border-[#23332D] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <header className="shrink-0 flex items-start gap-3 p-4 border-b border-[#1A2521]">
          <span className="w-10 h-10 shrink-0 rounded-xl bg-[#1A2521] border border-[#23332D] flex items-center justify-center text-[#D6A84F]">
            <Wand2 className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-bold text-[#F2EFE6] leading-tight">
              Elige la voz
            </h2>
            <p className="text-[11px] text-[#8A968D] leading-snug mt-0.5">
              Son las que tiene tu dispositivo. Tócalas para oírlas.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-persona p-3 space-y-2">
          {voces.length === 0 && (
            <p className="text-xs text-[#8A968D] text-center py-8 px-4 leading-relaxed">
              Tu navegador no ofrece ninguna voz en español. El recorrido y el test
              funcionan igual, solo que en silencio.
            </p>
          )}

          {voces.map(v => {
            const esta = activa === v.nombre;
            return (
              <button
                key={v.nombre}
                type="button"
                onClick={() => probar(v.nombre)}
                className={`w-full min-h-[56px] px-3.5 py-2.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                  esta
                    ? 'bg-[#14231D] border-[#4E8B69]'
                    : 'bg-[#101917] border-[#1E2A25] hover:border-[#315C45]'
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                    esta ? 'bg-[#315C45] text-[#86EFAC]' : 'bg-[#1A2521] text-[#8A968D]'
                  }`}
                >
                  {probando === v.nombre ? (
                    <Play className="w-4 h-4 animate-pulse" />
                  ) : esta ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-[#F2EFE6] truncate">{v.nombre}</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#7B8880]">
                    {v.lang}
                    {v.deRed && (
                      <>
                        <Wifi className="w-2.5 h-2.5" />
                        <span>suele sonar mejor</span>
                      </>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <footer className="shrink-0 p-3 border-t border-[#1A2521] flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              elegirVoz(null);
              setActiva(nombreDeLaVoz());
            }}
            className="min-h-[44px] px-4 rounded-xl border border-[#1E2A25] text-xs text-[#8A968D] hover:text-[#F2EFE6] transition-colors"
          >
            Automática
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-[#315C45] to-[#254836] border border-[#4E8B69] text-sm font-semibold text-[#F2EFE6] active:scale-95 transition-transform"
          >
            Listo
          </button>
        </footer>
      </div>
    </div>
  );
};
