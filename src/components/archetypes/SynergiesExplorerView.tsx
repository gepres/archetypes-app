import React, { useState } from 'react';
import { GitMerge, Shuffle } from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { ArchetypeId } from '../../types';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';

interface SynergiesExplorerViewProps {
  onSelectArchetype: (id: ArchetypeId) => void;
}

export const SynergiesExplorerView: React.FC<SynergiesExplorerViewProps> = ({
  onSelectArchetype,
}) => {
  const [firstId, setFirstId] = useState<ArchetypeId>('rey');
  const [secondId, setSecondId] = useState<ArchetypeId>('guerrero');

  const arch1 = ARCHETYPES[firstId];
  const arch2 = ARCHETYPES[secondId];

  const handleRandomize = () => {
    const list = ARCHETYPES_LIST.map(a => a.id);
    const i1 = Math.floor(Math.random() * list.length);
    let i2 = Math.floor(Math.random() * list.length);
    while (i2 === i1) {
      i2 = Math.floor(Math.random() * list.length);
    }
    setFirstId(list[i1]);
    setSecondId(list[i2]);
  };

  // Find explicit synergy definition if present
  const synergyData =
    arch1.synergies.find(s => s.partnerId === secondId) ||
    arch2.synergies.find(s => s.partnerId === firstId);

  const relationshipTitle = synergyData
    ? synergyData.title
    : `${arch1.name} en diálogo con ${arch2.name}`;

  const relationshipDynamic = synergyData
    ? synergyData.description
    : `La combinación de ${arch1.name} (${arch1.strength.toLowerCase()}) y ${arch2.name} (${arch2.strength.toLowerCase()}) aporta equilibrio entre ${arch1.dimension} y ${arch2.dimension}.`;

  return (
    <div id="synergies-explorer-view" className="max-w-4xl mx-auto space-y-10 pb-24 pt-2">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A17] border border-[#23332D] text-xs text-[#D6A84F]">
          <GitMerge className="w-3.5 h-3.5" />
          <span>Dinámica Inter-Arquetípica</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6] tracking-tight">
          Sinergias y Alianzas Arquetípicas
        </h1>
        <p className="text-sm text-[#9DA79F] max-w-xl mx-auto font-light">
          Ningún arquetipo actúa en solitario. Selecciona dos energías para observar cómo se complementan, qué arquetipo compuesto generan y qué tensiones pueden surgir.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="p-6 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* First Archetype Selector */}
          <div className="w-full sm:w-1/2 space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Primer Arquetipo
            </label>
            <select
              value={firstId}
              onChange={e => setFirstId(e.target.value as ArchetypeId)}
              className="w-full p-3 rounded-xl bg-[#16201D] border border-[#1E2A25] text-sm text-[#F2EFE6] font-medium focus:outline-none focus:border-[#315C45]"
            >
              {ARCHETYPES_LIST.map(a => (
                <option key={a.id} value={a.id} disabled={a.id === secondId}>
                  {a.emoji} {a.name} ({a.dimension})
                </option>
              ))}
            </select>
          </div>

          {/* Randomizer button */}
          <div className="flex sm:flex-col items-center justify-center pt-2">
            <button
              onClick={handleRandomize}
              className="p-3 rounded-xl bg-[#1E2A25] hover:bg-[#23332D] text-[#D6A84F] transition-all hover:rotate-180"
              title="Combinación aleatoria"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          {/* Second Archetype Selector */}
          <div className="w-full sm:w-1/2 space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Segundo Arquetipo
            </label>
            <select
              value={secondId}
              onChange={e => setSecondId(e.target.value as ArchetypeId)}
              className="w-full p-3 rounded-xl bg-[#16201D] border border-[#1E2A25] text-sm text-[#F2EFE6] font-medium focus:outline-none focus:border-[#315C45]"
            >
              {ARCHETYPES_LIST.map(a => (
                <option key={a.id} value={a.id} disabled={a.id === firstId}>
                  {a.emoji} {a.name} ({a.dimension})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Combined Synthesis Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#16201D] to-[#121A17] border border-[#315C45] space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2A25] pb-4">
            <div className="flex items-center gap-3">
              {/* Left archetype portrait */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#D6A84F]/60 shrink-0 bg-[#0E1513]">
                <ArchetypeIllustratedArtwork archetypeId={arch1.id} className="w-full h-full object-cover" />
              </div>

              <span className="text-xl text-[#D6A84F] font-serif font-bold">+</span>

              {/* Right archetype portrait */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#D6A84F]/60 shrink-0 bg-[#0E1513]">
                <ArchetypeIllustratedArtwork archetypeId={arch2.id} className="w-full h-full object-cover" />
              </div>

              <div className="ml-1">
                <span className="text-xs text-[#D6A84F] font-semibold uppercase tracking-wider block">
                  Alianza Arquetípica
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#F2EFE6]">
                  {relationshipTitle}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#C5CFC7] leading-relaxed font-light">
            {relationshipDynamic}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            <div className="p-4 rounded-lg bg-[#121A17] border border-[#1E2A25] space-y-1 text-xs">
              <span className="font-semibold text-[#10B981] block">
                Cuando cooperan en equilibrio:
              </span>
              <p className="text-[#9DA79F]">
                {arch1.name} aporta {arch1.strength.toLowerCase()}, mientras que {arch2.name} sostiene {arch2.strength.toLowerCase()}, evitando que caigan en sus respectivas sombras.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#121A17] border border-[#1E2A25] space-y-1 text-xs">
              <span className="font-semibold text-[#EF4444] block">
                Tensión o riesgo a vigilar:
              </span>
              <p className="text-[#9DA79F]">
                Si {arch1.name} domina en exceso ({arch1.shadow}), sofoca la cualidad de {arch2.name}. Se requiere alternar el mando según el contexto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Famous Archetypal Duos */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#F2EFE6]">
          Duplas Arquetípicas Clásicas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              a1: 'rey',
              a2: 'guerrero',
              name: 'La Orden y la Espada',
              desc: 'El Rey provee la visión moral; el Guerrero provee la fuerza de ejecución.',
            },
            {
              a1: 'mago',
              a2: 'creador',
              name: 'La Alquimia Creativa',
              desc: 'El Mago descifra las leyes invisibles; el Creador les da forma tangible.',
            },
            {
              a1: 'amante',
              a2: 'sabio',
              name: 'La Sabiduría del Corazón',
              desc: 'El Amante abre la empatía y la pasión; el Sabio aporta sobriedad y discernimiento.',
            },
            {
              a1: 'rebelde',
              a2: 'heroe',
              name: 'La Vanguardia Disruptiva',
              desc: 'El Rebelde derriba el orden obsoleto; el Héroe lidera la travesía hacia lo nuevo.',
            },
          ].map((duo, idx) => (
            <div
              key={idx}
              onClick={() => {
                setFirstId(duo.a1 as ArchetypeId);
                setSecondId(duo.a2 as ArchetypeId);
              }}
              className="p-4 rounded-xl bg-[#121A17] border border-[#1E2A25] hover:border-[#315C45] cursor-pointer space-y-1 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#F2EFE6]">
                  {duo.name}
                </span>
                <span className="text-xs text-[#D6A84F]">
                  {ARCHETYPES[duo.a1 as ArchetypeId].emoji} + {ARCHETYPES[duo.a2 as ArchetypeId].emoji}
                </span>
              </div>
              <p className="text-xs text-[#9DA79F]">{duo.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
