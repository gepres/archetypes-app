import React from 'react';
import { glifoDe } from '../../data/glifos';

interface ArchetypeGlyphProps {
  id: string;
  /** Tamaño y color. Por defecto, del tamaño del texto que acompaña y en dorado. */
  className?: string;
  /** Si el glifo va solo (sin el nombre al lado), lo que dice a un lector de pantalla. */
  titulo?: string;
  /** Grosor del trazo, en píxeles de pantalla: no cambia con el tamaño. */
  grosor?: number;
}

/**
 * El icono de un arquetipo: su símbolo en línea dorada (la corona del Rey, la espada del
 * Guerrero, el libro del Sabio…), el mismo que llevan los sigilos de la V2. Sustituye al emoji,
 * que era un dibujo de otro sistema —a color, con relleno— y no iba con el estilo de la app.
 * El trazo no se escala (non-scaling-stroke): se ve igual de fino a 16 px que a 48 px.
 */
export const ArchetypeGlyph: React.FC<ArchetypeGlyphProps> = ({
  id,
  className = 'w-[1.15em] h-[1.15em] text-[#D6A84F]',
  titulo,
  grosor = 1.6,
}) => (
  <svg
    viewBox="25 25 50 50"
    className={`shrink-0 inline-block ${className}`}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    role={titulo ? 'img' : undefined}
    aria-label={titulo}
    aria-hidden={titulo ? undefined : true}
    focusable="false"
  >
    <path d={glifoDe(id)} strokeWidth={grosor} vectorEffect="non-scaling-stroke" />
  </svg>
);
