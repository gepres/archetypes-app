import React, { useId } from 'react';
import { ArchetypeGlyph } from './ArchetypeGlyph';
import { arquetipoDelAvatar, avatarDe } from '../../data/avatar';
import { getArchetypeList, getArchetypeName } from '../../data/archetypesData';
import { DEFAULT_GENDER, GenderMode } from '../../types';

/** El avatar de una cuenta: el glifo de su arquetipo, en dorado. */
export const AvatarArquetipo: React.FC<{ valor?: string | null; className?: string }> = ({
  valor,
  className = 'w-[1.15em] h-[1.15em] text-[#D6A84F]',
}) => <ArchetypeGlyph id={arquetipoDelAvatar(valor)} className={className} />;

/**
 * Elegir el avatar: los 18 arquetipos con su glifo y su nombre en la perspectiva de la persona,
 * para que se sepa cuál es cuál.
 */
export const SelectorAvatar: React.FC<{
  valor?: string | null;
  onChange: (valor: string) => void;
  gender?: GenderMode;
  etiqueta: string;
}> = ({ valor, onChange, gender = DEFAULT_GENDER, etiqueta }) => {
  const elegido = arquetipoDelAvatar(valor);
  const idEtiqueta = useId();
  return (
    <div>
      <p id={idEtiqueta} className="text-xs font-semibold text-[#C5CFC7] mb-2">
        {etiqueta}: <span className="text-[#D6A84F]">{getArchetypeName(elegido, gender)}</span>
      </p>
      <div role="radiogroup" aria-labelledby={idEtiqueta} className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {getArchetypeList(gender).map(a => {
          const activo = a.id === elegido;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={activo}
              key={a.id}
              onClick={() => onChange(avatarDe(a.id))}
              className={`flex flex-col items-center gap-1 px-1 py-2 rounded-xl border transition-colors ${
                activo
                  ? 'bg-[#1E2E27] border-[#D6A84F] text-[#F2EFE6]'
                  : 'bg-[#121A17] border-[#23332D] text-[#9DA79F] hover:border-[#315C45]'
              }`}
            >
              <ArchetypeGlyph id={a.id} className={`w-6 h-6 ${activo ? 'text-[#D6A84F]' : 'text-[#B8A06A]'}`} />
              <span className="text-[10px] leading-tight text-center line-clamp-2">{a.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
