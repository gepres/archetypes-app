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
  Volume2,
  Infinity,
  Zap,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Layers,
} from 'lucide-react';
import { ARCHETYPE_VISUALS } from '../../data/archetypeImages';
import { getArchetype, getArchetypeList, getArchetypeName, getArchetypeNarrative, DIMENSIONS } from '../../data/archetypesData';
import { GeminiService } from '../../services/geminiService';
import { AIProviderService, PROVIDER_OPTIONS } from '../../services/aiProviderService';
import { StorageService } from '../../services/storageService';
import { ArchetypeId, AssessmentResult, ChatMessage, GenderMode, UserProfile } from '../../types';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { AiSettingsModal } from './AiSettingsModal';
import { PerspectiveSwitcher } from '../common/PerspectiveSwitcher';

interface AiReflectionViewProps {
  currentResult: AssessmentResult | null;
  initialPrompt?: string;
  initialPersona?: string;
  gender?: GenderMode;
  onGenderChange?: (gender: GenderMode) => void;
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
  const [personaViewMode, setPersonaViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>('todos');

  const [aiUsageState, setAiUsageState] = useState(() => AIProviderService.getUsageStatus());
  const [activeModelName, setActiveModelName] = useState(() => {
    const s = AIProviderService.getSettings();
    return s.provider === 'openrouter' ? (s.openrouterModel || 'Llama 3.3 70B') : s.provider;
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const personaScrollRef = useRef<HTMLDivElement | null>(null);

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

  const filteredPersonaOptions = useMemo(() => {
    if (selectedDimensionFilter === 'todos') return personaOptions;
    return personaOptions.filter(
      p => p.id === 'general' || p.dimension.toLowerCase() === selectedDimensionFilter.toLowerCase()
    );
  }, [personaOptions, selectedDimensionFilter]);

  const selectedPersonaObj =
    personaOptions.find(p => p.id === activePersona) || personaOptions[0];

  const scrollPersonas = (direction: 'left' | 'right') => {
    if (personaScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      personaScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const refreshAiStatus = () => {
    const status = AIProviderService.getUsageStatus();
    setAiUsageState(status);
    const s = AIProviderService.getSettings();
    const opt = PROVIDER_OPTIONS[s.provider];
    let modelName = opt.name;
    if (s.provider === 'openrouter') {
      const found = opt.availableModels.find(m => m.id === s.openrouterModel);
      modelName = found ? found.name : 'Llama 3.3 70B';
    } else if (s.provider === 'gemini') {
      const found = opt.availableModels.find(m => m.id === s.geminiModel);
      modelName = found ? found.name : 'Gemini 2.5 Flash';
    } else if (s.provider === 'openai') {
      const found = opt.availableModels.find(m => m.id === s.openaiModel);
      modelName = found ? found.name : 'GPT-4o Mini';
    }
    setActiveModelName(modelName);
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

  return (
    <div id="ai-reflection-view" className="max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121A17] via-[#16221E] to-[#0F1714] border border-[#23332D] rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2521] border border-[#315C45] text-[#D6A84F] text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
                <Bot className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>Diálogo Filosófico Simbólico</span>
              </div>

              {/* Perspective Indicator / Switcher */}
              {onGenderChange ? (
                <PerspectiveSwitcher
                  gender={currentGender}
                  onGenderChange={onGenderChange}
                  size="sm"
                  showLabel={false}
                />
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16221E] border border-[#315C45]/50 text-neutral-300 text-[11px]">
                  <span>
                    {currentGender === 'female'
                      ? '🌸 Perspectiva Femenina'
                      : currentGender === 'universal'
                      ? '☯ Perspectiva Universal'
                      : '🏛️ Perspectiva Masculina'}
                  </span>
                </div>
              )}

              {/* Active Provider / Quota Badge */}
              <button
                id="open-ai-settings-pill-btn"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/90 border border-amber-500/30 text-amber-300 text-[11px] hover:bg-neutral-800 transition-colors shadow-sm"
              >
                {aiUsageState.isUnlimited ? (
                  <Infinity className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="font-medium">{activeModelName}</span>
                {aiUsageState.activeKeySource === 'none' && (
                  <span className="text-[10px] text-amber-400 ml-1">(sin clave)</span>
                )}
                {aiUsageState.activeKeySource === 'app' && (
                  <span className="text-[10px] text-neutral-400 ml-1">
                    ({aiUsageState.remainingCourtesy}/{aiUsageState.maxDaily})
                  </span>
                )}
                <Settings className="w-3 h-3 text-neutral-400 ml-0.5" />
              </button>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#F2EFE6] tracking-tight">
              Habla con tu Mapa & la Voz de tus 18 Arquetipos
            </h1>
            <p className="text-xs sm:text-sm text-[#9DA79F]">
              {currentResult
                ? `Contextualizado con tu arquetipo central: ${dominantName}`
                : 'Diálogo socrático abierto para indagar en cualquier desafío o encrucijada vital.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="open-ai-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45]/60 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Configuración de IA y Proveedores"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes IA</span>
            </button>

            <button
              id="reset-chat-dialog-btn"
              onClick={handleClearHistory}
              className="px-3 py-2 bg-[#0E1513] hover:bg-[#1A2521] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#23332D] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
              title="Reiniciar diálogo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Enhanced Persona Selector Section */}
        <div className="pt-3.5 border-t border-[#1E2A25] space-y-3">
          {/* Header Row with Active Persona Info & View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-[#D6A84F] tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Voz Activa:</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#1D3228] border border-[#315C45] text-[#F2EFE6] font-serif font-bold text-sm flex items-center gap-1.5">
                <span>{selectedPersonaObj.emoji}</span>
                <span>{selectedPersonaObj.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Carousel Scroll Controls */}
              {personaViewMode === 'carousel' && (
                <div className="flex items-center gap-1 bg-[#0E1513] p-1 rounded-xl border border-[#23332D]">
                  <button
                    onClick={() => scrollPersonas('left')}
                    className="p-1.5 rounded-lg hover:bg-[#1A2521] text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
                    title="Desplazar a la izquierda"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-[#6B7A72] px-1 font-mono">19 voces</span>
                  <button
                    onClick={() => scrollPersonas('right')}
                    className="p-1.5 rounded-lg hover:bg-[#1A2521] text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
                    title="Desplazar a la derecha"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* View Mode Toggle Button */}
              <button
                onClick={() => setPersonaViewMode(m => (m === 'carousel' ? 'grid' : 'carousel'))}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  personaViewMode === 'grid'
                    ? 'bg-[#315C45] text-[#F2EFE6] border-[#4E8B69]'
                    : 'bg-[#121A17] text-[#C5CFC7] border-[#23332D] hover:border-[#315C45]'
                }`}
                title={personaViewMode === 'grid' ? 'Cambiar a vista carrusel' : 'Ver todos en cuadrícula'}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#D6A84F]" />
                <span>{personaViewMode === 'grid' ? 'Vista Carrusel' : 'Ver Cuadrícula'}</span>
              </button>
            </div>
          </div>

          {/* Dimension Filter Tabs for fast navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-[#6B7A72] shrink-0 font-medium">Filtrar:</span>
            {[
              { id: 'todos', label: 'Todos (19)' },
              { id: 'mente', label: 'Mente' },
              { id: 'accion', label: 'Acción' },
              { id: 'corazon', label: 'Corazón' },
              { id: 'construccion', label: 'Construcción' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDimensionFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                  selectedDimensionFilter === tab.id
                    ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                    : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border border-[#1E2A25]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Persona Selection Area: Carousel or Full Grid */}
          {personaViewMode === 'carousel' ? (
            <div className="relative">
              <div
                ref={personaScrollRef}
                className="flex gap-2.5 overflow-x-auto pb-3 pt-1 px-1 touch-scroll-x scrollbar-persona scroll-smooth"
              >
                {filteredPersonaOptions.map(persona => {
                  const isActive = activePersona === persona.id;
                  const isGeneral = persona.id === 'general';
                  const isArchetype = !isGeneral;
                  return (
                    <button
                      key={persona.id}
                      id={`persona-btn-${persona.id}`}
                      onClick={() => setActivePersona(persona.id)}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 border select-none active:scale-95 ${
                        isActive
                          ? isGeneral
                            ? 'bg-gradient-to-r from-[#1E2E27] to-[#15241E] text-[#F2EFE6] border-[#D6A84F] shadow-lg shadow-[#D6A84F]/15 font-bold ring-2 ring-[#D6A84F]'
                            : 'bg-[#1E2E27] text-[#F2EFE6] border-[#D6A84F] shadow-lg font-bold ring-2 ring-[#D6A84F]'
                          : isGeneral
                          ? 'bg-[#121E19] text-[#C5CFC7] hover:text-[#F2EFE6] border-[#2A4436] hover:border-[#315C45]'
                          : 'bg-[#0E1513] text-[#9DA79F] hover:text-[#F2EFE6] border-[#23332D] hover:border-[#315C45]'
                      }`}
                    >
                      {isGeneral ? (
                        <div className="w-7 h-7 rounded-full bg-[#1A2C23] border border-[#D6A84F] flex items-center justify-center text-xs text-[#D6A84F] shadow-inner shrink-0">
                          <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                        </div>
                      ) : isArchetype ? (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D6A84F]/80 shrink-0 bg-[#0B1110]">
                          <ArchetypeIllustratedArtwork
                            archetypeId={persona.id as ArchetypeId}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-sm">{persona.emoji}</span>
                      )}
                      <span className="tracking-tight text-xs font-semibold">{persona.name}</span>
                      {isGeneral && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D6A84F]/20 text-[#D6A84F] font-bold uppercase tracking-wider">
                          Síntesis
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid View: All 18 archetypes + general persona clearly visible */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-chat">
              {filteredPersonaOptions.map(persona => {
                const isActive = activePersona === persona.id;
                const isGeneral = persona.id === 'general';
                const isArchetype = !isGeneral;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setActivePersona(persona.id);
                      setPersonaViewMode('carousel');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-[#1E2E27] border-[#D6A84F] text-[#F2EFE6] font-bold ring-2 ring-[#D6A84F]'
                        : 'bg-[#0E1513] border-[#23332D] text-[#9DA79F] hover:text-[#F2EFE6] hover:border-[#315C45]'
                    }`}
                  >
                    {isGeneral ? (
                      <div className="w-7 h-7 rounded-full bg-[#1A2C23] border border-[#D6A84F] flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
                      </div>
                    ) : isArchetype ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D6A84F]/80 shrink-0 bg-[#0B1110]">
                        <ArchetypeIllustratedArtwork
                          archetypeId={persona.id as ArchetypeId}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span>{persona.emoji}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-[#F2EFE6]">{persona.name}</p>
                      <p className="text-[10px] text-[#6B7A72] truncate">
                        {isGeneral ? 'Síntesis global' : persona.dimension}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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

              {/* Message bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-[#315C45] text-[#F2EFE6] rounded-tr-none border border-[#437A5C]'
                    : 'bg-[#16201D] text-[#E3DDCF] rounded-tl-none border border-[#23332D]'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#23332D]">
                    <span className="font-serif font-bold text-xs text-[#D6A84F] flex items-center gap-1.5">
                      <span>{selectedPersonaObj.emoji}</span>
                      <span>{msg.personaUsed || selectedPersonaObj.name}</span>
                    </span>
                    <span className="text-[10px] text-[#6B7A72]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-[#D6A84F] p-3 rounded-xl bg-[#16201D]/60 border border-[#23332D] w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-[#86EFAC]" />
            <span className="font-medium animate-pulse">
              {selectedPersonaObj.name} está articulando una respuesta...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions based on Active Persona */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[#D6A84F] font-semibold">
          <Lightbulb className="w-3.5 h-3.5 text-[#86EFAC]" />
          <span>Indagaciones recomendadas para {selectedPersonaObj.name}:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentSamplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-left p-2.5 rounded-xl bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] hover:border-[#315C45] text-xs text-[#C5CFC7] hover:text-[#F2EFE6] transition-all flex items-start gap-2"
            >
              <span className="text-[#D6A84F] mt-0.5 font-bold">›</span>
              <span className="line-clamp-2">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 p-2 bg-[#121A17] border border-[#315C45] rounded-2xl shadow-xl focus-within:border-[#D6A84F] transition-all"
      >
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Consulta o reflexiona con la voz de ${selectedPersonaObj.name}...`}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none disabled:opacity-50"
        />
        <button
          id="chat-submit-btn"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 bg-[#315C45] hover:bg-[#3D7055] disabled:bg-[#1A2521] disabled:text-[#6B7A72] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md"
        >
          <span>Preguntar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshAiStatus();
        }}
      />
    </div>
  );
};

