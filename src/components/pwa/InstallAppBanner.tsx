import React, { useState } from 'react';
import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

/**
 * Aviso flotante que ofrece instalar la app en el dispositivo.
 *
 * En Android y escritorio el navegador da un prompt nativo y basta un botón.
 * En iOS no existe ese prompt, así que solo cabe explicar los dos pasos manuales.
 * Si el usuario lo cierra no vuelve a aparecer, pero la opción sigue disponible
 * en Perfil → Instalar la aplicación.
 */
export const InstallAppBanner: React.FC = () => {
  const {
    estaInstalada,
    bannerOculto,
    puedeInstalarDirecto,
    requiereInstruccionesManuales,
    instalar,
    ocultarBanner,
  } = useInstallPrompt();

  const [pasosVisibles, setPasosVisibles] = useState(false);

  const hayAlgoQueOfrecer = puedeInstalarDirecto || requiereInstruccionesManuales;
  if (estaInstalada || bannerOculto || !hayAlgoQueOfrecer) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 md:inset-x-auto md:right-6 md:bottom-6 md:w-[380px] z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-[#315C45] bg-[#111A16]/95 backdrop-blur-md shadow-2xl shadow-black/60 overflow-hidden">
        <div className="p-3.5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A2C23] border border-[#315C45] flex items-center justify-center text-[#D6A84F] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm font-semibold text-[#F2EFE6]">
              Lleva tus arquetipos contigo
            </h3>
            <p className="text-[11px] text-[#9DA79F] mt-0.5 leading-snug">
              Instálala en tu dispositivo: se abre a pantalla completa y tu mapa sigue
              disponible sin conexión.
            </p>

            {puedeInstalarDirecto && (
              <button
                onClick={() => void instalar()}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] hover:bg-[#E9C168] text-[#0B1110] text-xs font-bold transition-colors active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar aplicación
              </button>
            )}

            {requiereInstruccionesManuales && !pasosVisibles && (
              <button
                onClick={() => setPasosVisibles(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D6A84F] hover:bg-[#E9C168] text-[#0B1110] text-xs font-bold transition-colors active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Cómo instalarla
              </button>
            )}

            {requiereInstruccionesManuales && pasosVisibles && (
              <ol className="mt-2.5 space-y-1.5 text-[11px] text-[#C9D2CB]">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1A2C23] border border-[#315C45] text-[9px] font-bold text-[#D6A84F] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1">
                    Toca <Share className="w-3.5 h-3.5 text-[#D6A84F] inline" /> Compartir
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1A2C23] border border-[#315C45] text-[9px] font-bold text-[#D6A84F] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="flex items-center gap-1">
                    Elige <Plus className="w-3.5 h-3.5 text-[#D6A84F] inline" /> Añadir a pantalla de inicio
                  </span>
                </li>
              </ol>
            )}
          </div>

          <button
            onClick={ocultarBanner}
            aria-label="Cerrar aviso de instalación"
            className="p-1.5 -m-1 rounded-lg text-[#6F7A73] hover:text-[#F2EFE6] hover:bg-[#1A2521] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
