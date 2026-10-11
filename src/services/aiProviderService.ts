import { getArchetype, getArchetypeNarrative, getArchetypeName } from '../data/archetypesData';
import {
  AIProviderId,
  AISettings,
  ArchetypeId,
  AssessmentResult,
  ChatMessage,
  GenderMode,
  UserProfile,
  DEFAULT_GENDER,
} from '../types';
import { getMapLead } from './scoringEngine';
import {
  CRISIS_ACTIVE_NOTE,
  CRISIS_FOLLOWUP,
  CRISIS_PROTOCOL,
  CRISIS_RESPONSE,
  crisisInConversation,
  detectCrisis,
} from './crisisSupport';
import { motivoAmable, notaConsultasAgotadas } from './estadoAsistente';
import { fechaLocal } from './fechaLocal';
export { describirEstadoIA } from './estadoAsistente';

// Cómo se llama cada perspectiva en el prompt. Es una preferencia de lenguaje para nombrar los
// arquetipos, no un dato sobre el género de quien usa la app.
const PERSPECTIVE_LABEL: Record<GenderMode, string> = {
  male: 'MASCULINA',
  female: 'FEMENINA',
  universal: 'UNIVERSAL',
};

const PERSPECTIVE_EXAMPLES: ArchetypeId[] = ['rey', 'guerrero', 'mago', 'sabio', 'padre', 'cuidador'];

// Claves incluidas con la app, inyectadas desde el .env por vite.config.ts.
export const APP_KEYS = {
  openrouter: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
  openai: import.meta.env.VITE_OPENAI_API_KEY || '',
};

export const DEFAULT_COURTESY_DAILY_LIMIT = 10;

const STORAGE_KEY_AI_SETTINGS = 'archetypes_ai_settings_v1';

export interface ProviderOption {
  id: AIProviderId;
  name: string;
  tagline: string;
  icon: string;
  defaultModel: string;
  availableModels: Array<{ id: string; name: string; description: string; recommended?: boolean }>;
  keyPlaceholder: string;
  getKeyUrl: string;
}

export const PROVIDER_OPTIONS: Record<AIProviderId, ProviderOption> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    tagline: 'Varios modelos actuales en un solo lugar: Claude, Gemini, GPT, DeepSeek y Llama.',
    icon: '🌐',
    // Modelos comprobados en octubre de 2026 (lista pública de OpenRouter y una llamada de
    // prueba con la clave de cortesía). Si uno se retira, los ajustes guardados pasan al
    // recomendado (ver normalizeSettings).
    defaultModel: 'anthropic/claude-haiku-5.5',
    availableModels: [
      {
        id: 'anthropic/claude-haiku-5.5',
        name: 'Claude Haiku 5.5',
        description: 'Tono cálido, preciso y empático. El más económico de la lista.',
        recommended: true,
      },
      {
        id: 'google/gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        description: 'Rápido y muy bueno en español, con buen razonamiento.',
      },
      {
        id: 'openai/gpt-6-luna',
        name: 'GPT-6 Luna',
        description: 'Versátil y económico, con respuestas claras y ordenadas.',
      },
      {
        id: 'deepseek/deepseek-v4.1-flash',
        name: 'DeepSeek V4.1 Flash',
        description: 'Razonamiento cuidadoso para preguntas que piden pensar despacio.',
      },
      {
        id: 'meta-llama/llama-4-maverick',
        name: 'Llama 4 Maverick',
        description: 'Modelo abierto de Meta, equilibrado y directo.',
      },
    ],
    keyPlaceholder: 'sk-or-v1-...',
    getKeyUrl: 'https://openrouter.ai/keys',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Los modelos Gemini de Google, directamente desde Google AI Studio.',
    icon: '🔮',
    // Comprobados en octubre de 2026 con la clave de cortesía (los Pro no entran en su cupo).
    defaultModel: 'gemini-3.8-flash',
    availableModels: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        description: 'El Flash más reciente: rápido, muy bueno en español y con buen razonamiento.',
        recommended: true,
      },
      {
        id: 'gemini-3.5-flash-lite',
        name: 'Gemini 3.5 Flash-Lite',
        description: 'El más ligero y rápido, para respuestas breves.',
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Estable y probado, de la generación anterior.',
      },
    ],
    keyPlaceholder: 'AIzaSy...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    tagline: 'Los modelos GPT de OpenAI, con tu propia clave.',
    icon: '🤖',
    defaultModel: 'gpt-6-luna',
    availableModels: [
      {
        id: 'gpt-6-luna',
        name: 'GPT-6 Luna',
        description: 'Económico y rápido, con respuestas claras y ordenadas.',
        recommended: true,
      },
      {
        id: 'gpt-6-sol',
        name: 'GPT-6 Sol',
        description: 'El más capaz de OpenAI, para conversaciones más profundas.',
      },
    ],
    keyPlaceholder: 'sk-...',
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
  local: {
    id: 'local',
    name: 'Modo Local Simbólico',
    tagline: 'Respuestas contextuales arquetípicas sin conexión ni consumo de tokens',
    icon: '🏛️',
    defaultModel: 'sintesis-local',
    availableModels: [
      {
        id: 'sintesis-local',
        name: 'Motor Arquetípico Integrado',
        description: 'Algoritmo de reflexión filosófica basado en tus datos sin enviar información a servidores externos.',
        recommended: true,
      },
    ],
    keyPlaceholder: '',
    getKeyUrl: '',
  },
};

export const AIProviderService = {
  getSettings(): AISettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.normalizeSettings(parsed);
      }
    } catch (e) {
      console.error('Error reading AI settings:', e);
    }
    return this.getDefaultSettings();
  },

  saveSettings(settings: AISettings): void {
    try {
      const normalized = this.normalizeSettings(settings);
      localStorage.setItem(STORAGE_KEY_AI_SETTINGS, JSON.stringify(normalized));
    } catch (e) {
      console.error('Error saving AI settings:', e);
    }
  },

  getDefaultSettings(): AISettings {
    const today = fechaLocal();
    const hasDefaultOpenRouter = Boolean(APP_KEYS.openrouter);
    const defaultProvider: AIProviderId = hasDefaultOpenRouter ? 'openrouter' : 'local';

    return {
      provider: defaultProvider,
      geminiKeyMode: 'courtesy',
      openrouterKeyMode: 'courtesy',
      useAppCourtesyKey: true,
      geminiModel: PROVIDER_OPTIONS.gemini.defaultModel,
      openaiModel: PROVIDER_OPTIONS.openai.defaultModel,
      openrouterModel: PROVIDER_OPTIONS.openrouter.defaultModel,
      courtesyQuota: {
        lastResetDate: today,
        usedToday: 0,
        maxDaily: DEFAULT_COURTESY_DAILY_LIMIT,
      },
    };
  },

  normalizeSettings(settings: Partial<AISettings>): AISettings {
    const defaults = this.getDefaultSettings();
    // Un modelo guardado que ya no se ofrece (se retiró, como Claude 3.5 Haiku) daría error al
    // conversar: pasa al recomendado de su proveedor.
    const vigente = (provider: 'openrouter' | 'gemini' | 'openai', id: string | undefined) =>
      id && PROVIDER_OPTIONS[provider].availableModels.some(m => m.id === id) ? id : undefined;
    settings = {
      ...settings,
      openrouterModel: vigente('openrouter', settings.openrouterModel),
      geminiModel: vigente('gemini', settings.geminiModel),
      openaiModel: vigente('openai', settings.openaiModel),
    };
    const today = fechaLocal();

    const quota = settings.courtesyQuota || defaults.courtesyQuota;
    if (quota.lastResetDate !== today) {
      quota.lastResetDate = today;
      quota.usedToday = 0;
    }

    return {
      provider: settings.provider || defaults.provider,
      geminiKeyMode: settings.geminiKeyMode || defaults.geminiKeyMode,
      openrouterKeyMode: settings.openrouterKeyMode || defaults.openrouterKeyMode,
      geminiApiKey: settings.geminiApiKey,
      openaiApiKey: settings.openaiApiKey,
      openrouterApiKey: settings.openrouterApiKey,
      geminiModel: settings.geminiModel || defaults.geminiModel,
      openaiModel: settings.openaiModel || defaults.openaiModel,
      openrouterModel: settings.openrouterModel || defaults.openrouterModel,
      useAppCourtesyKey: settings.useAppCourtesyKey ?? defaults.useAppCourtesyKey,
      courtesyQuota: quota,
    };
  },

  getUsageStatus(): {
    isUnlimited: boolean;
    provider: AIProviderId;
    activeKeySource: 'custom' | 'app' | 'local' | 'none';
    remainingCourtesy: number;
    maxDaily: number;
    usedToday: number;
  } {
    const settings = this.getSettings();
    const provider = settings.provider;
    const sinCupo = { remainingCourtesy: 0, maxDaily: 0, usedToday: 0 };

    if (provider === 'local') {
      return { isUnlimited: true, provider, activeKeySource: 'local', ...sinCupo };
    }

    if (this.getUserKeyFor(provider)) {
      return { isUnlimited: true, provider, activeKeySource: 'custom', ...sinCupo };
    }

    if (this.getAppKeyFor(provider)) {
      const usedToday = settings.courtesyQuota?.usedToday || 0;
      const maxDaily = settings.courtesyQuota?.maxDaily || DEFAULT_COURTESY_DAILY_LIMIT;
      return {
        isUnlimited: false,
        provider,
        activeKeySource: 'app',
        remainingCourtesy: Math.max(0, maxDaily - usedToday),
        maxDaily,
        usedToday,
      };
    }

    return { isUnlimited: true, provider, activeKeySource: 'none', ...sinCupo };
  },

  getUserKeyFor(provider: AIProviderId): string {
    const settings = this.getSettings();
    if (provider === 'openrouter') return (settings.openrouterApiKey || '').trim();
    if (provider === 'gemini') return (settings.geminiApiKey || '').trim();
    if (provider === 'openai') return (settings.openaiApiKey || '').trim();
    return '';
  },

  getAppKeyFor(provider: AIProviderId): string {
    if (provider === 'openrouter') return APP_KEYS.openrouter;
    if (provider === 'gemini') return APP_KEYS.gemini || APP_KEYS.openrouter;
    if (provider === 'openai') return APP_KEYS.openai;
    return '';
  },

  getEffectiveKeyFor(provider: AIProviderId): string {
    return this.getUserKeyFor(provider) || this.getAppKeyFor(provider);
  },

  incrementCourtesyUsage(): void {
    const settings = this.getSettings();
    settings.courtesyQuota.usedToday += 1;
    this.saveSettings(settings);
  },

  buildSystemPrompt(
    archetypePersona?: string,
    currentResult?: AssessmentResult | null,
    userProfile?: UserProfile | null,
    gender: GenderMode = 'male'
  ): string {
    const userGender: GenderMode = userProfile?.gender || gender || DEFAULT_GENDER;
    const perspective = PERSPECTIVE_LABEL[userGender] || PERSPECTIVE_LABEL.male;
    const perspectiveExamples = PERSPECTIVE_EXAMPLES.map(id => getArchetypeName(id, userGender)).join(', ');

    let personaInstruction = '';
    if (archetypePersona && archetypePersona !== 'general') {
      const archId = archetypePersona.toLowerCase() as ArchetypeId;
      const narrative = getArchetypeNarrative(archId, userGender);
      const archetypeName = getArchetypeName(archId, userGender);

      personaInstruction = `
MODO DE PERSONA ARQUETÍPICA ACTIVO:
Estás hablando EN PRIMERA PERSONA como la VOZ DEL ARQUETIPO: "${archetypeName.toUpperCase()}" (perspectiva ${perspective.toLowerCase()}).
- Eres una voz ficticia inspirada en este arquetipo, un recurso de reflexión. No conoces la mente del usuario ni formas parte de ella: no afirmes saber lo que siente o piensa.
- Título / Esencia: ${narrative.characterTitle || narrative.shortDescription}
- Desafío Nuclear / Pregunta de Poder: "${narrative.centralQuestion}"
- Virtud y Fortaleza: ${narrative.strength}
- Sombra y Riesgo de Desbalance: ${narrative.shadow} (${narrative.shadowDescription})
- Comportamientos en Equilibrio: ${narrative.balancedBehavior.join(' | ')}
- Comportamientos en Desequilibrio: ${narrative.unbalancedBehavior.join(' | ')}
- Preguntas de Reflexión para el Usuario: ${narrative.reflectionQuestions.join(' | ')}
- Mantra Guía: "${narrative.mantra}"
- Instrucción: Encarna las virtudes, el ritmo, la agudeza y la visión de este arquetipo. Háblale al usuario de forma cercana, profunda y desafiante según corresponda a tu energía, ayudándole a integrar tus virtudes y reconocer tus sombras.
`;
    }

    let profileContext = '';
    if (userProfile) {
      profileContext = `
PERFIL DEL USUARIO:
- Nombre: ${userProfile.name || 'Explorador'}
- Perspectiva narrativa elegida: ${perspective.toLowerCase()}
${userProfile.lifeStage ? `- Etapa de Vida: ${userProfile.lifeStage}` : ''}
${userProfile.currentGoal ? `- Objetivo / Desafío Actual: ${userProfile.currentGoal}` : ''}
`;
    }

    let resultContext = '';
    if (currentResult) {
      const dominantArch = currentResult.dominantArchetype.archetypeId;
      const dominantNarrative = getArchetypeNarrative(dominantArch, userGender);
      const top3Names = currentResult.top3.map(a => getArchetypeName(a.archetypeId, userGender)).join(', ');
      const devNames = currentResult.developmentArchetypes.map(a => getArchetypeName(a.archetypeId, userGender)).join(', ');
      const lead = getMapLead(currentResult, userGender);
      const dimensiones = `Mente (${currentResult.dimensionScores.mente}%), Acción (${currentResult.dimensionScores.accion}%), Corazón (${currentResult.dimensionScores.corazon}%), Construcción (${currentResult.dimensionScores.construccion}%)`;

      // Lo que el mapa no sostiene, la IA tampoco puede afirmarlo: ni un dominante en un mapa
      // plano, ni uno solo cuando varios van a la par.
      resultContext =
        lead.kind === 'flat'
          ? `
CONTEXTO DEL MAPA ARQUETÍPICO DEL USUARIO (Sistema de 18 Arquetipos Universales):
- Mapa sin un polo claro: sus respuestas puntúan parecido en todas las figuras. No le atribuyas un arquetipo dominante ni le recomiendes desarrollar figuras concretas por su puesto en el ranking; ayúdale a explorar situaciones concretas.
- Balance Dimensional: ${dimensiones}
`
          : `
CONTEXTO DEL MAPA ARQUETÍPICO DEL USUARIO (Sistema de 18 Arquetipos Universales):
${
  lead.kind === 'tie'
    ? `- En cabeza, a la par y sin un único dominante: ${lead.ids.map(id => getArchetypeName(id, userGender)).join(', ')}. No presentes a ninguna de ellas como «su» arquetipo dominante.`
    : `- Arquetipo Dominante: ${getArchetypeName(dominantArch, userGender)} (${dominantNarrative.characterTitle || dominantNarrative.name})
  * Esencia: ${dominantNarrative.shortDescription}
  * Desafío Central: ${dominantNarrative.centralQuestion}`
}
- Tríada (Top 3): ${top3Names}
- Lo que menos apareció en sus respuestas (no es una carencia): ${devNames || 'ninguna figura destaca por abajo; no recomiendes desarrollar ninguna en concreto'}
- Balance Dimensional: ${dimensiones}
- Perfil Compuesto: ${currentResult.compositeProfile?.title || 'Explorador reflexivo'}
- Síntesis del Perfil: ${currentResult.compositeProfile?.synthesis || ''}
`;
    }

    return `Eres un Asistente Filosófico y Guía de Sabiduría Arquetípica para una aplicación de autoconocimiento basada en 18 arquetipos universales, que se pueden leer en perspectiva masculina, femenina o universal.

${CRISIS_PROTOCOL}

DIRECTRICES DE CONTENIDO Y PERSPECTIVA:
1. PERSPECTIVA NARRATIVA: El usuario eligió la perspectiva ${perspective} (ej: ${perspectiveExamples}). Es una preferencia de lenguaje para nombrar los arquetipos, no un dato sobre su género: no lo deduzcas ni lo menciones. Usa esos nombres y adapta los ejemplos cotidianos y las reflexiones sin caer en estereotipos simplistas ni clichés.
2. NUNCA te presentes como psicólogo, terapeuta ni profesional clínico.
3. NO realices diagnósticos clínicos ni afirmaciones médicas categóricas.
4. Trata siempre los arquetipos como un MODELO SIMBÓLICO, existencial y de autoindagación personal profunda.
5. Utiliza un lenguaje socrático, respetuoso, lúcido y matizado: "este modelo sugiere que...", "podría indicar...", "desde la perspectiva de este arquetipo...", "quizás valga la pena observar si...".
6. Ayuda al usuario a formular preguntas de autoindagación honesta e integrar sus arquetipos de desarrollo.
7. Responde siempre en español fluido, cálido, digno y filosóficamente enriquecedor.

${personaInstruction}
${profileContext}
${resultContext}
`.trim();
  },

  async sendMessage(
    message: string,
    history: ChatMessage[],
    currentResult: AssessmentResult | null,
    archetypePersona?: string,
    userProfile?: UserProfile | null,
    gender: GenderMode = 'male'
  ): Promise<{ text: string; modelUsed: string; provider: AIProviderId }> {
    // Ante una crisis no se interpreta nada ni se gasta cupo: la respuesta es siempre la misma,
    // la dé quien la dé, para que no dependa de lo que decida un modelo.
    if (detectCrisis(message)) {
      return { text: CRISIS_RESPONSE, modelUsed: 'Protocolo de cuidado', provider: 'local' };
    }

    // Si la señal llegó en un mensaje anterior, la crisis sigue abierta: un modelo puede
    // acompañar (con el aviso en el prompt), pero ni el motor local, ni el cupo agotado, ni un
    // fallo de red vuelven a interpretar arquetipos.
    const crisisAbierta = crisisInConversation(history);
    const seguimientoDeCrisis = { text: CRISIS_FOLLOWUP, modelUsed: 'Protocolo de cuidado', provider: 'local' as AIProviderId };

    const settings = this.getSettings();
    const status = this.getUsageStatus();
    const effectiveGender = userProfile?.gender || gender;

    // Sin ninguna clave disponible: responde el motor local
    if (status.activeKeySource === 'none') {
      if (crisisAbierta) return seguimientoDeCrisis;
      return {
        text:
          this.getLocalArchetypeReflection(message, currentResult, archetypePersona, effectiveGender) +
          `\n\n---\n*Esta respuesta sale de tu mapa simbólico, sin un asistente de IA detrás. Si quieres conversar con uno, puedes conectarlo en **Ajustes de IA**.*`,
        modelUsed: 'Motor Simbólico Local',
        provider: 'local',
      };
    }

    // Consultas incluidas agotadas: se responde igual, desde el mapa simbólico, como promete el
    // estado del asistente (describirEstadoIA), en vez de repetir un aviso a cada pregunta.
    if (status.activeKeySource === 'app' && status.remainingCourtesy <= 0) {
      if (crisisAbierta) return seguimientoDeCrisis;
      return {
        text:
          this.getLocalArchetypeReflection(message, currentResult, archetypePersona, effectiveGender) +
          `\n\n---\n*${notaConsultasAgotadas(status.maxDaily)}*`,
        modelUsed: 'Cupo diario agotado',
        provider: 'local',
      };
    }

    const systemPrompt =
      this.buildSystemPrompt(archetypePersona, currentResult, userProfile, effectiveGender) +
      (crisisAbierta ? `\n\n${CRISIS_ACTIVE_NOTE}` : '');

    try {
      if (settings.provider === 'local') {
        if (crisisAbierta) return seguimientoDeCrisis;
        return {
          text: this.getLocalArchetypeReflection(message, currentResult, archetypePersona, effectiveGender),
          modelUsed: 'Motor Simbólico Local',
          provider: 'local',
        };
      }

      if (settings.provider === 'openrouter') {
        const key = this.getEffectiveKeyFor('openrouter');
        if (!key) {
          throw new Error('Añade tu clave de OpenRouter en Ajustes de IA para usar este proveedor.');
        }

        let model = settings.openrouterModel || PROVIDER_OPTIONS.openrouter.defaultModel;
        if (model.includes(':free') || model === 'google/gemini-2.0-flash-001') {
          model = PROVIDER_OPTIONS.openrouter.defaultModel;
        }

        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: message },
        ];

        const fallbackModels = Array.from(
          new Set([model, 'anthropic/claude-haiku-5.5', 'openai/gpt-6-luna'])
        ).slice(0, 3);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': window.location.origin || 'https://archetypes-app.web.app',
            'X-Title': 'Arquetipos Universales',
          },
          body: JSON.stringify({
            model: model,
            models: fallbackModels,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 950,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP OpenRouter: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Respuesta vacía de OpenRouter');

        if (status.activeKeySource === 'app') {
          this.incrementCourtesyUsage();
        }

        return {
          text: reply,
          modelUsed: model,
          provider: 'openrouter',
        };
      }

      if (settings.provider === 'openai') {
        const key = this.getEffectiveKeyFor('openai');
        if (!key) {
          throw new Error('Por favor ingresa tu clave de OpenAI en Ajustes de IA para usar ChatGPT.');
        }

        const model = settings.openaiModel || PROVIDER_OPTIONS.openai.defaultModel;
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: message },
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 950,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP OpenAI: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Respuesta vacía de OpenAI');

        if (status.activeKeySource === 'app') {
          this.incrementCourtesyUsage();
        }

        return {
          text: reply,
          modelUsed: model,
          provider: 'openai',
        };
      }

      if (settings.provider === 'gemini') {
        const key = this.getEffectiveKeyFor('gemini');
        if (!key) {
          if (APP_KEYS.openrouter) {
            return this.sendMessage(message, history, currentResult, archetypePersona, userProfile, effectiveGender);
          }
          throw new Error('Por favor ingresa tu clave de Google Gemini en Ajustes de IA.');
        }

        const model = settings.geminiModel || PROVIDER_OPTIONS.gemini.defaultModel;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const contents = [
          {
            role: 'user',
            parts: [{ text: `[INSTRUCCIONES DEL SISTEMA]\n${systemPrompt}\n\n[INICIO DE LA CONVERSACIÓN]` }],
          },
          ...history.slice(-8).map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 950,
            },
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP Gemini: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!reply) throw new Error('Respuesta vacía de Gemini');

        if (status.activeKeySource === 'app') {
          this.incrementCourtesyUsage();
        }

        return {
          text: reply,
          modelUsed: model,
          provider: 'gemini',
        };
      }

      throw new Error('No se pudo procesar la solicitud con el proveedor actual.');
    } catch (err: any) {
      console.warn('AI Provider fallback triggered:', err);
      if (crisisAbierta) return seguimientoDeCrisis;
      return {
        text: `${this.getLocalArchetypeReflection(message, currentResult, archetypePersona, effectiveGender)}\n\n---\n*${motivoAmable(err, status.activeKeySource === 'custom')}*`,
        modelUsed: 'Fallback Local',
        provider: 'local',
      };
    }
  },

  async testConnection(
    provider: AIProviderId,
    customKey?: string,
    customModel?: string,
    keyMode?: 'courtesy' | 'custom'
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (provider === 'local') {
        return { success: true, message: 'El motor local simbólico no requiere conexión y está siempre disponible.' };
      }

      if (provider === 'openrouter') {
        const propia = (customKey || '').trim() || this.getUserKeyFor('openrouter');
        const key = propia || this.getAppKeyFor('openrouter');
        if (!key) {
          return { success: false, message: 'Añade tu clave de OpenRouter para probar la conexión.' };
        }
        let model = customModel || PROVIDER_OPTIONS.openrouter.defaultModel;
        if (model.includes(':free') || model === 'google/gemini-2.0-flash-001') {
          model = PROVIDER_OPTIONS.openrouter.defaultModel;
        }

        const fallbackModels = Array.from(
          new Set([model, 'anthropic/claude-haiku-5.5', 'openai/gpt-6-luna'])
        ).slice(0, 3);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': window.location.origin || 'https://archetypes-app.web.app',
            'X-Title': 'Test Arquetipos',
          },
          body: JSON.stringify({
            model: model,
            models: fallbackModels,
            messages: [{ role: 'user', content: 'Di "Conexión exitosa" en 3 palabras.' }],
            max_tokens: 20,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err?.error?.message || `Error HTTP ${res.status}` };
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Conexión verificada';
        return {
          success: true,
          message: propia
            ? `Conexión exitosa con tu clave de OpenRouter (${model}): "${reply.trim()}"`
            : `Conexión exitosa con la clave incluida en la app (${model}): "${reply.trim()}"`,
        };
      }

      if (provider === 'gemini') {
        const propia = (customKey || '').trim() || this.getUserKeyFor('gemini');
        const key = propia || APP_KEYS.gemini;
        if (!key) {
          if (APP_KEYS.openrouter) {
            return this.testConnection('openrouter', '', 'google/gemini-2.5-flash');
          }
          return { success: false, message: 'Añade tu clave de Google Gemini para probar la conexión.' };
        }

        const model = customModel || PROVIDER_OPTIONS.gemini.defaultModel;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responde "OK"' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err?.error?.message || `Error HTTP ${res.status}. Verifica que tu clave de Google AI Studio sea correcta.` };
        }

        return { success: true, message: `Conexión exitosa con tu clave de Google Gemini (${model}).` };
      }

      if (provider === 'openai') {
        const key = (customKey || '').trim();
        if (!key) {
          return { success: false, message: 'Ingresa tu API Key de OpenAI para probar.' };
        }
        const model = customModel || PROVIDER_OPTIONS.openai.defaultModel;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Di OK' }],
            max_tokens: 10,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err?.error?.message || `Error HTTP ${res.status}` };
        }

        return { success: true, message: `Conexión exitosa con OpenAI (${model}).` };
      }

      return { success: false, message: 'Proveedor no reconocido' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al conectar con el servidor' };
    }
  },

  getLocalArchetypeReflection(
    message: string,
    result: AssessmentResult | null,
    archetypePersona?: string,
    gender: GenderMode = 'male'
  ): string {
    if (detectCrisis(message)) return CRISIS_RESPONSE;

    if (archetypePersona && archetypePersona !== 'general') {
      const archId = archetypePersona.toLowerCase() as ArchetypeId;
      const name = getArchetypeName(archId, gender);
      const narrative = getArchetypeNarrative(archId, gender);

      return (
        `Como la voz de tu ${name.toUpperCase()} interior:\n\n` +
        `He escuchado tu reflexión: "${message}".\n\n` +
        `Desde mi energía (${narrative.characterTitle || narrative.shortDescription}), te propongo contemplar este dilema:\n` +
        `> "${narrative.centralQuestion}"\n\n` +
        `Pregunta para tu indagación: ${narrative.reflectionQuestions[0] || '¿Cómo puedes integrar esta virtud hoy?'}`
      );
    }

    if (!result) {
      return (
        `Observo tu inquietud. Para ofrecerte un análisis simbólico más preciso, te sugiero completar el test de 18 arquetipos. Mientras tanto, reflexiona: ¿Qué energía (la acción enfocada, la visión analítica, la conexión empática o la organización soberana) aportaría mayor balance a esta situación?`
      );
    }

    // Como en el prompt de los modelos: no se habla de un dominante que el mapa no tiene, ni se
    // recomiendan figuras por un puesto que en un mapa plano decide el orden de los datos.
    const lead = getMapLead(result, gender);
    if (lead.kind === 'flat') {
      return (
        `Tu mapa no tiene un polo claro: tus respuestas puntúan parecido en todas las figuras, así que no hay una que hable más alto que las demás.\n\n` +
        `En lugar de partir del mapa, partamos de la situación: ¿qué energía (la acción enfocada, la visión analítica, la conexión empática o la organización) te está pidiendo ahora, y cuál estás usando por costumbre?`
      );
    }

    const lowNames = result.developmentArchetypes.map(d => getArchetypeName(d.archetypeId, gender));
    const lowList = lowNames.length > 1 ? `${lowNames.slice(0, -1).join(', ')} y ${lowNames[lowNames.length - 1]}` : lowNames.join('');
    const cabeza =
      lead.kind === 'tie'
        ? `donde van a la par **${lead.label.replace(/, a la par$/, '')}**`
        : `donde predomina **${lead.label}**`;

    return (
      `Considerando tu mapa arquetípico (${cabeza}, y lo que menos apareció en tus respuestas es **${lowList}**), esta situación podría indicar que estás operando con mucha fuerza desde tus patrones habituales.\n\n` +
      `¿Cómo cambiaría tu perspectiva si convocaras por un momento la energía y virtudes de **${lowNames[0] || 'una figura que uses poco'}**?\n\n` +
      `Este modelo sugiere que no se trata de anular lo que ya te mueve, sino de enriquecerlo con nuevos recursos.`
    );
  },
};
