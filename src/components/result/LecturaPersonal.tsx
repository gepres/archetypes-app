import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { AIProviderService } from '../../services/aiProviderService';
import { motivoSinLectura, promptLectura, pulirLectura } from '../../services/lecturaPersonal';
import { AssessmentResult, GenderMode } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface LecturaPersonalProps {
  result: AssessmentResult;
  gender: GenderMode;
}

/** Las lecturas ya escritas, por resultado y perspectiva: no se gasta otra consulta al volver. */
const CLAVE = 'archetypes_lecturas_ia';
const MAX_GUARDADAS = 12;

function leerGuardada(clave: string): string | null {
  try {
    const todas = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    return typeof todas[clave]?.texto === 'string' ? todas[clave].texto : null;
  } catch {
    return null;
  }
}

function guardar(clave: string, texto: string) {
  try {
    const todas = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    todas[clave] = { texto, fecha: new Date().toISOString() };
    const recientes = Object.entries(todas)
      .sort((a, b) => String((b[1] as { fecha: string }).fecha).localeCompare(String((a[1] as { fecha: string }).fecha)))
      .slice(0, MAX_GUARDADAS);
    localStorage.setItem(CLAVE, JSON.stringify(Object.fromEntries(recientes)));
  } catch {
    // Sin almacenamiento, la lectura se ve igual; solo no se recuerda.
  }
}

/**
 * La lectura personal con IA, debajo del resultado. El mapa lo calcula el código; la IA solo lo
 * interpreta, a partir de lo que la persona eligió en cada situación, y solo si lo pide.
 */
export const LecturaPersonal: React.FC<LecturaPersonalProps> = ({ result, gender }) => {
  const clave = `${result.id}:${gender}`;
  const [texto, setTexto] = useState<string | null>(() => leerGuardada(clave));
  const [estado, setEstado] = useState<'inicial' | 'cargando' | 'lista' | 'sin-ia'>(() => (leerGuardada(clave) ? 'lista' : 'inicial'));
  const [motivo, setMotivo] = useState('');
  // La petición en curso: si cambia el resultado o la perspectiva, su respuesta ya no vale.
  const vigente = useRef(clave);

  useEffect(() => {
    vigente.current = clave;
    const guardada = leerGuardada(clave);
    setTexto(guardada);
    setEstado(guardada ? 'lista' : 'inicial');
    setMotivo('');
  }, [clave]);

  const uso = AIProviderService.getUsageStatus();
  const sinAsistente = uso.activeKeySource === 'none' || uso.activeKeySource === 'local';
  const sinConsultas = uso.activeKeySource === 'app' && uso.remainingCourtesy <= 0;

  const pedir = async () => {
    const prompt = promptLectura(result, gender);
    if (!prompt) return;
    const deEstaPeticion = clave;
    setEstado('cargando');
    // Sin el perfil de la persona: su nombre no hace falta para leer un mapa.
    const respuesta = await AIProviderService.sendMessage(prompt, [], result, undefined, null, gender);
    if (vigente.current !== deEstaPeticion) return;
    if (respuesta.provider === 'local') {
      setMotivo(motivoSinLectura(respuesta, uso.maxDaily));
      // Si ya había una lectura, se queda a la vista: solo falló pedir otra.
      setEstado(texto ? 'lista' : 'sin-ia');
      return;
    }
    const lectura = pulirLectura(respuesta.text);
    guardar(deEstaPeticion, lectura);
    setTexto(lectura);
    setMotivo('');
    setEstado('lista');
  };

  return (
    <section className="p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#15201C] to-[#101816] border border-[#2B3F36] space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#D6A84F]" />
        <h3 className="font-serif text-xl font-bold text-[#F2EFE6]">Tu lectura personal</h3>
      </div>

      {estado === 'lista' && texto ? (
        <div className="space-y-3">
          <div className="text-[15px] leading-relaxed text-[#D5DCD6]">
            <MarkdownRenderer content={texto} />
          </div>
          <p className="text-[11px] text-[#7B8880] leading-relaxed">
            La escribió una IA a partir de lo que elegiste en cada situación. Puede equivocarse: tu resultado no cambia.
          </p>
          {motivo && (
            <div className="p-3 rounded-xl bg-[#0E1513] border border-[#23332D] text-xs text-[#C5CFC7]" role="status">
              <MarkdownRenderer content={motivo} />
            </div>
          )}
          <button
            type="button"
            onClick={pedir}
            disabled={sinAsistente || sinConsultas}
            className="inline-flex items-center gap-1.5 text-xs text-[#9DA79F] hover:text-[#F2EFE6] disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Pedir otra lectura
          </button>
        </div>
      ) : estado === 'cargando' ? (
        <div className="flex items-center gap-3 py-4 text-sm text-[#C5CFC7]" role="status">
          <Loader2 className="w-5 h-5 animate-spin text-[#D6A84F]" />
          Leyendo lo que elegiste en cada situación…
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#C5CFC7] leading-relaxed">
            Una IA lee lo que elegiste en cada situación y te cuenta qué patrón ve en tu vida. Tu resultado no cambia: lo
            calcula siempre la app, igual para todo el mundo.
          </p>
          {estado === 'sin-ia' && (
            <div className="p-3 rounded-xl bg-[#0E1513] border border-[#23332D] text-xs text-[#C5CFC7]" role="status">
              <MarkdownRenderer content={motivo} />
            </div>
          )}
          <button
            type="button"
            onClick={pedir}
            disabled={sinAsistente || sinConsultas}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] border border-[#4E8B69]/40 text-sm font-semibold text-[#F2EFE6] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 text-[#D6A84F]" />
            {estado === 'sin-ia' ? 'Volver a intentarlo' : 'Leer mi mapa con IA'}
          </button>
          <p className="text-[11px] text-[#7B8880] leading-relaxed">
            {sinAsistente
              ? 'Ahora no hay un asistente de IA conectado: puedes conectarlo en Ajustes de IA.'
              : sinConsultas
                ? `Hoy ya usaste tus ${uso.maxDaily} consultas con el asistente: mañana se renuevan.`
                : `Al pedirla, lo que elegiste en el test se envía al asistente de IA (sin tu nombre).${
                    uso.activeKeySource === 'app' ? ` Usa una de tus consultas de hoy: te quedan ${uso.remainingCourtesy}.` : ''
                  }`}
          </p>
        </div>
      )}
    </section>
  );
};
