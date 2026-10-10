import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  X,
  Compass,
  Sun,
  Moon,
  BookOpen,
  Bot,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';
import { ARCHETYPES, getArchetype } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { composeDailyOracleTexts } from '../../services/storageService';
import { enFrase, relacionConTuMapa } from '../../services/personalization';
import { AssessmentResult, DailyOracleCard, GenderMode, DEFAULT_GENDER } from '../../types';

/** De madrugada y por la mañana, la pregunta para orientar el día; desde la tarde, la de repasarlo. */
function momentoDelDia(ahora: Date = new Date()): 'manana' | 'noche' {
  const h = ahora.getHours();
  return h >= 4 && h < 15 ? 'manana' : 'noche';
}

/** «sábado 10 de octubre» a partir de la fecha de la carta, que se guarda como 2026-10-10. */
function formatCardDate(isoDate: string): string {
  // A mediodía para que ningún huso horario la mueva al día anterior.
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
  const month = d.toLocaleDateString('es-ES', { month: 'long' });
  return `${weekday} ${d.getDate()} de ${month}`;
}
import { ArchetypePortraitCard } from './ArchetypePortraitCard';

interface DailyOracleModalProps {
  isOpen: boolean;
  /** Perspectiva activa: la carta del dia tambien habla en ella. */
  gender?: GenderMode;
  onClose: () => void;
  /** Null mientras está cerrada: la carta se calcula al abrirla. */
  card: DailyOracleCard | null;
  /** El mapa de la persona, para decir si la carta de hoy sale de él. */
  currentResult?: AssessmentResult | null;
  onGoToJournalWithPrompt: (prompt: string, archetypeId: string) => void;
  onGoToAiWithPrompt: (prompt: string, personaId: string) => void;
}

export const DailyOracleModal: React.FC<DailyOracleModalProps> = ({
  isOpen,
  gender = DEFAULT_GENDER,
  onClose,
  card,
  currentResult = null,
  onGoToJournalWithPrompt,
  onGoToAiWithPrompt,
}) => {
  // Se muestra la pregunta que toca a esta hora; la otra, a un toque.
  const [momento, setMomento] = useState<'manana' | 'noche'>(() => momentoDelDia());
  // El modal está siempre montado: la hora se mira cada vez que se abre, no al arrancar la app.
  useEffect(() => {
    if (isOpen) setMomento(momentoDelDia());
  }, [isOpen]);
  if (!isOpen || !card) return null;

  const archetype = getArchetype(card.archetypeId, gender) || ARCHETYPES.rey;
  const texts = composeDailyOracleTexts(archetype);
  const pregunta = momento === 'manana' ? texts.morningReflection : texts.eveningInquiry;
  const relacion = relacionConTuMapa(archetype.id, currentResult);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0E1513] border border-[#315C45] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#D6A84F]/15 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#9DA79F] hover:text-[#F2EFE6] bg-[#121A17]/80 hover:bg-[#1A2521] border border-[#23332D] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#1E2A25] relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tu oráculo de hoy</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#F2EFE6]">
            {archetype.emoji} {archetype.name}
          </h2>
          <p className="text-xs text-[#9DA79F] mt-0.5">
            {formatCardDate(card.date)}
            {relacion === 'cabeza' && ' · una de las figuras que encabezan tu mapa'}
            {relacion === 'crecer' && ' · de lo que menos apareció en tu mapa'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Card Presentation with Character Illustration */}
          <div className="rounded-3xl border-2 border-[#D6A84F] bg-[#0E1513] shadow-2xl overflow-hidden relative">
            <div className="h-52 w-full relative">
              <ArchetypePortraitCard
                archetype={archetype}
                size="md"
                showBadge={true}
                className="w-full h-full rounded-none border-0"
              />
            </div>
            <div className="p-4 bg-gradient-to-b from-[#141F1B] to-[#0E1513] text-center border-t border-[#D6A84F]/40 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#D6A84F] tracking-widest block">
                {ARCHETYPE_VISUALS[archetype.id]?.characterTitle || archetype.symbol}
              </span>
              <p className="font-serif italic text-base text-[#F2EFE6] leading-snug px-2">
                "{archetype.mantra}"
              </p>
            </div>
          </div>

          {/* Affirmation & Focus */}
          <div className="p-4 bg-[#121A17] border border-[#23332D] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
              <Sun className="w-4 h-4 text-[#D6A84F]" />
              <span>Tu intención para hoy</span>
            </div>
            <p className="text-xs sm:text-sm text-[#C5CFC7] leading-relaxed">
              {texts.affirmation}
            </p>
          </div>

          {/* La pregunta de esta hora: la de la mañana orienta el día, la de la noche lo repasa */}
          <div className="p-4 bg-[#121A17]/80 border border-[#23332D] rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${momento === 'manana' ? 'text-[#86EFAC]' : 'text-[#93C5FD]'}`}>
                {momento === 'manana' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{momento === 'manana' ? 'Para empezar el día' : 'Para repasar el día'}</span>
              </div>
              <div className="inline-flex rounded-lg bg-[#0E1513] border border-[#23332D] p-0.5 text-[11px]" role="tablist" aria-label="Momento del día">
                {(['manana', 'noche'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={momento === m}
                    onClick={() => setMomento(m)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${momento === m ? 'bg-[#1A2521] text-[#F2EFE6]' : 'text-[#8A968D] hover:text-[#C5CFC7]'}`}
                  >
                    {m === 'manana' ? 'Mañana' : 'Noche'}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-[#C5CFC7] leading-relaxed">{pregunta}</p>
          </div>

          {/* Shadow Warning */}
          <div className="p-3.5 bg-[#1A1514] border border-[#452723] rounded-xl flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-950/60 text-red-400 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">
                Alerta de Sombra del Día: {archetype.shadow}
              </span>
              <p className="text-xs text-[#C5CFC7] mt-0.5">
                {archetype.shadowAntidote}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => {
                onGoToJournalWithPrompt(pregunta, archetype.id);
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
            >
              <BookOpen className="w-4 h-4" />
              <span>Escribir en el Diario</span>
            </button>

            <button
              onClick={() => {
                onGoToAiWithPrompt(
                  momento === 'manana'
                    ? `Mi carta de hoy es ${enFrase(archetype.name)}, y para empezar el día me pregunta: «${pregunta}» ¿Me ayudas a pensarlo?`
                    : `Mi carta de hoy es ${enFrase(archetype.name)}, y para repasar el día me pregunta: «${pregunta}» ¿Me ayudas a mirarlo?`,
                  archetype.id
                );
                onClose();
              }}
              className="py-2.5 px-4 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Bot className="w-4 h-4" />
              <span>Consultar en Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
