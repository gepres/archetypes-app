import type {
  AssessmentResult,
  Challenge,
  ChatMessage,
  DailyOracleCard,
  JournalEntry,
  UserProfile,
} from '../domain/model';
import { isPerspective, type Perspective } from '../domain/archetypes/perspective';
import type {
  KeyValueStore,
  OracleCardCache,
  PerspectivePreference,
  ProfileRepository,
  TestProgress,
  TestProgressRepository,
} from '../ports/storage.port';

/**
 * Los repositorios, escritos una sola vez sobre el almacen de clave y valor.
 *
 * Es lo que hace que el hexagono salga rentable aqui. La serializacion, las
 * claves y el manejo de datos corruptos son identicos en web y en movil: lo
 * unico que cambia de verdad es donde se escriben tres bytes. Asi que eso —tres
 * metodos— es lo unico que cada app tiene que aportar.
 *
 * Solo depende del puerto, nunca de una tecnologia concreta, asi que sigue
 * siendo codigo de nucleo y se prueba con un almacen en memoria.
 */
const KEYS = {
  currentResult: 'archetypes_current_result',
  history: 'archetypes_history',
  journal: 'archetypes_journal_entries',
  challenges: 'archetypes_challenges',
  conversation: 'archetypes_chat_messages',
  profile: 'archetypes_user_profile',
  testProgress: 'archetypes_test_progress',
  dailyCard: 'archetypes_daily_card',
  perspective: 'archetypes_perspective',
} as const;

export function createProfileRepository(store: KeyValueStore): ProfileRepository {
  return {
    loadProfile: () => readJson<UserProfile>(store, KEYS.profile),
    saveProfile: profile => writeJson(store, KEYS.profile, profile),

    loadCurrentResult: () => readJson<AssessmentResult>(store, KEYS.currentResult),
    saveCurrentResult: async result => {
      await writeJson(store, KEYS.currentResult, result);
      const history = await readJsonArray<AssessmentResult>(store, KEYS.history);
      await writeJson(store, KEYS.history, [result, ...history.filter(r => r.id !== result.id)]);
    },
    loadHistory: () => readJsonArray<AssessmentResult>(store, KEYS.history),

    loadJournal: () => readJsonArray<JournalEntry>(store, KEYS.journal),
    saveJournal: entries => writeJson(store, KEYS.journal, entries),

    loadChallenges: () => readJsonArray<Challenge>(store, KEYS.challenges),
    saveChallenges: challenges => writeJson(store, KEYS.challenges, challenges),

    loadConversation: () => readJsonArray<ChatMessage>(store, KEYS.conversation),
    saveConversation: messages => writeJson(store, KEYS.conversation, messages),
  };
}

export function createTestProgressRepository(store: KeyValueStore): TestProgressRepository {
  return {
    load: () => readJson<TestProgress>(store, KEYS.testProgress),
    save: progress => writeJson(store, KEYS.testProgress, progress),
    clear: () => store.remove(KEYS.testProgress),
  };
}

export function createOracleCardCache(store: KeyValueStore): OracleCardCache {
  return {
    load: () => readJson<DailyOracleCard>(store, KEYS.dailyCard),
    save: card => writeJson(store, KEYS.dailyCard, card),
  };
}

/**
 * La perspectiva elegida, recordada entre arranques.
 *
 * Devuelve null —y no la perspectiva por defecto— cuando no hay nada guardado o
 * lo guardado no se reconoce. Quien llama sabe distinguir «todavia no ha
 * elegido» de «eligio universal», y esa diferencia importa: la primera puede
 * justificar preguntarselo; la segunda, nunca.
 */
export function createPerspectivePreference(store: KeyValueStore): PerspectivePreference {
  return {
    load: async () => {
      const raw = await store.read(KEYS.perspective);
      return isPerspective(raw) ? raw : null;
    },
    save: (perspective: Perspective) => store.write(KEYS.perspective, perspective),
  };
}

/**
 * Un almacen en memoria.
 *
 * Para tests y para el primer arranque de una app antes de que su
 * almacenamiento real este disponible.
 */
export function createInMemoryStore(seed: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(seed));
  return {
    read: async key => data.get(key) ?? null,
    write: async (key, value) => void data.set(key, value),
    remove: async key => void data.delete(key),
  };
}

/**
 * Lee y deserializa.
 *
 * Un valor corrupto devuelve null en vez de reventar: si alguien tiene basura
 * guardada de una version anterior, la app arranca sin diario en lugar de no
 * arrancar. Perder una entrada es malo; no poder abrir la aplicacion es peor.
 */
async function readJson<T>(store: KeyValueStore, key: string): Promise<T | null> {
  const raw = await store.read(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readJsonArray<T>(store: KeyValueStore, key: string): Promise<T[]> {
  const parsed = await readJson<T[]>(store, key);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeJson(store: KeyValueStore, key: string, value: unknown): Promise<void> {
  await store.write(key, JSON.stringify(value));
}
