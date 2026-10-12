import React, { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronDown,
  BookOpen,
  Sun,
  Shield,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Compass,
  Users,
  Activity,
  Flame,
  Award,
  Bot,
  Library,
  PenLine,
  GitMerge,
  ExternalLink,
  Dumbbell,
  Layers,
} from 'lucide-react';
import { DIMENSIONS, getArchetype, getArchetypeList, getDimensionShortName, withDe } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { LECTURAS, REFERENCIAS } from '../../data/referencias';
import { Archetype, ArchetypeId, DimensionId, GenderMode, LifeDomainKey, DEFAULT_GENDER } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';
import { ArchetypeGlyph } from '../common/ArchetypeGlyph';
import { PerspectiveSwitcher } from '../common/PerspectiveSwitcher';

interface ArchetypesListViewProps {
  selectedArchetypeId: ArchetypeId | null;
  onSelectArchetype: (id: ArchetypeId | null) => void;
  onSelectTab: (tab: NavTab) => void;
  onDiscussWithAi?: (archetypeName: string, archetypeId?: string) => void;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
}

const DOMAIN_LABELS: Record<LifeDomainKey, { label: string; icon: React.ElementType }> = {
  liderazgo: { label: 'Liderazgo y decisiones', icon: Award },
  relaciones: { label: 'Relaciones y vínculos', icon: Users },
  crisis: { label: 'Momentos difíciles', icon: Activity },
  creatividad: { label: 'Creatividad y trabajo', icon: Flame },
  paternidad: { label: 'Crianza y mentoría', icon: Compass },
};

const ORDEN_DIMENSIONES: DimensionId[] = ['construccion', 'accion', 'mente', 'corazon'];

/** Para buscar sin que importen tildes ni mayúsculas («heroe» encuentra «Héroe»). */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

type IdSeccion = 'comprender' | 'luz' | 'vida' | 'practicar' | 'preguntas' | 'figuras' | 'profundizar';

/** Una sección plegable del detalle: en el celular se lee una cosa a la vez. */
const Seccion: React.FC<{
  id: IdSeccion;
  titulo: string;
  icono: React.ElementType;
  abierta: boolean;
  onAlternar: (id: IdSeccion) => void;
  children: React.ReactNode;
}> = ({ id, titulo, icono: Icono, abierta, onAlternar, children }) => (
  <section className="rounded-2xl bg-[#121A17] border border-[#23332D] overflow-hidden">
    <h2>
      <button
        type="button"
        onClick={() => onAlternar(id)}
        aria-expanded={abierta}
        aria-controls={`seccion-${id}`}
        className="w-full min-h-[52px] flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-[#16221E] transition-colors"
      >
        <span className="w-8 h-8 shrink-0 rounded-lg bg-[#1A2521] border border-[#315C45] flex items-center justify-center text-[#D6A84F]">
          <Icono className="w-4 h-4" />
        </span>
        <span className="flex-1 font-serif text-base font-bold text-[#F2EFE6]">{titulo}</span>
        <ChevronDown className={`w-4 h-4 text-[#9DA79F] transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>
    </h2>
    {abierta && (
      <div id={`seccion-${id}`} className="px-4 sm:px-5 pb-5 pt-1 space-y-4 animate-fadeIn">
        {children}
      </div>
    )}
  </section>
);

export const ArchetypesListView: React.FC<ArchetypesListViewProps> = ({
  selectedArchetypeId,
  onSelectArchetype,
  onSelectTab,
  onDiscussWithAi,
  gender = DEFAULT_GENDER,
  onGenderChange,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<DimensionId | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  // En el detalle, qué secciones están abiertas. Al cambiar de arquetipo, solo «Comprender».
  const [abiertas, setAbiertas] = useState<Set<IdSeccion>>(() => new Set(['comprender']));
  useEffect(() => {
    setAbiertas(new Set(['comprender']));
    if (selectedArchetypeId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArchetypeId]);
  const alternar = (id: IdSeccion) =>
    setAbiertas(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

  const currentGender = gender || DEFAULT_GENDER;
  const archetypesList = getArchetypeList(currentGender);

  const busca = normalizar(searchQuery.trim());
  const filteredArchetypes = archetypesList.filter(arch => {
    const matchesDim = selectedDimension === 'todos' || arch.dimension === selectedDimension;
    const matchesQuery =
      !busca ||
      [arch.name, arch.shortDescription, arch.mantra, arch.shadow, ...arch.concepts].some(t => normalizar(t).includes(busca));
    return matchesDim && matchesQuery;
  });

  const selectedArchetype: Archetype | null = selectedArchetypeId
    ? getArchetype(selectedArchetypeId, currentGender)
    : null;

  // ── Detalle de un arquetipo ──────────────────────────────────────────────
  if (selectedArchetype) {
    const a = selectedArchetype;
    const dimensionInfo = DIMENSIONS[a.dimension];
    const visual = ARCHETYPE_VISUALS[a.id];
    const lecturas = LECTURAS[a.id] ?? [];
    return (
      <div id="archetype-detail-view" className="max-w-3xl mx-auto space-y-4 pb-24 pt-1 animate-fadeIn">
        {/* Volver y perspectiva */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => onSelectArchetype(null)}
            className="self-start inline-flex items-center gap-1.5 min-h-[40px] text-xs text-[#9DA79F] hover:text-[#D6A84F] transition-colors px-3 bg-[#121A17] rounded-xl border border-[#23332D]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Los 18 arquetipos</span>
          </button>
          {onGenderChange && <PerspectiveSwitcher gender={currentGender} onGenderChange={onGenderChange} size="sm" showLabel={false} />}
        </div>

        {/* Cabecera breve: retrato, nombre, dimensión y de qué va */}
        <header className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#16221E] to-[#0E1513] border border-[#315C45] space-y-4 relative overflow-hidden">
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: a.colorHex || '#D6A84F' }}
          />
          <div className="flex items-start gap-4 relative">
            <div className="w-24 h-28 sm:w-32 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-[#D6A84F]/50 bg-[#0B1110] shadow-xl">
              <ArchetypeIllustratedArtwork archetypeId={a.id} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <span
                className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border"
                style={{ color: dimensionInfo.color, borderColor: `${dimensionInfo.color}55`, backgroundColor: `${dimensionInfo.color}14` }}
              >
                {getDimensionShortName(a.dimension)}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6] leading-tight flex items-center gap-2">
                <ArchetypeGlyph id={a.id} className="w-7 h-7 text-[#D6A84F]" />
                <span>{a.name}</span>
              </h1>
              {visual?.characterTitle && <p className="text-xs text-[#D6A84F] font-medium">{visual.characterTitle}</p>}
            </div>
          </div>
          <p className="text-sm text-[#C5CFC7] leading-relaxed relative">{a.shortDescription}</p>
          <p className="font-serif italic text-base text-[#E5D7B7] leading-snug border-l-2 border-[#D6A84F]/60 pl-3 relative">
            «{a.mantra}»
          </p>
          <button
            onClick={() => {
              if (onDiscussWithAi) {
                onDiscussWithAi(
                  `Hablemos desde la energía ${withDe(a.name)}. ¿Cómo puedo manifestar tu fuerza en mi día a día?`,
                  a.id
                );
              } else {
                onSelectTab('ai');
              }
            }}
            className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#315C45] text-xs font-semibold text-[#F2EFE6] transition-colors"
          >
            <Bot className="w-4 h-4 text-[#86EFAC]" />
            Conversar con la voz {withDe(a.name)}
          </button>
        </header>

        {/* Comprender */}
        <Seccion id="comprender" titulo="Comprender" icono={BookOpen} abierta={abiertas.has('comprender')} onAlternar={alternar}>
          <p className="text-sm text-[#C5CFC7] leading-relaxed">{a.fullDescription}</p>
          <div className="p-4 rounded-xl bg-[#0E1513] border border-[#315C45]/50 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#D6A84F]">La pregunta que te hace</span>
            <p className="font-serif text-base text-[#F2EFE6] font-semibold leading-snug">{a.centralQuestion}</p>
          </div>
          {a.symbol && (
            <p className="text-sm text-[#C5CFC7]">
              <span className="font-semibold text-[#D6A84F]">Sus símbolos: </span>
              {a.symbol}
            </p>
          )}
          {a.concepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {a.concepts.map(c => (
                <span key={c} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0E1513] text-[#9DA79F] border border-[#1E2A25] capitalize">
                  {c}
                </span>
              ))}
            </div>
          )}
        </Seccion>

        {/* Luz y sombra */}
        <Seccion id="luz" titulo="Cuando ayuda y cuando se excede" icono={Sun} abierta={abiertas.has('luz')} onAlternar={alternar}>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sun className="w-4 h-4" /> Cuando ayuda
            </p>
            <p className="text-sm text-[#C5CFC7] leading-relaxed">{a.strength}</p>
            <ul className="space-y-1.5">
              {a.balancedBehavior.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#C5CFC7]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-[#1A1514] border border-[#452723]">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-300">
              <Shield className="w-4 h-4" /> Cuando se excede
            </p>
            <p className="text-sm font-semibold text-[#F2EFE6]">{a.shadow}</p>
            <p className="text-sm text-[#C5CFC7] leading-relaxed">{a.shadowDescription}</p>
            <ul className="space-y-1.5">
              {a.unbalancedBehavior.map((u, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#C5CFC7]">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[#121F1A] border border-[#315C45] space-y-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D6A84F]">
              <Sparkles className="w-4 h-4" /> Cómo recuperar el equilibrio
            </p>
            <p className="text-sm text-[#C5CFC7] leading-relaxed">{a.shadowAntidote}</p>
          </div>
        </Seccion>

        {/* En tu vida */}
        <Seccion id="vida" titulo="En tu vida" icono={Layers} abierta={abiertas.has('vida')} onAlternar={alternar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(DOMAIN_LABELS) as LifeDomainKey[]).map(clave => {
              const { label, icon: Icono } = DOMAIN_LABELS[clave];
              return (
                <div key={clave} className="p-4 rounded-xl bg-[#0E1513] border border-[#1E2A25] space-y-1.5">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#D6A84F]">
                    <Icono className="w-4 h-4 text-[#86EFAC]" /> {label}
                  </p>
                  <p className="text-sm text-[#C5CFC7] leading-relaxed">{a.domains[clave]}</p>
                </div>
              );
            })}
          </div>
        </Seccion>

        {/* Practicar */}
        <Seccion id="practicar" titulo="Practicar" icono={Dumbbell} abierta={abiertas.has('practicar')} onAlternar={alternar}>
          {a.developmentExercises.map((ex, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0E1513] border border-[#1E2A25] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#F2EFE6]">{ex.title}</h3>
              <p className="text-sm text-[#9DA79F] leading-relaxed">{ex.description}</p>
              <div className="p-3 rounded-lg bg-[#121F1A] border border-[#315C45]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86EFAC]">Primer paso</span>
                <p className="text-sm text-[#C5CFC7]">{ex.actionStep}</p>
              </div>
            </div>
          ))}
        </Seccion>

        {/* Preguntas para el diario */}
        <Seccion id="preguntas" titulo="Preguntas para tu diario" icono={PenLine} abierta={abiertas.has('preguntas')} onAlternar={alternar}>
          <ol className="space-y-2">
            {a.reflectionQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#0E1513] border border-[#1E2A25]">
                <span className="font-serif font-bold text-sm text-[#D6A84F] shrink-0">{i + 1}.</span>
                <span className="text-sm text-[#C5CFC7] leading-relaxed">{q}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => onSelectTab('journal')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D6A84F] hover:underline"
          >
            <PenLine className="w-3.5 h-3.5" /> Ir a mi diario
          </button>
        </Seccion>

        {/* Con otras figuras */}
        <Seccion id="figuras" titulo="Con otras figuras" icono={GitMerge} abierta={abiertas.has('figuras')} onAlternar={alternar}>
          <div className="space-y-3">
            {a.synergies.map((syn, i) => {
              const partner = getArchetype(syn.partnerId, currentGender);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectArchetype(partner.id)}
                  className="w-full text-left p-4 rounded-xl bg-[#0E1513] border border-[#1E2A25] hover:border-[#315C45] space-y-1.5 transition-colors"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-serif text-sm font-bold text-[#F2EFE6]">
                      <ArchetypeGlyph id={partner.id} className="w-6 h-6 text-[#D6A84F]" />
                      Con {partner.name}
                    </span>
                    <span className="text-[10px] bg-[#1A2521] text-[#D6A84F] px-2 py-0.5 rounded-md border border-[#315C45] font-bold shrink-0">
                      {syn.synergyKeyword}
                    </span>
                  </span>
                  <span className="block text-xs font-semibold text-[#86EFAC]">{syn.title}</span>
                  <span className="block text-sm text-[#9DA79F] leading-relaxed">{syn.description}</span>
                </button>
              );
            })}
          </div>
        </Seccion>

        {/* Para profundizar */}
        {lecturas.length > 0 && (
          <Seccion id="profundizar" titulo="Para profundizar" icono={Library} abierta={abiertas.has('profundizar')} onAlternar={alternar}>
            <ul className="space-y-3">
              {lecturas.map(l => {
                const r = REFERENCIAS[l.ref];
                return (
                  <li key={l.ref} className="p-4 rounded-xl bg-[#0E1513] border border-[#1E2A25] space-y-1.5">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 font-serif text-base font-bold text-[#F2EFE6] hover:text-[#D6A84F] leading-snug"
                    >
                      <span>{r.titulo}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 text-[#D6A84F]" />
                    </a>
                    <p className="text-xs text-[#9DA79F]">
                      {r.autores}
                      {r.anio > 0 && ` · ${r.anio}`}
                      {r.tipo === 'articulo' ? ' · artículo' : ''}
                    </p>
                    {'enEspanol' in r && r.enEspanol && <p className="text-xs text-[#C5CFC7]">En español: {r.enEspanol}</p>}
                    <p className="text-sm text-[#C5CFC7] leading-relaxed">{l.porQue}</p>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-[#7B8880] leading-relaxed">
              Lecturas elegidas por afinidad: los 18 arquetipos de esta app son una síntesis propia de varias tradiciones,
              y los autores no siempre usan estos mismos nombres. Los enlaces llevan a la ficha del libro o al artículo.
            </p>
          </Seccion>
        )}
      </div>
    );
  }

  // ── Galería de los 18 ─────────────────────────────────────────────────────
  const tarjeta = (arch: Archetype) => {
    const dim = DIMENSIONS[arch.dimension];
    return (
      <li key={arch.id}>
        <button
          type="button"
          onClick={() => onSelectArchetype(arch.id)}
          className="group w-full h-full text-left flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-[#121A17] border border-[#23332D] hover:border-[#D6A84F] overflow-hidden transition-colors"
        >
          <span className="block w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#0B1110]">
            <ArchetypeIllustratedArtwork
              archetypeId={arch.id}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </span>
          <span className="min-w-0 flex-1 flex flex-col gap-1 justify-center">
            <span className="flex items-center gap-1.5 font-serif text-base font-bold text-[#F2EFE6] leading-tight">
              <ArchetypeGlyph id={arch.id} />
              <span className="truncate">{arch.name}</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: dim.color }}>
              {getDimensionShortName(arch.dimension)}
            </span>
            <span className="text-xs text-[#9DA79F] leading-snug line-clamp-2 sm:line-clamp-3">{arch.shortDescription}</span>
          </span>
        </button>
      </li>
    );
  };
  const agrupada = selectedDimension === 'todos' && !busca;

  return (
    <div id="archetypes-gallery-view" className="space-y-5 animate-fadeIn max-w-6xl mx-auto pb-24">
      {/* Cabecera */}
      <header className="space-y-3">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6] tracking-tight">Los 18 arquetipos</h1>
        <p className="text-sm text-[#9DA79F] leading-relaxed max-w-2xl">
          Dieciocho maneras de estar en el mundo, en cuatro dimensiones. Toca uno para conocer cuándo ayuda, cuándo se excede
          y cómo practicarlo.
        </p>
        {onGenderChange && <PerspectiveSwitcher gender={currentGender} onGenderChange={onGenderChange} size="sm" />}
      </header>

      {/* Buscar y filtrar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7A72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, idea o sombra…"
            className="w-full min-h-[44px] pl-10 pr-4 bg-[#121A17] border border-[#23332D] rounded-xl text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 touch-scroll-x scrollbar-persona -mx-1 px-1" role="group" aria-label="Filtrar por dimensión">
          {(['todos', ...ORDEN_DIMENSIONES] as const).map(d => {
            const activo = selectedDimension === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDimension(d)}
                aria-pressed={activo}
                className={`shrink-0 min-h-[36px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors ${
                  activo
                    ? 'bg-[#315C45] text-[#F2EFE6] font-semibold border-[#437A5C]'
                    : 'bg-[#121A17] text-[#9DA79F] hover:text-[#F2EFE6] border-[#23332D]'
                }`}
              >
                {d === 'todos' ? 'Todos (18)' : DIMENSIONS[d].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Los arquetipos: por dimensión, o la lista filtrada */}
      {filteredArchetypes.length === 0 ? (
        <div className="text-center py-12 px-6 space-y-3 rounded-2xl border border-dashed border-[#23332D] bg-[#101917]/50">
          <p className="text-sm text-[#C5CFC7] font-medium">No encontramos arquetipos con «{searchQuery.trim()}».</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDimension('todos');
            }}
            className="text-xs font-semibold text-[#D6A84F] hover:underline"
          >
            Ver los 18
          </button>
        </div>
      ) : agrupada ? (
        ORDEN_DIMENSIONES.map(d => (
          <section key={d} className="space-y-2.5" aria-labelledby={`dimension-${d}`}>
            <div className="flex items-baseline gap-2">
              <span className="w-2 h-2 rounded-full shrink-0 self-center" style={{ backgroundColor: DIMENSIONS[d].color }} />
              <h2 id={`dimension-${d}`} className="font-serif text-lg font-bold text-[#F2EFE6]">
                {DIMENSIONS[d].name}
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {filteredArchetypes.filter(x => x.dimension === d).map(tarjeta)}
            </ul>
          </section>
        ))
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">{filteredArchetypes.map(tarjeta)}</ul>
      )}
    </div>
  );
};
