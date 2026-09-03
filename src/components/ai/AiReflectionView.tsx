import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  Settings,
  Lightbulb,
  Infinity,
  Zap,
  ChevronDown,
  MoreVertical,
  X,
} from 'lucide-react';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { getArchetypeList, getArchetypeName, getArchetypeNarrative } from '../../data/archetypesData';
import { GeminiService } from '../../services/geminiService';
import { AIProviderService, PROVIDER_OPTIONS } from '../../services/aiProviderService';
import { StorageService } from '../../services/storageService';
import { ArchetypeId, AssessmentResult, ChatMessage, GenderMode, UserProfile } from '../../types';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { AiSettingsModal } from './AiSettingsModal';
import { PerspectiveSwitcher } from '../common/PerspectiveSwitcher';
import { ArchetypePickerModal } from '../archetypes/ArchetypePickerModal';

interface AiReflectionViewProps {
  currentResult: AssessmentResult | null;
  initialPrompt?: string;
  initialPersona?: string;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
}

/** El nombre legible del modelo activo, no su identificador. */
function nombreDelModelo(): string {
  const s = AIProviderService.getSettings();
  const opt = PROVIDER_OPTIONS[s.provider];
  const elegido =
    s.provider === 'openrouter'
      ? s.openrouterModel
      : s.provider === 'gemini'
      ? s.geminiModel
      : s.provider === 'openai'
      ? s.openaiModel
      : undefined;
  const encontrado = opt.availableModels.find(m => m.id === elegido);
  return encontrado ? encontrado.name : opt.name;
}

export const AiReflectionView: React.FC<AiReflectionViewProps> = ({
  currentResult,
  initialPrompt,
  initialPersona = 'general',
  gender: propGender,
  onGenderChange,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const currentGender: GenderMode = propGender || userProfile.gender || 'male';

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageService.getChatMessages()
  );
  const [inputText, setInputText] = useState('');
  const [activePersona, setActivePersona] = useState<string>(initialPersona);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // La eleccion de voz se hace en un selector aparte, no ocupando media pantalla.
  const [isPersonaPickerOpen, setIsPersonaPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [aiUsageState, setAiUsageState] = useState(() => AIProviderService.getUsageStatus());
  const [activeModelName, setActiveModelName] = useState(() => nombreDelModelo());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);

  // Dynamic persona options based on 18 archetypes and active gender
  const personaOptions = useMemo(() => {
    const archetypes = getArchetypeList(currentGender);
    const generalOption = {
      id: 'general',
      name: 'Asistente Integral',
      emoji: '🔮',
      tone: 'Síntesis filosófica y equilibrada de tus 18 arquetipos',
      dimension: 'universal',
    };

    const archOptions = archetypes.map(a => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      tone: a.shortDescription,
      dimension: a.dimension,
    }));

    return [generalOption, ...archOptions];
  }, [currentGender]);

  const selectedPersonaObj =
    personaOptions.find(p => p.id === activePersona) || personaOptions[0];

  const refreshAiStatus = () => {
    const status = AIProviderService.getUsageStatus();
    setAiUsageState(status);
    setActiveModelName(nombreDelModelo());
    setUserProfile(StorageService.getUserProfile());
  };

  // Dynamic suggested prompts from the gender-specific narrative layer
  const currentSamplePrompts = useMemo(() => {
    if (activePersona === 'general') {
      return currentGender === 'female'
        ? [
            '¿Cómo puedo equilibrar la firmeza de mi Guerrera con la sensibilidad de la Amante?',
            '¿Qué sombra arquetípica podría estar jugándome en contra en mi momento actual?',
            '¿Cómo integro mi arquetipo menos desarrollado en mis desafíos cotidianos?',
            '¿Qué prácticas diarias me ayudarían a consolidar la sabiduría de mi Reina interior?',
          ]
        : [
            '¿Cómo puedo equilibrar la exigencia de mi Guerrero con la ternura del Amante?',
            '¿Qué sombra arquetípica podría estar jugándome en contra en mis proyectos?',
            '¿Cómo integro mi arquetipo menos desarrollado en mi vida diaria?',
            '¿Qué hábitos cotidianos me ayudarían a consolidar la soberanía del Rey interior?',
          ];
    }

    try {
      const narrative = getArchetypeNarrative(activePersona as ArchetypeId, currentGender);
      return narrative.reflectionQuestions.length > 0
        ? narrative.reflectionQuestions.slice(0, 4)
        : [
            `¿Cómo puedo manifestar la energía de ${selectedPersonaObj.name} con mayor pureza?`,
            `¿Qué sombra debo vigilar para no caer en el desbalance?`,
            `¿Cuál es el siguiente paso evolutivo para este arquetipo?`,
          ];
    } catch {
      return [
        '¿Cómo puedo integrar las virtudes de este arquetipo en mis decisiones?',
        '¿Qué límites necesito clarificar hoy?',
      ];
    }
  }, [activePersona, currentGender, selectedPersonaObj.name]);

  const scrollToBottom = () => {
    // Dentro de la lista, no de la pagina: en un chat de alto fijo, pedirle a
    // la pagina que se desplace no mueve nada.
    const lista = listaRef.current;
    if (lista) {
      lista.scrollTo({ top: lista.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPersona) {
      setActivePersona(initialPersona);
    }
  }, [initialPersona]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== inputText) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      personaUsed: activePersona !== 'general' ? selectedPersonaObj.name : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    StorageService.saveChatMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await GeminiService.sendMessage(
        text.trim(),
        messages,
        currentResult,
        activePersona,
        userProfile,
        currentGender
      );

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toISOString(),
        personaUsed: activePersona !== 'general' ? selectedPersonaObj.name : undefined,
      };

      const updated = [...newMessages, aiMsg];
      setMessages(updated);
      StorageService.saveChatMessages(updated);
      refreshAiStatus();
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas reiniciar la conversación de reflexión?')) {
      StorageService.clearChatMessages();
      setMessages(StorageService.getChatMessages());
    }
  };

  const dominantName = currentResult
    ? getArchetypeName(currentResult.dominantArchetype.archetypeId, currentGender)
    : '';

  const sinMensajes = !messages.some(m => m.role === 'user');
  // Con clave propia no hay cupo que gastar; con la incluida, si.
  const conCupo = aiUsageState.isUnlimited || aiUsageState.activeKeySource === 'custom';
  const esGeneral = activePersona === 'general';

  /** El rostro de la voz activa: ilustración si es un arquetipo, emblema si no. */
  const Rostro = ({ className = 'w-full h-full' }: { className?: string }) =>
    esGeneral ? (
      <span className="w-full h-full flex items-center justify-center text-[1.5em]">🔮</span>
    ) : (
      <ArchetypeIllustratedArtwork
        archetypeId={activePersona as ArchetypeId}
        className={`${className} object-cover`}
      />
    );

  return (
    <div id="ai-chat-view" className="flex flex-col flex-1 min-h-0">
      {/* ── Cabecera: una sola fila. Lo único permanente es con quién hablas ── */}
      <header className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-[#1A2521] bg-[#0E1513]">
        <button
          type="button"
          onClick={() => setIsPersonaPickerOpen(true)}
          className="group flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-xl px-1.5 py-1 hover:bg-[#141E1B] transition-colors min-h-[44px]"
        >
          <span className="w-9 h-9 shrink-0 rounded-xl overflow-hidden border border-[#23332D] bg-[#121A17] flex items-center justify-center">
            <Rostro />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1">
              <span className="font-serif font-bold text-sm sm:text-base text-[#F2EFE6] truncate">
                {selectedPersonaObj.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[#6B7A72] group-hover:text-[#D6A84F] transition-colors" />
            </span>
            <span className="block text-[10px] text-[#6B7A72] truncate">
              {esGeneral ? 'Toca para elegir una voz' : 'Toca para cambiar de voz'}
            </span>
          </span>
        </button>

        {/* El estado del modelo cabe en escritorio; en móvil vive en el menú */}
        <span className="hidden lg:inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-[#121A17] border border-[#23332D] text-[10px] text-[#9DA79F]">
          {conCupo ? (
            <Infinity className="w-3 h-3 text-[#86EFAC]" />
          ) : (
            <Zap className="w-3 h-3 text-[#D6A84F]" />
          )}
          <span className="max-w-[130px] truncate">{activeModelName}</span>
          {!conCupo && (
            <span className="text-[#D6A84F] font-semibold">
              {aiUsageState.remainingCourtesy}/{aiUsageState.maxDaily}
            </span>
          )}
        </span>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen(o => !o)}
            aria-label="Más opciones"
            aria-expanded={isMenuOpen}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#8A968D] hover:text-[#F2EFE6] hover:bg-[#141E1B] transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-12 z-40 w-64 p-3 rounded-2xl bg-[#0E1513] border border-[#23332D] shadow-2xl space-y-3 animate-fadeInUp">
                {onGenderChange && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7A72]">
                      Perspectiva
                    </span>
                    <PerspectiveSwitcher
                      gender={currentGender}
                      onGenderChange={g => {
                        onGenderChange(g);
                        setIsMenuOpen(false);
                      }}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                )}

                <div className="lg:hidden flex items-center gap-1.5 px-1 text-[11px] text-[#9DA79F]">
                  {conCupo ? (
                    <Infinity className="w-3 h-3 text-[#86EFAC]" />
                  ) : (
                    <Zap className="w-3 h-3 text-[#D6A84F]" />
                  )}
                  <span className="truncate">{activeModelName}</span>
                  {!conCupo && (
                    <span className="shrink-0 text-[#D6A84F] font-semibold">
                      {aiUsageState.remainingCourtesy}/{aiUsageState.maxDaily}
                    </span>
                  )}
                </div>

                <div className="pt-1 border-t border-[#1A2521] space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-xs text-[#C5CFC7] hover:text-[#F2EFE6] hover:bg-[#141E1B] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#D6A84F]" />
                    Ajustes de IA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleClearHistory();
                    }}
                    disabled={sinMensajes}
                    className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-xs text-[#C5CFC7] hover:text-[#F2EFE6] hover:bg-[#141E1B] transition-colors disabled:opacity-40"
                  >
                    <RotateCcw className="w-4 h-4 text-[#8B5A5A]" />
                    Reiniciar conversación
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Los mensajes: lo único que crece ─────────────────────────────── */}
      <div
        ref={listaRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-chat px-3 sm:px-4 py-4 space-y-4"
      >
        {sinMensajes ? (
          /* Nada que leer todavía: se presenta la voz y se ofrece por dónde empezar */
          <div className="min-h-full flex flex-col items-center justify-center text-center gap-4 py-2 max-w-md mx-auto">
            <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-[#23332D] bg-[#121A17] flex items-center justify-center shadow-xl">
              <Rostro />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-serif text-xl font-bold text-[#F2EFE6]">
                {selectedPersonaObj.name}
              </h2>
              <p className="text-xs text-[#9DA79F] leading-relaxed px-2">
                {selectedPersonaObj.tone}
              </p>
              {currentResult && (
                <p className="text-[11px] text-[#718277] pt-1">
                  Conoce tu mapa · dominante{' '}
                  <span className="text-[#D6A84F]">{dominantName}</span>
                </p>
              )}
            </div>

            <div className="w-full space-y-2 pt-1">
              <span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7A72]">
                <Lightbulb className="w-3 h-3 text-[#D6A84F]" />
                Por dónde empezar
              </span>
              {currentSamplePrompts.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="w-full text-left px-3.5 py-3 rounded-xl bg-[#121A17] border border-[#1E2A25] text-xs text-[#C5CFC7] hover:border-[#315C45] hover:text-[#F2EFE6] transition-colors min-h-[48px] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            <p className="flex items-center gap-1.5 text-[10px] text-[#4E5C55] pt-1">
              <ShieldCheck className="w-3 h-3" />
              Reflexión simbólica, no consejo clínico
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const esMio = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center ${
                    esMio
                      ? 'bg-[#1A2521] border-[#23332D] text-[#9DA79F]'
                      : 'bg-[#121A17] border-[#315C45]'
                  }`}
                >
                  {esMio ? <User className="w-4 h-4" /> : <Rostro className="w-full h-full" />}
                </span>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    esMio
                      ? 'bg-[#315C45] text-[#F2EFE6] rounded-tr-sm'
                      : 'bg-[#121A17] border border-[#1E2A25] text-[#C5CFC7] rounded-tl-sm'
                  }`}
                >
                  {esMio ? (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    <>
                      {msg.personaUsed && (
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#D6A84F] mb-1.5">
                          {msg.personaUsed}
                        </span>
                      )}
                      <MarkdownRenderer content={msg.content} />
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <span className="w-8 h-8 shrink-0 rounded-xl overflow-hidden border border-[#315C45] bg-[#121A17] flex items-center justify-center">
              <Rostro className="w-full h-full" />
            </span>
            <span className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-[#121A17] border border-[#1E2A25] text-xs text-[#D6A84F]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Pensando…
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sugerencias en fila, solo mientras la conversación es corta ──── */}
      {!sinMensajes && messages.length < 5 && !isLoading && (
        <div className="shrink-0 flex gap-2 overflow-x-auto touch-scroll-x scrollbar-persona px-3 sm:px-4 pb-2">
          {currentSamplePrompts.slice(0, 3).map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              className="shrink-0 max-w-[70vw] truncate px-3 py-2 rounded-full bg-[#121A17] border border-[#1E2A25] text-[11px] text-[#9DA79F] hover:text-[#F2EFE6] hover:border-[#315C45] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── El compositor: fijo abajo, nunca hay que buscarlo ───────────── */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 px-3 sm:px-4 py-3 border-t border-[#1A2521] bg-[#0E1513]"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2 p-1.5 bg-[#121A17] border border-[#23332D] rounded-2xl focus-within:border-[#D6A84F] transition-colors">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              // Enter envía; con Mayúsculas hace salto de línea. En un móvil el
              // teclado trae su propio salto, así que no se pierde nada.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={`Escribe a ${selectedPersonaObj.name}…`}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent px-2.5 py-2 max-h-32 text-sm text-[#F2EFE6] placeholder-[#5E6C64] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            aria-label="Enviar"
            className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#315C45] to-[#254836] border border-[#4E8B69] flex items-center justify-center text-[#F2EFE6] transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
          >
            {isLoading ? (
              <Bot className="w-4.5 h-4.5 animate-pulse" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </form>

      {/* Elegir la voz: el mismo selector que ya usan el comparador y sinergias */}
      <ArchetypePickerModal
        isOpen={isPersonaPickerOpen}
        onClose={() => setIsPersonaPickerOpen(false)}
        onSelect={id => setActivePersona(id === 'none' ? 'general' : id)}
        currentSelectedId={esGeneral ? 'none' : (activePersona as ArchetypeId)}
        title="¿Con quién quieres hablar?"
        subtitle="Cada arquetipo responde desde su propia mirada. El asistente integral los sintetiza a los 18."
        allowNone
        noneLabel="🔮 Asistente Integral"
        gender={currentGender}
      />

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshAiStatus();
        }}
        onSettingsSaved={refreshAiStatus}
      />
    </div>
  );
};
