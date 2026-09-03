import type {
  AssessmentResult,
  Challenge,
  ChatMessage,
  DailyOracleCard,
  JournalEntry,
  UserProfile,
} from '../domain/model';
import type { Perspective } from '../domain/archetypes/perspective';

/**
 * Almacen de clave y valor.
 *
 * Es asincrono a proposito. El almacenamiento del navegador es sincrono y el
 * del movil no lo es: si el puerto fuera sincrono, ninguna implementacion movil
 * podria cumplirlo, y habria que partir la interfaz en dos. Al reves si se
 * puede — un almacen sincrono se envuelve en promesas ya resueltas y no cuesta
 * nada—, asi que la forma que sirve a los dos mundos es esta.
 */
export interface KeyValueStore {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * Lo que el nucleo necesita guardar y recuperar del recorrido de una persona.
 *
 * Deliberadamente NO es un espejo del servicio de almacenamiento actual, que
 * mezcla persistencia con reglas y con gestion de cuentas. Aqui esta solo lo
 * que un caso de uso pide: guardar esto, devolveme aquello.
 */
export interface ProfileRepository {
  loadProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;

  loadCurrentResult(): Promise<AssessmentResult | null>;
  saveCurrentResult(result: AssessmentResult): Promise<void>;
  loadHistory(): Promise<AssessmentResult[]>;

  loadJournal(): Promise<JournalEntry[]>;
  saveJournal(entries: JournalEntry[]): Promise<void>;

  loadChallenges(): Promise<Challenge[]>;
  saveChallenges(challenges: Challenge[]): Promise<void>;

  loadConversation(): Promise<ChatMessage[]>;
  saveConversation(messages: ChatMessage[]): Promise<void>;
}

/** Un test a medio responder, para poder retomarlo. */
export interface TestProgress {
  answers: Record<number, number>;
  currentIndex: number;
  testType: 'full' | 'quick';
}

export interface TestProgressRepository {
  load(): Promise<TestProgress | null>;
  save(progress: TestProgress): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Cache de la carta del dia.
 *
 * La carta se puede recalcular siempre —la regla es deterministica— asi que
 * esto no es persistencia critica: es evitar recalcular y, sobre todo, poder
 * mostrarla sin conexion.
 */
export interface OracleCardCache {
  load(): Promise<DailyOracleCard | null>;
  save(card: DailyOracleCard): Promise<void>;
}

/**
 * La perspectiva elegida.
 *
 * Se guarda fuera del perfil a proposito: se puede cambiar en el primer
 * arranque, antes de que exista perfil alguno, y cambia mucho mas a menudo que
 * nada de lo que hay dentro de uno. Meterla ahi obligaria a crear un perfil
 * vacio solo para poder recordar como quiere que le hablen.
 */
export interface PerspectivePreference {
  load(): Promise<Perspective | null>;
  save(perspective: Perspective): Promise<void>;
}
