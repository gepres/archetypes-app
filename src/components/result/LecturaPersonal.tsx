import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { RespuestaLectura, estadoLectura, lecturas, suscribirCrisis } from '../../services/lecturaIA';
import { AssessmentResult, GenderMode } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface LecturaPersonalProps {
  result: AssessmentResult;
  gender: GenderMode;
}

/**
 * La lectura personal con IA, debajo del resultado. El mapa lo calcula el código; la IA solo lo
 * interpreta, a partir de lo que la persona eligió en cada situación, y solo si lo pide.
 */
export const LecturaPersonal: React.FC<LecturaPersonalProps> = ({ result, gender }) => {
  const clave = lecturas.clave(result, gender);
  const [texto, setTexto] = useState<string | null>(() => lecturas.leer(clave));
  const [estado, setEstado] = useState<'inicial' | 'cargando' | 'lista' | 'sin-ia'>(() => (lecturas.leer(clave) ? 'lista' : 'inicial'));
  const [motivo, setMotivo] = useState('');
  const [cuidado, setCuidado] = useState(false);
  // Cada petición lleva su número: solo la vigente toca la pantalla. Al cambiar de resultado o de
  // perspectiva, o al salir, ninguna respuesta vieja la toca (aunque se guarde bajo su clave).
  const peticion = useRef(0);
  // Cambia cuando se abre o se cierra una crisis (también en otra pestaña): se vuelve a decidir
  // qué se muestra.
  const [revision, setRevision] = useState(0);
  useEffect(() => suscribirCrisis(() => setRevision(n => n + 1)), []);

  const aplicar = (r: RespuestaLectura, anterior: string | null) => {
    if (!r.ok) {
      setMotivo(r.motivo);
      setCuidado(!!r.cuidado);
      // Si la cuenta o sus datos cambiaron, la lectura anterior tampoco vale: se quita.
      if (r.invalidada || r.cuidado) setTexto(null);
      // Si solo falló la conexión, la anterior se queda a la vista.
      setEstado(anterior && !r.cuidado && !r.invalidada ? 'lista' : 'sin-ia');
      return;
    }
    setTexto(r.texto);
    setMotivo('');
    setCuidado(false);
    setEstado('lista');
  };

  useEffect(() => {
    const mia = ++peticion.current;
    // Recién abierta la pestaña, aún no se sabe si otra tiene una crisis: se espera (la
    // suscripción avisa al saberlo) sin mostrar nada.
    if (!lecturas.listo()) {
      setEstado('cargando');
      return () => {
        peticion.current++;
      };
    }
    // Con una crisis abierta, ni siquiera la lectura guardada: el protocolo de cuidado.
    if (lecturas.crisisAbierta()) {
      aplicar(lecturas.cuidado, null);
      return () => {
        peticion.current++;
      };
    }
    const guardada = lecturas.leer(clave);
    setTexto(guardada);
    setMotivo('');
    setCuidado(false);
    // Si esta lectura se pidió antes y sigue en camino, se espera a esa: no se gasta otra consulta.
    const enCurso = lecturas.pendiente(clave);
    if (enCurso) {
      setEstado('cargando');
      enCurso.then(r => {
        if (peticion.current === mia) aplicar(r, guardada);
      });
    } else setEstado(guardada ? 'lista' : 'inicial');
    return () => {
      peticion.current++;
    };
  }, [clave, revision]);

  const { disponible, aviso } = estadoLectura();

  const pedir = async () => {
    const mia = ++peticion.current;
    const anterior = texto;
    setEstado('cargando');
    const r = await lecturas.pedir(result, gender);
    if (peticion.current === mia) aplicar(r, anterior);
  };

  const avisoMotivo = motivo && (
    <div
      className={`p-3 rounded-xl border text-xs ${cuidado ? 'bg-[#2A1418] border-[#7F2D3A] text-[#F2EFE6]' : 'bg-[#0E1513] border-[#23332D] text-[#C5CFC7]'}`}
      role={cuidado ? 'alert' : 'status'}
    >
      <MarkdownRenderer content={motivo} />
    </div>
  );

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
          {avisoMotivo}
          <button
            type="button"
            onClick={pedir}
            disabled={!disponible}
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
          {cuidado ? (
            avisoMotivo
          ) : (
            <>
              <p className="text-sm text-[#C5CFC7] leading-relaxed">
                Una IA lee lo que elegiste en cada situación y te cuenta qué patrón ve en tu vida. Tu resultado no cambia:
                lo calcula siempre la app, igual para todo el mundo.
              </p>
              {estado === 'sin-ia' && avisoMotivo}
              <button
                type="button"
                onClick={pedir}
                disabled={!disponible}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] border border-[#4E8B69]/40 text-sm font-semibold text-[#F2EFE6] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                {estado === 'sin-ia' ? 'Volver a intentarlo' : 'Leer mi mapa con IA'}
              </button>
              <p className="text-[11px] text-[#7B8880] leading-relaxed">{aviso}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
};
