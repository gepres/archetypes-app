import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Smartphone,
  Square,
  Palette,
  Eye,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ARCHETYPES, DIMENSIONS, getArchetype } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId, AssessmentResult, GenderMode } from '../../types';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';

interface ShareResultImageModalProps {
  result: AssessmentResult;
  /** Perspectiva activa: la imagen que se comparte lleva TU nombre, no el universal. */
  gender?: GenderMode;
  isOpen: boolean;
  onClose: () => void;
}

type CardFormat = 'story' | 'square';
type CardTheme = 'emerald-gold' | 'obsidian-cosmic' | 'crimson-amber';

export const ShareResultImageModal: React.FC<ShareResultImageModalProps> = ({
  result,
  gender = 'male',
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<CardFormat>('story');
  const [theme, setTheme] = useState<CardTheme>('emerald-gold');
  const [userName, setUserName] = useState('');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showTop3, setShowTop3] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const dominant = getArchetype(result.dominantArchetype.archetypeId, gender);
  const dominantVisual = ARCHETYPE_VISUALS[result.dominantArchetype.archetypeId];
  const { compositeProfile } = result;

  // Theme styling configurations
  const themeStyles = {
    'emerald-gold': {
      bg: 'bg-gradient-to-b from-[#0B1511] via-[#0E1B15] to-[#070D0B]',
      border: 'border-[#315C45]',
      accentColor: '#D6A84F',
      accentText: 'text-[#D6A84F]',
      badgeBg: 'bg-[#15271F] border-[#315C45] text-[#D6A84F]',
      subtleBox: 'bg-[#101F18]/90 border-[#233F31]',
      glow: 'rgba(214, 168, 79, 0.25)',
      cardBorder: '#D6A84F',
    },
    'obsidian-cosmic': {
      bg: 'bg-gradient-to-b from-[#0A0E1A] via-[#10172A] to-[#070912]',
      border: 'border-[#2E3C66]',
      accentColor: '#60A5FA',
      accentText: 'text-[#60A5FA]',
      badgeBg: 'bg-[#16213E] border-[#2E3C66] text-[#60A5FA]',
      subtleBox: 'bg-[#11192E]/90 border-[#1E2B4D]',
      glow: 'rgba(96, 165, 250, 0.25)',
      cardBorder: '#60A5FA',
    },
    'crimson-amber': {
      bg: 'bg-gradient-to-b from-[#180A0E] via-[#240F16] to-[#0E0508]',
      border: 'border-[#5A2332]',
      accentColor: '#F59E0B',
      accentText: 'text-[#F59E0B]',
      badgeBg: 'bg-[#2E121C] border-[#5A2332] text-[#F59E0B]',
      subtleBox: 'bg-[#200C13]/90 border-[#421723]',
      glow: 'rgba(245, 158, 11, 0.25)',
      cardBorder: '#F59E0B',
    },
  }[theme];

  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      setIsGenerating(true);
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5, // Crisp 2.5x high resolution
        quality: 0.95,
      });
      return blob;
    } catch (err) {
      console.error('Error generating image blob:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

const SITIO = 'https://archetypes-mystical.web.app/';

/** Un nombre de fichero valido a partir del nombre del arquetipo. */
function comoNombreDeFichero(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'arquetipo';
}

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.95,
      });
      const link = document.createElement('a');
      link.download = `mapa-arquetipico-${comoNombreDeFichero(dominant.name)}-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Hubo un error al generar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateImageBlob();
      if (!blob) throw new Error('Blob generation failed');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      } else {
        // Fallback to direct download
        handleDownload();
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      // Fallback
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateImageBlob();
      if (!blob) throw new Error('Blob generation failed');

      const file = new File(
        [blob],
        `mapa-arquetipico-${comoNombreDeFichero(dominant.name)}.png`,
        { type: 'image/png' }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Mi Mapa Arquetípico: ${compositeProfile.title}`,
          text: `Descubrí mi arquetipo dominante: ${dominant.name} (${result.dominantArchetype.normalizedScore}%). Descubre el tuyo: ${SITIO}`,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // If file share is not supported by device/browser, copy or trigger download
        handleDownload();
      }
    } catch (err) {
      // Ignore user cancellation in share sheet
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        handleDownload();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#121A17] border border-[#23332D] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1E2A25] bg-[#0E1513]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#315C45]/30 border border-[#315C45] flex items-center justify-center text-[#D6A84F]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F2EFE6]">
                Compartir Mapa en Redes Sociales
              </h2>
              <p className="text-xs text-[#9DA79F]">
                Exporta una tarjeta ilustrada en alta resolución lista para publicar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#1A2521] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Controls Left / Preview Right */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 shrink-0 space-y-5 text-left">
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Formato de Publicación</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('story')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    format === 'story'
                      ? 'bg-[#1E2C26] border-[#D6A84F] text-[#F2EFE6] shadow-md'
                      : 'bg-[#0E1513] border-[#1E2A25] text-[#9DA79F] hover:text-[#F2EFE6]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#D6A84F]" />
                  <span>Historia / Reels (9:16)</span>
                  <span className="text-[10px] text-[#86968D]">Stories, WhatsApp, TikTok</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('square')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    format === 'square'
                      ? 'bg-[#1E2C26] border-[#D6A84F] text-[#F2EFE6] shadow-md'
                      : 'bg-[#0E1513] border-[#1E2A25] text-[#9DA79F] hover:text-[#F2EFE6]'
                  }`}
                >
                  <Square className="w-4 h-4 text-[#D6A84F]" />
                  <span>Post Cuadrado (1:1)</span>
                  <span className="text-[10px] text-[#86968D]">Feed, X, LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Estilo Visual</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('emerald-gold')}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all text-center ${
                    theme === 'emerald-gold'
                      ? 'bg-[#172B22] border-[#D6A84F] text-[#F2EFE6] ring-1 ring-[#D6A84F]'
                      : 'bg-[#0E1513] border-[#1E2A25] text-[#9DA79F]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#D6A84F] inline-block mb-1 mx-auto" />
                  <span className="block truncate">Esmeralda & Oro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('obsidian-cosmic')}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all text-center ${
                    theme === 'obsidian-cosmic'
                      ? 'bg-[#15203D] border-[#60A5FA] text-[#F2EFE6] ring-1 ring-[#60A5FA]'
                      : 'bg-[#0E1513] border-[#1E2A25] text-[#9DA79F]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#60A5FA] inline-block mb-1 mx-auto" />
                  <span className="block truncate">Obsidiana Cósmica</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('crimson-amber')}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all text-center ${
                    theme === 'crimson-amber'
                      ? 'bg-[#2D121B] border-[#F59E0B] text-[#F2EFE6] ring-1 ring-[#F59E0B]'
                      : 'bg-[#0E1513] border-[#1E2A25] text-[#9DA79F]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block mb-1 mx-auto" />
                  <span className="block truncate">Rubí & Ámbar</span>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#0E1513] border border-[#1E2A25]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9DA79F] block">
                Personalización
              </span>

              <div className="space-y-1.5">
                <label className="text-xs text-[#C5CFC7]">Tu Nombre o Alias (opcional):</label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Ej: Ana Lucía / @tu_usuario"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16201D] border border-[#23332D] text-xs text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F]"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-[#C5CFC7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDimensions}
                    onChange={(e) => setShowDimensions(e.target.checked)}
                    className="rounded border-[#23332D] text-[#315C45] focus:ring-0 bg-[#16201D]"
                  />
                  <span>Mostrar barras de las 4 Dimensiones</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#C5CFC7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTop3}
                    onChange={(e) => setShowTop3(e.target.checked)}
                    className="rounded border-[#23332D] text-[#315C45] focus:ring-0 bg-[#16201D]"
                  />
                  <span>Mostrar podio Top 3 arquetipos</span>
                </label>
              </div>
            </div>

            {/* Quick Action buttons on Desktop & Mobile */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 border border-[#4E8B69]/40 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                ) : (
                  <Share2 className="w-4 h-4 text-[#D6A84F]" />
                )}
                <span>Compartir Directo en Redes</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Descargar PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {copiedToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">¡Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Copiar Imagen</span>
                    </>
                  )}
                </button>
              </div>

              {shareSuccess && (
                <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#86EFAC] text-xs flex items-center justify-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Tarjeta compartida con éxito!</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Preview Column */}
          <div className="lg:col-span-7 shrink-0 flex flex-col items-center justify-center bg-[#0B100E] p-2 sm:p-6 rounded-3xl border border-[#1E2A25] w-full overflow-hidden">
            <div className="text-center mb-3">
              <span className="text-[11px] text-[#9DA79F] inline-flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#D6A84F]" />
                <span>Vista Previa de la Tarjeta</span>
              </span>
            </div>

            {/* Live Render Card Wrapper (Captured by html-to-image) */}
            <div
              ref={cardRef}
              style={{
                width: format === 'story' ? '360px' : '380px',
                maxWidth: '100%',
                minHeight: format === 'story' ? '620px' : '380px',
              }}
              className={`p-4 sm:p-6 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col justify-between select-none ${themeStyles.bg} ${themeStyles.border} box-border`}
            >
              {/* Decorative background glow & sacred geometry */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: themeStyles.glow }}
              />
              <div
                className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: themeStyles.glow }}
              />

              {/* Top Branding & Header */}
              <div className="relative z-10 space-y-1 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-widest font-bold shadow-sm"
                     style={{ borderColor: `${themeStyles.accentColor}50`, color: themeStyles.accentColor }}>
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Los 18 Arquetipos · Mapa Simbólico</span>
                </div>

                {userName && (
                  <p className="text-xs font-medium text-[#E5D7B7] pt-0.5">
                    {userName}
                  </p>
                )}
              </div>

              {/* Main Archetype Illustrated Core */}
              <div className="relative z-10 my-3 flex flex-col items-center text-center space-y-2">
                {/* Illustrated Avatar/Portrait Card */}
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border-2 shrink-0 bg-[#0E1513] relative"
                  style={{ borderColor: themeStyles.cardBorder }}
                >
                  <ArchetypeIllustratedArtwork
                    archetypeId={dominant.id}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 border border-white/10 text-[9px] font-mono font-bold text-[#FFE898]">
                    {result.dominantArchetype.normalizedScore}%
                  </div>
                </div>

                {/* Dominant Titles */}
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#A6B2A8]">
                    <span>Arquetipo Dominante</span>
                    <span>·</span>
                    {/* El nombre de la dimension, no su identificador: "corazon"
                        con capitalize salia "Corazon", sin tilde. */}
                    <span>{DIMENSIONS[dominant.dimension].name.split(' & ')[0]}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6] tracking-tight">
                    {dominant.name}
                  </h3>
                  <p className="text-[11px] font-medium" style={{ color: themeStyles.accentColor }}>
                    {dominantVisual.characterTitle}
                  </p>
                </div>

                {/* Composite Title & Synthesis */}
                <div className={`w-full p-3 rounded-2xl border text-left space-y-1.5 ${themeStyles.subtleBox}`}>
                  {/* La combinacion son tres nombres completos: al lado del titulo
                      del bloque no cabe y se pisan. Va debajo, en su linea. */}
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-[#9DA79F]">
                    Perfil Compuesto
                  </span>
                  <p className="font-serif font-bold text-sm text-[#F2EFE6] leading-tight">
                    {compositeProfile.title}
                  </p>
                  <p className="text-[9px] font-semibold text-[#D6A84F] leading-tight">
                    {compositeProfile.archetypeCombination}
                  </p>
                  <p className="text-[10px] text-[#C5CFC7] leading-relaxed italic font-serif">
                    "{dominant.mantra}"
                  </p>
                </div>
              </div>

              {/* 4 Dimensions Bar (Optional Toggle) */}
              {showDimensions && (
                <div className={`relative z-10 p-2.5 rounded-xl border space-y-1.5 my-1 ${themeStyles.subtleBox}`}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#9DA79F] uppercase tracking-wider">
                    <span>Balance de las 4 Dimensiones</span>
                  </div>
                  {/* En filas, no en cuatro columnas: en una tarjeta de 360 px de
                      ancho, "Construcción & Soberanía" en un cuarto del ancho no
                      cabe de ninguna manera. Alineadas, se leen de un vistazo y
                      las barras se comparan entre si, que es de lo que trata. */}
                  <div className="space-y-1">
                    {(['mente', 'accion', 'corazon', 'construccion'] as const).map((dimId) => {
                      const score = result.dimensionScores[dimId] || 0;
                      const dimInfo = DIMENSIONS[dimId];
                      return (
                        <div key={dimId} className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: dimInfo.color }}
                          />
                          <span className="w-[76px] shrink-0 text-[8px] text-[#A6B2A8] truncate">
                            {dimInfo.name.split(' & ')[0]}
                          </span>
                          <span className="flex-1 h-1.5 bg-[#0E1513] rounded-full overflow-hidden">
                            <span
                              className="block h-full rounded-full"
                              style={{ width: `${score}%`, backgroundColor: dimInfo.color }}
                            />
                          </span>
                          <span className="w-[26px] shrink-0 text-right text-[8px] font-mono font-bold text-[#F2EFE6]">
                            {score}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 3 Ranking Podiums (Optional Toggle) */}
              {showTop3 && (
                <div className={`relative z-10 p-2 rounded-xl border my-1 ${themeStyles.subtleBox}`}>
                  <div className="text-[9px] font-bold text-[#9DA79F] uppercase tracking-wider mb-1 text-center">
                    Top 3 Fuerzas Arquetípicas
                  </div>
                  {/* Un podio se lee mejor en vertical: los nombres caben enteros
                      -"Constructor / Constructora" no entra en un tercio de 360 px-
                      y las tres barras quedan alineadas para compararse. */}
                  <div className="space-y-1">
                    {result.ranking.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.archetypeId}
                        className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-black/40 border border-white/5"
                      >
                        <span className="w-3.5 shrink-0 text-[8px] font-mono font-bold text-[#D6A84F]">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] shrink-0 leading-none">{item.emoji}</span>
                        <span className="flex-1 min-w-0 text-[10px] font-serif font-bold text-[#F2EFE6] truncate leading-tight">
                          {item.name}
                        </span>
                        <span className="w-9 shrink-0 h-1 bg-[#0E1513] rounded-full overflow-hidden">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${item.normalizedScore}%`,
                              backgroundColor: themeStyles.accentColor,
                            }}
                          />
                        </span>
                        <span className="w-[26px] shrink-0 text-right text-[8px] font-mono font-bold text-[#D6A84F]">
                          {item.normalizedScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watermark & Footer */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-[#7A8880]">
                <span>Descubre tu mapa interior</span>
                <span className="font-semibold text-[#A6B2A8]">archetypes-mystical.web.app</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
