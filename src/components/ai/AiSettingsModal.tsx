import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Infinity,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Gift,
} from 'lucide-react';
import {
  AIProviderId,
  AISettings,
  KeyMode,
} from '../../types';
import {
  AIProviderService,
  DEFAULT_COURTESY_DAILY_LIMIT,
  PROVIDER_OPTIONS,
} from '../../services/aiProviderService';
import { ModalBase } from '../common/ModalBase';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const [settings, setSettings] = useState<AISettings>(() => AIProviderService.getSettings());
  const [activeTab, setActiveTab] = useState<AIProviderId>(settings.provider);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = AIProviderService.getSettings();
      setSettings(current);
      setActiveTab(current.provider);
      setTestStatus(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const usageStatus = AIProviderService.getUsageStatus();
  const currentProviderOpt = PROVIDER_OPTIONS[activeTab];
  // La clave de cortesía del proveedor que se está mirando, y su cupo (común a todos).
  const conCortesia = activeTab !== 'local' && Boolean(AIProviderService.getAppKeyFor(activeTab));
  const cortesiaMax = settings.courtesyQuota?.maxDaily || DEFAULT_COURTESY_DAILY_LIMIT;
  const cortesiaRestante = Math.max(0, cortesiaMax - (settings.courtesyQuota?.usedToday || 0));

  const handleProviderSelect = (prov: AIProviderId) => {
    setActiveTab(prov);
    setSettings(prev => ({ ...prev, provider: prov }));
    setTestStatus(null);
  };

  const handleKeyModeChange = (provider: 'gemini' | 'openrouter', mode: KeyMode) => {
    if (provider === 'gemini') {
      setSettings(prev => ({ ...prev, geminiKeyMode: mode }));
    } else if (provider === 'openrouter') {
      setSettings(prev => ({ ...prev, openrouterKeyMode: mode }));
    }
    setTestStatus(null);
  };

  const handleKeyChange = (provider: AIProviderId, val: string) => {
    if (provider === 'openrouter') {
      setSettings(prev => ({
        ...prev,
        openrouterApiKey: val,
        openrouterKeyMode: val.trim() ? 'custom' : prev.openrouterKeyMode,
      }));
    } else if (provider === 'gemini') {
      setSettings(prev => ({
        ...prev,
        geminiApiKey: val,
        geminiKeyMode: val.trim() ? 'custom' : prev.geminiKeyMode,
      }));
    } else if (provider === 'openai') {
      setSettings(prev => ({ ...prev, openaiApiKey: val }));
    }
    setTestStatus(null);
  };

  const handleModelChange = (provider: AIProviderId, modelId: string) => {
    if (provider === 'openrouter') {
      setSettings(prev => ({ ...prev, openrouterModel: modelId }));
    } else if (provider === 'gemini') {
      setSettings(prev => ({ ...prev, geminiModel: modelId }));
    } else if (provider === 'openai') {
      setSettings(prev => ({ ...prev, openaiModel: modelId }));
    }
  };

  const getCurrentKey = (provider: AIProviderId): string => {
    if (provider === 'openrouter') return settings.openrouterApiKey || '';
    if (provider === 'gemini') return settings.geminiApiKey || '';
    if (provider === 'openai') return settings.openaiApiKey || '';
    return '';
  };

  const getCurrentModel = (provider: AIProviderId): string => {
    if (provider === 'openrouter') return settings.openrouterModel || PROVIDER_OPTIONS.openrouter.defaultModel;
    if (provider === 'gemini') return settings.geminiModel || PROVIDER_OPTIONS.gemini.defaultModel;
    if (provider === 'openai') return settings.openaiModel || PROVIDER_OPTIONS.openai.defaultModel;
    return 'sintesis-local';
  };

  const getKeyMode = (provider: AIProviderId): KeyMode => {
    if (provider === 'openrouter') return settings.openrouterKeyMode || (settings.openrouterApiKey?.trim() ? 'custom' : 'courtesy');
    if (provider === 'gemini') return settings.geminiKeyMode || (settings.geminiApiKey?.trim() ? 'custom' : 'courtesy');
    return 'custom';
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const currentKey = getCurrentKey(activeTab);
    const currentModel = getCurrentModel(activeTab);
    const mode = getKeyMode(activeTab);

    const result = await AIProviderService.testConnection(activeTab, currentKey, currentModel, mode);
    setTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  const handleSave = () => {
    AIProviderService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSettingsSaved?.();
      onClose();
    }, 600);
  };

  const handleResetToDefaults = () => {
    const today = new Date().toISOString().split('T')[0];
    const resetSettings: AISettings = {
      provider: 'openrouter',
      openrouterKeyMode: 'courtesy',
      geminiKeyMode: 'courtesy',
      openrouterApiKey: '',
      geminiApiKey: '',
      openaiApiKey: '',
      openrouterModel: PROVIDER_OPTIONS.openrouter.defaultModel,
      geminiModel: PROVIDER_OPTIONS.gemini.defaultModel,
      openaiModel: PROVIDER_OPTIONS.openai.defaultModel,
      useAppCourtesyKey: true,
      courtesyQuota: {
        lastResetDate: today,
        usedToday: 0,
        maxDaily: 10,
      },
    };
    setSettings(resetSettings);
    setActiveTab('openrouter');
    setTestStatus({ loading: false, success: true, message: 'Se han restaurado los valores recomendados por defecto.' });
  };

  const toggleShowKey = (prov: string) => {
    setShowApiKey(prev => ({ ...prev, [prov]: !prev[prov] }));
  };

  const pie = (
    <div className="flex items-center justify-between gap-2">
      <button
        id="reset-ai-settings-btn"
        onClick={handleResetToDefaults}
        className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restaurar<span className="hidden sm:inline">&nbsp;valores recomendados</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          id="save-ai-settings-btn"
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> Guardar Ajustes
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <ModalBase
      abierto={isOpen}
      onCerrar={onClose}
      id="ai-settings-modal-backdrop"
      ancho="2xl"
      icono={<Sparkles className="w-5 h-5" />}
      titulo="Ajustes del Motor de IA"
      subtitulo="Elige con qué asistente conversar y con qué modelo."
      pie={pie}
    >
      <div id="ai-settings-modal-card" className="space-y-6 text-neutral-100">
        {/* Status Banner */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${usageStatus.isUnlimited ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {usageStatus.isUnlimited ? <Infinity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-300 flex items-center gap-2">
                <span>Estado Actual:</span>
                <span className={`font-semibold ${usageStatus.isUnlimited ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {usageStatus.activeKeySource === 'none'
                    ? 'Sin clave configurada'
                    : usageStatus.activeKeySource === 'app'
                      ? 'Clave incluida con la app'
                      : 'Consultas Ilimitadas'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {usageStatus.activeKeySource === 'none'
                  ? 'Se responderá con el motor simbólico local. Añade tu clave de API abajo para conversar con un modelo de IA.'
                  : usageStatus.activeKeySource === 'app'
                    ? `Puedes chatear ya mismo: te quedan ${usageStatus.remainingCourtesy} de ${usageStatus.maxDaily} consultas incluidas hoy. Añade tu clave abajo para uso ilimitado.`
                    : 'Conectado mediante tu clave de API personal o motor local sin restricciones de cuota.'}
              </div>
            </div>
          </div>
        </div>


        {/* Provider Selection Tabs */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5">
            1. Proveedor de Inteligencia Artificial
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(PROVIDER_OPTIONS) as AIProviderId[]).map(provId => {
              const opt = PROVIDER_OPTIONS[provId];
              const isSelected = activeTab === provId;
              return (
                <button
                  key={provId}
                  id={`select-provider-${provId}`}
                  onClick={() => handleProviderSelect(provId)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-sm'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.icon}</span>
                  <span className="text-xs font-medium line-clamp-1">{opt.name}</span>
                  {/* OpenRouter y Gemini traen una clave de cortesía: no «requieren» la tuya. */}
                  {provId === 'local' ? (
                    <span className="text-[10px] text-emerald-400/90 mt-0.5">Sin conexión</span>
                  ) : AIProviderService.getAppKeyFor(provId) ? (
                    <span className="text-[10px] text-emerald-400/90 mt-0.5 inline-flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Incluido
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/80 mt-0.5">Requiere tu clave</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider Details & Key Configuration */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <span>{currentProviderOpt.icon}</span> {currentProviderOpt.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentProviderOpt.tagline}
              </p>
            </div>

            {currentProviderOpt.getKeyUrl && (
              <a
                href={currentProviderOpt.getKeyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 underline decoration-amber-400/40"
              >
                Obtener Clave Gratis <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* La clave de cortesía: OpenRouter y Gemini se pueden usar sin configurar nada */}
          {activeTab !== 'local' && conCortesia && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                <span className="font-semibold text-emerald-300">Clave de cortesía incluida.</span> Puedes usar{' '}
                {currentProviderOpt.name} sin configurar nada: la app trae una clave de cortesía con {cortesiaMax}{' '}
                consultas al día (hoy te quedan {cortesiaRestante}). Si pegas tu propia clave, conversas con tu cuenta y
                sin ese límite.
              </p>
            </div>
          )}

          {/* Campo de clave: la propia (opcional si hay de cortesía) */}
          {activeTab !== 'local' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  {conCortesia
                    ? `Tu propia clave de ${currentProviderOpt.name} (opcional)`
                    : `Pega tu clave de ${currentProviderOpt.name}`}
                </label>
                {getCurrentKey(activeTab) ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-medium">
                    ✓ Clave propia · sin límite
                  </span>
                ) : conCortesia ? (
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Usando la de cortesía
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                    Sin clave · responde el motor local
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id={`api-key-input-${activeTab}`}
                  type={showApiKey[activeTab] ? 'text' : 'password'}
                  value={getCurrentKey(activeTab)}
                  onChange={e => handleKeyChange(activeTab, e.target.value)}
                  placeholder={
                    activeTab === 'gemini'
                      ? 'Ejemplo: AIzaSy...'
                      : activeTab === 'openrouter'
                      ? 'Ejemplo: sk-or-v1-...'
                      : 'Ejemplo: sk-...'
                  }
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey(activeTab)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                >
                  {showApiKey[activeTab] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tu clave se almacena exclusivamente en tu navegador (localStorage) y se comunica directamente con la API oficial sin intermediarios.
              </p>
            </div>
          )}


          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Modelo Seleccionado
            </label>
            <div className="grid grid-cols-1 gap-2">
              {currentProviderOpt.availableModels.map(mod => {
                const isSelected = getCurrentModel(activeTab) === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleModelChange(activeTab, mod.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
                        {mod.name}
                        {mod.recommended && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{mod.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-neutral-800">
            <button
              id="test-ai-connection-btn"
              onClick={handleTestConnection}
              disabled={testStatus?.loading}
              className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {testStatus?.loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  Probando conexión...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Probar Conexión del Modelo ({getKeyMode(activeTab) === 'courtesy' ? 'Cortesía' : 'Clave Propia'})
                </>
              )}
            </button>

            {testStatus?.message && (
              <div
                className={`text-[11px] flex items-center gap-1.5 ${
                  testStatus.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
