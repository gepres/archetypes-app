import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  Compass,
  Lightbulb,
  Flame,
  Crown,
  Sword,
  Scroll,
  Heart,
  Volume2,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST } from '../../data/archetypesData';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';
import { ArchetypeId, AssessmentResult, ChatMessage } from '../../types';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface AiReflectionViewProps {
  currentResult: AssessmentResult | null;
  initialPrompt?: string;
  initialPersona?: string;
}

const PERSONA_OPTIONS: Array<{ id: string; name: string; emoji: string; tone: string }> = [
  { id: 'general', name: 'Asistente Integral', emoji: '🔮', tone: 'Síntesis filosófica y equilibrada' },
  { id: 'rey', name: 'Rey', emoji: '👑', tone: 'Soberanía, orden, bendición y visión de conjunto' },
  { id: 'guerrero', name: 'Guerrero', emoji: '⚔️', tone: 'Disciplina, límites firmes, coraje e impecabilidad' },
  { id: 'mago', name: 'Mago', emoji: '🔮', tone: 'Estrategia, discernimiento y transformación profunda' },
  { id: 'amante', name: 'Amante', emoji: '🔥', tone: 'Sensibilidad, pasión, belleza y afecto auténtico' },
  { id: 'padre', name: 'Padre', emoji: '🏛️', tone: 'Sostén generativo, guía madura y legado' },
  { id: 'cuidador', name: 'Cuidador', emoji: '🛡️', tone: 'Compasión, servicio altruista y sanación' },
  { id: 'bufon', name: 'Bufón', emoji: '🃏', tone: 'Humor sabio, ligereza y desmitificación sagrada' },
  { id: 'explorador', name: 'Explorador', emoji: '🧭', tone: 'Libertad, aventura y búsqueda de autenticidad' },
  { id: 'creador', name: 'Creador', emoji: '🎨', tone: 'Originalidad, oficio artesanal y manifestación' },
  { id: 'sabio', name: 'Sabio', emoji: '📜', tone: 'Verdad esencial, ecuanimidad y filosofía estoica' },
  { id: 'heroe', name: 'Héroe', emoji: '⚡', tone: 'Superación de límites, misión noble y coraje épico' },
  { id: 'rebelde', name: 'Rebelde', emoji: '⚡', tone: 'Disrupción de lo caduco y verdad sin concesiones' },
];

export const AiReflectionView: React.FC<AiReflectionViewProps> = ({
  currentResult,
  initialPrompt,
  initialPersona = 'general',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageService.getChatMessages()
  );
  const [inputText, setInputText] = useState('');
  const [activePersona, setActivePersona] = useState<string>(initialPersona);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedPersonaObj = PERSONA_OPTIONS.find(p => p.id === activePersona) || PERSONA_OPTIONS[0];

  const samplePromptsByPersona: Record<string, string[]> = {
    general: [
      '¿Cómo puedo equilibrar la exigencia de mi Guerrero con la ternura del Amante?',
      '¿Qué sombra arquetípica podría estar jugándome en contra en mis proyectos?',
      '¿Cómo integro mi arquetipo menos desarrollado en mi vida diaria?',
      '¿Qué hábitos cotidianos me ayudarían a consolidar mi arquetipo dominante?',
    ],
    rey: [
      'Rey interior: ¿En qué área de mi vida estoy abdicando y permitiendo el caos?',
      '¿Cómo puedo liderar con generosidad sin caer en el autoritarismo?',
      '¿A quién o qué proyectos necesito bendecir y respaldar hoy?',
    ],
    guerrero: [
      'Guerrero: ¿Qué límite innegociable necesito poner hoy para cuidar mi energía?',
      '¿Cómo puedo cultivar la disciplina sin volverme un verdugo de mí mismo?',
      '¿Qué batalla secundaria estoy peleando que debería abandonar con dignidad?',
    ],
    mago: [
      'Mago: ¿Qué patrón oculto estoy repitiendo sin darme cuenta?',
      '¿Cómo traduzco mis teorías y reflexiones en una acción práctica hoy?',
      '¿Cómo evito la trampa del aislamiento intelectual o la soberbia?',
    ],
    amante: [
      'Amante: ¿Dónde me he vuelto frío o excesivamente utilitario?',
      '¿Cómo abro mi corazón a la intimidad sin perder mi propia individualidad?',
      '¿Qué belleza o disfrute necesito regalarme hoy para reconectar con la vida?',
    ],
    sabio: [
      'Sabio: ¿Cuál es la verdad esencial detrás del conflicto que estoy viviendo?',
      '¿Cómo cultivo la ecuanimidad y la calma ante la incertidumbre?',
      '¿Qué lectura o silencio reflexivo me conviene adoptar en esta etapa?',
    ],
  };

  const currentSamplePrompts =
    samplePromptsByPersona[activePersona] || samplePromptsByPersona.general;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial prompt if passed
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
        activePersona
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

  return (
    <div id="ai-reflection-view" className="max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121A17] via-[#16221E] to-[#0F1714] border border-[#23332D] rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
              <Bot className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>Diálogo Filosófico Simbólico</span>
            </div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#F2EFE6] tracking-tight">
              Habla con tu Mapa & la Voz de tus Arquetipos
            </h1>
            <p className="text-xs sm:text-sm text-[#9DA79F]">
              {currentResult
                ? `Contextualizado con tu arquetipo central: ${currentResult.dominantArchetype.name}`
                : 'Diálogo abierto para indagar en cualquier desafío o encrucijada personal.'}
            </p>
          </div>

          <button
            onClick={handleClearHistory}
            className="px-3 py-2 bg-[#0E1513] hover:bg-[#1A2521] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            title="Reiniciar diálogo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>

        {/* Persona Selector Bar with Custom Scroll */}
        <div className="mt-4 pt-3.5 border-t border-[#1E2A25] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-[#D6A84F] tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#86EFAC] shrink-0" />
              <span>Voz Activa:</span>
              <span className="text-[#F2EFE6] font-semibold">{selectedPersonaObj.name}</span>
            </span>
            <span className="text-[11px] text-[#9DA79F] italic line-clamp-1 max-w-[200px] sm:max-w-none text-right">
              {ARCHETYPE_VISUALS[activePersona as ArchetypeId]?.characterTitle || selectedPersonaObj.tone}
            </span>
          </div>

          {/* Persona selector scrollable track with customized scrollbar & smooth momentum */}
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto pb-2.5 pt-1 px-1 touch-scroll-x scrollbar-persona">
              {PERSONA_OPTIONS.map(persona => {
                const isActive = activePersona === persona.id;
                const isGeneral = persona.id === 'general';
                const isArchetype = !isGeneral;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setActivePersona(persona.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 border select-none active:scale-95 ${
                      isActive
                        ? isGeneral
                          ? 'bg-gradient-to-r from-[#1E2E27] to-[#15241E] text-[#F2EFE6] border-[#D6A84F] shadow-lg shadow-[#D6A84F]/10 font-bold ring-1 ring-[#D6A84F]/60'
                          : 'bg-[#1E2E27] text-[#F2EFE6] border-[#D6A84F] shadow-lg font-bold'
                        : isGeneral
                        ? 'bg-[#121E19] text-[#C5CFC7] hover:text-[#F2EFE6] border-[#2A4436] hover:border-[#315C45]'
                        : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border-[#23332D] hover:border-[#315C45]'
                    }`}
                  >
                    {isGeneral ? (
                      <div className="w-6 h-6 rounded-full bg-[#1A2C23] border border-[#D6A84F]/80 flex items-center justify-center text-xs text-[#D6A84F] shadow-inner shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
                      </div>
                    ) : isArchetype ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-[#D6A84F]/60 shrink-0 bg-[#0B1110]">
                        <ArchetypeIllustratedArtwork archetypeId={persona.id as ArchetypeId} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-sm">{persona.emoji}</span>
                    )}
                    <span className="tracking-tight">{persona.name}</span>
                    {isGeneral && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D6A84F]/20 text-[#D6A84F] font-bold uppercase tracking-wider hidden sm:inline">
                        Síntesis
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Box with Custom Scroll */}
      <div className="bg-[#121A17] border border-[#23332D] rounded-3xl p-3.5 sm:p-6 min-h-[360px] h-[52vh] sm:h-[520px] max-h-[640px] overflow-y-auto space-y-4 sm:space-y-5 shadow-inner scrollbar-chat touch-scroll-x">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isArchetype = activePersona !== 'general';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
            >
              {/* Avatar Icon / Character Portrait */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-md overflow-hidden ${
                  isUser
                    ? 'bg-[#315C45] text-[#F2EFE6] border border-[#437A5C]'
                    : activePersona === 'general'
                    ? 'bg-[#15241E] text-[#D6A84F] border border-[#D6A84F]/70'
                    : 'bg-[#0E1513] text-[#D6A84F] border border-[#D6A84F]/60'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : activePersona === 'general' ? (
                  <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                ) : isArchetype ? (
                  <ArchetypeIllustratedArtwork archetypeId={activePersona as ArchetypeId} className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedPersonaObj.emoji}</span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 space-y-1.5 shadow-md leading-relaxed text-xs sm:text-sm break-words overflow-hidden ${
                  isUser
                    ? 'bg-[#162620] border border-[#315C45]/50 text-[#F2EFE6]'
                    : 'bg-[#0E1513] border border-[#23332D] text-[#C5CFC7]'
                }`}
              >
                {/* Persona Tag */}
                {msg.personaUsed && (
                  <div className="text-[10px] text-[#D6A84F] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]" />
                    <span>Voz: {msg.personaUsed}</span>
                  </div>
                )}

                {isUser ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-[#F2EFE6]">{msg.content}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}

                <div
                  className={`text-[10px] pt-1 ${
                    isUser ? 'text-[#86EFAC]/70 text-right' : 'text-[#6B7A72]'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3.5 items-start">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0E1513] border border-[#23332D] flex items-center justify-center text-[#D6A84F] shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-[#D6A84F]" />
            </div>
            <div className="p-3.5 sm:p-4 bg-[#0E1513] border border-[#23332D] rounded-2xl flex items-center gap-2 text-xs text-[#9DA79F]">
              <span className="w-2 h-2 rounded-full bg-[#D6A84F] animate-pulse" />
              <span>Sintonizando la sabiduría del {selectedPersonaObj.name}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Container */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9DA79F]">
          <Lightbulb className="w-3.5 h-3.5 text-[#D6A84F]" />
          <span>Sugerencias para el {selectedPersonaObj.name}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentSamplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-left text-xs bg-[#121A17] hover:bg-[#1A2521] text-[#C5CFC7] hover:text-[#F2EFE6] border border-[#23332D] hover:border-[#315C45] px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 relative"
      >
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Escribe tu consulta o dilema personal para el ${selectedPersonaObj.name}...`}
          rows={2}
          className="flex-1 px-4 py-3 bg-[#121A17] border border-[#23332D] rounded-2xl text-xs sm:text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F] resize-none shadow-lg transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 sm:px-5 bg-[#315C45] hover:bg-[#3D7055] disabled:opacity-50 text-[#F2EFE6] rounded-2xl font-semibold transition-all shadow-md flex items-center justify-center shrink-0 active:scale-95 min-h-[44px]"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Ethical & Model Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#0E1513] border border-[#1E2A25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#6B7A72]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#315C45] shrink-0" />
          <span>
            Marco simbólico de autorreflexión. No constituye diagnóstico ni asesoramiento psicológico profesional.
          </span>
        </div>
        <span className="text-[#D6A84F] font-semibold shrink-0">Gemini Flash Activo</span>
      </div>
    </div>
  );
};
