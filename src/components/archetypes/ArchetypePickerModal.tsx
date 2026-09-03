import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Sparkles, Check, Filter, Layers, Ban } from 'lucide-react';
import { ARCHETYPES_LIST, getArchetypeList } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId, GenderMode } from '../../types';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';

interface ArchetypePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: ArchetypeId | 'none') => void;
  currentSelectedId?: ArchetypeId | 'none';
  title?: string;
  subtitle?: string;
  allowNone?: boolean;
  /** Que dice la opcion "ninguno". Cada pantalla la usa para algo distinto. */
  noneLabel?: string;
  disabledIds?: ArchetypeId[];
  gender?: GenderMode;
}

export const ArchetypePickerModal: React.FC<ArchetypePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSelectedId,
  title = 'Seleccionar Arquetipo',
  subtitle = 'Explora la galería arquetípica y elige la energía para comparar.',
  allowNone = false,
  noneLabel = 'Desactivar 3er Arquetipo',
  disabledIds = [],
  gender = 'male',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('todos');

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
    return archetypeList.filter(arch => {
      const matchesSearch =
        arch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arch.dimension.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arch.strength.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ARCHETYPE_VISUALS[arch.id]?.characterTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDim =
        selectedDimension === 'todos' || arch.dimension.toLowerCase() === selectedDimension.toLowerCase();

      return matchesSearch && matchesDim;
    });
  }, [searchTerm, selectedDimension, archetypeList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window Container */}
      <div className="relative w-full max-w-4xl bg-[#0E1513] border border-[#315C45] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D6A84F]/10 via-[#315C45]/10 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#1E2A25] relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-[11px] font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>Galería de Selección Arquetípica</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F2EFE6] tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#9DA79F] font-light">
              {subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#9DA79F] hover:text-[#F2EFE6] bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] rounded-full transition-colors shrink-0 active:scale-95"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-4 sm:px-6 bg-[#121A17]/60 border-b border-[#1E2A25] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9DA79F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, virtud o dimensión..."
                className="w-full bg-[#0B100E] border border-[#23332D] focus:border-[#D6A84F] rounded-xl pl-9.5 pr-4 py-2 text-xs sm:text-sm text-[#F2EFE6] placeholder-[#64746B] focus:outline-none transition-colors"
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

            {/* Optional "None" Selection Button */}
            {allowNone && (
              <button
                onClick={() => {
                  onSelect('none');
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all shrink-0 active:scale-95 ${
                  currentSelectedId === 'none'
                    ? 'bg-[#381B20] text-[#FCA5A5] border-[#F87171] shadow-md'
                    : 'bg-[#181112] hover:bg-[#251518] text-[#E5B8BF] border-[#4E2B2B]'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-[#F87171]" />
                <span>{noneLabel}</span>
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
                  <span className="capitalize">{dim}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archetype Cards Grid Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 scrollbar-chat">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredArchetypes.map(arch => {
                const isSelected = currentSelectedId === arch.id;
                const isDisabled = disabledIds.includes(arch.id);
                const visual = ARCHETYPE_VISUALS[arch.id];

                return (
                  <button
                    key={arch.id}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onSelect(arch.id);
                        onClose();
                      }
                    }}
                    className={`group relative rounded-2xl p-3.5 text-left border transition-all flex items-center gap-3.5 select-none active:scale-98 ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-[#0B100E] border-[#1A2521]'
                        : isSelected
                        ? 'bg-gradient-to-br from-[#1E2E27] to-[#121E19] border-[#D6A84F] ring-1 ring-[#D6A84F] shadow-xl shadow-[#D6A84F]/10'
                        : 'bg-[#121A17] hover:bg-[#16221E] border-[#23332D] hover:border-[#315C45] hover:shadow-lg'
                    }`}
                  >
                    {/* Artwork Mini Thumbnail */}
                    <div className="w-14 h-16 rounded-xl overflow-hidden border border-[#D6A84F]/60 bg-[#0B1110] shrink-0 shadow-md relative">
                      <ArchetypeIllustratedArtwork
                        archetypeId={arch.id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Archetype Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-serif font-bold text-[#F2EFE6] truncate flex items-center gap-1.5">
                          <span>{arch.emoji}</span>
                          <span>{arch.name}</span>
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#D6A84F] text-[#0E1513] flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#1A2521] text-[#D6A84F] border border-[#315C45]/50">
                          {arch.dimension}
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

        {/* Modal Footer */}
        <div className="p-4 bg-[#0B100E] border-t border-[#1E2A25] flex items-center justify-between text-xs text-[#8A968D]">
          <span>
            Mostrando {filteredArchetypes.length} de {ARCHETYPES_LIST.length} arquetipos
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A2521] hover:bg-[#23332D] text-[#F2EFE6] rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
