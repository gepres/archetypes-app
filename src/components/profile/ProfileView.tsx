import React, { useState } from 'react';
import {
  User,
  History,
  Download,
  Trash2,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Info,
  ShieldCheck,
  Upload,
  LogIn,
  Users,
  LogOut,
  Flame,
  Cpu,
  Settings,
  Zap,
  Infinity,
  Cloud,
  RefreshCw,
  Check,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { FirebaseService } from '../../services/firebaseService';
import { AIProviderService } from '../../services/aiProviderService';
import { AccountRecord, AssessmentResult, GenderMode, UserProfile } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { AiSettingsModal } from '../ai/AiSettingsModal';
import { InstallAppCard } from '../pwa/InstallAppCard';

interface ProfileViewProps {
  userProfile: UserProfile;
  history: AssessmentResult[];
  onUpdateProfile: (profile: UserProfile) => void;
  onSelectResult: (result: AssessmentResult) => void;
  onSelectTab: (tab: NavTab) => void;
  onResetAllData: () => void;
  onOpenAuthModal: () => void;
}

const AVATARS = ['👑', '⚔️', '🔮', '🔥', '🏛️', '🛡️', '🃏', '🧭', '🎨', '📜', '⚡', '🦅', '🦁', '🐺', '🌿'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  history,
  onUpdateProfile,
  onSelectResult,
  onSelectTab,
  onResetAllData,
  onOpenAuthModal,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email || '');
  const [gender, setGender] = useState<GenderMode>(userProfile.gender || 'male');
  const [avatarEmoji, setAvatarEmoji] = useState(userProfile.avatarEmoji || '👑');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [aiUsage, setAiUsage] = useState(() => AIProviderService.getUsageStatus());
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);
  const [testCloudLoading, setTestCloudLoading] = useState(false);
  const [testCloudMsg, setTestCloudMsg] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || (userProfile.isGuest ? 'Invitado' : 'Usuario'),
      email: email.trim(),
      gender: gender,
      avatarEmoji: avatarEmoji,
      bio: bio.trim(),
      isGuest: userProfile.isGuest && !email.trim(),
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleManualCloudSync = async () => {
    setSyncLoading(true);
    setSyncResultMsg(null);
    try {
      StorageService.syncActiveAccountData();
      const profile = StorageService.getUserProfile();
      if (profile.id) {
        const ok = await FirebaseService.syncFullDataToCloud(profile.id, {
          currentResult: StorageService.getCurrentResult(),
          history: StorageService.getAssessmentHistory(),
          journalEntries: StorageService.getJournalEntries(),
          challenges: StorageService.getChallenges(),
          chatMessages: StorageService.getChatMessages(),
        });
        if (ok) {
          setSyncResultMsg('¡Sincronización en la Nube de Firebase completada con éxito!');
        } else {
          setSyncResultMsg('Datos guardados localmente. Sincronización en la nube pendiente.');
        }
      } else {
        setSyncResultMsg('Modo invitado: Datos resguardados en este navegador.');
      }
    } catch (e: any) {
      setSyncResultMsg(`Error al sincronizar: ${e?.message || 'Error desconocido'}`);
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSyncResultMsg(null), 4000);
    }
  };

  const handleTestCloudConnection = async () => {
    setTestCloudLoading(true);
    setTestCloudMsg(null);
    try {
      const res = await FirebaseService.testFirestoreConnection();
      setTestCloudMsg(res);
    } catch (err: any) {
      setTestCloudMsg({
        success: false,
        message: err?.message || 'Error al conectar con Firestore.',
      });
    } finally {
      setTestCloudLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: StorageService.getUserProfile(),
      currentResult: StorageService.getCurrentResult(),
      history: StorageService.getAssessmentHistory(),
      journalEntries: StorageService.getJournalEntries(),
      challenges: StorageService.getChallenges(),
      chatMessages: StorageService.getChatMessages(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arquetipos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.currentResult) StorageService.saveCurrentResult(json.currentResult);
        if (json.journalEntries) StorageService.saveJournalEntries(json.journalEntries);
        if (json.challenges) StorageService.saveChallenges(json.challenges);
        if (json.chatMessages) StorageService.saveChatMessages(json.chatMessages);
        if (json.profile) onUpdateProfile(json.profile);
        alert('Datos importados correctamente.');
        window.location.reload();
      } catch (err) {
        alert('Archivo de copia de seguridad no válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="profile-view" className="max-w-4xl mx-auto space-y-8 pb-24 pt-2 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#1E2A25] pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs text-[#D6A84F] font-semibold uppercase tracking-widest">
          <User className="w-4 h-4" />
          <span>Configuración & Datos de Usuario</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6]">
          Perfil, Cuenta e Historial
        </h1>
      </div>

      {/* Account Status Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#121A17] to-[#16221E] border border-[#23332D] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0E1513] border-2 border-[#315C45] flex items-center justify-center text-3xl shadow-md">
            {userProfile.avatarEmoji || '👑'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[#F2EFE6]">
                {userProfile.name}
              </h2>
              {userProfile.isGuest ? (
                <span className="text-[10px] bg-[#1A2521] text-[#9DA79F] px-2.5 py-0.5 rounded-full border border-[#23332D] font-bold">
                  Invitado
                </span>
              ) : (
                <span className="text-[10px] bg-[#315C45] text-[#86EFAC] px-2.5 py-0.5 rounded-full border border-[#437A5C] font-bold">
                  Cuenta Registrada
                </span>
              )}
            </div>
            <p className="text-xs text-[#9DA79F] mt-0.5">
              {userProfile.isGuest
                ? 'Los datos se almacenan en este dispositivo. Inicia sesión para respaldarlos con tu correo.'
                : `Correo activo: ${userProfile.email}`}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
        >
          <LogIn className="w-4 h-4" />
          <span>{userProfile.isGuest ? 'Iniciar Sesión / Registrar' : 'Cambiar de Cuenta'}</span>
        </button>
      </div>

      {/* Firebase Cloud Sync Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121A17] to-[#182420] border border-[#23332D] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D6A84F]/10 border border-[#D6A84F]/30 flex items-center justify-center text-[#D6A84F] shrink-0 shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[#F2EFE6]">
                  Sincronización en la Nube (Firebase Firestore)
                </h3>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-[#9DA79F] mt-0.5">
                Tus evaluaciones, diarios, retos y mensajes se sincronizan automáticamente con tu cuenta en Firebase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualCloudSync}
              disabled={syncLoading}
              className="px-3.5 py-2 bg-[#315C45] hover:bg-[#3D7055] disabled:opacity-50 text-[#F2EFE6] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Sincronizando...' : 'Sincronizar a la Nube'}</span>
            </button>

            <button
              onClick={handleTestCloudConnection}
              disabled={testCloudLoading}
              className="px-3.5 py-2 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{testCloudLoading ? 'Probando...' : 'Probar Firestore'}</span>
            </button>
          </div>
        </div>

        {syncResultMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncResultMsg}</span>
          </div>
        )}

        {testCloudMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
              testCloudMsg.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-red-950/40 border-red-800/60 text-red-200'
            }`}
          >
            {testCloudMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{testCloudMsg.message}</span>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
            Editar Datos del Perfil
          </h3>
          {savedSuccess && (
            <span className="text-xs text-[#86EFAC] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Guardado exitoso</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Nombre o Alias
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#0E1513] border border-[#23332D] text-sm text-[#F2EFE6] focus:outline-none focus:border-[#D6A84F]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              className="w-full p-3 rounded-xl bg-[#0E1513] border border-[#23332D] text-sm text-[#F2EFE6] focus:outline-none focus:border-[#D6A84F]"
            />
          </div>

          {/* Gender Perspective / Archetypal Focus */}
          <div className="space-y-2 pt-1 pb-1">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
                Perspectiva de Género / Enfoque Arquetípico
              </label>
              <span className="text-[11px] text-[#D6A84F] hidden sm:inline">
                Adapta nombres, títulos y narrativas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Masculine */}
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  gender === 'male'
                    ? 'bg-[#182721] border-[#86EFAC] shadow-lg ring-1 ring-[#86EFAC]/50'
                    : 'bg-[#0E1513] border-[#23332D] hover:border-[#315C45]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#F2EFE6] flex items-center gap-1.5">
                    <span className="text-base text-[#86EFAC]">♂</span>
                    <span>Masculino</span>
                  </span>
                  {gender === 'male' && <Check className="w-4 h-4 text-[#86EFAC]" />}
                </div>
                <p className="text-[11px] text-[#9DA79F] leading-snug">
                  El Rey, El Guerrero, El Mago, El Sabio, El Padre, El Amante...
                </p>
              </button>

              {/* Feminine */}
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  gender === 'female'
                    ? 'bg-[#22172E] border-[#C084FC] shadow-lg ring-1 ring-[#C084FC]/50'
                    : 'bg-[#0E1513] border-[#23332D] hover:border-[#7C3AED]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#F2EFE6] flex items-center gap-1.5">
                    <span className="text-base text-[#C084FC]">♀</span>
                    <span>Femenino</span>
                  </span>
                  {gender === 'female' && <Check className="w-4 h-4 text-[#C084FC]" />}
                </div>
                <p className="text-[11px] text-[#9DA79F] leading-snug">
                  La Reina, La Guerrera, La Maga, La Sabia, La Madre, La Amante...
                </p>
              </button>

              {/* Universal */}
              <button
                type="button"
                onClick={() => setGender('universal')}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  gender === 'universal'
                    ? 'bg-[#262014] border-[#D6A84F] shadow-lg ring-1 ring-[#D6A84F]/50'
                    : 'bg-[#0E1513] border-[#23332D] hover:border-[#D6A84F]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#F2EFE6] flex items-center gap-1.5">
                    <span className="text-base text-[#D6A84F]">☯</span>
                    <span>Universal</span>
                  </span>
                  {gender === 'universal' && <Check className="w-4 h-4 text-[#D6A84F]" />}
                </div>
                <p className="text-[11px] text-[#9DA79F] leading-snug">
                  Rey / Reina, Guerrero / Guerrera, Mago / Maga (Enfoque dual)
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Símbolo / Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(av => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatarEmoji(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    avatarEmoji === av
                      ? 'bg-[#315C45] border-2 border-[#D6A84F] scale-110 shadow-md'
                      : 'bg-[#0E1513] border border-[#23332D] hover:border-[#315C45]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Nota o Intención de Crecimiento Personal
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={2}
              placeholder="Ej. Integrar el Guerrero para poner límites claros y nutrir la sabiduría del Rey..."
              className="w-full p-3 rounded-xl bg-[#0E1513] border border-[#23332D] text-sm text-[#F2EFE6] focus:outline-none focus:border-[#D6A84F] resize-none"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 bg-[#315C45] hover:bg-[#3D7055] text-[#F2EFE6] font-semibold text-xs rounded-xl transition-all shadow-md active:scale-98"
          >
            Actualizar Perfil
          </button>
        </form>
      </div>

      {/* Assessment History */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#F2EFE6]">
            <History className="w-4 h-4 text-[#D6A84F]" />
            <span>Historial de Evaluaciones Realizadas ({history.length})</span>
          </div>
          <button
            onClick={() => onSelectTab('test')}
            className="text-xs text-[#D6A84F] hover:underline font-semibold"
          >
            + Nueva Evaluación
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-6 bg-[#0E1513] rounded-2xl border border-[#1E2A25] text-center space-y-2">
            <p className="text-xs text-[#9DA79F]">
              Aún no has completado ninguna evaluación arquetípica.
            </p>
            <button
              onClick={() => onSelectTab('test')}
              className="px-4 py-2 bg-[#315C45] text-[#F2EFE6] text-xs font-semibold rounded-xl"
            >
              Comenzar Test Ahora
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectResult(item);
                  onSelectTab('result');
                }}
                className="p-4 bg-[#0E1513] hover:bg-[#16221E] border border-[#23332D] hover:border-[#315C45] rounded-2xl transition-all cursor-pointer flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{item.dominantArchetype?.emoji || '👑'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#F2EFE6]">
                        {item.title || `Mapa del ${item.dominantArchetype?.name}`}
                      </span>
                      <span className="text-[10px] bg-[#1A2521] text-[#D6A84F] px-2 py-0.5 rounded-full font-bold">
                        {item.type === 'quick' ? 'Rápido' : 'Completo (60)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9DA79F] mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Dominante: {item.dominantArchetype?.name} ({item.dominantArchetype?.normalizedScore}%)</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs text-[#9DA79F] group-hover:text-[#D6A84F] font-semibold">
                  Ver Mapa →
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instalación como app: sigue accesible aunque se cierre el banner flotante */}
      <InstallAppCard />

      {/* AI Provider & Engine Settings Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#F2EFE6] flex items-center gap-2">
                <span>Motor de Inteligencia Artificial</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-sans">
                  {aiUsage.activeKeySource === 'none'
                    ? 'Sin clave'
                    : aiUsage.activeKeySource === 'app'
                      ? 'Incluido con la app'
                      : 'Ilimitado'}
                </span>
              </h3>
              <p className="text-xs text-[#9DA79F]">
                {aiUsage.activeKeySource === 'none'
                  ? 'Sin clave propia: responde el motor simbólico local, sin conexión externa.'
                  : aiUsage.activeKeySource === 'app'
                    ? `Usando la clave incluida con la app (${aiUsage.remainingCourtesy} de ${aiUsage.maxDaily} consultas restantes hoy).`
                    : 'Configurado con tu propia clave o modo local. Sin límites diarios.'}
              </p>
            </div>
          </div>

          <button
            id="profile-open-ai-settings-btn"
            onClick={() => setIsAiSettingsOpen(true)}
            className="px-4 py-2.5 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Proveedores & API Keys</span>
          </button>
        </div>
      </div>

      {/* Backup and Data Export/Import */}
      <div className="p-6 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-4 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2EFE6] flex items-center gap-2">
          <Download className="w-4 h-4 text-[#D6A84F]" />
          <span>Copia de Seguridad & Portabilidad de Datos</span>
        </h3>
        <p className="text-xs text-[#9DA79F] leading-relaxed">
          Descarga un archivo JSON con todas tus evaluaciones, entradas del diario, retos y mensajes de chat para respaldarlos o transferirlos a otro navegador.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Copia de Seguridad (.json)</span>
          </button>

          <label className="px-4 py-2.5 bg-[#1A2521] hover:bg-[#23332D] text-[#C5CFC7] border border-[#23332D] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Importar Copia de Seguridad</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetAllData}
            className="px-4 py-2.5 bg-red-950/40 hover:bg-red-950/70 text-red-300 border border-red-800/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Restablecer Datos Locales</span>
          </button>
        </div>
      </div>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => {
          setIsAiSettingsOpen(false);
          setAiUsage(AIProviderService.getUsageStatus());
        }}
        onSettingsSaved={() => {
          setAiUsage(AIProviderService.getUsageStatus());
        }}
      />
    </div>
  );
};
