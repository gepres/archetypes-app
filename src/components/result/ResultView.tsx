import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Share2,
  RotateCcw,
  Bot,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { DIMENSIONS, getArchetype, getDimensionShortName, withDe } from '../../data/archetypesData';
import { LIKERT_OPTIONS, QUESTIONS_DATA } from '../../data/questionsData';
import { DILEMAS } from '../../data/dilemasData';
import { TIE_MAX_GAP } from '../../services/scoringEngine';
import { AnswerEvidence, ArchetypeId, AssessmentResult, GenderMode, DEFAULT_GENDER } from '../../types';
import { DimensionBar } from '../common/DimensionBar';
import { RadarChartComponent } from '../common/RadarChartComponent';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { NavTab } from '../layout/Sidebar';
import { ShareResultImageModal } from './ShareResultImageModal';

interface ResultViewProps {
  result: AssessmentResult;
  onSelectTab: (tab: NavTab) => void;
  onSelectArchetype: (id: ArchetypeId) => void;
  onRetakeTest: () => void;
  gender?: GenderMode;
}

const QUESTION_TEXT = new Map(QUESTIONS_DATA.map(q => [q.id, q.text]));
const likertLabel = (value: number) => LIKERT_OPTIONS.find(o => o.value === value)?.label ?? '';
const DILEMA = new Map(DILEMAS.map(d => [d.id, d]));

/**
 * Lo que explica por qué salió una figura, tal como la persona respondió: en el test por dilemas,
 * la situación y lo que eligió; en el de frases (resultados antiguos), la afirmación y su respuesta.
 */
const EvidenceList: React.FC<{ items: AnswerEvidence[]; archetypeId: ArchetypeId; compact?: boolean }> = ({
  items,
  archetypeId,
  compact,
}) => (
  <ul className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
    {items.map(e => {
      const dilema = e.dilemaId ? DILEMA.get(e.dilemaId) : undefined;
      if (dilema) {
        const elegida = dilema.opciones.find(o => o.arquetipo === archetypeId);
        if (!elegida) return null;
        return (
          <li key={dilema.id} className="text-left">
            <p className="text-[11px] text-[#7B8880] leading-snug">{dilema.situacion}</p>
            <p className={`font-serif italic text-[#E5D7B7] leading-snug mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
              Elegiste: «{elegida.texto}»
            </p>
          </li>
        );
      }
      if (e.questionId === undefined) return null;
      return (
        <li key={e.questionId} className="text-left">
          <p className={`font-serif italic text-[#E5D7B7] leading-snug ${compact ? 'text-xs' : 'text-sm'}`}>
            «{QUESTION_TEXT.get(e.questionId)}»
          </p>
          {e.value !== undefined && (
            <p className="text-[10px] uppercase tracking-wider text-[#7B8880] mt-0.5">Respondiste: {likertLabel(e.value)}</p>
          )}
        </li>
      );
    })}
  </ul>
);

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onSelectTab,
  onSelectArchetype,
  onRetakeTest,
  gender = DEFAULT_GENDER,
}) => {
  const { compositeProfile } = result;
  const plano = !!compositeProfile.isFlat;
  const empate = !!compositeProfile.isTie;

  useEffect(() => {
    // Sin polo claro no hay nada que celebrar como un descubrimiento.
    if (plano) return;
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D6A84F', '#315C45', '#F2EFE6'],
      });
    } catch (e) {
      // ignore
    }
  }, [plano]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dominant = getArchetype(result.dominantArchetype.archetypeId, gender);
  // Quiénes van con el dominante: todos los que comparten el primer puesto si hay empate, o el
  // segundo si no. Con empate de tres no se esconde a ninguno.
  const companions = (empate && compositeProfile.tiedLeaders
    ? compositeProfile.tiedLeaders.filter(id => id !== dominant.id)
    : compositeProfile.companions
      ? compositeProfile.companions // dos empatadas detrás del líder: las dos, sin elegir
      : compositeProfile.pair
        ? [result.ranking[1].archetypeId]
        : [] // un líder con varias empatadas detrás: no hay un único acompañante
  ).map(id => getArchetype(id, gender));
  // Con muchos a la par se nombran unos pocos y se dice cuántos más hay.
  const shownCompanions = companions.slice(0, 4);
  const hiddenCompanions = companions.length - shownCompanions.length;
  const evidence: Partial<Record<ArchetypeId, AnswerEvidence[]>> = result.evidence ?? {};
  const dominantEvidence = evidence[dominant.id] ?? [];
  const isQuick = result.type === 'quick';

  return (
    <div id="result-view" className="max-w-4xl mx-auto space-y-10 pb-24 pt-2">
      {/* 1. La revelación: el rostro primero, como en la V2 */}
      <section className="relative overflow-hidden rounded-3xl border border-[#23332D] bg-[#0B1110] px-5 py-8 sm:px-8 sm:py-10 shadow-2xl">
        {!plano && (
          <div
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full blur-3xl opacity-25"
            style={{ backgroundColor: dominant.colorHex }}
          />
        )}

        <div className="relative z-10 space-y-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-[#8A968D]">
            {plano ? 'Tu mapa' : empate ? 'Tus arquetipos, a la par' : 'Tu arquetipo dominante'}
          </p>

          {plano ? (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6]">Sin un polo claro</h1>
              <p className="text-sm sm:text-base text-[#C5CFC7] leading-relaxed">{compositeProfile.synthesis}</p>
              <button
                onClick={onRetakeTest}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] border border-[#4E8B69]/50 text-sm font-semibold text-[#F2EFE6] shadow-lg active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                Volver a responder
              </button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
              {/* El rostro */}
              <button
                type="button"
                onClick={() => onSelectArchetype(dominant.id)}
                className="relative mx-auto w-full max-w-[260px] aspect-[4/5] rounded-[1.75rem] overflow-hidden border-2 shadow-2xl bg-[#0B1110] text-left"
                style={{ borderColor: `${dominant.colorHex}80` }}
                aria-label={`Ver la ficha completa ${withDe(dominant.name)}`}
              >
                <ArchetypeIllustratedArtwork archetypeId={dominant.id} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#070C0B] via-[#070C0B]/85 to-transparent">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dominant.colorHex }}>
                    {DIMENSIONS[dominant.dimension].name}
                  </p>
                  <h1 className="font-serif text-2xl font-bold leading-tight text-[#F2EFE6]">
                    {dominant.emoji} {dominant.name}
                  </h1>
                </div>
              </button>

              {/* Lo justo: quién es, su mantra y por qué te salió */}
              <div className="space-y-5 text-center lg:text-left">
                <p className="text-sm sm:text-base text-[#C5CFC7] leading-relaxed">{dominant.shortDescription}</p>

                <blockquote
                  className="font-serif italic text-base sm:text-lg text-[#E5D7B7] leading-relaxed px-4 py-3 rounded-2xl bg-[#101917]/70 border-l-2 text-left"
                  style={{ borderColor: dominant.colorHex }}
                >
                  «{dominant.mantra}»
                </blockquote>

                {companions.length === 0 ? (
                  <p className="text-xs text-[#7B8880]">Detrás, varias figuras van a la par.</p>
                ) : (
                <p className="text-xs text-[#7B8880]">
                  {empate ? 'A la par con' : companions.length > 1 ? 'Te acompañan, a la par,' : 'Te acompaña'}{' '}
                  {shownCompanions.map((arch, i) => (
                    <React.Fragment key={arch.id}>
                      {i > 0 && (i === shownCompanions.length - 1 && hiddenCompanions === 0 ? ' y ' : ', ')}
                      <button
                        type="button"
                        onClick={() => onSelectArchetype(arch.id)}
                        className="text-[#C5CFC7] font-semibold hover:text-[#F2EFE6] underline-offset-2 hover:underline"
                      >
                        {arch.emoji} {arch.name}
                      </button>
                    </React.Fragment>
                  ))}
                  {hiddenCompanions > 0 && ` y ${hiddenCompanions} más`}
                </p>
                )}

                {dominantEvidence.length > 0 && (
                  <div className="rounded-2xl border border-[#23332D] bg-[#101917]/80 p-4 space-y-3 text-left">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#D6A84F]">Por qué te salió</p>
                    <EvidenceList items={dominantEvidence} archetypeId={dominant.id} />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={() => onSelectArchetype(dominant.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] border border-[#4E8B69]/50 text-sm font-semibold text-[#F2EFE6] shadow-lg active:scale-95 transition-transform"
                  >
                    Ver la ficha completa
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#23332D] bg-[#101917] hover:border-[#D6A84F]/50 text-sm font-medium text-[#C5CFC7] hover:text-[#F2EFE6] active:scale-95 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. La pareja que encabeza el mapa y su tensión */}
      {!plano && (
        <section className="p-6 sm:p-8 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D6A84F] font-bold">
              {compositeProfile.pair ? 'Tu pareja de arquetipos' : 'En cabeza de tu mapa'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">{compositeProfile.title}</h2>
            <p className="text-sm sm:text-base text-[#C5CFC7] leading-relaxed font-light pt-1">{compositeProfile.synthesis}</p>
            {compositeProfile.tension && (
              <p className="font-serif italic text-lg sm:text-xl text-[#E5D7B7] leading-relaxed pt-3">
                {compositeProfile.tension}
              </p>
            )}
          </div>

          {(compositeProfile.strengths.length > 0 || compositeProfile.risksAndShadows.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-[#1E2A25]">
              <div className="p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-2.5">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#10B981] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lo que aportan</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#C5CFC7]">
                  {compositeProfile.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#10B981] mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-2.5">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#EF4444] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Sus sombras, para observar</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#C5CFC7]">
                  {compositeProfile.risksAndShadows.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#EF4444] mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. Los tres primeros, con su rostro */}
      {!plano && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F2EFE6]">Tus tres primeros</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {result.top3.map((item, index) => {
              const arch = getArchetype(item.archetypeId, gender);
              const next = result.top3[index + 1];
              // Si el test decidió este puesto comparando directamente, no está a la par aunque
              // el número se parezca al del siguiente.
              const decidido = index < (result.cabezaResuelta ?? 0);
              const aLaParConElSiguiente = !decidido && !!next && item.normalizedScore - next.normalizedScore <= TIE_MAX_GAP;
              const primera = (evidence[item.archetypeId] ?? [])[0];
              return (
                <button
                  key={item.archetypeId}
                  type="button"
                  onClick={() => onSelectArchetype(item.archetypeId)}
                  className="group text-left rounded-2xl border border-[#23332D] bg-[#121A17] hover:border-[#D6A84F]/50 overflow-hidden transition-colors"
                >
                  <div className="flex lg:block">
                    <div className="relative w-24 lg:w-full h-28 lg:h-40 shrink-0 bg-[#0B1110] overflow-hidden">
                      <ArchetypeIllustratedArtwork archetypeId={arch.id} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3.5 space-y-1.5 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-serif font-bold text-base text-[#F2EFE6] truncate">
                          {arch.emoji} {arch.name}
                        </p>
                        <span className="font-mono text-sm font-bold text-[#D6A84F] shrink-0">
                          {item.normalizedScore}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-[#7B8880]">
                        {getDimensionShortName(arch.dimension)}
                        {aLaParConElSiguiente ? ' · a la par con el siguiente' : ''}
                      </p>
                      {primera && <EvidenceList items={[primera]} archetypeId={item.archetypeId} compact />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Cómo se reparte el mapa, y qué significa el número */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-6">
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-[#F2EFE6]">Cómo se reparte tu mapa</h3>
          <p className="text-xs text-[#9DA79F] leading-relaxed max-w-2xl">
            {result.instrumento === 'dilemas'
              ? 'Cada número compara esa figura con las que compartió pantalla: en qué parte de esas comparaciones la preferiste, en una escala de 10 a 98.'
              : 'Cada número es tu afinidad con las afirmaciones de esa figura, en una escala de 10 a 98.'}{' '}
            No te compara con otras personas ni mide lo que eres, y una diferencia de uno o dos puntos no significa nada.
            {result.instrumento === 'dilemas' &&
              ' El orden sale de tus elecciones directas (y del desempate, si lo hubo): por eso una figura puede ir delante de otra con un número algo menor.'}
            {isQuick &&
              (result.instrumento === 'dilemas'
                ? ' Con el test rápido, cada figura aparece solo cuatro veces: el completo afina más.'
                : ' Con el test rápido, algunas figuras se miden con pocas afirmaciones.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <DimensionBar scores={result.dimensionScores} gender={gender} />
          <RadarChartComponent ranking={result.ranking} size="md" gender={gender} />
        </div>

        {/* Los 18, plegados: el detalle está ahí para quien lo busque, sin ocupar la pantalla */}
        <details className="group rounded-xl border border-[#1E2A25] bg-[#0E1513]">
          <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer list-none text-sm font-semibold text-[#C5CFC7] hover:text-[#F2EFE6]">
            Ver los 18 arquetipos
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="divide-y divide-[#1A2420] border-t border-[#1E2A25]">
            {result.ranking.map(item => {
              const arch = getArchetype(item.archetypeId, gender);
              return (
                <li key={item.archetypeId}>
                  <button
                    type="button"
                    onClick={() => onSelectArchetype(item.archetypeId)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#121A17] transition-colors"
                  >
                    <span className="font-mono text-[11px] text-[#6B7A72] w-5 shrink-0">{item.rank}</span>
                    <span className="text-lg shrink-0">{arch.emoji}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-serif text-sm font-bold text-[#F2EFE6] truncate">{arch.name}</span>
                      <span className="block text-[10px] text-[#7B8880]">{getDimensionShortName(arch.dimension)}</span>
                    </span>
                    <span className="font-mono text-sm text-[#C5CFC7] shrink-0">{item.normalizedScore}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </details>
      </section>

      {/* 5. Lo que menos apareció: sin tratarlo como una carencia */}
      {compositeProfile.developmentArchetypes.length > 0 && (
        <section className="p-6 sm:p-7 rounded-2xl bg-[#121A17] border border-[#23332D] space-y-5">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#D6A84F] font-bold">Para explorar, si te apetece</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F2EFE6]">Lo que menos apareció</h3>
            <p className="text-xs text-[#9DA79F] max-w-2xl leading-relaxed">
              Puntuar poco en una figura no es una carencia: es lo que menos salió en tus respuestas de hoy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {compositeProfile.developmentArchetypes.map(dev => {
              const arch = getArchetype(dev.archetypeId, gender);
              return (
                <div key={dev.archetypeId} className="p-5 rounded-xl bg-[#16201D] border border-[#1E2A25] space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{arch.emoji}</span>
                    <span className="font-serif font-bold text-base text-[#F2EFE6]">{arch.name}</span>
                  </div>
                  <p className="text-xs text-[#C5CFC7] leading-relaxed">{dev.reason}</p>
                  <div className="pt-2 border-t border-[#1E2A25] space-y-1">
                    <span className="text-[11px] font-semibold text-[#D6A84F] block">Una práctica para empezar:</span>
                    <p className="text-xs text-[#9DA79F] italic font-serif">«{dev.activationPractice}»</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Cómo seguir */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#F2EFE6] text-center">¿Cómo quieres seguir?</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSelectTab('ai')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#86EFAC] flex items-center justify-center group-hover:text-[#D6A84F]">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">Habla con tu Mapa</h4>
            <p className="text-xs text-[#9DA79F]">Conversa sobre tu pareja de arquetipos, sus sombras y lo que estás viviendo.</p>
          </button>

          <button
            onClick={() => onSelectTab('challenges')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#86EFAC] flex items-center justify-center group-hover:text-[#D6A84F]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">Retos de Desarrollo</h4>
            <p className="text-xs text-[#9DA79F]">Prácticas cortas para llevar tus arquetipos a la vida diaria.</p>
          </button>

          <button
            onClick={() => onSelectTab('journal')}
            className="p-5 rounded-xl bg-[#121A17] border border-[#23332D] hover:border-[#315C45] text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C45]/20 text-[#86EFAC] flex items-center justify-center group-hover:text-[#D6A84F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#F2EFE6]">Diario de Reflexión</h4>
            <p className="text-xs text-[#9DA79F]">Escribe sobre tus decisiones y qué arquetipo estaba al mando.</p>
          </button>
        </div>
      </section>

      {/* Compartir / repetir */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#1E2A25]">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] border border-[#4E8B69]/50 text-xs font-semibold text-[#F2EFE6] transition-all shadow-lg active:scale-95"
        >
          <Share2 className="w-4 h-4 text-[#D6A84F]" />
          <span>Compartir como imagen</span>
        </button>

        <button
          onClick={onRetakeTest}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#23332D] bg-[#121A17] hover:bg-[#1A2521] text-xs font-semibold text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isQuick ? `Afinar con el test completo (${DILEMAS.length})` : 'Repetir el test'}</span>
        </button>
      </div>

      <ShareResultImageModal
        result={result}
        gender={gender}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
