import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, Filter, Layers, Ban } from 'lucide-react';
import { ARCHETYPES_LIST, getArchetypeList, getDimensionShortName } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId, DimensionId, GenderMode, DEFAULT_GENDER } from '../../types';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';
import { useFocoModal } from '../common/useFocoModal';
import { ArchetypeGlyph } from '../common/ArchetypeGlyph';

interface ArchetypePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Al elegir uno (o la opción «ninguno»/«todos»). En modo `multiple` no se usa. */
  onSelect?: (id: ArchetypeId | 'none') => void;
  currentSelectedId?: ArchetypeId | 'none';
  title?: string;
  subtitle?: string;
  allowNone?: boolean;
  /** Que dice la opcion "ninguno". Cada pantalla la usa para algo distinto. */
  noneLabel?: string;
  /** Cómo se ve esa opción: quitar algo (rojo) o ver todos (neutra, como en un filtro). */
  noneVariant?: 'quitar' | 'todos';
  disabledIds?: ArchetypeId[];
  gender?: GenderMode;
  /** Para elegir varios (p. ej. los arquetipos de una entrada del diario). */
  multiple?: boolean;
  selectedIds?: ArchetypeId[];
  onConfirmMany?: (ids: ArchetypeId[]) => void;
}

/** Para buscar sin que importen tildes ni mayúsculas («heroe» encuentra «Héroe»). */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * El selector de arquetipos de toda la app. En el celular ocupa la pantalla entera, con el
 * título y la salida siempre a la vista (en un modal centrado, la barra del navegador los
 * tapaba); en pantallas grandes es un modal centrado. Los nombres siguen la perspectiva elegida.
 */
export const ArchetypePickerModal: React.FC<ArchetypePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSelectedId,
  title = 'Seleccionar Arquetipo',
  subtitle = 'Explora la galería arquetípica y elige la energía para comparar.',
  allowNone = false,
  noneLabel = 'Desactivar 3er Arquetipo',
  noneVariant = 'quitar',
  disabledIds = [],
  gender = DEFAULT_GENDER,
  multiple = false,
  selectedIds = [],
  onConfirmMany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('todos');
  // En modo múltiple, lo marcado se confirma con «Listo»; «Cancelar» no cambia nada.
  const [marcados, setMarcados] = useState<ArchetypeId[]>(selectedIds);
  // El foco entra en el selector y no sale con Tab mientras está abierto (ver useFocoModal).
  const ventana = useRef<HTMLDivElement>(null);
  useFocoModal(isOpen, ventana);
  useEffect(() => {
    // Solo al abrir: mientras está abierto, manda lo que se va marcando.
    if (isOpen) setMarcados(selectedIds);
  }, [isOpen]);

  const archetypeList = useMemo(() => {
    return getArchetypeList(gender);
  }, [gender]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const dimensions = useMemo(() => {
    const set = new Set<string>();
    archetypeList.forEach(a => set.add(a.dimension));
    return ['todos', ...Array.from(set)];
  }, [archetypeList]);

  const filteredArchetypes = useMemo(() => {
    const busca = normalizar(searchTerm.trim());
    return archetypeList.filter(arch => {
      const matchesSearch =
        !busca ||
        [arch.name, arch.dimension, arch.strength, ARCHETYPE_VISUALS[arch.id]?.characterTitle || ''].some(t =>
          normalizar(t).includes(busca)
        );
      const matchesDim =
        selectedDimension === 'todos' || arch.dimension.toLowerCase() === selectedDimension.toLowerCase();
      return matchesSearch && matchesDim;
    });
  }, [searchTerm, selectedDimension, archetypeList]);

  if (!isOpen) return null;

  const alternar = (id: ArchetypeId) =>
    setMarcados(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // En un portal, sobre el body: dentro de una vista con su propio contexto de apilamiento (una
  // animación con transform, por ejemplo), la barra de navegación inferior quedaba por encima y
  // tapaba «Cancelar».
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* En el celular, pantalla completa (100dvh: el alto visible de verdad, sin la barra del
          navegador); desde sm, un modal centrado. */}
      <div ref={ventana} tabIndex={-1} className="relative w-full outline-none sm:max-w-4xl bg-[#0E1513] sm:border sm:border-[#315C45] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] z-10">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D6A84F]/10 via-[#315C45]/10 to-transparent pointer-events-none" />

        {/* Modal Header: siempre a la vista */}
        <div
          className="shrink-0 px-4 pb-3 sm:p-6 border-b border-[#1E2A25] relative z-10 flex items-start justify-between gap-3"
          style={{ paddingTop: 'max(0.875rem, env(safe-area-inset-top))' }}
        >
          <div className="min-w-0 space-y-0.5">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#F2EFE6] tracking-tight leading-snug">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#9DA79F] font-light leading-snug">{subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#9DA79F] hover:text-[#F2EFE6] bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] rounded-full transition-colors shrink-0 active:scale-95"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="shrink-0 px-4 py-3 sm:px-6 bg-[#121A17]/60 border-b border-[#1E2A25] space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9DA79F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, virtud o dimensión..."
                className="w-full bg-[#0B100E] border border-[#23332D] focus:border-[#D6A84F] rounded-xl pl-10 pr-16 py-2.5 text-sm text-[#F2EFE6] placeholder-[#64746B] focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9DA79F] hover:text-[#F2EFE6]"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Optional "None" / "Todos" Selection Button */}
            {allowNone && !multiple && (
              <button
                onClick={() => {
                  onSelect?.('none');
                  onClose();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all shrink-0 active:scale-95 ${
                  noneVariant === 'todos'
                    ? currentSelectedId === 'none'
                      ? 'bg-[#1E2E27] text-[#F2EFE6] border-[#D6A84F]'
                      : 'bg-[#121A17] hover:bg-[#16221E] text-[#C5CFC7] border-[#23332D]'
                    : currentSelectedId === 'none'
                    ? 'bg-[#381B20] text-[#FCA5A5] border-[#F87171] shadow-md'
                    : 'bg-[#181112] hover:bg-[#251518] text-[#E5B8BF] border-[#4E2B2B]'
                }`}
              >
                {noneVariant === 'todos' ? (
                  <Layers className="w-3.5 h-3.5 text-[#D6A84F]" />
                ) : (
                  <Ban className="w-3.5 h-3.5 text-[#F87171]" />
                )}
                <span>{noneLabel}</span>
                {noneVariant === 'todos' && currentSelectedId === 'none' && <Check className="w-3.5 h-3.5 text-[#D6A84F]" />}
              </button>
            )}
          </div>

          {/* Dimension Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 touch-scroll-x scrollbar-persona text-xs">
            {dimensions.map(dim => {
              const isSelected = selectedDimension.toLowerCase() === dim.toLowerCase();
              return (
                <button
                  key={dim}
                  onClick={() => setSelectedDimension(dim)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border select-none ${
                    isSelected
                      ? 'bg-[#315C45] text-[#F2EFE6] border-[#D6A84F] shadow-sm font-bold'
                      : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border-[#1E2A25]'
                  }`}
                >
                  <Filter className="w-3 h-3 text-[#D6A84F]" />
                  <span>{dim === 'todos' ? 'Todos' : getDimensionShortName(dim as DimensionId)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archetype Cards Grid Area */}
        <div className="px-4 py-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 scrollbar-chat overscroll-contain">
          {filteredArchetypes.length === 0 ? (
            <div className="py-12 text-center text-[#9DA79F] space-y-2">
              <Layers className="w-10 h-10 mx-auto text-[#4E5E56] opacity-60" />
              <p className="text-sm">No se encontraron arquetipos con ese criterio de búsqueda.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDimension('todos');
                }}
                className="text-xs text-[#D6A84F] underline hover:text-[#FFE898]"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
              {filteredArchetypes.map(arch => {
                const isSelected = multiple ? marcados.includes(arch.id) : currentSelectedId === arch.id;
                const isDisabled = disabledIds.includes(arch.id);
                const visual = ARCHETYPE_VISUALS[arch.id];

                return (
                  <button
                    key={arch.id}
                    disabled={isDisabled}
                    aria-pressed={multiple ? isSelected : undefined}
                    onClick={() => {
                      if (isDisabled) return;
                      if (multiple) {
                        alternar(arch.id);
                        return;
                      }
                      onSelect?.(arch.id);
                      onClose();
                    }}
                    className={`group relative rounded-2xl p-3 text-left border transition-all flex items-center gap-3 select-none active:scale-98 ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-[#0B100E] border-[#1A2521]'
                        : isSelected
                        ? 'bg-gradient-to-br from-[#1E2E27] to-[#121E19] border-[#D6A84F] ring-1 ring-[#D6A84F] shadow-xl shadow-[#D6A84F]/10'
                        : 'bg-[#121A17] hover:bg-[#16221E] border-[#23332D] hover:border-[#315C45] hover:shadow-lg'
                    }`}
                  >
                    {/* Artwork Mini Thumbnail */}
                    <div className="w-12 h-14 rounded-xl overflow-hidden border border-[#D6A84F]/60 bg-[#0B1110] shrink-0 shadow-md relative">
                      <ArchetypeIllustratedArtwork
                        archetypeId={arch.id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Archetype Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F2EFE6] truncate flex items-center gap-1.5">
                          <ArchetypeGlyph id={arch.id} />
                          <span className="truncate">{arch.name}</span>
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#D6A84F] text-[#0E1513] flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#1A2521] text-[#D6A84F] border border-[#315C45]/50">
                          {getDimensionShortName(arch.dimension)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#9DA79F] truncate font-light">
                        {visual?.characterTitle || arch.symbol}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer: siempre a la vista */}
        <div
          className="shrink-0 px-4 pt-3 sm:p-4 bg-[#0B100E] border-t border-[#1E2A25] flex items-center justify-between gap-3 text-xs text-[#8A968D] relative z-10"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <span>
            {multiple
              ? `${marcados.length} elegido${marcados.length === 1 ? '' : 's'}`
              : `Mostrando ${filteredArchetypes.length} de ${ARCHETYPES_LIST.length} arquetipos`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 bg-[#1A2521] hover:bg-[#23332D] text-[#F2EFE6] rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            {multiple && (
              <button
                onClick={() => {
                  onConfirmMany?.(marcados);
                  onClose();
                }}
                className="min-h-[44px] px-4 py-2 bg-[#D6A84F] hover:bg-[#E5BE72] text-[#0B1110] rounded-xl font-bold transition-colors"
              >
                Listo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
