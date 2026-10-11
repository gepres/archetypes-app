import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { declararASalvo, estadoLectura, lecturas, parrafosLectura, suscribirCrisis, textoParaVoz } from '../lib/domain';
import type { AssessmentResult, ParrafoLectura, RespuestaLectura } from '../lib/domain';
import { callar, decir } from '../lib/voice';

interface LecturaVozProps {
  resultado: AssessmentResult;
  silencio: boolean;
}

type Estado = 'comprobando' | 'inicial' | 'cargando' | 'lista' | 'sin-ia' | 'cuidado';

/** Párrafos pintados con los estilos de la V2 (que no tiene un intérprete de Markdown). */
const Parrafos: React.FC<{ texto: string; pequeno?: boolean }> = ({ texto, pequeno }) => (
  <div className="space-y-3 text-left">
    {parrafosLectura(texto).map((p: ParrafoLectura, i: number) => (
      <p
        key={i}
        className={
          p.cursiva
            ? 'font-serif italic text-base text-[#E5D7B7] leading-relaxed'
            : `${pequeno ? 'text-xs' : 'text-sm'} text-[#C5CFC7] leading-relaxed`
        }
      >
        {p.partes.map((x, j) =>
          x.enlace ? (
            <a key={j} href={x.enlace} target="_blank" rel="noopener noreferrer" className="underline text-[#D6A84F]">
              {x.texto}
            </a>
          ) : (
            <React.Fragment key={j}>{x.texto}</React.Fragment>
          )
        )}
      </p>
    ))}
  </div>
);

/**
 * La lectura personal con IA en la revelación de la V2: se escribe y, como todo en la V2, se lee
 * en voz alta. El mapa lo calcula el código; la IA solo lo interpreta, y solo si se pide.
 * Nunca se enseña ni se lee nada sin haber comprobado antes que no hay una crisis abierta.
 */
export const LecturaVoz: React.FC<LecturaVozProps> = ({ resultado, silencio }) => {
  const clave = lecturas.clave(resultado, 'universal');
  const [texto, setTexto] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>('comprobando');
  const [motivo, setMotivo] = useState('');
  // Solo la comprobación o petición vigente toca la pantalla (ver la V1).
  const peticion = useRef(0);
  // El silencio de ahora, no el de cuando se pidió: activarlo durante la espera tiene que valer.
  const silencioRef = useRef(silencio);
  silencioRef.current = silencio;
  // Cambia cuando se abre o se cierra una crisis (aquí o en otra pestaña): se vuelve a comprobar,
  // y mientras tanto la voz se calla.
  const [revision, setRevision] = useState(0);
  useEffect(
    () =>
      suscribirCrisis(() => {
        callar();
        setRevision(n => n + 1);
      }),
    []
  );

  const hablar = (t: string, rate = 0.96) => {
    if (!silencioRef.current) decir(textoParaVoz(t), { rate });
  };

  const aplicar = (r: RespuestaLectura, anterior: string | null, leer: boolean) => {
    if (!r.ok && r.cuidado) {
      callar();
      setTexto(null);
      setMotivo(r.motivo);
      setEstado('cuidado');
      if (leer) hablar(r.motivo, 0.94);
      return;
    }
    if (!r.ok) {
      setMotivo(r.motivo);
      // Si la cuenta o sus datos cambiaron, la anterior tampoco vale (y se calla la voz); si solo
      // falló la conexión, se queda a la vista.
      if (r.invalidada || !anterior) {
        callar();
        setTexto(null);
        setEstado('sin-ia');
      } else setEstado('lista');
      return;
    }
    setTexto(r.texto);
    setMotivo('');
    setEstado('lista');
    if (leer) hablar(r.texto);
  };

  useEffect(() => {
    const mia = ++peticion.current;
    setEstado('comprobando');
    setTexto(null);
    setMotivo('');
    void (async () => {
      const crisis = await lecturas.crisisAbierta();
      if (peticion.current !== mia) return;
      if (crisis) {
        aplicar(lecturas.cuidado, null, false);
        return;
      }
      const guardada = lecturas.leer(clave);
      const enCurso = lecturas.pendiente(clave);
      if (enCurso) {
        setTexto(guardada);
        setEstado('cargando');
        const r = await enCurso;
        if (peticion.current === mia) aplicar(r, guardada, true);
      } else if (guardada) {
        setTexto(guardada);
        setEstado('lista');
      } else setEstado('inicial');
    })();
    return () => {
      peticion.current++;
    };
  }, [clave, revision]);

  const { disponible, aviso } = estadoLectura();

  const pedir = async () => {
    const mia = ++peticion.current;
    const anterior = texto;
    callar();
    setEstado('cargando');
    const r = await lecturas.pedir(resultado, 'universal');
    if (peticion.current === mia) aplicar(r, anterior, true);
  };

  /** Volver a escucharla: antes, se comprueba que no se haya abierto una crisis. */
  const escucharDeNuevo = async () => {
    const mia = peticion.current;
    if (await lecturas.crisisAbierta()) {
      if (peticion.current === mia) aplicar(lecturas.cuidado, null, true);
      return;
    }
    if (peticion.current === mia && texto) hablar(texto);
  };

  const aSalvo = async () => {
    callar();
    await declararASalvo();
    setRevision(n => n + 1);
  };

  const cajaMotivo = (cuidado: boolean) =>
    motivo && (
      <div
        className={`rounded-2xl border p-3 ${cuidado ? 'bg-[#2A1418] border-[#7F2D3A]' : 'bg-[#0B1110] border-[#23332D]'}`}
        role={cuidado ? 'alert' : 'status'}
      >
        <Parrafos texto={motivo} pequeno />
      </div>
    );

  return (
    <div className="rounded-3xl border border-[#23332D] bg-[#101917]/90 p-5 space-y-4 text-left">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D6A84F]">
        <Sparkles className="w-3.5 h-3.5" /> Tu lectura personal
      </p>

      {estado === 'comprobando' ? (
        <p className="flex items-center gap-3 text-sm text-[#8A968D]" role="status">
          <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
          Un momento…
        </p>
      ) : estado === 'cuidado' ? (
        <>
          {cajaMotivo(true)}
          <button
            type="button"
            onClick={aSalvo}
            className="w-full px-4 py-3 rounded-2xl bg-[#1C3529] border border-[#4E8B69] text-sm font-semibold text-[#F2EFE6] active:scale-95 transition-all"
          >
            Ya estoy a salvo
          </button>
        </>
      ) : estado === 'lista' && texto ? (
        <>
          <Parrafos texto={texto} />
          <p className="text-[10px] text-[#5E6C64] leading-relaxed">
            La escribió una IA a partir de lo que elegiste en cada situación. Puede equivocarse: tu resultado no cambia.
          </p>
          {cajaMotivo(false)}
          <div className="flex items-center gap-4 text-[11px] text-[#7B8880]">
            {!silencio && (
              <button type="button" onClick={escucharDeNuevo} className="inline-flex items-center gap-1.5 hover:text-[#C5CFC7]">
                <Volume2 className="w-3.5 h-3.5" /> Escucharla de nuevo
              </button>
            )}
            <button type="button" onClick={pedir} disabled={!disponible} className="inline-flex items-center gap-1.5 hover:text-[#C5CFC7] disabled:opacity-40">
              <RotateCcw className="w-3.5 h-3.5" /> Pedir otra
            </button>
          </div>
        </>
      ) : estado === 'cargando' ? (
        <p className="flex items-center gap-3 py-2 text-sm text-[#C5CFC7]" role="status">
          <Loader2 className="w-5 h-5 animate-spin text-[#D6A84F]" />
          Leyendo lo que elegiste en cada situación…
        </p>
      ) : (
        <>
          <p className="text-sm text-[#C5CFC7] leading-relaxed">
            Una IA lee lo que elegiste en cada situación y te cuenta, en voz alta, qué patrón ve en tu vida. Tu resultado no
            cambia.
          </p>
          {estado === 'sin-ia' && cajaMotivo(false)}
          <button
            type="button"
            onClick={pedir}
            disabled={!disponible}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#15221D] border border-[#315C45] text-sm font-semibold text-[#F2EFE6] active:scale-95 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-[#D6A84F]" />
            {estado === 'sin-ia' ? 'Volver a intentarlo' : 'Escuchar mi lectura'}
          </button>
          <p className="text-[10px] text-[#5E6C64] leading-relaxed">{aviso}</p>
        </>
      )}
    </div>
  );
};
