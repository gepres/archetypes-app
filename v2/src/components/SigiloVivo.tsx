import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SIGIL_VIEWBOX, sigilLayers } from '@sigils';
import type { SigilArchetypeId, SigilDimensionId } from '@sigils';
import { glifoDe } from '../lib/glifos';

interface SigiloVivoProps {
  archetypeId: string;
  dimension: string;
  color: string;
  /** Dibuja el glifo del arquetipo en el centro. */
  conGlifo?: boolean;
  className?: string;
}

/**
 * El sigilo de un arquetipo, trazándose solo.
 *
 * No es una imagen: es geometría generada a partir de la receta del arquetipo
 * —cuántas puntas, con qué salto, con qué giro, cuántos rayos—, así que los
 * dieciocho se dibujan con las mismas reglas y se leen como una familia. Al
 * entrar, cada capa se traza de la nada, como si alguien la estuviera dibujando;
 * después el anillo gira despacio, la estrella gira al revés y el centro late.
 *
 * Al no ser un mapa de bits, se ve nítido en cualquier pantalla y no pesa nada.
 */
/** El trazo de cada capa: la estrella es la que da caracter, y va mas marcada. */
const grosor = (capa: string) => (capa === 'star' ? 1.6 : capa === 'ring' ? 1 : 1.2);
const opacidad = (capa: string) => (capa === 'rays' ? 0.7 : capa === 'ring' ? 0.65 : 1);

export const SigiloVivo: React.FC<SigiloVivoProps> = ({
  archetypeId,
  dimension,
  color,
  conGlifo = true,
  className = 'w-full h-full',
}) => {
  const reducido = useReducedMotion();

  const capas = useMemo(() => {
    try {
      return sigilLayers(archetypeId as SigilArchetypeId, dimension as SigilDimensionId);
    } catch {
      return [];
    }
  }, [archetypeId, dimension]);

  if (!capas.length) return null;

  // Cada capa arranca un poco después que la anterior: se lee como un trazo
  // continuo en vez de como cuatro cosas apareciendo a la vez.
  const RETRASO = 0.28;

  return (
    <div className={`relative ${className}`}>
      {/* El halo, que respira */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-[8%] rounded-full blur-2xl"
        style={{ backgroundColor: `${color}44` }}
        animate={reducido ? undefined : { opacity: [0.45, 0.85, 0.45], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg viewBox={SIGIL_VIEWBOX} className="relative w-full h-full" fill="none">
        <defs>
          <radialGradient id={`sv-${archetypeId}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#sv-${archetypeId})`} />

        {capas.map((capa, i) => {
          // El anillo gira en un sentido y la estrella en el contrario: es lo que
          // da la sensación de mecanismo vivo en vez de dibujo quieto.
          const giro =
            capa.key === 'ring' ? 360 : capa.key === 'star' ? -360 : capa.key === 'rays' ? 360 : 0;
          const duracion = capa.key === 'ring' ? 64 : capa.key === 'star' ? 92 : 120;

          return (
            <motion.g
              key={capa.key}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={reducido || !giro ? undefined : { rotate: giro }}
              transition={{ duration: duracion, repeat: Infinity, ease: 'linear' }}
            >
              {/* El resplandor: la misma linea, mas ancha y translucida */}
              <motion.path
                d={capa.d}
                stroke={color}
                strokeWidth={grosor(capa.key) * 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.14}
                initial={reducido ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reducido ? 0.01 : 1.6,
                  delay: reducido ? 0 : i * RETRASO,
                  ease: 'easeInOut',
                }}
              />
              <motion.path
                d={capa.d}
                stroke={color}
                strokeWidth={grosor(capa.key)}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reducido ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: opacidad(capa.key) }}
                transition={{
                  duration: reducido ? 0.01 : 1.6,
                  delay: reducido ? 0 : i * RETRASO,
                  ease: 'easeInOut',
                }}
              />
            </motion.g>
          );
        })}

        {/* El glifo del arquetipo: se traza el ultimo, cuando el sigilo ya esta
            hecho, como si el dibujo terminara por dentro. Antes aqui iba un
            emoji, que es un dibujo de otro sistema -a color y con relleno- sobre
            una geometria de linea: nunca iban a parecer la misma pieza. */}
        {conGlifo && (
          <motion.g
            initial={reducido ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reducido ? 0 : capas.length * RETRASO }}
          >
            {/* Un medallon limpio: la estrella cruza el centro y sin este disco
                el glifo se pierde entre sus lineas. */}
            <motion.circle
              cx="50"
              cy="50"
              r="16.5"
              fill="#0B1110"
              initial={reducido ? { opacity: 0.9 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.92, scale: 1 }}
              transition={{ duration: 0.5, delay: reducido ? 0 : capas.length * RETRASO }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <circle cx="50" cy="50" r="16.5" fill="none" stroke={color} strokeWidth={0.5} opacity={0.35} />
            <motion.path
              d={glifoDe(archetypeId)}
              transform="translate(50 50) scale(0.72) translate(-50 -50)"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.2}
            />
            <motion.path
              d={glifoDe(archetypeId)}
              transform="translate(50 50) scale(0.72) translate(-50 -50)"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={reducido ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reducido ? 0.01 : 1.4,
                delay: reducido ? 0 : capas.length * RETRASO,
                ease: 'easeInOut',
              }}
            />
          </motion.g>
        )}

      </svg>


    </div>
  );
};
