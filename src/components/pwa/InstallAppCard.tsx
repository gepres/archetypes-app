import React, { useState } from 'react';
import { Download, Share, Plus, Smartphone, CheckCircle2 } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

/**
 * Tarjeta permanente en el perfil. A diferencia del banner flotante, esta no se
 * puede descartar: es el sitio al que acudir si se cerró el aviso, y también
 * confirma el estado cuando la app ya está instalada.
 */
export const InstallAppCard: React.FC = () => {
  const { estaInstalada, puedeInstalarDirecto, requiereInstruccionesManuales, instalar } =
    useInstallPrompt();

  const [pasosVisibles, setPasosVisibles] = useState(false);

  // El navegador no ofrece instalación y tampoco es iOS: no hay nada que contar
  if (!estaInstalada && !puedeInstalarDirecto && !requiereInstruccionesManuales) return null;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#121A17] border border-[#23332D] space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A2C23] border border-[#315C45] flex items-center justify-center text-[#D6A84F] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#F2EFE6] flex items-center gap-2">
              <span>Instalar la aplicación</span>
              {estaInstalada && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162620] text-[#86EFAC] border border-[#315C45] font-sans">
                  Instalada
                </span>
              )}
            </h3>
            <p className="text-xs text-[#9DA79F]">
              {estaInstalada
                ? 'Ya la estás usando como aplicación: pantalla completa y acceso sin conexión.'
                : 'Añádela a tu pantalla de inicio para abrirla a pantalla completa y consultar tu mapa sin conexión.'}
            </p>
          </div>
        </div>

        {estaInstalada ? (
          <CheckCircle2 className="w-5 h-5 text-[#86EFAC] shrink-0 hidden sm:block" />
        ) : puedeInstalarDirecto ? (
          <button
            onClick={() => void instalar()}
            className="px-4 py-2.5 bg-[#D6A84F] hover:bg-[#E9C168] text-[#0B1110] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Instalar ahora</span>
          </button>
        ) : (
          <button
            onClick={() => setPasosVisibles(v => !v)}
            className="px-4 py-2.5 bg-[#1A2521] hover:bg-[#23332D] text-[#D6A84F] border border-[#315C45] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{pasosVisibles ? 'Ocultar pasos' : 'Ver cómo instalarla'}</span>
          </button>
        )}
      </div>

      {requiereInstruccionesManuales && pasosVisibles && (
        <div className="p-4 rounded-2xl bg-[#0E1513] border border-[#23332D] space-y-2.5">
          <p className="text-[11px] text-[#9DA79F]">
            En iPhone y iPad la instalación se hace desde Safari, en dos pasos:
          </p>
          <ol className="space-y-2 text-xs text-[#C9D2CB]">
            <li className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1A2C23] border border-[#315C45] text-[10px] font-bold text-[#D6A84F] flex items-center justify-center shrink-0">
                1
              </span>
              <span className="flex items-center gap-1.5">
                Toca <Share className="w-4 h-4 text-[#D6A84F] inline" /> Compartir, en la barra inferior
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1A2C23] border border-[#315C45] text-[10px] font-bold text-[#D6A84F] flex items-center justify-center shrink-0">
                2
              </span>
              <span className="flex items-center gap-1.5">
                Elige <Plus className="w-4 h-4 text-[#D6A84F] inline" /> Añadir a pantalla de inicio
              </span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
