import { ArchetypeId } from '../types';
import { ARCHETYPES } from './archetypesData';

/**
 * El avatar de la cuenta es un arquetipo, y se dibuja con su glifo. Se sigue guardando como el
 * emoji de ese arquetipo, en el campo `avatarEmoji` de siempre: es el que ya viaja a la nube y el
 * que tienen las cuentas existentes, y el emoji de cada arquetipo es único.
 */
export const AVATAR_POR_DEFECTO: ArchetypeId = 'rey';

/**
 * La lista anterior ofrecía emojis que no son de ningún arquetipo, o de otro sistema: cada uno
 * pasa al arquetipo que más se le parece.
 */
const ANTERIORES: Record<string, ArchetypeId> = {
  '🃏': 'bufon',
  '📜': 'sabio',
  '🦅': 'soberano',
  '🦁': 'heroe',
  '🐺': 'explorador',
};

/** Sin el selector de variante (U+FE0F): «⚔️» y «⚔» son el mismo símbolo. */
const limpio = (s: string) => s.replace(/️/g, '').trim();

/** El arquetipo de un avatar guardado; si no se reconoce, el de por defecto. */
export function arquetipoDelAvatar(valor?: string | null): ArchetypeId {
  if (!valor) return AVATAR_POR_DEFECTO;
  const buscado = limpio(valor);
  const propio = (Object.keys(ARCHETYPES) as ArchetypeId[]).find(id => limpio(ARCHETYPES[id].emoji) === buscado);
  if (propio) return propio;
  const anterior = Object.keys(ANTERIORES).find(e => limpio(e) === buscado);
  return anterior ? ANTERIORES[anterior] : AVATAR_POR_DEFECTO;
}

/** Lo que se guarda al elegir un arquetipo como avatar. */
export const avatarDe = (id: ArchetypeId): string => ARCHETYPES[id].emoji;
