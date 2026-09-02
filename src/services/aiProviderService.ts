import { AIProviderId, AISettings, AssessmentResult, ChatMessage } from '../types';

// La app no distribuye ninguna clave: cada usuario aporta la suya en Ajustes de IA.
// Sin clave propia se responde con el motor simbolico local, que no sale a la red.

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
    tagline: 'Acceso a múltiples modelos de vanguardia (Llama 3.3, Claude, DeepSeek, Gemini)',
    icon: '🌐',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    availableModels: [
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct (Recomendado)',
        description: 'Modelo potente y equilibrado para análisis y reflexiones profundas.',
        recommended: true,
      },
      {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Ultra veloz y excelente comprensión de contextos en español.',
      },
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek V3 Chat',
        description: 'Alta agudeza filosófica y razonamiento socrático.',
      },
      {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        description: 'Tono reflexivo, sobrio y empático de alta precisión.',
      },
    ],
    keyPlaceholder: 'sk-or-v1-...',
    getKeyUrl: 'https://openrouter.ai/keys',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Modelos de última generación de Google con alta capacidad de razonamiento',
    icon: '🔮',
    defaultModel: 'gemini-2.5-flash',
    availableModels: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Excelente balance entre velocidad, inteligencia y razonamiento reflexivo.',
        recommended: true,
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Máxima profundidad para análisis arquetípico exhaustivo.',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Respuesta inmediata de baja latencia.',
      },
    ],
    keyPlaceholder: 'AIzaSy...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    tagline: 'Modelos GPT de OpenAI para estructuración y guía personal',
    icon: '🤖',
    defaultModel: 'gpt-4o-mini',
    availableModels: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Económico, rápido y muy certero en respuestas estructuradas.',
        recommended: true,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'El modelo insignia con la mayor sofisticación verbal.',
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
    const today = new Date().toISOString().split('T')[0];
    const defaultSettings: AISettings = {
      provider: 'openrouter',
      openrouterKeyMode: 'courtesy',
      geminiKeyMode: 'courtesy',
      geminiApiKey: '',
      openaiApiKey: '',
      openrouterApiKey: '',
      geminiModel: PROVIDER_OPTIONS.gemini.defaultModel,
      openaiModel: PROVIDER_OPTIONS.openai.defaultModel,
      openrouterModel: PROVIDER_OPTIONS.openrouter.defaultModel,
      useAppCourtesyKey: true,
      courtesyQuota: {
        lastResetDate: today,
        usedToday: 0,
        maxDaily: 0,
      },
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_SETTINGS);
      if (!stored) return defaultSettings;
      const parsed: AISettings = JSON.parse(stored);

      // Reset daily quota if new day
      if (parsed.courtesyQuota?.lastResetDate !== today) {
        parsed.courtesyQuota = {
          lastResetDate: today,
          usedToday: 0,
          maxDaily: 0,
        };
      }

      // Sanitize obsolete slugs
      let sanitizedOpenrouterModel = parsed.openrouterModel || PROVIDER_OPTIONS.openrouter.defaultModel;
      if (sanitizedOpenrouterModel.includes(':free') || sanitizedOpenrouterModel === 'google/gemini-2.0-flash-001') {
        sanitizedOpenrouterModel = PROVIDER_OPTIONS.openrouter.defaultModel;
      }

      let sanitizedGeminiModel = parsed.geminiModel || PROVIDER_OPTIONS.gemini.defaultModel;
      if (sanitizedGeminiModel === 'google/gemini-2.0-flash-001') {
        sanitizedGeminiModel = 'gemini-2.5-flash';
      }

      return {
        ...defaultSettings,
        ...parsed,
        openrouterModel: sanitizedOpenrouterModel,
        geminiModel: sanitizedGeminiModel,
        openrouterKeyMode: parsed.openrouterKeyMode || (parsed.openrouterApiKey?.trim() ? 'custom' : 'courtesy'),
        geminiKeyMode: parsed.geminiKeyMode || (parsed.geminiApiKey?.trim() ? 'custom' : 'courtesy'),
        courtesyQuota: parsed.courtesyQuota || defaultSettings.courtesyQuota,
      };
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings(settings: AISettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_AI_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving AI settings:', e);
    }
  },

  // Con que se responde: la clave que el usuario haya guardado, o el motor local.
  // Al no haber clave compartida, no hay cuotas que contar.
  getUsageStatus(): {
    isUnlimited: boolean;
    provider: AIProviderId;
    activeKeySource: 'custom' | 'local' | 'none';
    remainingCourtesy: number;
    maxDaily: number;
    usedToday: number;
  } {
    const provider = this.getSettings().provider;
    const base = { isUnlimited: true, provider, remainingCourtesy: 0, maxDaily: 0, usedToday: 0 };

    if (provider === 'local') {
      return { ...base, activeKeySource: 'local' as const };
    }

    return {
      ...base,
      activeKeySource: this.getUserKeyFor(provider) ? ('custom' as const) : ('none' as const),
    };
  },

  // Clave que el propio usuario guardo para un proveedor; cadena vacia si no hay ninguna.
  getUserKeyFor(provider: AIProviderId): string {
    const settings = this.getSettings();
    if (provider === 'openrouter') return (settings.openrouterApiKey || '').trim();
    if (provider === 'gemini') return (settings.geminiApiKey || '').trim();
    if (provider === 'openai') return (settings.openaiApiKey || '').trim();
    return '';
  },

  buildSystemPrompt(
    archetypePersona?: string,
    currentResult?: AssessmentResult | null
  ): string {
    let personaInstruction = '';
    if (archetypePersona && archetypePersona !== 'general') {
      personaInstruction = `
MODO DE PERSONA ARQUETÍPICA ACTIVO:
Estás hablando EN PRIMERA PERSONA como la VOZ INTERIOR DEL ARQUETIPO: "${archetypePersona.toUpperCase()}".
- Encarna las virtudes, el ritmo, la agudeza y la visión de este arquetipo.
- Háblale al usuario de forma cercana, profunda, desafiante o sabia según corresponda a tu energía.
- Mantén la consciencia de que eres una parte viva de su propia psique invitándole a la maduración e integración.
`;
    }

    let contextPrompt = '';
    if (currentResult) {
      contextPrompt = `
CONTEXTO DEL MAPA ARQUETÍPICO DEL USUARIO (Modelo simbólico y reflexivo):
- Arquetipo Dominante: ${currentResult.dominantArchetype.name}
- Top 3 Arquetipos con mayor energía: ${currentResult.top3.map(a => a.name).join(', ')}
- Arquetipos de desarrollo sugeridos para equilibrio: ${currentResult.developmentArchetypes.map(a => a.name).join(', ')}
- Balance Dimensional: Mente (${currentResult.dimensionScores.mente}%), Acción (${currentResult.dimensionScores.accion}%), Corazón (${currentResult.dimensionScores.corazon}%), Construcción (${currentResult.dimensionScores.construccion}%)
- Perfil Compuesto: ${currentResult.compositeProfile?.title || 'Explorador reflexivo'}
`;
    }

    return `Eres un Asistente Filosófico y Guía de Reflexión Simbólica para una aplicación de autoconocimiento basada en 12 arquetipos masculinos (Rey, Guerrero, Mago, Amante, Padre, Cuidador, Bufón, Explorador, Creador, Sabio, Héroe, Rebelde).

DIRECTRICES ÉTICAS Y DE TONO:
1. NUNCA te presentes como psicólogo, terapeuta ni profesional clínico.
2. NO realices diagnósticos psicológicos ni afirmaciones clínicas categóricas.
3. Trata siempre los arquetipos como un MODELO SIMBÓLICO, metafórico y de indagación personal.
4. Utiliza un lenguaje reflexivo, socrático y matizado: "este modelo sugiere que...", "podría indicar...", "desde esta perspectiva simbólica...", "quizás valga la pena observar si...".
5. Estilo: Serio, elegante, empático, profundo, sin clichés ni dogmatismos.
6. Ayuda al usuario a formular preguntas de autoindagación honesta e integrar sus arquetipos de desarrollo.
7. Responde siempre en español fluido, respetuoso y reflexivo.

${personaInstruction}
${contextPrompt}
`.trim();
  },

  async sendMessage(
    message: string,
    history: ChatMessage[],
    currentResult: AssessmentResult | null,
    archetypePersona?: string
  ): Promise<{ text: string; modelUsed: string; provider: AIProviderId }> {
    const settings = this.getSettings();
    const status = this.getUsageStatus();

    // Sin clave propia no hay a quien llamar: responde el motor simbolico local
    if (status.activeKeySource === 'none') {
      return {
        text:
          this.getLocalArchetypeReflection(message, currentResult, archetypePersona) +
          `\n\n---\n*Respuesta del **motor simbolico local**, sin conexion externa. Para conversar con un modelo de IA, anade tu propia clave en **Ajustes de IA**.*`,
        modelUsed: 'Motor Simbolico Local',
        provider: 'local',
      };
    }

    const systemPrompt = this.buildSystemPrompt(archetypePersona, currentResult);

    try {
      if (settings.provider === 'local') {
        return {
          text: this.getLocalArchetypeReflection(message, currentResult, archetypePersona),
          modelUsed: 'Motor Simbólico Local',
          provider: 'local',
        };
      }

      if (settings.provider === 'openrouter') {
        const key = this.getUserKeyFor('openrouter');
        if (!key) {
          throw new Error('Anade tu clave de OpenRouter en Ajustes de IA para usar este proveedor.');
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
          new Set([model, 'deepseek/deepseek-chat', 'mistralai/mistral-small-24b-instruct-2501'])
        ).slice(0, 3);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': window.location.origin || 'https://archetypes-app.web.app',
            'X-Title': 'Arquetipos Masculinos',
          },
          body: JSON.stringify({
            model: model,
            models: fallbackModels,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 900,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP OpenRouter: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Respuesta vacía de OpenRouter');

        return {
          text: reply,
          modelUsed: model,
          provider: 'openrouter',
        };
      }

      if (settings.provider === 'openai') {
        const key = (settings.openaiApiKey || '').trim();
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
            max_tokens: 900,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP OpenAI: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Respuesta vacía de OpenAI');

        return {
          text: reply,
          modelUsed: model,
          provider: 'openai',
        };
      }

      if (settings.provider === 'gemini') {
        const key = this.getUserKeyFor('gemini');
        if (!key) {
          throw new Error('Anade tu clave de Google Gemini en Ajustes de IA para usar este proveedor.');
        }

        const model = settings.geminiModel || PROVIDER_OPTIONS.gemini.defaultModel;
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const contents = [
          ...history.slice(-8).map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 900,
            },
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `Error HTTP Gemini: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!reply) throw new Error('Respuesta vacia de Gemini');

        return {
          text: reply,
          modelUsed: model,
          provider: 'gemini',
        };
      }

      throw new Error('No se pudo procesar la solicitud con el proveedor actual.');
    } catch (err: any) {
      console.warn('AI Provider fallback triggered:', err);
      // Return safe fallback
      return {
        text: `${this.getLocalArchetypeReflection(message, currentResult, archetypePersona)}\n\n*(Nota: Respuesta del motor local debido a: ${err.message || 'conexión de red'})*`,
        modelUsed: 'Fallback Local',
        provider: 'local',
      };
    }
  },

  async testConnection(provider: AIProviderId, customKey?: string, customModel?: string, keyMode?: 'courtesy' | 'custom'): Promise<{ success: boolean; message: string }> {
    try {
      if (provider === 'local') {
        return { success: true, message: 'El motor local simbólico no requiere conexión y está siempre disponible.' };
      }

      if (provider === 'openrouter') {
        const key = (customKey || '').trim() || this.getUserKeyFor('openrouter');
        if (!key) {
          return { success: false, message: 'Anade tu clave de OpenRouter para probar la conexion.' };
        }
        let model = customModel || PROVIDER_OPTIONS.openrouter.defaultModel;
        if (model.includes(':free') || model === 'google/gemini-2.0-flash-001') {
          model = PROVIDER_OPTIONS.openrouter.defaultModel;
        }

        const fallbackModels = Array.from(
          new Set([model, 'deepseek/deepseek-chat', 'mistralai/mistral-small-24b-instruct-2501'])
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
          message: `Conexion exitosa con tu clave de OpenRouter (${model}): "${reply.trim()}"`,
        };
      }

      if (provider === 'gemini') {
        const key = (customKey || '').trim() || this.getUserKeyFor('gemini');
        if (!key) {
          return { success: false, message: 'Anade tu clave de Google Gemini para probar la conexion.' };
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

        return { success: true, message: `Conexion exitosa con tu clave de Google Gemini (${model}).` };
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
    archetypePersona?: string
  ): string {
    if (archetypePersona && archetypePersona !== 'general') {
      return (
        `Como la voz de tu ${archetypePersona.toUpperCase()} interior: He escuchado tu reflexión ("${message}"). ` +
        `Mi energía te recuerda mantenerte firme en lo esencial, no desgastarte en batallas estériles y recordar el propósito superior que guía tu camino hacia la madurez e integración.`
      );
    }

    if (!result) {
      return (
        'Observo tu inquietud. Para ofrecerte un análisis simbólico más preciso, te sugiero completar el test de arquetipos. Mientras tanto, reflexiona: ¿Qué arquetipo (el Guerrero que actúa y pone límites, el Mago que analiza con serenidad, el Amante que conecta con empatía o el Rey que organiza) aportaría mayor equilibrio a esta situación?'
      );
    }

    const dom = result.dominantArchetype.name;
    const dev = result.developmentArchetypes.map(d => d.name).join(' y ');

    return (
      `Considerando tu mapa arquetípico (donde predomina el ${dom} y tus arquetipos de desarrollo sugeridos son ${dev}), esta situación podría indicar que estás operando con mucha fuerza desde tus inclinaciones habituales.\n\n` +
      `¿Cómo cambiaría tu perspectiva si convocaras por un momento la energía de ${result.developmentArchetypes[0]?.name || 'tu arquetipo complementario'}?\n\n` +
      `Este modelo sugiere que no se trata de anular tu ${dom}, sino de enriquecerlo con nuevos recursos de acción y presencia consciente.`
    );
  },
};
