export type ArchetypeId =
  | 'rey'
  | 'guerrero'
  | 'mago'
  | 'amante'
  | 'padre'
  | 'cuidador'
  | 'bufon'
  | 'explorador'
  | 'creador'
  | 'sabio'
  | 'heroe'
  | 'rebelde';

export type DimensionId = 'mente' | 'accion' | 'corazon' | 'construccion';

export interface DimensionInfo {
  id: DimensionId;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  archetypes: ArchetypeId[];
}

export interface ArchetypeSynergy {
  partnerId: ArchetypeId;
  title: string;
  description: string;
  synergyKeyword: string;
}

export type LifeDomainKey = 'liderazgo' | 'relaciones' | 'crisis' | 'creatividad' | 'paternidad';

export interface Archetype {
  id: ArchetypeId;
  name: string;
  emoji: string;
  dimension: DimensionId;
  concepts: string[];
  centralQuestion: string;
  shortDescription: string;
  fullDescription: string;
  mantra: string;
  symbol: string;
  colorHex: string;
  characterTitle?: string;
  image?: string;
  avatarUrl?: string;
  strength: string;
  shadow: string;
  shadowDescription: string;
  shadowAntidote: string;
  domains: Record<LifeDomainKey, string>;
  balancedBehavior: string[];
  unbalancedBehavior: string[];
  reflectionQuestions: string[];
  developmentExercises: {
    title: string;
    description: string;
    actionStep: string;
  }[];
  synergies: ArchetypeSynergy[];
}

export interface QuestionWeight {
  archetypeId: ArchetypeId;
  weight: number; // e.g., 1, 2, 3
}

export interface Question {
  id: number;
  text: string;
  dimensionFocus: DimensionId;
  weights: QuestionWeight[];
  scenarioCategory?: string;
}

export interface AssessmentAnswer {
  questionId: number;
  value: number; // 1 to 5 (Likert scale)
}

export interface ArchetypeScore {
  archetypeId: ArchetypeId;
  name: string;
  emoji: string;
  rawScore: number;
  normalizedScore: number; // 0-100
  rank: number;
  dimension: DimensionId;
}

export interface DimensionScore {
  dimensionId: DimensionId;
  name: string;
  score: number; // 0-100
  color: string;
  description: string;
}

export interface CompositeProfile {
  archetypeKey: string;
  title: string;
  archetypeCombination: string;
  synthesis: string;
  strengths: string[];
  risksAndShadows: string[];
  developmentArchetypes: {
    archetypeId: ArchetypeId;
    name: string;
    reason: string;
    activationPractice: string;
  }[];
}

export interface AssessmentResult {
  id: string;
  date: string; // ISO string
  title: string;
  type: 'full' | 'quick';
  scores: Record<ArchetypeId, number>; // normalized 0-100
  ranking: ArchetypeScore[];
  dominantArchetype: ArchetypeScore;
  top3: ArchetypeScore[];
  top5: ArchetypeScore[];
  developmentArchetypes: ArchetypeScore[];
  dimensionScores: Record<DimensionId, number>;
  compositeProfile: CompositeProfile;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  relatedArchetypes: ArchetypeId[];
  mood?: string;
  promptUsed?: string;
  updatedAt?: string;
}

export interface Challenge {
  id: string;
  archetypeId: ArchetypeId;
  title: string;
  description: string;
  actionGuidance: string;
  timeEstimate: string;
  difficulty: 'accesible' | 'intermedio' | 'profundo';
  completed: boolean;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  personaUsed?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  avatarEmoji?: string;
  bio?: string;
  pinCode?: string;
  focusArchetypeId?: ArchetypeId;
  createdAt: string;
  lastActive: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  email: string;
  avatarEmoji: string;
  createdAt: string;
  lastActive: string;
  data: {
    currentResult: AssessmentResult | null;
    history: AssessmentResult[];
    journalEntries: JournalEntry[];
    challenges: Challenge[];
    chatMessages: ChatMessage[];
  };
}

export interface DailyOracleCard {
  date: string;
  archetypeId: ArchetypeId;
  mantra: string;
  affirmation: string;
  dailyFocus: string;
  morningReflection: string;
  eveningInquiry: string;
}

export type AIProviderId = 'openrouter' | 'gemini' | 'openai' | 'local';
export type KeyMode = 'courtesy' | 'custom';

export interface AISettings {
  provider: AIProviderId;
  // Key mode preferences
  geminiKeyMode?: KeyMode; // 'courtesy' (app key) or 'custom' (user key)
  openrouterKeyMode?: KeyMode; // 'courtesy' (app key) or 'custom' (user key)
  // User custom API keys (BYOK - Bring Your Own Key)
  geminiApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  // Model selections
  geminiModel?: string;
  openaiModel?: string;
  openrouterModel?: string;
  // Use app courtesy key if user key is not provided
  useAppCourtesyKey: boolean;
  // Courtesy Quota tracking
  courtesyQuota: {
    lastResetDate: string; // YYYY-MM-DD
    usedToday: number;
    maxDaily: number;
  };
}

