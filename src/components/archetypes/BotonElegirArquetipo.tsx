import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getArchetype } from '../../data/archetypesData';
import { ArchetypeId, GenderMode } from '../../types';

interface BotonElegirArquetipoProps {
  /** Lo que se elige con él, p. ej. «Filtrar por». */
  etiqueta: string;
  valor: ArchetypeId | 'todos';
  gender: GenderMode;
  onAbrir: () => void;
}

/**
 * El botón que abre el selector de arquetipos (ArchetypePickerModal) en lugar de un desplegable:
 * en el celular un desplegable de 18 opciones se ve mal. Muestra lo elegido con el nombre de
 * la perspectiva de la persona.
 */
export const BotonElegirArquetipo: React.FC<BotonElegirArquetipoProps> = ({ etiqueta, valor, gender, onAbrir }) => {
  const elegido = valor === 'todos' ? null : getArchetype(valor, gender);
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-haspopup="dialog"
      className="w-full sm:w-auto inline-flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-xl bg-[#121A17] border border-[#1E2A25] hover:border-[#315C45] text-xs text-left transition-colors"
    >
      <span className="text-[#9DA79F] shrink-0">{etiqueta}:</span>
      <span className="font-semibold text-[#F2EFE6] truncate flex-1">
        {elegido ? `${elegido.emoji} ${elegido.name}` : 'Todos los arquetipos'}
      </span>
      <ChevronDown className="w-3.5 h-3.5 text-[#D6A84F] shrink-0" />
    </button>
  );
};
