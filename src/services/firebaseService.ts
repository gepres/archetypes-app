import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import {
  AccountRecord,
  AssessmentResult,
  Challenge,
  ChatMessage,
  JournalEntry,
  UserProfile,
} from '../types';

let appInstance: FirebaseApp | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp({
        apiKey: firebaseConfigJson.apiKey,
        authDomain: firebaseConfigJson.authDomain,
        projectId: firebaseConfigJson.projectId,
        storageBucket: firebaseConfigJson.storageBucket,
        messagingSenderId: firebaseConfigJson.messagingSenderId,
        appId: firebaseConfigJson.appId,
        measurementId: firebaseConfigJson.measurementId || undefined,
      });

      if (typeof window !== 'undefined' && firebaseConfigJson.measurementId) {
        isSupported().then(supported => {
          if (supported && appInstance) {
            getAnalytics(appInstance);
          }
        }).catch(() => {});
      }
    }
  }
  return appInstance;
}

export function getFirebaseAuth() {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    const databaseId = firebaseConfigJson.firestoreDatabaseId;
    if (databaseId && databaseId !== '(default)') {
      try {
        dbInstance = getFirestore(app, databaseId);
      } catch (e) {
        dbInstance = getFirestore(app);
      }
    } else {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

export interface CloudSyncStatus {
  isConfigured: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  userEmail: string | null;
  userId: string | null;
}

export const FirebaseService = {
  isConfigured(): boolean {
    return !!(firebaseConfigJson && firebaseConfigJson.projectId && firebaseConfigJson.apiKey);
  },

  getCurrentAuthUser(): FirebaseUser | null {
    try {
      const auth = getFirebaseAuth();
      return auth.currentUser;
    } catch {
      return null;
    }
  },

  onAuthChanged(callback: (user: FirebaseUser | null) => void): () => void {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, callback);
    } catch (e) {
      console.warn('Firebase auth listener not available:', e);
      return () => {};
    }
  },

  // Auth methods
  async registerWithEmail(name: string, email: string, pass: string, avatarEmoji?: string): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }

    const profile: UserProfile = {
      id: cred.user.uid,
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      avatarEmoji: avatarEmoji || '👑',
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await this.saveUserProfileToCloud(profile);
    return profile;
  },

  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);

    // Try loading cloud profile
    const existing = await this.loadUserProfileFromCloud(cred.user.uid);
    if (existing) {
      return existing;
    }

    const profile: UserProfile = {
      id: cred.user.uid,
      name: cred.user.displayName || email.split('@')[0],
      email: email.trim().toLowerCase(),
      avatarEmoji: '👑',
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    await this.saveUserProfileToCloud(profile);
    return profile;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);

    const existing = await this.loadUserProfileFromCloud(cred.user.uid);
    if (existing) {
      return existing;
    }

    const profile: UserProfile = {
      id: cred.user.uid,
      name: cred.user.displayName || 'Explorador Solar',
      email: cred.user.email || '',
      avatarEmoji: '🦅',
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    await this.saveUserProfileToCloud(profile);
    return profile;
  },

  async loginAnonymously(): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    const cred = await signInAnonymously(auth);

    const profile: UserProfile = {
      id: cred.user.uid,
      name: 'Explorador en la Nube',
      email: '',
      avatarEmoji: '🧭',
      isGuest: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    await this.saveUserProfileToCloud(profile);
    return profile;
  },

  async logout(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Error signing out of Firebase:', e);
    }
  },

  // Firestore Sync & Data Operations
  async saveUserProfileToCloud(profile: UserProfile): Promise<void> {
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', profile.id);
      await setDoc(
        userRef,
        {
          ...profile,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error('Error saving user profile to Firestore:', e);
    }
  },

  async loadUserProfileFromCloud(userId: string): Promise<UserProfile | null> {
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.error('Error loading user profile from Firestore:', e);
      return null;
    }
  },

  async syncFullDataToCloud(
    userId: string,
    data: {
      currentResult: AssessmentResult | null;
      history: AssessmentResult[];
      journalEntries: JournalEntry[];
      challenges: Challenge[];
      chatMessages: ChatMessage[];
    }
  ): Promise<boolean> {
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', userId);

      await setDoc(
        userRef,
        {
          currentResult: data.currentResult,
          history: data.history,
          journalEntries: data.journalEntries,
          challenges: data.challenges,
          chatMessages: data.chatMessages,
          lastSyncedAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('Error syncing full data to Firestore:', e);
      return false;
    }
  },

  async loadFullDataFromCloud(userId: string): Promise<{
    currentResult: AssessmentResult | null;
    history: AssessmentResult[];
    journalEntries: JournalEntry[];
    challenges: Challenge[];
    chatMessages: ChatMessage[];
  } | null> {
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const d = snap.data();
        return {
          currentResult: d.currentResult || null,
          history: d.history || [],
          journalEntries: d.journalEntries || [],
          challenges: d.challenges || [],
          chatMessages: d.chatMessages || [],
        };
      }
      return null;
    } catch (e) {
      console.error('Error loading full data from Firestore:', e);
      return null;
    }
  },

  async testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const db = getFirebaseDb();
      const auth = getFirebaseAuth();
      let testUid = auth.currentUser?.uid;

      if (!testUid) {
        // Sign in anonymously to test if needed
        const anon = await signInAnonymously(auth);
        testUid = anon.user.uid;
      }

      const testRef = doc(db, 'users', testUid);
      await setDoc(testRef, { lastPing: new Date().toISOString() }, { merge: true });
      const snap = await getDoc(testRef);

      if (snap.exists()) {
        return {
          success: true,
          message: `Conexión exitosa con Firestore (${firebaseConfigJson.projectId}). Base de datos activa y sincronizada.`,
        };
      } else {
        return {
          success: false,
          message: 'Documento no recuperado en Firestore.',
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Error al conectar con Firestore.',
      };
    }
  },
};
