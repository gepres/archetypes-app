import React, { useState, useEffect } from 'react';
import { Cpu, Settings, Zap, Infinity, Sparkles, Key, AlertCircle } from 'lucide-react';
import { AIProviderService, PROVIDER_OPTIONS } from '../../services/aiProviderService';

interface AiModelStatusBadgeProps {
  onOpenSettings: () => void;
  className?: string;
  variant?: 'compact' | 'full' | 'pill';
}

export const AiModelStatusBadge: React.FC<AiModelStatusBadgeProps> = ({
  onOpenSettings,
  className = '',
  variant = 'compact',
}) => {
  const [usage, setUsage] = useState(() => AIProviderService.getUsageStatus());
  const [modelLabel, setModelLabel] = useState(() => {
    const s = AIProviderService.getSettings();
    const opt = PROVIDER_OPTIONS[s.provider];
    if (s.provider === 'openrouter') {
      const found = opt.availableModels.find(m => m.id === s.openrouterModel);
      return found ? found.name : 'Llama 3.3 70B';
    } else if (s.provider === 'gemini') {
      const found = opt.availableModels.find(m => m.id === s.geminiModel);
      return found ? found.name : 'Gemini 2.5 Flash';
    } else if (s.provider === 'openai') {
      const found = opt.availableModels.find(m => m.id === s.openaiModel);
      return found ? found.name : 'GPT-4o Mini';
    }
    return 'IA Local Simbólica';
  });

  const refresh = () => {
    setUsage(AIProviderService.getUsageStatus());
    const s = AIProviderService.getSettings();
    const opt = PROVIDER_OPTIONS[s.provider];
    if (s.provider === 'openrouter') {
      const found = opt.availableModels.find(m => m.id === s.openrouterModel);
      setModelLabel(found ? found.name : 'Llama 3.3 70B');
    } else if (s.provider === 'gemini') {
      const found = opt.availableModels.find(m => m.id === s.geminiModel);
      setModelLabel(found ? found.name : 'Gemini 2.5 Flash');
    } else if (s.provider === 'openai') {
      const found = opt.availableModels.find(m => m.id === s.openaiModel);
      setModelLabel(found ? found.name : 'GPT-4o Mini');
    } else {
      setModelLabel('IA Local Simbólica');
    }
  };

  useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (variant === 'pill') {
    return (
      <button
        id="ai-badge-pill-btn"
        onClick={onOpenSettings}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14201A] hover:bg-[#1A2C23] border border-[#315C45] text-xs text-[#F2EFE6] transition-all shadow-sm active:scale-95 group ${className}`}
        title="Configuración de IA y clave de API"
      >
        <div className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse" />
        <span className="text-[#D6A84F] font-semibold">{modelLabel}</span>
        {usage.activeKeySource === 'none' ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-medium bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" />
            Sin clave · motor local
          </span>
        ) : usage.activeKeySource === 'app' ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-medium bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" />
            Incluido: {usage.remainingCourtesy}/{usage.maxDaily} hoy
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#86EFAC] font-medium bg-[#162620] px-1.5 py-0.5 rounded-md border border-[#315C45]">
            <Infinity className="w-3 h-3" /> {usage.activeKeySource === 'local' ? 'Motor Local' : 'Clave Propia'}
          </span>
        )}
        <Settings className="w-3.5 h-3.5 text-[#9DA79F] group-hover:text-[#D6A84F] ml-0.5 transition-colors" />
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#14221C] via-[#121A17] to-[#0E1513] border border-[#23332D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A2C23] border border-[#315C45] flex items-center justify-center text-[#D6A84F] shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F2EFE6]">Motor Activo: {modelLabel}</span>
              {usage.activeKeySource === 'none' ? (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Sin clave
                </span>
              ) : usage.activeKeySource === 'app' ? (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Incluido con la app
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-[#86EFAC] bg-[#162620] px-2 py-0.5 rounded-full border border-[#315C45]">
                  Ilimitado
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#9DA79F] mt-0.5">
              {usage.activeKeySource === 'none'
                ? 'Sin clave propia responde el motor simbólico local, sin conexión. Añade tu clave para conversar con un modelo de IA.'
                : usage.activeKeySource === 'app'
                  ? `Te quedan ${usage.remainingCourtesy} de ${usage.maxDaily} consultas incluidas hoy. Añade tu propia clave para uso ilimitado.`
                  : usage.activeKeySource === 'local'
                    ? 'Motor simbólico local: responde sin conexión ni consumo de tokens.'
                    : 'Conectado con tu API Key personal. Consultas ilimitadas.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="px-3.5 py-2 rounded-xl bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Ajustes IA / Cambiar Clave</span>
        </button>
      </div>
    );
  }

  // Compact variant (for Sidebar or Header)
  return (
    <button
      id="ai-badge-compact-btn"
      onClick={onOpenSettings}
      className={`w-full p-2.5 rounded-xl bg-[#121A17] hover:bg-[#16221E] border border-[#23332D] hover:border-[#315C45] flex items-center justify-between text-left transition-all group ${className}`}
      title="Configuración de Inteligencia Artificial"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-[#1A2521] border border-[#315C45] flex items-center justify-center text-[#D6A84F] shrink-0">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#F2EFE6] truncate">{modelLabel}</span>
          </div>
          <span className="text-[10px] text-[#9DA79F] block">
            {usage.activeKeySource === 'none' ? (
              <span className="text-amber-400 font-medium">
                Sin clave · motor local
              </span>
            ) : usage.activeKeySource === 'app' ? (
              <span className="text-amber-400 font-medium">
                Incluido ({usage.remainingCourtesy}/{usage.maxDaily})
              </span>
            ) : (
              <span className="text-[#86EFAC] font-medium flex items-center gap-0.5">
                <Infinity className="w-3 h-3 inline" /> Ilimitado
              </span>
            )}
          </span>
        </div>
      </div>
      <Settings className="w-3.5 h-3.5 text-[#6B7A72] group-hover:text-[#D6A84F] shrink-0 transition-colors" />
    </button>
  );
};
