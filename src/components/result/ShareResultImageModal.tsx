import React, { useEffect, useRef, useState } from 'react';
import { Share2, Download, Copy, Check, X, Smartphone, Square, Loader2, CheckCircle2, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { AssessmentResult, GenderMode, DEFAULT_GENDER } from '../../types';
import { FormatoPostal, datosPostalDe } from '../../services/disenoPostal';
import { contenidoParaCompartir } from '../../services/tarjetaCompartir';
import { NombreTemaPostal, TEMAS_POSTAL, generarPostal } from './pintarPostal';

interface ShareResultImageModalProps {
  result: AssessmentResult;
  /** Perspectiva activa: la imagen que se comparte lleva TU nombre, no el universal. */
  gender?: GenderMode;
  isOpen: boolean;
  onClose: () => void;
}

const SITIO = 'https://archetypes-mystical.web.app/';

const TEMAS: { id: NombreTemaPostal; nombre: string }[] = [
  { id: 'esmeralda', nombre: 'Esmeralda' },
  { id: 'obsidiana', nombre: 'Obsidiana' },
  { id: 'carmesi', nombre: 'Rubí' },
];

/** Un nombre de fichero válido. */
function comoNombreDeFichero(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'mapa'
  );
}

export const ShareResultImageModal: React.FC<ShareResultImageModalProps> = ({ result, gender = DEFAULT_GENDER, isOpen, onClose }) => {
  const [formato, setFormato] = useState<FormatoPostal>('story');
  const [tema, setTema] = useState<NombreTemaPostal>('esmeralda');
  const [nombre, setNombre] = useState('');
  // El nombre se aplica al dejar de escribir: no hace falta repintar con cada letra.
  const [alias, setAlias] = useState('');
  const [conDimensiones, setConDimensiones] = useState(false);
  const [conTop3, setConTop3] = useState(false);
  // La imagen va con la clave de las opciones con que se hizo: solo se exporta si coincide con
  // lo que hay elegido ahora. Si una regeneración falla, la anterior se ve, pero no se exporta.
  const [postal, setPostal] = useState<{ blob: Blob; url: string; clave: string } | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [fallo, setFallo] = useState(false);
  const [intento, setIntento] = useState(0);
  const [copiada, setCopiada] = useState(false);
  const [compartida, setCompartida] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setAlias(nombre.trim()), 350);
    return () => window.clearTimeout(t);
  }, [nombre]);

  // La imagen se prepara en cuanto cambia algo, no al tocar «Compartir»: la vista previa ES la
  // imagen que se descarga, y la hoja de compartir del móvil la recibe sin esperar.
  const clave = JSON.stringify([result.id, gender, formato, tema, alias, conDimensiones, conTop3]);

  useEffect(() => {
    if (!isOpen) return;
    let vigente = true;
    setPreparando(true);
    setFallo(false);
    generarPostal(datosPostalDe(result, gender, { formato, alias, conDimensiones, conTop3 }), TEMAS_POSTAL[tema], result.id)
      .then(blob => {
        if (!vigente) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setPostal({ blob, url, clave });
      })
      .catch(err => {
        console.error('No se pudo preparar la postal:', err);
        if (vigente) setFallo(true);
      })
      .finally(() => {
        if (vigente) setPreparando(false);
      });
    return () => {
      vigente = false;
    };
  }, [isOpen, result, gender, formato, tema, alias, conDimensiones, conTop3, intento, clave]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  if (!isOpen) return null;

  const contenido = contenidoParaCompartir(result, gender);
  const nombreFichero = `mapa-arquetipos-${comoNombreDeFichero(contenido.titulo)}-${formato}.png`;
  // Mientras el nombre escrito no se ha aplicado aún (los 350 ms de espera), la imagen que hay
  // lleva el anterior: no se exporta, por si se acababa de borrar.
  const listo = !!postal && postal.clave === clave && alias === nombre.trim() && !preparando && !fallo;

  const descargar = () => {
    if (!postal || !listo) return;
    const enlace = document.createElement('a');
    enlace.download = nombreFichero;
    enlace.href = postal.url;
    enlace.click();
  };

  const copiar = async () => {
    if (!postal || !listo) return;
    try {
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error('Sin portapapeles de imágenes');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': postal.blob })]);
      setCopiada(true);
      window.setTimeout(() => setCopiada(false), 2500);
    } catch {
      // Sin portapapeles de imágenes, se descarga: que la persona no se quede sin ella.
      descargar();
    }
  };

  const compartir = async () => {
    if (!postal || !listo) return;
    const archivo = new File([postal.blob], nombreFichero, { type: 'image/png' });
    if (!navigator.share || !navigator.canShare?.({ files: [archivo] })) {
      descargar();
      return;
    }
    try {
      await navigator.share({ files: [archivo], title: 'Mi mapa de arquetipos', text: `${contenido.texto} Descubre el tuyo: ${SITIO}` });
      setCompartida(true);
      window.setTimeout(() => setCompartida(false), 2500);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') descargar();
    }
  };

  const boton = (activo: boolean) =>
    `flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
      activo ? 'bg-[#1E2C26] text-[#F2EFE6] ring-1 ring-[#D6A84F]' : 'text-[#9DA79F] hover:text-[#F2EFE6]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="titulo-postal">
      <div className="relative w-full sm:max-w-4xl bg-[#121A17] border border-[#23332D] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        <div className="flex items-center justify-between px-4 py-3 sm:p-5 border-b border-[#1E2A25] bg-[#0E1513]">
          <div className="min-w-0">
            <h2 id="titulo-postal" className="font-serif text-lg sm:text-xl font-bold text-[#F2EFE6]">
              Comparte tu mapa
            </h2>
            <p className="text-[11px] sm:text-xs text-[#9DA79F] truncate">Una postal lista para historias y publicaciones</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 -mr-1 rounded-xl text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#1A2521] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:items-start">
          {/* La vista previa: es la imagen que se descarga, tal cual. */}
          <div className="lg:col-span-7 lg:order-2 flex flex-col items-center gap-3">
            <div
              className={`relative flex items-center justify-center rounded-2xl bg-[#0B100E] border border-[#1E2A25] overflow-hidden ${
                formato === 'story' ? 'aspect-[9/16] h-[min(52dvh,560px)] lg:h-[min(70vh,640px)]' : 'aspect-square w-full max-w-[min(100%,46dvh)] lg:max-w-[520px]'
              }`}
            >
              {postal && <img src={postal.url} alt={`Vista previa de la postal: ${contenido.titulo}`} className="w-full h-full object-contain" />}
              {preparando && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D6A84F]" aria-label="Preparando la imagen" />
                </div>
              )}
              {fallo && !preparando && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-[#0B100E]">
                  <p className="text-xs text-[#C5CFC7]">No se pudo preparar la imagen.</p>
                  <button
                    type="button"
                    onClick={() => setIntento(n => n + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#315C45] text-xs text-[#D6A84F]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reintentar
                  </button>
                </div>
              )}
            </div>

            <div className="w-full max-w-sm flex gap-1 p-1 rounded-2xl bg-[#0E1513] border border-[#1E2A25]" role="group" aria-label="Formato">
              <button type="button" onClick={() => setFormato('story')} aria-pressed={formato === 'story'} className={boton(formato === 'story')}>
                <Smartphone className="w-3.5 h-3.5 text-[#D6A84F]" /> Historia 9:16
              </button>
              <button type="button" onClick={() => setFormato('square')} aria-pressed={formato === 'square'} className={boton(formato === 'square')}>
                <Square className="w-3.5 h-3.5 text-[#D6A84F]" /> Cuadrado 1:1
              </button>
            </div>
          </div>

          {/* Acciones y ajustes */}
          <div className="lg:col-span-5 lg:order-1 space-y-4 text-left">
            <div className="space-y-2">
              <button
                type="button"
                onClick={compartir}
                disabled={!listo}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-sm transition-all shadow-xl flex items-center justify-center gap-2 border border-[#4E8B69]/40 active:scale-[0.98] disabled:opacity-50"
              >
                {listo ? <Share2 className="w-4 h-4 text-[#D6A84F]" /> : <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />}
                Compartir
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={descargar}
                  disabled={!listo}
                  className="py-2.5 px-3 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-[#D6A84F]" /> Descargar
                </button>
                <button
                  type="button"
                  onClick={copiar}
                  disabled={!listo}
                  className="py-2.5 px-3 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {copiada ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" /> <span className="text-[#10B981]">Copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#D6A84F]" /> Copiar imagen
                    </>
                  )}
                </button>
              </div>
              {compartida && (
                <p className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#86EFAC] text-xs flex items-center justify-center gap-1.5" role="status">
                  <CheckCircle2 className="w-4 h-4" /> Compartida
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9DA79F] block">Color</span>
              <div className="flex gap-2" role="group" aria-label="Color">
                {TEMAS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTema(t.id)}
                    aria-pressed={tema === t.id}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      tema === t.id ? 'border-[#D6A84F] bg-[#172B22] text-[#F2EFE6]' : 'border-[#1E2A25] bg-[#0E1513] text-[#9DA79F]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ background: `linear-gradient(135deg, ${TEMAS_POSTAL[t.id].fondo[0]} 45%, ${TEMAS_POSTAL[t.id].acento} 55%)` }}
                    />
                    {t.nombre}
                  </button>
                ))}
              </div>
            </div>

            <details className="group rounded-2xl bg-[#0E1513] border border-[#1E2A25]">
              <summary className="flex items-center gap-2 px-3.5 py-3 cursor-pointer list-none text-xs font-semibold text-[#C5CFC7]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D6A84F]" />
                Personalizar
                <span className="ml-auto text-[10px] text-[#6B7A72] group-open:hidden">nombre, dimensiones, podio</span>
              </summary>
              <div className="px-3.5 pb-3.5 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs text-[#C5CFC7]">Tu nombre o alias (opcional)</span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Ej: Ana Lucía / @tu_usuario"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#16201D] border border-[#23332D] text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F]"
                  />
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#C5CFC7] cursor-pointer py-1">
                  <input type="checkbox" checked={conDimensiones} onChange={e => setConDimensiones(e.target.checked)} className="w-4 h-4 rounded border-[#23332D] bg-[#16201D]" />
                  Añadir las 4 dimensiones
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#C5CFC7] cursor-pointer py-1">
                  <input type="checkbox" checked={conTop3} onChange={e => setConTop3(e.target.checked)} className="w-4 h-4 rounded border-[#23332D] bg-[#16201D]" />
                  Añadir el podio de tus 3 primeros
                </label>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
