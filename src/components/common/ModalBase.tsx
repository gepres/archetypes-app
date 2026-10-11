import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalBaseProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  /** El icono de la cabecera (un icono de lucide, por ejemplo). */
  icono?: React.ReactNode;
  /** Lo de abajo (guardar, cancelar…): siempre a la vista, fuera de lo que se desplaza. */
  pie?: React.ReactNode;
  /** Ancho máximo en pantallas grandes; en el celular ocupa la pantalla entera. */
  ancho?: 'md' | 'lg' | 'xl' | '2xl';
  id?: string;
  children: React.ReactNode;
}

const ANCHOS = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
} as const;

/**
 * El patrón de todos los modales de la app. En el celular ocupa la pantalla entera (100dvh: el
 * alto visible de verdad, sin la barra del navegador), con la cabecera arriba y el pie abajo
 * siempre a la vista, y solo el contenido se desplaza. Desde sm es un modal centrado.
 * Se pinta en un portal sobre el body, para que nada de la vista (la barra de navegación
 * inferior, una animación con transform) quede por encima.
 */
export const ModalBase: React.FC<ModalBaseProps> = ({
  abierto,
  onCerrar,
  titulo,
  subtitulo,
  icono,
  pie,
  ancho = 'lg',
  id,
  children,
}) => {
  const idTitulo = useId();

  // Escape cierra, y el fondo no se desplaza mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPulsar);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = antes;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div
      id={id}
      className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={idTitulo}
    >
      {/* Tocar fuera cierra (en pantallas grandes: en el celular no hay «fuera») */}
      <div className="absolute inset-0" onClick={onCerrar} aria-hidden="true" />

      <div
        className={`relative w-full ${ANCHOS[ancho]} bg-[#0E1513] sm:border sm:border-[#23332D] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90dvh]`}
      >
        <header
          className="shrink-0 flex items-start gap-3 px-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-[#1E2A25] bg-gradient-to-r from-[#121A17] to-[#0E1513]"
          style={{ paddingTop: 'max(0.875rem, env(safe-area-inset-top))' }}
        >
          {icono && (
            <span className="w-10 h-10 shrink-0 rounded-xl bg-[#1A2521] border border-[#315C45] flex items-center justify-center text-[#D6A84F]">
              {icono}
            </span>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={idTitulo} className="font-serif text-lg sm:text-xl font-bold text-[#F2EFE6] leading-snug">
              {titulo}
            </h2>
            {subtitulo && <p className="text-xs text-[#9DA79F] leading-snug mt-0.5">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            title="Cerrar"
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-[#9DA79F] hover:text-[#F2EFE6] bg-[#121A17] hover:bg-[#1A2521] border border-[#23332D] transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:p-6">{children}</div>

        {pie && (
          <footer
            className="shrink-0 px-4 pt-3 sm:px-6 sm:pt-4 border-t border-[#1E2A25] bg-[#0B100E]"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            {pie}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
