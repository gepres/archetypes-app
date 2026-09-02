import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  GitMerge,
  Bot,
  Brain,
  Zap,
  Heart,
  Hammer,
  ChevronLeft,
  Sun,
  Shield,
  Layers,
  Compass,
  Briefcase,
  Users,
  Flame,
  Activity,
  Award,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST, DIMENSIONS, getArchetype, getArchetypeList } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { Archetype, ArchetypeId, DimensionId, GenderMode, LifeDomainKey } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { ArchetypePortraitCard } from './ArchetypePortraitCard';

interface ArchetypesListViewProps {
  selectedArchetypeId: ArchetypeId | null;
  onSelectArchetype: (id: ArchetypeId | null) => void;
  onSelectTab: (tab: NavTab) => void;
  onDiscussWithAi?: (archetypeName: string, archetypeId?: string) => void;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
}

const DOMAIN_LABELS: Record<LifeDomainKey, { label: string; icon: any }> = {
  liderazgo: { label: 'Liderazgo & Dirección', icon: Award },
  relaciones: { label: 'Relaciones & Vínculos', icon: Users },
  crisis: { label: 'Crisis & Resiliencia', icon: Activity },
  creatividad: { label: 'Creatividad & Obra', icon: Flame },
  paternidad: { label: 'Paternidad & Mentoría', icon: Compass },
};

export const ArchetypesListView: React.FC<ArchetypesListViewProps> = ({
  selectedArchetypeId,
  onSelectArchetype,
  onSelectTab,
  onDiscussWithAi,
  gender = 'male',
  onGenderChange,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<DimensionId | 'todos'>('todos');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<LifeDomainKey | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailActiveTab, setDetailActiveTab] = useState<'esencia' | 'luz_sombra' | 'ambitos' | 'ejercicios' | 'sinergias'>('esencia');

  const currentGender = gender || 'male';
  const archetypesList = getArchetypeList(currentGender);

  const filteredArchetypes = archetypesList.filter(arch => {
    const matchesDim = selectedDimension === 'todos' || arch.dimension === selectedDimension;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      arch.name.toLowerCase().includes(query) ||
      arch.shortDescription.toLowerCase().includes(query) ||
      arch.concepts.some(c => c.toLowerCase().includes(query)) ||
      arch.mantra.toLowerCase().includes(query) ||
      arch.shadow.toLowerCase().includes(query);
    return matchesDim && matchesQuery;
  });

  const selectedArchetype: Archetype | null = selectedArchetypeId
    ? getArchetype(selectedArchetypeId, currentGender)
    : null;

  // Render detail view if an archetype is selected
  if (selectedArchetype) {
    const dimensionInfo = DIMENSIONS[selectedArchetype.dimension];
    return (
      <div id="archetype-detail-view" className="max-w-4xl mx-auto space-y-8 pb-24 pt-2 animate-fadeIn">
        {/* Back navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onSelectArchetype(null)}
            className="inline-flex items-center gap-2 text-xs text-[#9DA79F] hover:text-[#D6A84F] transition-colors py-1.5 px-3.5 bg-[#121A17] rounded-xl border border-[#23332D]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a la galería de 18 arquetipos</span>
          </button>

          {/* Gender Perspective switcher in detail view */}
          {onGenderChange && (
            <div className="flex items-center gap-1.5 bg-[#121A17] p-1 rounded-xl border border-[#23332D]">
              <span className="text-[10px] font-bold text-[#8A968D] uppercase px-2">
                Perspectiva:
              </span>
              <button
                onClick={() => onGenderChange('male')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentGender === 'male'
                    ? 'bg-[#315C45] text-[#F2EFE6] border border-[#437A5C]'
                    : 'text-[#9DA79F] hover:text-[#F2EFE6]'
                }`}
                title="Perspectiva Masculina"
              >
                ♂ Masculina
              </button>
              <button
                onClick={() => onGenderChange('female')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentGender === 'female'
                    ? 'bg-[#7C3AED]/50 text-[#F2EFE6] border border-[#7C3AED]'
                    : 'text-[#9DA79F] hover:text-[#F2EFE6]'
                }`}
                title="Perspectiva Femenina"
              >
                ♀ Femenina
              </button>
              <button
                onClick={() => onGenderChange('universal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentGender === 'universal'
                    ? 'bg-[#D6A84F]/25 text-[#D6A84F] border border-[#D6A84F]'
                    : 'text-[#9DA79F] hover:text-[#F2EFE6]'
                }`}
                title="Perspectiva Universal / Dual"
              >
                ☯ Universal
              </button>
            </div>
          )}
        </div>

        {/* Archetype Hero Header with Ornate Styling */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#16221E] via-[#121A17] to-[#0E1513] border-2 border-[#315C45] shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle glowing orb */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: selectedArchetype.colorHex || '#D6A84F' }}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Character Portrait Card Hero */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-[#D6A84F]/60 relative group">
                <ArchetypePortraitCard
                  archetype={selectedArchetype}
                  size="md"
                  showBadge={false}
                  className="w-full h-full rounded-2xl"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-lg bg-black/80 text-[10px] text-[#D6A84F] font-bold">
                  {selectedArchetype.emoji}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#D6A84F]">
                    Arquetipo #{ARCHETYPES_LIST.findIndex(a => a.id === selectedArchetype.id) + 1}
                  </span>
                  <span className="text-[#6B7A72]">·</span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold border"
                    style={{
                      backgroundColor: `${dimensionInfo.color}18`,
                      color: dimensionInfo.color,
                      borderColor: `${dimensionInfo.color}40`,
                    }}
                  >
                    Dimensión {dimensionInfo.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A2822] text-[#86EFAC] border border-[#315C45] font-semibold">
                    {ARCHETYPE_VISUALS[selectedArchetype.id]?.characterClass || 'Arquetipo'}
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6] tracking-tight">
                  {selectedArchetype.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#D6A84F] font-medium tracking-wide">
                  {ARCHETYPE_VISUALS[selectedArchetype.id]?.characterTitle || `Símbolo: ${selectedArchetype.symbol}`}
                </p>
                <p className="text-xs text-[#9DA79F] font-semibold tracking-wide">
                  Símbolo Sagrado: {selectedArchetype.symbol}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onDiscussWithAi) {
                  onDiscussWithAi(
                    `Hablemos desde la energía del ${selectedArchetype.name}. ¿Cómo puedo manifestar tu fuerza en mi día a día?`,
                    selectedArchetype.id
                  );
                } else {
                  onSelectTab('ai');
                }
              }}
              className="w-full md:w-auto px-5 py-3.5 bg-gradient-to-r from-[#315C45] to-[#254635] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 shrink-0 border border-[#4E8B69]/40"
            >
              <Bot className="w-4 h-4 text-[#86EFAC]" />
              <span>Hablar con la Voz del {selectedArchetype.name}</span>
            </button>
          </div>

          {/* Archetypal Mantra Banner */}
          <div className="p-4 rounded-2xl bg-[#0B1110]/80 border border-[#D6A84F]/30 text-center relative">
            <span className="text-[10px] uppercase font-bold text-[#D6A84F] tracking-widest block mb-1">
              Mantra & Voto Arquetípico
            </span>
            <p className="font-serif italic text-base sm:text-lg text-[#F2EFE6] leading-relaxed">
              "{selectedArchetype.mantra}"
            </p>
          </div>

          {/* Concept tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedArchetype.concepts.map(concept => (
              <span
                key={concept}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0E1513] text-[#9DA79F] border border-[#1E2A25] capitalize font-medium"
              >
                #{concept}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Tabs Header */}
        <div className="flex flex-wrap gap-2 border-b border-[#1E2A25] pb-3">
          {[
            { id: 'esencia', label: '1. Visión & Esencia' },
            { id: 'luz_sombra', label: '2. Luz, Sombra & Antídoto' },
            { id: 'ambitos', label: '3. En 5 Ámbitos de Vida' },
            { id: 'ejercicios', label: '4. Prácticas & Retos' },
            { id: 'sinergias', label: '5. Alianzas & Sinergias' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDetailActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                detailActiveTab === t.id
                  ? 'bg-[#315C45] text-[#F2EFE6] border border-[#437A5C] shadow-sm'
                  : 'bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Esencia */}
        {detailActiveTab === 'esencia' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#121A17] border border-[#23332D] rounded-2xl space-y-4 shadow-lg">
              <h2 className="font-serif text-lg font-bold text-[#F2EFE6] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D6A84F]" />
                <span>Naturaleza Arquetípica Integral</span>
              </h2>
              <p className="text-sm text-[#C5CFC7] leading-relaxed">
                {selectedArchetype.fullDescription}
              </p>
            </div>

            <div className="p-5 bg-[#0E1513] border border-[#23332D] rounded-2xl flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#1A2521] border border-[#315C45] text-[#D6A84F] shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold text-[#D6A84F]">
                  Pregunta Central de Autoindagación
                </span>
                <p className="font-serif text-base text-[#F2EFE6] font-semibold">
                  {selectedArchetype.centralQuestion}
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#121A17] border border-[#23332D] rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-[#9DA79F] uppercase tracking-wider">
                Preguntas para el Diario de Reflexión
              </h3>
              <div className="space-y-3">
                {selectedArchetype.reflectionQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0E1513] rounded-xl border border-[#1E2A25] flex items-start gap-3"
                  >
                    <span className="text-[#D6A84F] font-serif font-bold text-xs shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <p className="text-xs text-[#C5CFC7] leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Luz & Sombra */}
        {detailActiveTab === 'luz_sombra' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Luz */}
              <div className="p-6 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <Sun className="w-4 h-4" />
                  <span>Virtud Luminosa & Fortaleza</span>
                </div>
                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {selectedArchetype.strength}
                </p>
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-[#9DA79F] uppercase tracking-wider block">
                    Conductas Equilibradas:
                  </span>
                  {selectedArchetype.balancedBehavior.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#C5CFC7]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sombra */}
              <div className="p-6 rounded-2xl bg-[#1A1514] border border-[#452723] space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Sombra: {selectedArchetype.shadow}</span>
                </div>
                <p className="text-xs text-[#C5CFC7] leading-relaxed">
                  {selectedArchetype.shadowDescription}
                </p>
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-red-300/80 uppercase tracking-wider block">
                    Señales de Desequilibrio:
                  </span>
                  {selectedArchetype.unbalancedBehavior.map((u, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#C5CFC7]">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Antídoto de Sombra */}
            <div className="p-5 bg-gradient-to-r from-[#121A17] to-[#1A2521] border border-[#315C45] rounded-2xl space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                <span>Antídoto Psicológico para Integrar la Sombra</span>
              </div>
              <p className="text-xs sm:text-sm text-[#C5CFC7] leading-relaxed">
                {selectedArchetype.shadowAntidote}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: En Ámbitos de Vida */}
        {detailActiveTab === 'ambitos' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9DA79F]">
              Manifestación concreta del {selectedArchetype.name} en los 5 territorios fundamentales de la existencia cotidiana:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(DOMAIN_LABELS) as LifeDomainKey[]).map(domainKey => {
                const config = DOMAIN_LABELS[domainKey];
                const Icon = config.icon;
                return (
                  <div
                    key={domainKey}
                    className="p-5 bg-[#121A17] border border-[#23332D] rounded-2xl space-y-2 hover:border-[#315C45] transition-all shadow-md"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                      <Icon className="w-4 h-4 text-[#86EFAC]" />
                      <span>{config.label}</span>
                    </div>
                    <p className="text-xs text-[#C5CFC7] leading-relaxed">
                      {selectedArchetype.domains[domainKey]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Ejercicios & Prácticas */}
        {detailActiveTab === 'ejercicios' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9DA79F]">
              Protocolos de desarrollo deliberado para encarnar y madurar este arquetipo:
            </p>
            <div className="space-y-4">
              {selectedArchetype.developmentExercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-[#121A17] border border-[#23332D] rounded-2xl space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                      Ejercicio #{idx + 1}
                    </span>
                    <span className="text-[11px] text-[#9DA79F] bg-[#0E1513] px-2.5 py-0.5 rounded-full border border-[#1E2A25]">
                      Práctica Activa
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#F2EFE6]">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-[#9DA79F] leading-relaxed">
                    {ex.description}
                  </p>
                  <div className="p-3.5 bg-[#0E1513] rounded-xl border border-[#315C45]/40 space-y-1">
                    <span className="text-[10px] font-bold text-[#86EFAC] uppercase tracking-wider">
                      Paso de Acción Inmediato:
                    </span>
                    <p className="text-xs text-[#C5CFC7] font-medium">
                      {ex.actionStep}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Sinergias */}
        {detailActiveTab === 'sinergias' && (
          <div className="space-y-4">
            <p className="text-xs text-[#9DA79F]">
              Alianzas clave: Cómo se complementa el {selectedArchetype.name} con otras energías:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedArchetype.synergies.map((syn, idx) => {
                const partner = ARCHETYPES[syn.partnerId];
                return (
                  <div
                    key={idx}
                    className="p-5 bg-[#121A17] border border-[#23332D] rounded-2xl space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{partner?.emoji}</span>
                        <span className="font-serif text-sm font-bold text-[#F2EFE6]">
                          Con {partner?.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#1A2521] text-[#D6A84F] px-2 py-0.5 rounded-md border border-[#315C45] font-bold">
                        {syn.synergyKeyword}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#86EFAC]">{syn.title}</h4>
                    <p className="text-xs text-[#9DA79F] leading-relaxed">
                      {syn.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Gallery View of the 18 Archetypes
  return (
    <div id="archetypes-gallery-view" className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121A17] via-[#16221E] to-[#0F1714] border border-[#23332D] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enciclopedia Simbólica Dinámica</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F2EFE6] tracking-tight">
            {currentGender === 'male'
              ? 'Los 18 Arquetipos Masculinos'
              : currentGender === 'female'
              ? 'Los 18 Arquetipos Femeninos'
              : 'Los 18 Arquetipos Universales'}
          </h1>
          <p className="text-sm text-[#9DA79F] leading-relaxed">
            {currentGender === 'male'
              ? 'Explora las 18 energías simbólicas en su manifestación masculina (El Rey, El Guerrero, El Mago, El Padre...). Conoce sus luces, sombras y prácticas evolutivas.'
              : currentGender === 'female'
              ? 'Explora las 18 energías simbólicas en su manifestación femenina (La Reina, La Guerrera, La Maga, La Madre...). Conoce sus luces, sombras y prácticas evolutivas.'
              : 'Explora las 18 energías arquetípicas en su forma integrada y universal, organizada en cuatro dimensiones cardinales.'}
          </p>
        </div>

        {/* Quick Gender Switcher in Banner */}
        {onGenderChange && (
          <div className="relative z-10 bg-[#0B1110] p-3 rounded-2xl border border-[#23332D] space-y-2 shrink-0">
            <span className="text-[11px] font-bold text-[#D6A84F] uppercase tracking-wider block">
              Perspectiva Activa
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onGenderChange('male')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-3 ${
                  currentGender === 'male'
                    ? 'bg-[#315C45] text-[#F2EFE6] border border-[#437A5C] shadow'
                    : 'bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#1E2A25]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>♂</span>
                  <span>Masculina</span>
                </div>
                {currentGender === 'male' && <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" />}
              </button>

              <button
                onClick={() => onGenderChange('female')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-3 ${
                  currentGender === 'female'
                    ? 'bg-[#7C3AED]/50 text-[#F2EFE6] border border-[#7C3AED] shadow'
                    : 'bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#1E2A25]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>♀</span>
                  <span>Femenina</span>
                </div>
                {currentGender === 'female' && <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />}
              </button>

              <button
                onClick={() => onGenderChange('universal')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-3 ${
                  currentGender === 'universal'
                    ? 'bg-[#D6A84F]/25 text-[#D6A84F] border border-[#D6A84F] shadow'
                    : 'bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#1E2A25]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>☯</span>
                  <span>Universal</span>
                </div>
                {currentGender === 'universal' && <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121A17] border border-[#23332D] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6B7A72] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, mantra, sombra..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#0E1513] border border-[#23332D] rounded-xl text-xs text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F]"
            />
          </div>

          {/* Dimension Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedDimension('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedDimension === 'todos'
                  ? 'bg-[#315C45] text-[#F2EFE6] font-semibold border border-[#437A5C]'
                  : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D]'
              }`}
            >
              Todos (18)
            </button>
            {(Object.keys(DIMENSIONS) as DimensionId[]).map(dimId => {
              const dim = DIMENSIONS[dimId];
              const isSelected = selectedDimension === dimId;
              return (
                <button
                  key={dimId}
                  onClick={() => setSelectedDimension(dimId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#315C45] text-[#F2EFE6] font-semibold border border-[#437A5C]'
                      : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D]'
                  }`}
                >
                  {dim.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Archetype Cards with Illustrated Character Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArchetypes.map(archetype => {
          const dim = DIMENSIONS[archetype.dimension];
          const visual = ARCHETYPE_VISUALS[archetype.id];
          return (
            <div
              key={archetype.id}
              onClick={() => onSelectArchetype(archetype.id)}
              className="group bg-[#121A17] border border-[#23332D] hover:border-[#D6A84F] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between relative"
            >
              {/* Card Character Portrait Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0E1513]">
                <ArchetypePortraitCard
                  archetype={archetype}
                  size="md"
                  showBadge={true}
                  className="w-full h-full rounded-none border-0"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {/* Mantra */}
                  <p className="text-xs italic text-[#E5D7B7] font-serif line-clamp-2 leading-relaxed bg-[#0B1110]/80 p-2.5 rounded-xl border border-[#1E2A25]">
                    "{archetype.mantra}"
                  </p>

                  {/* Question */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#8A968D] block tracking-wider">
                      Pregunta de Indagación:
                    </span>
                    <p className="text-xs text-[#F2EFE6] font-medium leading-snug line-clamp-2">
                      {archetype.centralQuestion}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#1E2A25] flex items-center justify-between text-xs text-[#9DA79F] group-hover:text-[#D6A84F] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]/80" />
                    <span className="font-medium text-[11px] truncate max-w-[130px]">
                      Sombra: {archetype.shadow.split(' ')[0]}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-[#D6A84F] text-xs">
                    <span>Ver Ficha</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
