import { AssessmentResult, ChatMessage } from '../types';
import { AIProviderService } from './aiProviderService';

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
    const result = await AIProviderService.sendMessage(
      message,
      history,
      currentResult,
      archetypePersona
    );
    return result.text;
  },

  getLocalArchetypeReflection(
    message: string,
    result: AssessmentResult | null,
    archetypePersona?: string
  ): string {
    return AIProviderService.getLocalArchetypeReflection(message, result, archetypePersona);
  },
};
