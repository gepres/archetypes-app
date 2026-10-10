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

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'archetypes_active_user_id',
  ACCOUNTS_VAULT: 'archetypes_accounts_vault',
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
      this.saveJournalEntries([initialEntry]);
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
      this.saveChallenges(INITIAL_CHALLENGES);
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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (data) return JSON.parse(data);

      const initialMessage: ChatMessage = {
        id: 'msg-welcome-1',
        role: 'model',
        content: 'Bienvenido al espacio de reflexión arquetípica. Estoy aquí para acompañarte a explorar tu mapa personal desde una mirada filosófica y simbólica. Puedes compartirme cualquier situación actual, conflicto decisional o solicitar hablar con la voz directa de un arquetipo específico.',
        timestamp: new Date().toISOString(),
      };
      this.saveChatMessages([initialMessage]);
      return [initialMessage];
    } catch (e) {
      console.error("Error reading chat messages:", e);
      return [];
    }
  },

  saveChatMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
      this.syncActiveAccountData();
    } catch (e) {
      console.error("Error saving chat messages:", e);
    }
  },

  clearChatMessages(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
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

  loginOrCreateAccount(accountData: { name: string; email: string; avatarEmoji?: string; pinCode?: string; gender?: GenderMode }): UserProfile {
    const accounts = this.getSavedAccounts();
    const existingIndex = accounts.findIndex(
      a => a.email.toLowerCase().trim() === accountData.email.toLowerCase().trim()
    );

    const now = new Date().toISOString();
    let targetAccount: AccountRecord;

    if (existingIndex >= 0) {
      // Existing registered user: load their saved data
      targetAccount = accounts[existingIndex];
      targetAccount.lastActive = now;
      if (accountData.name) targetAccount.name = accountData.name;
      if (accountData.avatarEmoji) targetAccount.avatarEmoji = accountData.avatarEmoji;
      accounts[existingIndex] = targetAccount;
      this.saveAccountsVault(accounts);

      // Restore their data to active storage
      if (targetAccount.data) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(targetAccount.data.currentResult));
        localStorage.setItem(STORAGE_KEYS.ASSESSMENT_HISTORY, JSON.stringify(targetAccount.data.history || []));
        localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(targetAccount.data.journalEntries || []));
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(targetAccount.data.challenges || INITIAL_CHALLENGES));
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(targetAccount.data.chatMessages || []));
      }
    } else {
      // New registered user: create fresh record or import current guest session data
      const newId = `user-${Date.now()}`;
      const currentRes = this.getCurrentResult();
      const history = this.getAssessmentHistory();
      const journal = this.getJournalEntries();
      const challenges = this.getChallenges();
      const chat = this.getChatMessages();

      targetAccount = {
        id: newId,
        name: accountData.name.trim() || 'Caminante Arquetípico',
        email: accountData.email.trim().toLowerCase(),
        avatarEmoji: accountData.avatarEmoji || '👑',
        createdAt: now,
        lastActive: now,
        data: {
          currentResult: currentRes,
          history: history,
          journalEntries: journal,
          challenges: challenges,
          chatMessages: chat,
        }
      };

      accounts.push(targetAccount);
      this.saveAccountsVault(accounts);
    }

    const currentSaved = this.getUserProfile();
    const newProfile: UserProfile = {
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

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
    return newProfile;
  },

  switchToGuestMode(): UserProfile {
    // Save active user's state first
    this.syncActiveAccountData();

    const guestProfile: UserProfile = {
      id: 'user-guest',
      name: 'Explorador Invitado',
      email: '',
      isGuest: true,
      avatarEmoji: '🧭',
      bio: 'Modo invitado activo. Crea o inicia sesión en cualquier momento para resguardar tus evaluaciones y notas.',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(guestProfile));
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

  syncActiveAccountData(): void {
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
