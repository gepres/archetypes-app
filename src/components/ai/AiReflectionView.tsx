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
import { getArchetypeList, getArchetypeName, getArchetypeNarrative, withDe } from '../../data/archetypesData';
import { getMapLead } from '../../services/scoringEngine';
import { SenalCrisis, crisisInConversation, senalesDeCrisis, ultimoCierreDeCrisis } from '../../services/crisisSupport';
import { apuntarCierreDelChat, apuntarCrisis, cerrarCrisisDelChat } from '../../services/crisisVigente';
import { GeminiService } from '../../services/geminiService';
import { AIProviderService, describirEstadoIA } from '../../services/aiProviderService';
import { StorageService, conCierreDeCrisis, insertarRespuesta, unirConversaciones } from '../../services/storageService';
import { suggestedPrompts } from '../../services/personalization';
import { ArchetypeId, AssessmentResult, ChatMessage, GenderMode, UserProfile, DEFAULT_GENDER } from '../../types';
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
  /** Se avisa cuando la pregunta inicial se aceptó y se envió, para que no se reenvíe al montar otra vez. */
  onInitialPromptConsumed?: () => void;
  /** Si es la pestaña visible. Fuera de ella el chat sigue montado, oculto. */
  isActive?: boolean;
}

// Las vistas del chat montadas ahora mismo. Una respuesta que llega cuando su vista ya se
// desmontó (se fue a otra pestaña y volvió) avisa a la que esté montada para que la muestre.
const vistasDelChat = new Set<(preguntaId: string, respuesta: ChatMessage, guardada: boolean) => void>();

export const AiReflectionView: React.FC<AiReflectionViewProps> = ({
  currentResult,
  initialPrompt,
  initialPersona = 'general',
  gender: propGender,
  onGenderChange,
  onInitialPromptConsumed,
  isActive = true,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const currentGender: GenderMode = propGender || userProfile.gender || DEFAULT_GENDER;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    StorageService.getChatMessages()
  );
  // De quién es la conversación a la vista: de la cuenta abierta al montarse. Si otra pestaña
  // cambia de cuenta, esta vista no escribe en la conversación de la otra (la app la vuelve a
  // montar con la cuenta nueva).
  const duenoDeLaVista = useRef(StorageService.getUserProfile().id);
  const esDeLaCuentaAbierta = () => StorageService.getUserProfile().id === duenoDeLaVista.current;
  // La conversación vigente, al instante. El estado tarda un render en reflejar un cambio, y en
  // ese hueco pueden pasar cosas que la necesitan: una respuesta inmediata busca su pregunta, o
  // al volver a la pestaña se recarga la conversación y en el mismo momento se envía una
  // consulta de fuera. Quien cambia la conversación la actualiza aquí también, y los envíos
  // construyen sobre ella, no sobre el estado del último render.
  const mensajesRef = useRef(messages);
  mensajesRef.current = messages;
  const ponerMensajes = (lista: ChatMessage[]) => {
    mensajesRef.current = lista;
    setMessages(lista);
  };
  // Un reinicio que no se pudo guardar: hasta que se guarde algo, lo que hay en el disco es
  // justo lo que se quiso borrar, y no se une con nada.
  const reinicioSinGuardarRef = useRef(false);
  /**
   * La conversación sobre la que se escribe entera (enviar, cerrar la crisis): la de la vista
   * unida a la del disco, para no pisar lo que entró por otro lado mientras tanto (mensajes
   * recuperados de la nube al volver a entrar en la misma cuenta).
   */
  const conversacionVigente = () =>
    reinicioSinGuardarRef.current
      ? mensajesRef.current
      : unirConversaciones(StorageService.getChatMessages(), mensajesRef.current);
  const [inputText, setInputText] = useState('');
  const [activePersona, setActivePersona] = useState<string>(initialPersona);
  const [isLoading, setIsLoading] = useState(false);
  // La última escritura de la conversación falló (almacenamiento lleno): se ve, pero no se guardó.
  const [sinGuardar, setSinGuardar] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // La eleccion de voz se hace en un selector aparte, no ocupando media pantalla.
  const [isPersonaPickerOpen, setIsPersonaPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [aiUsageState, setAiUsageState] = useState(() => AIProviderService.getUsageStatus());

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
    setUserProfile(StorageService.getUserProfile());
  };

  // Dynamic suggested prompts from the gender-specific narrative layer
  const currentSamplePrompts = useMemo(() => {
    if (activePersona === 'general') {
      // Con un mapa, las preguntas salen de él; sin mapa, unas de ejemplo.
      const delMapa = suggestedPrompts(currentResult, currentGender);
      if (delMapa) return delMapa;
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
            `¿Cómo puedo manifestar la energía ${withDe(selectedPersonaObj.name)} con mayor pureza?`,
            `¿Qué sombra debo vigilar para no caer en el desbalance?`,
            `¿Cuál es el siguiente paso evolutivo para este arquetipo?`,
          ];
    } catch {
      return [
        '¿Cómo puedo integrar las virtudes de este arquetipo en mis decisiones?',
        '¿Qué límites necesito clarificar hoy?',
      ];
    }
  }, [activePersona, currentGender, selectedPersonaObj.name, currentResult]);

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
    if (isActive) scrollToBottom();
  }, [messages, isLoading, isActive]);

  // Al volver a la pestaña. El chat sigue montado mientras se navega, así que al volver se pone
  // al día: si todo estaba guardado, relee la conversación por si cambió fuera (una
  // importación, la nube); si no, conserva la que tiene, que es la única copia.
  // Solo al pasar de oculto a visible: ni al montar ni en la segunda pasada de StrictMode.
  const activoAntesRef = useRef(isActive);
  useEffect(() => {
    const antes = activoAntesRef.current;
    activoAntesRef.current = isActive;
    if (!isActive || antes) return;
    // Antes que la consulta de fuera que pueda llegar con la vuelta: se envía sobre esta. Si
    // todo estaba guardado, la del disco; si no, la del disco unida a lo que solo tiene la vista.
    ponerMensajes(sinGuardar ? conversacionVigente() : StorageService.getChatMessages());
    refreshAiStatus();
  }, [isActive]);

  useEffect(() => {
    if (initialPersona) {
      setActivePersona(initialPersona);
    }
  }, [initialPersona]);

  // La consulta que llega de fuera (Carta del Día…) se envía en cuanto el chat queda libre, y
  // solo se da por consumida cuando se aceptó: si había una respuesta en camino, espera a que
  // llegue en vez de perderse. Una vez enviada, al remontar el chat no se reenvía. Y solo con
  // el chat a la vista: oculto, su conversación puede estar desfasada (se recuperó otra desde
  // la nube); al volver, el efecto de reactivación la recarga antes que este envíe.
  useEffect(() => {
    // Con la voz que la acompaña: setActivePersona aún no se ha aplicado en este render.
    if (initialPrompt && isActive && !isLoading && handleSend(initialPrompt, initialPersona)) {
      onInitialPromptConsumed?.();
    }
  }, [initialPrompt, isLoading, isActive]);

  // Mientras este chat esté montado. Una respuesta que llega después de desmontarlo no toca
  // esta vista: se guarda en la conversación vigente y avisa a la vista que haya montada.
  const montadoRef = useRef(true);
  useEffect(() => {
    montadoRef.current = true;
    // Cada vista añade la respuesta a la conversación que muestra, detrás de su pregunta, sin
    // releer el disco: si no se pudo guardar (almacenamiento lleno), al menos se ve, y se
    // guarda con la siguiente escritura. Si su pregunta no está aquí (otra cuenta, conversación
    // reiniciada), no hace nada.
    const recibir = (preguntaId: string, respuesta: ChatMessage, guardada: boolean) => {
      const conRespuesta = insertarRespuesta(mensajesRef.current, preguntaId, respuesta);
      if (!conRespuesta) return;
      mensajesRef.current = conRespuesta;
      setMessages(prev => insertarRespuesta(prev, preguntaId, respuesta) ?? prev);
      // Puede poner la marca, nunca quitarla: que se guardara la respuesta no dice que se haya
      // guardado todo lo que esta vista tiene (otra pregunta pudo quedarse sin guardar). Solo la
      // quita guardar la conversación entera: enviar, reiniciar o cerrar la crisis.
      if (!guardada) setSinGuardar(true);
    };
    vistasDelChat.add(recibir);
    return () => {
      montadoRef.current = false;
      vistasDelChat.delete(recibir);
    };
  }, []);

  // Cierra el paso a un segundo envío en el mismo instante, antes de que el estado se entere.
  const enviandoRef = useRef(false);

  /**
   * Envía un mensaje, con la voz activa o con la que se indique. Devuelve si se aceptó: no se
   * acepta vacío ni con otra respuesta en camino.
   */
  const handleSend = (textToSend?: string, persona: string = activePersona): boolean => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading || enviandoRef.current) return false;
    enviandoRef.current = true;
    // De quién es esta conversación. Si mientras llega la respuesta se cambia de cuenta, la
    // respuesta no se guarda: sería guardar la conversación de una cuenta en otra. Y si ya se
    // cambió en otra pestaña, esta vista (de la cuenta anterior) no envía nada.
    const dueno = StorageService.getUserProfile().id;
    if (dueno !== duenoDeLaVista.current) {
      enviandoRef.current = false;
      return false;
    }

    const voz = personaOptions.find(p => p.id === persona) ?? selectedPersonaObj;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      personaUsed: voz.id !== 'general' ? voz.name : undefined,
    };

    // Sobre la conversación vigente, no sobre la del último render (ver mensajesRef), y unida
    // a la del disco para no pisar lo que entró por otro lado.
    const historial = conversacionVigente();
    const newMessages = [...historial, userMsg];
    ponerMensajes(newMessages);
    const guardada = StorageService.saveChatMessages(newMessages);
    if (guardada) reinicioSinGuardarRef.current = false;
    setSinGuardar(!guardada);
    setInputText('');
    setIsLoading(true);
    void pedirRespuesta(text, dueno, userMsg.id, voz, historial);
    return true;
  };

  const pedirRespuesta = async (
    text: string,
    dueno: string,
    preguntaId: string,
    voz: { id: string; name: string },
    historial: ChatMessage[]
  ) => {
    try {
      const reply = await GeminiService.sendMessage(
        text,
        historial,
        currentResult,
        voz.id,
        userProfile,
        currentGender
      );

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toISOString(),
        personaUsed: voz.id !== 'general' ? voz.name : undefined,
      };

      // Se añade a la conversación guardada, no a la copia de este envío: entretanto la vista
      // pudo desmontarse y volver, o la persona pudo escribir otra cosa. Y a la de cada vista
      // montada, para que se vea aunque no se haya podido guardar.
      const guardada = StorageService.addChatReply(dueno, preguntaId, aiMsg)?.guardada ?? false;
      vistasDelChat.forEach(recibir => recibir(preguntaId, aiMsg, guardada));
      if (montadoRef.current) refreshAiStatus();
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      enviandoRef.current = false;
      if (montadoRef.current) setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas reiniciar la conversación de reflexión?')) {
      const { messages: vacia, guardada } = StorageService.clearChatMessages();
      reinicioSinGuardarRef.current = !guardada;
      ponerMensajes(vacia);
      setSinGuardar(!guardada);
    }
  };

  // Mientras una crisis sigue abierta, la persona puede cerrarla diciendo que está a salvo, sin
  // tener que borrar la conversación.
  const crisisAbierta = crisisInConversation(messages);
  // La lectura personal con IA también tiene que saberlo, aunque esta conversación no se haya
  // podido guardar (almacenamiento lleno): se apunta cada señal de crisis (su mensaje y cuándo se
  // escribió) en el registro común. Un cierre explícito vale en todas las pestañas, para las
  // señales anteriores a él.
  const senalesClave = JSON.stringify(senalesDeCrisis(messages));
  useEffect(() => {
    for (const senal of JSON.parse(senalesClave) as SenalCrisis[]) void apuntarCrisis(duenoDeLaVista.current, senal);
  }, [senalesClave]);
  // Y su último «Ya estoy a salvo», con su momento: si solo llegó a guardarse en el chat, que no
  // se pierda al reiniciar la conversación.
  const ultimoCierre = ultimoCierreDeCrisis(messages);
  useEffect(() => {
    if (ultimoCierre !== null) void apuntarCierreDelChat(duenoDeLaVista.current, ultimoCierre);
  }, [ultimoCierre]);

  // Cómo se nombra la cabeza del mapa en la cabecera: sin inventar un dominante si no lo hay.
  const lead = currentResult ? getMapLead(currentResult, currentGender) : null;

  const sinMensajes = !messages.some(m => m.role === 'user');
  // Con clave propia no hay cupo que gastar; con la incluida, si.
  const conCupo = aiUsageState.isUnlimited || aiUsageState.activeKeySource === 'custom';
  // Lo que le importa a quien conversa: cuántas consultas le quedan, no el nombre del modelo.
  const estadoIA = describirEstadoIA(aiUsageState);
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
          <span className={`truncate ${estadoIA.aviso ? 'text-[#D6A84F] font-semibold' : ''}`}>{estadoIA.etiqueta}</span>
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
                  <span className={estadoIA.aviso ? 'text-[#D6A84F]' : ''}>{estadoIA.detalle}</span>
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
              {lead && (
                <p className="text-[11px] text-[#718277] pt-1">
                  Conoce tu mapa ·{' '}
                  {lead.kind === 'single' ? 'dominante ' : ''}
                  <span className="text-[#D6A84F]">{lead.label}</span>
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

      {/* ── La conversación no se pudo guardar en este dispositivo ───────── */}
      {sinGuardar && (
        <p role="status" className="shrink-0 mx-3 sm:mx-4 mb-2 px-3.5 py-2.5 rounded-2xl bg-[#121A17] border border-[#5C4A31] text-[11px] text-[#D6A84F] leading-relaxed">
          No pude guardar la conversación en este dispositivo: puede que el almacenamiento esté lleno. Sigue aquí mientras no cierres la app, y se guardará con tu próximo mensaje si hay espacio.
        </p>
      )}

      {/* ── Crisis abierta: una salida explícita que no obliga a borrar nada ─ */}
      {crisisAbierta && !isLoading && (
        <div className="shrink-0 mx-3 sm:mx-4 mb-2 flex flex-col sm:flex-row sm:items-center gap-2 px-3.5 py-3 rounded-2xl bg-[#121A17] border border-[#315C45]">
          <p className="flex-1 text-[11px] text-[#9DA79F] leading-relaxed">
            Mientras lo necesites, aquí no se habla del mapa. Cuando estés a salvo, puedes volver a él.
          </p>
          <button
            type="button"
            onClick={() => {
              // En el registro común también (hasta este momento, el mismo que lleva la marca del
              // chat), aunque el cierre no llegue a guardarse en el chat. Si otra pestaña cambió
              // de cuenta, se cierra la de esta conversación, y no se guarda en la de la otra.
              const { messages: cerrada, guardada } = cerrarCrisisDelChat(duenoDeLaVista.current, momento =>
                esDeLaCuentaAbierta()
                  ? StorageService.closeCrisis(conversacionVigente(), momento)
                  : { messages: conCierreDeCrisis(mensajesRef.current, momento), guardada: false }
              );
              if (guardada) reinicioSinGuardarRef.current = false;
              ponerMensajes(cerrada);
              setSinGuardar(!guardada);
            }}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-[#315C45] hover:bg-[#3D7055] text-xs font-semibold text-[#F2EFE6] transition-colors"
          >
            Ya estoy a salvo, volver al mapa
          </button>
        </div>
      )}

      {/* ── Sugerencias en fila, solo mientras la conversación es corta ──── */}
      {!sinMensajes && !crisisAbierta && messages.length < 5 && !isLoading && (
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
