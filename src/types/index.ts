export type GenderMode = 'male' | 'female' | 'universal';

/**
 * La perspectiva de quien todavía no ha elegido ninguna. Universal, para no dar por hecho un
 * género: antes era la masculina, y la bienvenida abría con «Masculina» marcada para todos.
 */
export const DEFAULT_GENDER: GenderMode = 'universal';

export type ArchetypeId =
  | 'rey'
  | 'guerrero'
  | 'mago'
  | 'sabio'
  | 'sacerdote'
  | 'amante'
  | 'padre'
  | 'cuidador'
  | 'bufon'
  | 'explorador'
  | 'creador'
  | 'heroe'
  | 'rebelde'
  | 'sanador'
  | 'constructor'
  | 'soberano'
  | 'mistico'
  | 'integrador';

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

export interface ArchetypeNarrativeVariant {
  name: string; // e.g. "El Guerrero", "La Guerrera", "Guerrero / Guerrera"
  characterTitle?: string;
  centralQuestion: string;
  shortDescription: string;
  fullDescription: string;
  mantra: string;
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
}

export interface Archetype {
  id: ArchetypeId;
  name: string; // Active resolved name based on gender
  universalName: string; // e.g. "Rey / Reina" or "Guerrero / Guerrera"
  masculineName: string; // e.g. "El Rey", "El Guerrero"
  feminineName: string; // e.g. "La Reina", "La Guerrera"
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
  variants?: {
    masculine: VarianteDeArquetipo;
    feminine: VarianteDeArquetipo;
    universal: VarianteDeArquetipo;
  };
}

/**
 * Lo que cambia una perspectiva (masculina, femenina, universal) respecto del contenido común:
 * siempre el nombre, y solo lo que de verdad dependa de ella. Lo que no trae, sale del común.
 */
export type VarianteDeArquetipo = Pick<ArchetypeNarrativeVariant, 'name'> & Partial<Omit<ArchetypeNarrativeVariant, 'name'>>;

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
  // Los perfiles guardados antes de nombrarse por pareja no traen estos campos.
  /** Las dos figuras que encabezan el mapa y le dan nombre. */
  pair?: [ArchetypeId, ArchetypeId];
  /** La pregunta que abre la tensión entre esas dos figuras. */
  tension?: string;
  /** Dos o más figuras comparten el primer puesto: no hay un dominante claro entre ellas. */
  isTie?: boolean;
  /** Con un líder claro y exactamente dos empatadas detrás: esas dos (no se elige una). */
  companions?: ArchetypeId[];
  /** Las figuras que comparten el primer puesto, cuando hay empate (dos o más). */
  tiedLeaders?: ArchetypeId[];
  /** Todo el mapa cabe en unos pocos puntos: no tiene un polo claro y no se le pone nombre. */
  isFlat?: boolean;
}

/** Una respuesta que pesó en un arquetipo: el *por qué te salió*. */
/**
 * Una respuesta que explica por qué salió un arquetipo. Del test de frases (los resultados
 * antiguos): la afirmación y lo que se respondió. Del test por dilemas: la situación en la que se
 * eligió a ese arquetipo.
 */
export interface AnswerEvidence {
  questionId?: number;
  value?: number; // 1 a 5, lo que respondió la persona
  dilemaId?: string;
}

/** Los grupos del primer y del segundo puesto de un mapa de dilemas. */
export interface CabezaMapa {
  primero: ArchetypeId[];
  segundo: ArchetypeId[];
}

/** El test por dilemas a medias, para retomarlo donde se dejó. */
export interface ProgresoTest {
  instrumento: 'dilemas';
  testType: 'full' | 'quick';
  /** Las elecciones de las situaciones (los desempates no se guardan: se repiten al final). */
  respuestas: RespuestaDilema[];
  currentIndex: number;
  /** Con ella se baraja el orden de las opciones: el mismo al volver. */
  semilla: string;
}

/** Una elección en el test por dilemas. */
export interface RespuestaDilema {
  dilemaId: string;
  arquetipo: ArchetypeId;
  /** Solo en los desempates: entre qué figuras se eligió. */
  entre?: ArchetypeId[];
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
  /** Las respuestas que más pesaron en cada uno de los tres primeros. No existe en resultados antiguos. */
  evidence?: Partial<Record<ArchetypeId, AnswerEvidence[]>>;
  /** Con qué test se hizo. Sin él, es el de frases de 1 a 5 (todos los resultados antiguos). */
  instrumento?: 'dilemas';
  /**
   * Cuántas posiciones de arriba (1 o 2) decidió el test por comparaciones directas: no son
   * empates aunque sus números se parezcan.
   */
  cabezaResuelta?: number;
  /**
   * Test por dilemas: lo que se eligió en cada situación (sin los desempates). Lo usa la lectura
   * personal con IA, que interpreta el resultado sin cambiarlo.
   */
  elecciones?: { dilemaId: string; arquetipo: ArchetypeId }[];
  /**
   * Test por dilemas: quiénes comparten el primer puesto y quiénes el segundo. Un objeto y no una
   * lista de listas: Firestore no admite listas anidadas y rechazaría la cuenta entera al
   * sincronizar.
   */
  cabeza?: CabezaMapa;
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
  /** Lo pone solo el botón «Ya estoy a salvo»: cierra una crisis. Ningún texto generado lo tiene. */
  crisisClosed?: boolean;
  /** En una respuesta, el id de la pregunta a la que contesta: va detrás de ella aunque llegue tarde. */
  replyTo?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  gender?: GenderMode;
  lifeStage?: string;
  currentGoal?: string;
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
  /** La perspectiva que eligió esta cuenta: los perfiles de Firebase no la traen al volver a entrar. */
  gender?: GenderMode;
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
  /** El resultado para el que se eligió la carta; null si se eligió sin mapa. */
  basadaEn?: string | null;
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

