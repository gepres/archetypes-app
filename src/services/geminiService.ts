import { AssessmentResult, ChatMessage } from '../types';

export interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  archetypePersona?: string;
  archetypeContext?: {
    dominant: string;
    top3: string[];
    development: string[];
    dimensions: {
      mente: number;
      accion: number;
      corazon: number;
      construccion: number;
    };
    compositeProfileTitle?: string;
  };
}

export const GeminiService = {
  async sendMessage(
    message: string,
    history: ChatMessage[],
    currentResult: AssessmentResult | null,
    archetypePersona?: string
  ): Promise<string> {
    try {
      const formattedHistory = history.map(m => ({
        role: m.role,
        parts: m.content,
      }));

      const payload: ChatRequestPayload = {
        message,
        history: formattedHistory,
        archetypePersona: archetypePersona && archetypePersona !== 'general' ? archetypePersona : undefined,
        archetypeContext: currentResult
          ? {
              dominant: currentResult.dominantArchetype.name,
              top3: currentResult.top3.map(a => a.name),
              development: currentResult.developmentArchetypes.map(a => a.name),
              dimensions: currentResult.dimensionScores,
              compositeProfileTitle: currentResult.compositeProfile.title,
            }
          : undefined,
      };

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (data && data.text && !data.error && !data.text.includes('"error":{"code":503')) {
        return data.text;
      }

      // If server returned an error payload
      return this.getLocalArchetypeReflection(message, currentResult, archetypePersona);
    } catch (error: any) {
      console.warn('Gemini chat request fallback:', error);
      return this.getLocalArchetypeReflection(message, currentResult, archetypePersona);
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
        `Mi energía te recuerda mantenerte firme en lo esencial, no desgastarte en batallas estériles y recordar el propósito superior que guía tu camino hacia la madurez.`
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

