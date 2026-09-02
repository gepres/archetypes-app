import React, { useState } from 'react';
import {
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle2,
  Users,
  LogOut,
  KeyRound,
  Compass,
  Cloud,
  Loader2,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { FirebaseService } from '../../services/firebaseService';
import { AccountRecord, UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

const AVATAR_OPTIONS = ['👑', '⚔️', '🔮', '🔥', '🏛️', '🛡️', '🃏', '🧭', '🎨', '📜', '⚡', '🦅', '🦁', '🐺', '🌿'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('👑');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<AccountRecord[]>(() =>
    StorageService.getSavedAccounts()
  );

  if (!isOpen) return null;

  const handleRegisterOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Por favor ingresa un correo electrónico válido.');
        setLoading(false);
        return;
      }

      if (tab === 'register' && !name.trim()) {
        setErrorMsg('Por favor ingresa tu nombre o seudónimo.');
        setLoading(false);
        return;
      }

      let profile: UserProfile;
      const passToUse = pinCode.trim() || 'arquetipos123456';

      if (tab === 'register') {
        try {
          profile = await FirebaseService.registerWithEmail(
            name.trim() || email.split('@')[0],
            email.trim(),
            passToUse,
            avatarEmoji
          );
        } catch (fbErr: any) {
          console.warn('Firebase register notice:', fbErr?.message);
          // Fallback to local profile
          profile = StorageService.loginOrCreateAccount({
            name: name.trim() || email.split('@')[0],
            email: email.trim(),
            avatarEmoji: avatarEmoji,
            pinCode: pinCode.trim() || undefined,
          });
        }
      } else {
        try {
          profile = await FirebaseService.loginWithEmail(email.trim(), passToUse);
        } catch (fbErr: any) {
          console.warn('Firebase login notice:', fbErr?.message);
          // Fallback to local profile
          profile = StorageService.loginOrCreateAccount({
            name: name.trim() || email.split('@')[0],
            email: email.trim(),
            avatarEmoji: avatarEmoji,
            pinCode: pinCode.trim() || undefined,
          });
        }
      }

      // Check if user has cloud data to restore
      if (profile.id) {
        const cloudData = await FirebaseService.loadFullDataFromCloud(profile.id);
        if (cloudData) {
          if (cloudData.currentResult) StorageService.saveCurrentResult(cloudData.currentResult);
          if (cloudData.journalEntries?.length) StorageService.saveJournalEntries(cloudData.journalEntries);
          if (cloudData.challenges?.length) StorageService.saveChallenges(cloudData.challenges);
          if (cloudData.chatMessages?.length) StorageService.saveChatMessages(cloudData.chatMessages);
        } else {
          // Sync current session to cloud
          StorageService.syncActiveAccountData();
        }
      }

      StorageService.saveUserProfile(profile);
      setSavedAccounts(StorageService.getSavedAccounts());
      onUserChange(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error durante la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const profile = await FirebaseService.loginWithGoogle();
      
      // Load cloud data if available
      const cloudData = await FirebaseService.loadFullDataFromCloud(profile.id);
      if (cloudData) {
        if (cloudData.currentResult) StorageService.saveCurrentResult(cloudData.currentResult);
        if (cloudData.journalEntries?.length) StorageService.saveJournalEntries(cloudData.journalEntries);
        if (cloudData.challenges?.length) StorageService.saveChallenges(cloudData.challenges);
        if (cloudData.chatMessages?.length) StorageService.saveChatMessages(cloudData.chatMessages);
      } else {
        StorageService.syncActiveAccountData();
      }

      StorageService.saveUserProfile(profile);
      setSavedAccounts(StorageService.getSavedAccounts());
      onUserChange(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingAccount = (account: AccountRecord) => {
    const updatedProfile = StorageService.loginOrCreateAccount({
      name: account.name,
      email: account.email,
      avatarEmoji: account.avatarEmoji,
    });
    setSavedAccounts(StorageService.getSavedAccounts());
    onUserChange(updatedProfile);
    onClose();
  };

  const handleSwitchToGuest = () => {
    FirebaseService.logout().catch(() => {});
    const guestProfile = StorageService.switchToGuestMode();
    onUserChange(guestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F1714] border border-[#23332D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1E2A25] bg-gradient-to-r from-[#121A17] to-[#0F1714] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2521] border border-[#315C45] flex items-center justify-center text-[#D6A84F]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#F2EFE6]">
                {currentUser.isGuest ? 'Identidad & Guardado' : 'Gestión de Cuenta'}
              </h2>
              <p className="text-xs text-[#9DA79F]">
                {currentUser.isGuest
                  ? 'Estás navegando como invitado'
                  : `Conectado como: ${currentUser.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#1A2521] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#1E2A25] bg-[#0C1310] px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`pb-3 text-xs font-semibold px-3 border-b-2 transition-all ${
              tab === 'login'
                ? 'border-[#D6A84F] text-[#D6A84F]'
                : 'border-transparent text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`pb-3 text-xs font-semibold px-3 border-b-2 transition-all ${
              tab === 'register'
                ? 'border-[#D6A84F] text-[#D6A84F]'
                : 'border-transparent text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Crear Cuenta
          </button>
          {savedAccounts.length > 0 && (
            <button
              onClick={() => {
                setTab('switch');
                setErrorMsg('');
              }}
              className={`pb-3 text-xs font-semibold px-3 border-b-2 transition-all ${
                tab === 'switch'
                  ? 'border-[#D6A84F] text-[#D6A84F]'
                  : 'border-transparent text-[#9DA79F] hover:text-[#F2EFE6]'
              }`}
            >
              Cuentas ({savedAccounts.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {tab === 'switch' && savedAccounts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#9DA79F]">
                Selecciona una cuenta guardada para cambiar de perfil con tus datos y notas aisladas:
              </p>
              <div className="space-y-2">
                {savedAccounts.map(acc => {
                  const isCurrent = currentUser.email.toLowerCase() === acc.email.toLowerCase() && !currentUser.isGuest;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectExistingAccount(acc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#121A17] border-[#D6A84F]/60 ring-1 ring-[#D6A84F]/30'
                          : 'bg-[#121A17]/60 border-[#23332D] hover:border-[#315C45] hover:bg-[#121A17]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{acc.avatarEmoji || '👑'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#F2EFE6]">
                              {acc.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#315C45] text-[#D6A84F] px-2 py-0.5 rounded-full font-bold">
                                Activo
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#9DA79F]">{acc.email}</span>
                        </div>
                      </div>
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isCurrent ? 'text-[#D6A84F]' : 'text-[#3E4F47]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterOrLogin} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#C5CFC7] mb-1.5">
                    Tu Nombre o Seudónimo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Marco Aurelio"
                    required={tab === 'register'}
                    className="w-full px-3.5 py-2.5 bg-[#121A17] border border-[#23332D] rounded-xl text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#C5CFC7] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#121A17] border border-[#23332D] rounded-xl text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F] transition-colors"
                />
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#C5CFC7] mb-2">
                    Elige tu Símbolo / Avatar Arquetípico
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                          avatarEmoji === emoji
                            ? 'bg-[#315C45] border-2 border-[#D6A84F] scale-110 shadow-md'
                            : 'bg-[#121A17] border border-[#23332D] hover:border-[#315C45]'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#C5CFC7] mb-1.5 flex justify-between">
                  <span>Contraseña o PIN (Mínimo 6 carácteres)</span>
                  <span className="text-[#6B7A72] font-normal">Para resguardar tu nube</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#121A17] border border-[#23332D] rounded-xl text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#D6A84F] transition-colors"
                  />
                  <KeyRound className="w-4 h-4 text-[#6B7A72] absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#315C45] hover:bg-[#3D7055] disabled:opacity-50 text-[#F2EFE6] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                ) : tab === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Perfil & Sincronizar Nube</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Acceder y Sincronizar Datos</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1E2A25]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0F1714] px-2 text-[#6B7A72]">O continuar con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] hover:border-[#315C45] text-[#F2EFE6] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google (Acceso Inmediato a Firebase)</span>
              </button>
            </form>
          )}

          {/* Cloud Info & Guest Mode Switcher Section */}
          <div className="pt-4 border-t border-[#1E2A25] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9DA79F]">
              <Cloud className="w-4 h-4 text-[#D6A84F]" />
              <span>Firebase Firestore + Auth Activo</span>
            </div>

            {!currentUser.isGuest ? (
              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="text-xs text-[#C5CFC7] hover:text-[#D6A84F] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121A17] border border-[#23332D] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <div className="text-[11px] text-[#D6A84F] bg-[#1A2521] px-2.5 py-1 rounded-md border border-[#315C45]">
                Modo Invitado Local
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
