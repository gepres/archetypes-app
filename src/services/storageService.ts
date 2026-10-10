import { ARCHETYPES_LIST, withDe } from '../data/archetypesData';
import { INITIAL_CHALLENGES } from '../data/challengesData';
import {
  AccountRecord,
  Archetype,
  ArchetypeId,
  AssessmentResult,
  Challenge,
  ChatMessage,
  DailyOracleCard,
  GenderMode,
  JournalEntry,
  UserProfile,
} from '../types';
import { FirebaseService } from './firebaseService';
import { adaptAssessmentResultToGender } from './scoringEngine';
import { CRISIS_CLOSED_NOTE } from './crisisSupport';

// Mientras se aplican de golpe los datos de una cuenta no se sube nada a la nube (ver
// `applyAccountData`).
let syncPaused = false;

// La conversación que no se pudo guardar (almacenamiento lleno) y de qué cuenta es. Mientras
// exista, es la conversación vigente de esa cuenta: se lee de aquí y no del disco, para que ni
// una respuesta tardía ni la vista al volver pierdan lo que no llegó a guardarse. La siguiente
// escritura que funcione la guarda y la suelta; cambiar los datos de cuenta también la suelta.
let chatSinGuardar: { dueno: string; messages: ChatMessage[] } | null = null;

function welcomeMessage(): ChatMessage {
  return {
    id: 'msg-welcome-1',
    role: 'model',
    content: 'Bienvenido al espacio de reflexión arquetípica. Estoy aquí para acompañarte a explorar tu mapa personal desde una mirada filosófica y simbólica. Puedes compartirme cualquier situación actual, conflicto decisional o solicitar hablar con la voz directa de un arquetipo específico.',
    timestamp: new Date().toISOString(),
  };
}

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'archetypes_active_user_id',
  ACCOUNTS_VAULT: 'archetypes_accounts_vault',
  // Lo del invitado, aparcado mientras hay una cuenta abierta (ver enterAccount).
  GUEST_DATA: 'archetypes_guest_data',
  CURRENT_RESULT: 'archetypes_current_result',
  ASSESSMENT_HISTORY: 'archetypes_history',
  JOURNAL_ENTRIES: 'archetypes_journal_entries',
  CHALLENGES: 'archetypes_challenges',
  CHAT_MESSAGES: 'archetypes_chat_messages',
  USER_PROFILE: 'archetypes_user_profile',
  ACTIVE_TEST_PROGRESS: 'archetypes_test_progress',
  SAVED_DAILY_CARD: 'archetypes_daily_card',
};

/**
 * El texto de un reto lo pone el catálogo; del usuario solo es si lo completó y cuándo.
 *
 * Antes se guardaba la lista entera y se devolvía tal cual, así que un reto corregido o añadido
 * después nunca llegaba a quien ya tenía la app. Un reto retirado del catálogo se conserva solo
 * si estaba completado, porque eso ya es historia del usuario.
 */
export function mergeChallengeProgress(catalog: Challenge[], stored: Challenge[]): Challenge[] {
  const saved = new Map(stored.map(c => [c.id, c]));
  const current = catalog.map(c => {
    const progress = saved.get(c.id);
    if (!progress) return { ...c };
    // Sin `completedAt: undefined`: Firestore rechaza el documento entero por un solo campo
    // indefinido, y con él se caía el respaldo del diario y del resultado.
    const merged: Challenge = { ...c, completed: !!progress.completed };
    if (progress.completedAt) merged.completedAt = progress.completedAt;
    return merged;
  });
  const catalogIds = new Set(catalog.map(c => c.id));
  const retired = stored.filter(c => !catalogIds.has(c.id) && c.completed);
  return [...current, ...retired];
}

type AccountData = AccountRecord['data'];

/**
 * ¿Es esta copia de respaldo de la cuenta abierta? Solo si no trae perfil (copias antiguas) o
 * si su id coincide. El correo no basta: una cuenta local y una de Firebase pueden compartirlo
 * y no son la misma.
 */
export function backupBelongsTo(current: UserProfile, backupProfile?: UserProfile | null): boolean {
  return !backupProfile || backupProfile.id === current.id;
}

/** Una cuenta sin nada: lo que recibe quien entra en una cuenta nueva o sale a invitado. */
export function emptyAccountData(): AccountData {
  return { currentResult: null, history: [], journalEntries: [], challenges: [], chatMessages: [] };
}

const SAMPLE_JOURNAL_ID = 'journal-init-1';

/** ¿Hay algo que sea de la persona, más allá de los textos de bienvenida? */
export function hasOwnData(d: AccountData): boolean {
  return (
    !!d.currentResult ||
    d.history.length > 0 ||
    d.journalEntries.some(e => e.id !== SAMPLE_JOURNAL_ID) ||
    d.chatMessages.some(m => m.role === 'user') ||
    d.challenges.some(c => c.completed)
  );
}

const instante = (fecha?: string) => (fecha ? Date.parse(fecha) || 0 : 0);

function unirPorId<T extends { id: string }>(a: T[], b: T[], quedarse: (x: T, y: T) => T): T[] {
  const porId = new Map<string, T>();
  for (const item of [...a, ...b]) {
    const previo = porId.get(item.id);
    porId.set(item.id, previo ? quedarse(previo, item) : item);
  }
  return [...porId.values()];
}

/**
 * Combina dos copias de los datos de la MISMA persona (la del navegador y la de la nube, o la
 * guardada y la activa) sin perder nada de ninguna: une por id y, si un registro está en las
 * dos, se queda la versión más reciente. Un reto completado en cualquiera de las dos queda
 * completado. Nunca se usa para mezclar cuentas distintas.
 */
export function mergeAccountData(a: AccountData, b: AccountData): AccountData {
  const actuales = [a.currentResult, b.currentResult].filter(Boolean) as AssessmentResult[];
  const currentResult = actuales.sort((x, y) => instante(y.date) - instante(x.date))[0] ?? null;
  const history = unirPorId(a.history ?? [], b.history ?? [], (x, y) => (instante(y.date) >= instante(x.date) ? y : x))
    .sort((x, y) => instante(y.date) - instante(x.date));
  const journalEntries = unirPorId(a.journalEntries ?? [], b.journalEntries ?? [], (x, y) =>
    instante(y.updatedAt ?? y.date) >= instante(x.updatedAt ?? x.date) ? y : x
  ).sort((x, y) => instante(y.date) - instante(x.date));
  const challenges = unirPorId(a.challenges ?? [], b.challenges ?? [], (x, y) => {
    const { completedAt: _x, ...base } = y;
    const hecho = !!(x.completed || y.completed);
    const fecha = [x.completedAt, y.completedAt].filter(Boolean).sort().pop();
    return hecho && fecha ? { ...base, completed: true, completedAt: fecha } : { ...base, completed: hecho };
  });
  const chatMessages = ordenarConversacion(unirPorId(a.chatMessages ?? [], b.chatMessages ?? [], (_x, y) => y));
  return { currentResult, history, journalEntries, challenges, chatMessages };
}

/**
 * Ordena una conversación por hora, salvo las respuestas que saben a qué pregunta contestan
 * (`replyTo`): esas van justo detrás de su pregunta. Una respuesta que tardó en llegar no se
 * desplaza detrás de preguntas posteriores al combinar copias.
 */
export function ordenarConversacion(mensajes: ChatMessage[]): ChatMessage[] {
  const porHora = [...mensajes].sort((x, y) => instante(x.timestamp) - instante(y.timestamp));
  const preguntas = new Set(porHora.filter(m => m.role === 'user').map(m => m.id));
  const enlazada = (m: ChatMessage) => m.role === 'model' && !!m.replyTo && preguntas.has(m.replyTo);
  const resultado: ChatMessage[] = [];
  for (const m of porHora) {
    if (enlazada(m)) continue;
    resultado.push(m);
    if (m.role === 'user') resultado.push(...porHora.filter(r => enlazada(r) && r.replyTo === m.id));
  }
  return resultado;
}

/**
 * Los textos de la carta del día para un arquetipo ya resuelto en una perspectiva.
 *
 * La carta guardada se escribió con el nombre universal («Sanador / Sanadora»), así que quien
 * la muestra los vuelve a componer con el arquetipo en la perspectiva elegida.
 */
export function composeDailyOracleTexts(
  archetype: Archetype
): Pick<DailyOracleCard, 'affirmation' | 'morningReflection' | 'eveningInquiry'> {
  return {
    affirmation: `Hoy elijo manifestar la energía luminosa ${withDe(archetype.name)}: ${archetype.strength}`,
    morningReflection: `Al iniciar tu día: ¿cómo puedes responder a tus compromisos con el espíritu ${withDe(archetype.name)}?`,
    eveningInquiry: `Al cerrar tu jornada: ¿en qué momentos te mantuviste fiel a tu centro, y dónde asomó su sombra (${archetype.shadow})?`,
  };
}

// Initial default sample journal prompts
export const JOURNAL_PROMPTS = [
  "¿Dónde estoy actuando hoy desde mi Guerrero y dónde estoy evitando poner límites?",
  "¿En qué aspecto de mi vida estoy dejando que el Rey abdique ante el desorden?",
  "¿Qué proyecto o verdad interior está pidiendo a gritos tomar forma a través de mi Creador?",
  "¿Estoy cuidando a los demás desde el amor genuino o desde la necesidad de validación?",
  "¿Qué parte de mí necesita más espacio de silencio y reflexión filosófica?",
  "¿Dónde estoy siendo excesivamente solemne y me vendría bien la ligereza del Bufón?",
  "¿Qué territorio nuevo temo explorar por miedo a perder el control?",
  "¿Cómo puedo honrar hoy la voz de mi arquetipo de desarrollo sin forzar una identidad ajena?",
];

export const StorageService = {
  // Current assessment result
  /**
   * Un resultado guardado trae escritos su perfil y sus nombres tal como eran al hacer el test.
   * Al leerlo se recomponen con la lógica y la perspectiva de ahora, a partir de las
   * puntuaciones, que es lo único que no cambia. Si el dato está roto, se devuelve tal cual.
   */
  refreshResult(result: AssessmentResult): AssessmentResult {
    try {
      return adaptAssessmentResultToGender(result, this.getUserProfile().gender || 'male');
    } catch (e) {
      console.warn('No se pudo recomponer un resultado guardado:', e);
      return result;
    }
  },

  getCurrentResult(): AssessmentResult | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_RESULT);
      return data ? this.refreshResult(JSON.parse(data)) : null;
    } catch (e) {
      console.error("Error reading current result:", e);
      return null;
    }
  },

  saveCurrentResult(result: AssessmentResult): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(result));
      const history = this.getAssessmentHistory();
      const existsIndex = history.findIndex(h => h.id === result.id);
      if (existsIndex >= 0) {
        history[existsIndex] = result;
      } else {
        history.unshift(result);
      }
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_HISTORY, JSON.stringify(history));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving assessment result:", e);
    }
  },

  // Assessment history (evolution)
  getAssessmentHistory(): AssessmentResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
      return data ? (JSON.parse(data) as AssessmentResult[]).map(r => this.refreshResult(r)) : [];
    } catch (e) {
      console.error("Error reading history:", e);
      return [];
    }
  },

  saveAssessmentHistory(history: AssessmentResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_HISTORY, JSON.stringify(history));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving history:", e);
    }
  },

  // In-progress test save
  getTestProgress(): { answers: Record<number, number>; currentIndex: number; testType: 'full' | 'quick' } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEST_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveTestProgress(progress: { answers: Record<number, number>; currentIndex: number; testType: 'full' | 'quick' }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TEST_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  },

  clearTestProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEST_PROGRESS);
  },

  // Journal entries
  getJournalEntries(): JournalEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (data) return JSON.parse(data);

      // Default welcome entry
      const initialEntry: JournalEntry = {
        id: 'journal-init-1',
        date: new Date().toISOString(),
        title: 'Primeros pasos en la exploración de mis arquetipos',
        content: 'Inicio este espacio de introspección para observar con honestidad las fuerzas que guían mis decisiones. Reconozco que estos arquetipos no son etiquetas fijas, sino un mapa simbólico para cultivar mayor equilibrio interior.',
        relatedArchetypes: ['mago', 'sabio', 'rey'],
        mood: 'Reflexivo y sereno',
        promptUsed: '¿Qué parte de mí necesita más espacio de silencio y reflexión filosófica?',
      };
      // Leer no sube nada a la nube: el valor inicial se guarda solo en local.
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify([initialEntry]));
      return [initialEntry];
    } catch (e) {
      console.error("Error reading journal entries:", e);
      return [];
    }
  },

  saveJournalEntries(entries: JournalEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving journal entries:", e);
    }
  },

  addJournalEntry(entry: Omit<JournalEntry, 'id' | 'date'>): JournalEntry {
    const entries = this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal-${Date.now()}`,
      date: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    this.saveJournalEntries(entries);
    return newEntry;
  },

  deleteJournalEntry(id: string): void {
    const entries = this.getJournalEntries().filter(e => e.id !== id);
    this.saveJournalEntries(entries);
  },

  // Challenges
  getChallenges(): Challenge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (data) return mergeChallengeProgress(INITIAL_CHALLENGES, JSON.parse(data));
      // Leer no debe subir nada a la nube: el valor inicial se guarda solo en local. Con
      // `saveChallenges` aquí, cada subida leía los retos y disparaba otra subida dentro.
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
      return INITIAL_CHALLENGES;
    } catch (e) {
      console.error("Error reading challenges:", e);
      return INITIAL_CHALLENGES;
    }
  },

  saveChallenges(challenges: Challenge[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving challenges:", e);
    }
  },

  toggleChallenge(id: string): Challenge[] {
    const challenges = this.getChallenges().map(c => {
      if (c.id === id) {
        const { completedAt: _previo, ...rest } = c;
        return c.completed
          ? { ...rest, completed: false }
          : { ...rest, completed: true, completedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveChallenges(challenges);
    return challenges;
  },

  // Chat messages for Gemini
  getChatMessages(): ChatMessage[] {
    if (chatSinGuardar && chatSinGuardar.dueno === this.getUserProfile().id) return chatSinGuardar.messages;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (data) return JSON.parse(data);

      const initialMessage = welcomeMessage();
      // Como en los retos: el valor inicial se guarda solo en local, sin subir nada al leer.
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([initialMessage]));
      return [initialMessage];
    } catch (e) {
      console.error("Error reading chat messages:", e);
      return [];
    }
  },

  /**
   * Devuelve si quedó guardada. Con el almacenamiento lleno la escritura falla, y la
   * conversación se queda en memoria como la vigente de esta cuenta (ver `chatSinGuardar`).
   */
  saveChatMessages(messages: ChatMessage[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat messages:", e);
      chatSinGuardar = { dueno: this.getUserProfile().id, messages };
      return false;
    }
    chatSinGuardar = null;
    this.syncActiveAccountData();
    return true;
  },

  /**
   * Reiniciar la conversación es un cambio deliberado: se guarda y se sube, para que la
   * conversación borrada no vuelva desde la nube en otro dispositivo (ni reabra una crisis).
   */
  clearChatMessages(): ChatMessage[] {
    const vacia = [welcomeMessage()];
    this.saveChatMessages(vacia);
    return vacia;
  },

  /** La persona dice que está a salvo: se cierra la crisis sin borrar el historial. */
  closeCrisis(): ChatMessage[] {
    const messages = [
      ...this.getChatMessages(),
      { id: `msg-safe-${Date.now()}`, role: 'model' as const, content: CRISIS_CLOSED_NOTE, timestamp: new Date().toISOString(), crisisClosed: true },
    ];
    this.saveChatMessages(messages);
    return messages;
  },

  /**
   * Guarda la respuesta a una pregunta en la conversación vigente, justo detrás de su pregunta,
   * sin pisar lo que se haya escrito mientras llegaba (la vista que la pidió puede llevar rato
   * desmontada, y su copia de la conversación ser antigua). La respuesta recuerda su pregunta
   * (`replyTo`), para seguir detrás de ella al combinar copias. Se descarta, devolviendo null,
   * si la cuenta abierta ya no es la que preguntó o si la pregunta ya no está porque se reinició
   * la conversación. Si no se pudo guardar, la conversación se devuelve igual con `guardada`
   * en false: la respuesta no se pierde de la vista y se guarda con la siguiente escritura.
   */
  addChatReply(
    dueno: string,
    preguntaId: string,
    respuesta: ChatMessage
  ): { messages: ChatMessage[]; guardada: boolean } | null {
    if (this.getUserProfile().id !== dueno) return null;
    const actual = this.getChatMessages();
    const i = actual.findIndex(m => m.id === preguntaId && m.role === 'user');
    if (i === -1) return null;
    const messages = [...actual.slice(0, i + 1), { ...respuesta, replyTo: preguntaId }, ...actual.slice(i + 1)];
    return { messages, guardada: this.saveChatMessages(messages) };
  },

  // User Profile & Account Management
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.gender) {
          parsed.gender = 'male';
        }
        return parsed;
      }

      const defaultProfile: UserProfile = {
        id: 'user-guest',
        name: 'Explorador Invitado',
        email: '',
        isGuest: true,
        gender: 'male',
        avatarEmoji: '🧭',
        bio: 'Modo invitado activo. Los datos se guardan en este navegador.',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      this.saveUserProfile(defaultProfile);
      return defaultProfile;
    } catch (e) {
      return {
        id: 'user-guest',
        name: 'Explorador Invitado',
        email: '',
        isGuest: true,
        gender: 'male',
        avatarEmoji: '🧭',
        bio: 'Modo invitado activo.',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      profile.lastActive = new Date().toISOString();
      if (!profile.gender) profile.gender = 'male';
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  },

  // Accounts Vault (Multi-Account & Persistence)
  getSavedAccounts(): AccountRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_VAULT);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveAccountsVault(accounts: AccountRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_VAULT, JSON.stringify(accounts));
    } catch (e) {
      console.error("Error saving accounts vault:", e);
    }
  },

  /**
   * Crea o encuentra una cuenta local (la que se usa cuando no hay Firebase) y devuelve su
   * perfil. No toca los datos activos: entrar en ella, con lo suyo y solo lo suyo, es cosa de
   * `enterAccount`. Antes este método volcaba aquí los datos y, al crear una cuenta nueva desde
   * otra cuenta abierta, le copiaba los datos de esa otra.
   */
  loginOrCreateAccount(accountData: { name: string; email: string; avatarEmoji?: string; pinCode?: string; gender?: GenderMode }): UserProfile {
    const accounts = this.getSavedAccounts();
    const existingIndex = accounts.findIndex(
      a => a.email.toLowerCase().trim() === accountData.email.toLowerCase().trim()
    );

    const now = new Date().toISOString();
    let targetAccount: AccountRecord;

    if (existingIndex >= 0) {
      targetAccount = accounts[existingIndex];
      targetAccount.lastActive = now;
      if (accountData.name) targetAccount.name = accountData.name;
      if (accountData.avatarEmoji) targetAccount.avatarEmoji = accountData.avatarEmoji;
      accounts[existingIndex] = targetAccount;
    } else {
      targetAccount = {
        id: `user-${Date.now()}`,
        name: accountData.name.trim() || 'Caminante Arquetípico',
        email: accountData.email.trim().toLowerCase(),
        avatarEmoji: accountData.avatarEmoji || '👑',
        createdAt: now,
        lastActive: now,
        data: emptyAccountData(),
      };
      accounts.push(targetAccount);
    }
    this.saveAccountsVault(accounts);

    const currentSaved = this.getUserProfile();
    return {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      isGuest: false,
      gender: accountData.gender || currentSaved.gender || 'male',
      avatarEmoji: targetAccount.avatarEmoji,
      pinCode: accountData.pinCode,
      createdAt: targetAccount.createdAt,
      lastActive: now,
    };
  },

  /** Los datos de quien está ahora en el navegador. */
  readActiveData(): AccountData {
    return {
      currentResult: this.getCurrentResult(),
      history: this.getAssessmentHistory(),
      journalEntries: this.getJournalEntries(),
      challenges: this.getChallenges(),
      chatMessages: this.getChatMessages(),
    };
  },

  /** Pone en el navegador los datos de una persona, sin subir nada. */
  writeActiveData(d: AccountData): void {
    chatSinGuardar = null;
    if (d.currentResult) localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(d.currentResult));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_RESULT);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_HISTORY, JSON.stringify(d.history ?? []));
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(d.journalEntries ?? []));
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(d.challenges ?? []));
    localStorage.setItem(
      STORAGE_KEYS.CHAT_MESSAGES,
      JSON.stringify(d.chatMessages?.length ? d.chatMessages : [welcomeMessage()])
    );
  },

  /** Guarda la copia local de los datos de una cuenta registrada (nunca del invitado). */
  vaultUpsert(profile: UserProfile, data: AccountData): void {
    if (profile.isGuest) return;
    const accounts = this.getSavedAccounts();
    const now = new Date().toISOString();
    const i = accounts.findIndex(
      a => a.id === profile.id || (!!profile.email && a.email.toLowerCase() === profile.email.toLowerCase())
    );
    if (i >= 0) {
      accounts[i] = { ...accounts[i], data, lastActive: now };
    } else {
      accounts.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatarEmoji: profile.avatarEmoji || '🧭',
        createdAt: profile.createdAt || now,
        lastActive: now,
        data,
      });
    }
    this.saveAccountsVault(accounts);
  },

  /**
   * Entrar en una cuenta. Cada cuenta ve y sube solo lo suyo:
   *
   * - Lo de quien sale se aparca: lo de una cuenta, en su copia local; lo del invitado, en su
   *   hueco, salvo que la persona elija llevarlo a la cuenta (`bringGuestData`).
   * - Lo de quien entra se compone con su copia local y lo de la nube, combinados por id: no se
   *   pierde nada de ningún lado. Si es la misma cuenta que ya estaba abierta, lo que había en el
   *   navegador también cuenta.
   * - Mientras tanto no se sube nada; al final se sube una sola vez, a la cuenta que entra.
   */
  enterAccount(incoming: UserProfile, cloud: Partial<AccountData> | null, opts: { bringGuestData?: boolean } = {}): void {
    const outgoing = this.getUserProfile();
    const active = this.readActiveData();
    const mismaCuenta =
      !outgoing.isGuest &&
      (outgoing.id === incoming.id ||
        (!!outgoing.email && outgoing.email.toLowerCase() === (incoming.email || '').toLowerCase()));

    syncPaused = true;
    try {
      if (!mismaCuenta) {
        if (outgoing.isGuest) {
          if (opts.bringGuestData) localStorage.removeItem(STORAGE_KEYS.GUEST_DATA);
          else if (hasOwnData(active)) localStorage.setItem(STORAGE_KEYS.GUEST_DATA, JSON.stringify(active));
        } else {
          this.vaultUpsert(outgoing, active);
        }
        // Un test a medias es de quien lo estaba haciendo.
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEST_PROGRESS);
      }

      let data = mismaCuenta ? active : emptyAccountData();
      const guardada = this.getSavedAccounts().find(
        a => a.id === incoming.id || (!!incoming.email && a.email.toLowerCase() === incoming.email.toLowerCase())
      );
      if (guardada?.data) data = mergeAccountData(data, { ...emptyAccountData(), ...guardada.data });
      if (!mismaCuenta && outgoing.isGuest && opts.bringGuestData) data = mergeAccountData(data, active);
      if (cloud) data = mergeAccountData(data, { ...emptyAccountData(), ...cloud });

      this.writeActiveData(data);
      this.saveUserProfile(incoming);
      this.vaultUpsert(incoming, data);
    } finally {
      syncPaused = false;
    }
    this.syncActiveAccountData();
  },

  /**
   * Cerrar sesión. Lo de la cuenta se sube y se aparca en su copia local, y en el navegador
   * queda lo del invitado (si lo había), nunca lo de la cuenta: antes, quien usara el
   * navegador después veía el mapa, el diario y el chat de la cuenta que acababa de salir.
   */
  switchToGuestMode(): UserProfile {
    this.syncActiveAccountData();
    const outgoing = this.getUserProfile();

    const guestProfile: UserProfile = {
      id: 'user-guest',
      name: 'Explorador Invitado',
      email: '',
      isGuest: true,
      gender: outgoing.gender,
      avatarEmoji: '🧭',
      bio: 'Modo invitado activo. Crea o inicia sesión en cualquier momento para resguardar tus evaluaciones y notas.',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    syncPaused = true;
    try {
      if (!outgoing.isGuest) this.vaultUpsert(outgoing, this.readActiveData());
      const aparcada = localStorage.getItem(STORAGE_KEYS.GUEST_DATA);
      this.writeActiveData(aparcada ? { ...emptyAccountData(), ...JSON.parse(aparcada) } : emptyAccountData());
      localStorage.removeItem(STORAGE_KEYS.GUEST_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEST_PROGRESS);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(guestProfile));
    } finally {
      syncPaused = false;
    }
    return guestProfile;
  },

  /**
   * ¿Lo que se guarda ahora acaba también en la nube? `cloud` solo si la cuenta tiene sesión
   * abierta en Firebase con el mismo id: `syncActiveAccountData` lo intenta con cualquier cuenta
   * registrada, pero las reglas de Firestore rechazan a quien no es dueño. `pending` mientras
   * Firebase aún no ha dicho si hay sesión.
   */
  getCloudSyncState(): 'local' | 'cloud' | 'pending' {
    const profile = this.getUserProfile();
    // Las cuentas locales llevan ids `user-…` (y el invitado, `user-guest`); un uid de Firebase
    // nunca lleva guiones. Esas no suben nada aunque se intente.
    if (!profile || profile.isGuest || !profile.email || profile.id.startsWith('user-')) return 'local';
    if (FirebaseService.getCurrentAuthUser()?.uid === profile.id) return 'cloud';
    // Firebase restaura la sesión de forma asíncrona: mientras no termina, no se sabe si lo que
    // se guarde subirá, y no se puede prometer que se queda solo en el navegador.
    return FirebaseService.isAuthResolved() ? 'local' : 'pending';
  },

  /**
   * Importa una copia de los datos de la persona (un archivo de respaldo) en la cuenta abierta:
   * se combina por id con lo que ya hay, sin pisarlo, y se sube una sola vez al final.
   */
  applyAccountData(data: Partial<AccountData> | null): void {
    if (!data) return;
    syncPaused = true;
    try {
      this.writeActiveData(mergeAccountData(this.readActiveData(), { ...emptyAccountData(), ...data }));
    } finally {
      syncPaused = false;
    }
    this.syncActiveAccountData();
  },

  syncActiveAccountData(): void {
    if (syncPaused) return;
    try {
      const profile = this.getUserProfile();
      if (!profile || profile.isGuest || !profile.email) return;

      const currentRes = this.getCurrentResult();
      const history = this.getAssessmentHistory();
      const journal = this.getJournalEntries();
      const challenges = this.getChallenges();
      const chat = this.getChatMessages();

      const accounts = this.getSavedAccounts();
      const index = accounts.findIndex(a => a.id === profile.id || a.email.toLowerCase() === profile.email.toLowerCase());
      if (index >= 0) {
        accounts[index].data = {
          currentResult: currentRes,
          history: history,
          journalEntries: journal,
          challenges: challenges,
          chatMessages: chat,
        };
        accounts[index].lastActive = new Date().toISOString();
        this.saveAccountsVault(accounts);
      }

      // Also sync to Firebase Firestore if online
      if (profile.id) {
        FirebaseService.syncFullDataToCloud(profile.id, {
          currentResult: currentRes,
          history: history,
          journalEntries: journal,
          challenges: challenges,
          chatMessages: chat,
        }).catch(err => {
          console.warn('Background Firestore sync caught:', err);
        });
      }
    } catch (e) {
      console.error("Error syncing active account:", e);
    }
  },

  // Daily Archetype Oracle Card
  getDailyOracleCard(): DailyOracleCard {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_DAILY_CARD);
      if (stored) {
        const parsed: DailyOracleCard = JSON.parse(stored);
        if (parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch (e) {
      // generate fresh
    }

    // Pick deterministic or rotating archetype for the day based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const archetype = ARCHETYPES_LIST[dayOfYear % ARCHETYPES_LIST.length];

    const oracleCard: DailyOracleCard = {
      date: todayStr,
      archetypeId: archetype.id,
      mantra: archetype.mantra,
      dailyFocus: archetype.centralQuestion,
      ...composeDailyOracleTexts(archetype),
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_DAILY_CARD, JSON.stringify(oracleCard));
    } catch (e) {}

    return oracleCard;
  }
};
