import { ArchetypeId } from '../types';

export interface ArchetypeVisualData {
  id: ArchetypeId;
  characterTitle: string;
  portraitUrl: string;
  avatarUrl: string;
  badgeSymbol: string;
  elementAura: string;
  vibeSummary: string;
  characterClass: string;
}

export const ARCHETYPE_VISUALS: Record<ArchetypeId, ArchetypeVisualData> = {
  rey: {
    id: 'rey',
    characterTitle: 'El Soberano del Orden y la Bendición',
    portraitUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '👑',
    elementAura: '#D6A84F',
    vibeSummary: 'Presencia majestuosa, orden benevolente y visión integradora',
    characterClass: 'Gobernante Cósmico',
  },
  guerrero: {
    id: 'guerrero',
    characterTitle: 'El Guardián de la Acción y la Impecabilidad',
    portraitUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '⚔️',
    elementAura: '#EF4444',
    vibeSummary: 'Foco inquebrantable, disciplina física y defensa de lo sagrado',
    characterClass: 'Campeón Disciplinado',
  },
  mago: {
    id: 'mago',
    characterTitle: 'El Alquimista de Patrones y Consciencia',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🔮',
    elementAura: '#3B82F6',
    vibeSummary: 'Visión profunda, maestría en sistemas y transformación sutil',
    characterClass: 'Iniciado del Conocimiento',
  },
  amante: {
    id: 'amante',
    characterTitle: 'El Custodio de la Sensibilidad, Arte y Empatía',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '❤️',
    elementAura: '#10B981',
    vibeSummary: 'Conexión humana, deleite estético y pasión vital compartida',
    characterClass: 'Poeta y Conector',
  },
  padre: {
    id: 'padre',
    characterTitle: 'El Pilar Protector y Nutrición de Raíces',
    portraitUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🛡️',
    elementAura: '#D6A84F',
    vibeSummary: 'Refugio seguro, mentoría paciente y cimiento generacional',
    characterClass: 'Patriarca Sabio',
  },
  cuidador: {
    id: 'cuidador',
    characterTitle: 'El Sanador del Vínculo y Servicio Generoso',
    portraitUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🌱',
    elementAura: '#10B981',
    vibeSummary: 'Compasión activa, escucha profunda y presencia reparadora',
    characterClass: 'Sanador de la Comunidad',
  },
  bufon: {
    id: 'bufon',
    characterTitle: 'El Sabio de la Risa, el Juego y la Verdad',
    portraitUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🎭',
    elementAura: '#F59E0B',
    vibeSummary: 'Desmitifica la solemnidad, aporta ligereza y gozo espontáneo',
    characterClass: 'Maestro del Instante',
  },
  explorador: {
    id: 'explorador',
    characterTitle: 'El Buscador Incansable de la Verdad y el Horizonte',
    portraitUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🧭',
    elementAura: '#3B82F6',
    vibeSummary: 'Autenticidad radical, pasión por lo desconocido y autonomía',
    characterClass: 'Navegante de Fronteras',
  },
  creador: {
    id: 'creador',
    characterTitle: 'El Arquitecto de Realidades y Obras Eternas',
    portraitUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🔨',
    elementAura: '#D6A84F',
    vibeSummary: 'Materializa ideas en materia tangible, innovación y legado estético',
    characterClass: 'Forjador de Mundos',
  },
  sabio: {
    id: 'sabio',
    characterTitle: 'El Filósofo del Discernimiento y la Verdad Pura',
    portraitUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '📖',
    elementAura: '#3B82F6',
    vibeSummary: 'Serenidad intelectual, búsqueda de leyes universales y objetividad',
    characterClass: 'Custodio del Saber',
  },
  heroe: {
    id: 'heroe',
    characterTitle: 'El Campeón del Coraje y la Superación Trascendente',
    portraitUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '⚡',
    elementAura: '#EF4444',
    vibeSummary: 'Traspasa límites autoimpuestos, conquista pruebas y protege el bien',
    characterClass: 'Guerrero de la Luz',
  },
  rebelde: {
    id: 'rebelde',
    characterTitle: 'El Iconoclasta de la Transformación y Ruptura',
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    badgeSymbol: '🔥',
    elementAura: '#EF4444',
    vibeSummary: 'Quiebra estructuras obsoletas, coraje para decir la verdad prohibida',
    characterClass: 'Fuego Transformador',
  },
};
