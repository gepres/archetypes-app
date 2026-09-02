import { AssessmentResult, ChatMessage, GenderMode, UserProfile } from '../types';
import { AIProviderService } from './aiProviderService';

export const GeminiService = {
  async sendMessage(
    message: string,
    history: ChatMessage[],
    currentResult: AssessmentResult | null,
    archetypePersona?: string,
    userProfile?: UserProfile | null,
    gender?: GenderMode
  ): Promise<string> {
    const result = await AIProviderService.sendMessage(
      message,
      history,
      currentResult,
      archetypePersona,
      userProfile,
      gender
    );
    return result.text;
  },

  getLocalArchetypeReflection(
    message: string,
    result: AssessmentResult | null,
    archetypePersona?: string,
    gender: GenderMode = 'male'
  ): string {
    return AIProviderService.getLocalArchetypeReflection(message, result, archetypePersona, gender);
  },
};
