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
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<AccountRecord[]>(() =>
    StorageService.getSavedAccounts()
  );

  if (!isOpen) return null;

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMsg('Por favor ingresa tu nombre o seudónimo.');
      return;
    }

    const updatedProfile = StorageService.loginOrCreateAccount({
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      avatarEmoji: avatarEmoji,
      pinCode: pinCode.trim() || undefined,
    });

    setSavedAccounts(StorageService.getSavedAccounts());
    onUserChange(updatedProfile);
    onClose();
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
                  <span>Clave / PIN de Seguridad (Opcional)</span>
                  <span className="text-[#6B7A72] font-normal">Para proteger tu sesión</span>
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
                className="w-full py-3 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {tab === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Guardar y Crear Mi Perfil</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Acceder a Mi Cuenta</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Guest Mode Switcher Section */}
          <div className="pt-4 border-t border-[#1E2A25] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9DA79F]">
              <ShieldCheck className="w-4 h-4 text-[#315C45]" />
              <span>Privacidad garantizada en tu navegador local</span>
            </div>

            {!currentUser.isGuest ? (
              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="text-xs text-[#C5CFC7] hover:text-[#D6A84F] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121A17] border border-[#23332D] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Usar como Invitado</span>
              </button>
            ) : (
              <div className="text-[11px] text-[#D6A84F] bg-[#1A2521] px-2.5 py-1 rounded-md border border-[#315C45]">
                Modo Invitado Activo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
