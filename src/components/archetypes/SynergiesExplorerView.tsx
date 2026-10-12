import React, { useState } from 'react';
import { GitMerge, Shuffle, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST, getArchetype, getDimensionShortName, withDe } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { initialArchetypes } from '../../services/personalization';
import { ArchetypeId, AssessmentResult, GenderMode, DEFAULT_GENDER } from '../../types';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';
import { ArchetypePickerModal } from './ArchetypePickerModal';
import { ArchetypeGlyph } from '../common/ArchetypeGlyph';

interface SynergiesExplorerViewProps {
  /** El mapa de la persona, si ya hizo el test: de él salen las figuras con las que se arranca. */
  currentResult?: AssessmentResult | null;
  onSelectArchetype: (id: ArchetypeId) => void;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
}

type ActivePickerSlot = 'first' | 'second' | null;

export const SynergiesExplorerView: React.FC<SynergiesExplorerViewProps> = ({
  currentResult = null,
  onSelectArchetype,
  gender = DEFAULT_GENDER,
  onGenderChange,
}) => {
  // Arranca con las dos figuras que encabezan tu mapa; sin mapa, con las de siempre.
  const [firstId, setFirstId] = useState<ArchetypeId>(() => initialArchetypes(currentResult, 2)[0]);
  const [secondId, setSecondId] = useState<ArchetypeId>(() => initialArchetypes(currentResult, 2)[1]);
  const [pickerSlot, setPickerSlot] = useState<ActivePickerSlot>(null);

  const currentGender = gender || DEFAULT_GENDER;
  const arch1 = getArchetype(firstId, currentGender);
  const arch2 = getArchetype(secondId, currentGender);

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

  const handleSelectFromPicker = (id: ArchetypeId | 'none') => {
    if (id === 'none') return;
    if (pickerSlot === 'first') {
      setFirstId(id);
    } else if (pickerSlot === 'second') {
      setSecondId(id);
    }
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
    : `La combinación ${withDe(arch1.name)} (${arch1.strength.toLowerCase()}) y ${withDe(arch2.name)} (${arch2.strength.toLowerCase()}) aporta equilibrio entre ${getDimensionShortName(arch1.dimension).toLowerCase()} y ${getDimensionShortName(arch2.dimension).toLowerCase()}.`;

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
      <div className="p-6 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* First Archetype Trigger Card */}
          <div className="flex-1 space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#D6A84F] block">
              Primer Arquetipo
            </span>
            <button
              onClick={() => setPickerSlot('first')}
              className="w-full text-left p-3.5 rounded-2xl bg-[#16201D] hover:bg-[#1A2623] border border-[#1E2A25] hover:border-[#D6A84F] transition-all flex items-center justify-between gap-3 group active:scale-98 shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-14 rounded-xl overflow-hidden border border-[#D6A84F]/70 bg-[#0B1110] shrink-0 shadow">
                  <ArchetypeIllustratedArtwork archetypeId={arch1.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-serif font-bold text-[#F2EFE6] truncate flex items-center gap-1.5">
                    <ArchetypeGlyph id={arch1.id} />
                    <span>{arch1.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2521] text-[#D6A84F] font-semibold border border-[#315C45]/50 inline-block">
                    {getDimensionShortName(arch1.dimension)}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-[#1A2521] group-hover:bg-[#315C45] text-xs font-semibold text-[#D6A84F] group-hover:text-[#F2EFE6] border border-[#315C45] transition-colors shrink-0 flex items-center gap-1">
                <span>Cambiar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Randomizer button */}
          <div className="flex items-center justify-center pt-5 sm:pt-4">
            <button
              onClick={handleRandomize}
              className="p-3.5 rounded-2xl bg-[#1E2A25] hover:bg-[#2A3B34] text-[#D6A84F] hover:text-[#FFE898] border border-[#315C45] transition-all hover:rotate-180 active:scale-95 shadow-md"
              title="Combinación aleatoria"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          {/* Second Archetype Trigger Card */}
          <div className="flex-1 space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#D6A84F] block">
              Segundo Arquetipo
            </span>
            <button
              onClick={() => setPickerSlot('second')}
              className="w-full text-left p-3.5 rounded-2xl bg-[#16201D] hover:bg-[#1A2623] border border-[#1E2A25] hover:border-[#D6A84F] transition-all flex items-center justify-between gap-3 group active:scale-98 shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-14 rounded-xl overflow-hidden border border-[#D6A84F]/70 bg-[#0B1110] shrink-0 shadow">
                  <ArchetypeIllustratedArtwork archetypeId={arch2.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-serif font-bold text-[#F2EFE6] truncate flex items-center gap-1.5">
                    <ArchetypeGlyph id={arch2.id} />
                    <span>{arch2.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2521] text-[#D6A84F] font-semibold border border-[#315C45]/50 inline-block">
                    {getDimensionShortName(arch2.dimension)}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-[#1A2521] group-hover:bg-[#315C45] text-xs font-semibold text-[#D6A84F] group-hover:text-[#F2EFE6] border border-[#315C45] transition-colors shrink-0 flex items-center gap-1">
                <span>Cambiar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Picker Modal for Synergies */}
        <ArchetypePickerModal
          isOpen={pickerSlot !== null}
          onClose={() => setPickerSlot(null)}
          onSelect={handleSelectFromPicker}
          gender={currentGender}
          currentSelectedId={pickerSlot === 'first' ? firstId : secondId}
          disabledIds={pickerSlot === 'first' ? [secondId] : [firstId]}
          title={pickerSlot === 'first' ? 'Seleccionar Primer Arquetipo' : 'Seleccionar Segundo Arquetipo'}
          subtitle="Explora la galería arquetípica para calibrar la sinergia y alianza."
        />

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
                Si {arch1.name} domina en exceso ({arch1.shadow}), sofoca la cualidad {withDe(arch2.name)}. Se requiere alternar el mando según el contexto.
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
                  <span className="inline-flex items-center gap-1"><ArchetypeGlyph id={duo.a1} /> + <ArchetypeGlyph id={duo.a2} /></span>
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
