import React, { useState } from 'react';
import { Compass, Sparkles, Check, ArrowRight, ShieldCheck, Heart, Crown } from 'lucide-react';
import { GenderMode, UserProfile } from '../../types';

interface WelcomePerspectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGender: GenderMode;
  onSelectPerspective: (gender: GenderMode) => void;
}

export const WelcomePerspectiveModal: React.FC<WelcomePerspectiveModalProps> = ({
  isOpen,
  onClose,
  currentGender = 'male',
  onSelectPerspective,
}) => {
  const [selected, setSelected] = useState<GenderMode>(currentGender || 'male');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectPerspective(selected);
    try {
      localStorage.setItem('archetype_perspective_selected', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <div
      id="welcome-perspective-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-xl bg-[#0E1513] border-2 border-[#315C45] rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D6A84F]/15 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2521] border border-[#315C45] text-xs font-semibold text-[#D6A84F] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Bienvenido a tu Mapa Arquetípico</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
            Elige tu Perspectiva de Exploración
          </h2>
          <p className="text-xs sm:text-sm text-[#9DA79F] max-w-md mx-auto leading-relaxed">
            Personaliza el lenguaje simbólico, los nombres arquetípicos y las preguntas reflexivas de toda la plataforma según tu preferencia.
          </p>
        </div>

        {/* Options Cards */}
        <div className="grid grid-cols-1 gap-3 relative z-10">
          {/* Masculina */}
          <div
            onClick={() => setSelected('male')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 text-left select-none ${
              selected === 'male'
                ? 'bg-[#14231D] border-[#86EFAC] shadow-lg ring-1 ring-[#86EFAC]/40'
                : 'bg-[#121A17] border-[#23332D] hover:border-[#315C45] opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold ${
                selected === 'male'
                  ? 'bg-[#315C45] text-[#86EFAC] border border-[#4E8B69]'
                  : 'bg-[#1A2521] text-[#9DA79F] border border-[#23332D]'
              }`}
            >
              ♂
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#F2EFE6]">
                  Perspectiva Masculina
                </span>
                {selected === 'male' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#86EFAC] bg-[#1A3326] px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" /> Seleccionada
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9DA79F]">
                Nombres en clave masculina: <strong className="text-[#E5D7B7]">El Rey, El Guerrero, El Mago, El Padre, El Amante...</strong>
              </p>
              <p className="text-[11px] text-[#718277]">
                Enfoque en la iniciación, soberanía del reino interior y disciplina de propósito.
              </p>
            </div>
          </div>

          {/* Femenina */}
          <div
            onClick={() => setSelected('female')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 text-left select-none ${
              selected === 'female'
                ? 'bg-[#231526] border-[#F472B6] shadow-lg ring-1 ring-[#F472B6]/40'
                : 'bg-[#121A17] border-[#23332D] hover:border-[#53295C] opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold ${
                selected === 'female'
                  ? 'bg-[#7C3AED] text-[#F472B6] border border-[#A855F7]'
                  : 'bg-[#1A2521] text-[#9DA79F] border border-[#23332D]'
              }`}
            >
              ♀
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#F2EFE6]">
                  Perspectiva Femenina
                </span>
                {selected === 'female' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F472B6] bg-[#3B1736] px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" /> Seleccionada
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9DA79F]">
                Nombres en clave femenina: <strong className="text-[#E5D7B7]">La Reina, La Guerrera, La Maga, La Madre, La Amante...</strong>
              </p>
              <p className="text-[11px] text-[#718277]">
                Enfoque en la intuición profunda, soberanía nutricia, coraje y sabiduría cíclica.
              </p>
            </div>
          </div>

          {/* Universal */}
          <div
            onClick={() => setSelected('universal')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 text-left select-none ${
              selected === 'universal'
                ? 'bg-[#221F14] border-[#D6A84F] shadow-lg ring-1 ring-[#D6A84F]/40'
                : 'bg-[#121A17] border-[#23332D] hover:border-[#4B3E23] opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold ${
                selected === 'universal'
                  ? 'bg-[#D6A84F] text-[#0E1513] border border-[#F3E8B5]'
                  : 'bg-[#1A2521] text-[#9DA79F] border border-[#23332D]'
              }`}
            >
              ☯
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#F2EFE6]">
                  Perspectiva Universal / Dual
                </span>
                {selected === 'universal' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D6A84F] bg-[#382E17] px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" /> Seleccionada
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9DA79F]">
                Nombres duales equilibrados: <strong className="text-[#E5D7B7]">Rey / Reina, Guerrero / Guerrera, Mago / Maga...</strong>
              </p>
              <p className="text-[11px] text-[#718277]">
                Ideal para un abordaje integrador que contempla simultáneamente ambas energías arquetípicas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E2A25] relative z-10">
          <span className="text-[11px] text-[#8A968D]">
            ✦ Puedes cambiar esta perspectiva en cualquier momento desde el Inicio o la barra superior.
          </span>
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#315C45] to-[#254836] hover:from-[#3D7055] hover:to-[#315C45] text-[#F2EFE6] font-semibold text-sm shadow-xl transition-all active:scale-95 border border-[#4E8B69]/50"
          >
            <span>Confirmar e Iniciar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
