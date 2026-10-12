import React from 'react';
import { glifoDe } from '../lib/glifos';

/**
 * El icono de un arquetipo en la V2: su glifo en línea (el mismo que la versión completa y que el
 * centro de los sigilos), en lugar del emoji. El trazo no se escala con el tamaño.
 */
export const Glifo: React.FC<{ id: string; className?: string }> = ({
  id,
  className = 'w-[1.1em] h-[1.1em] text-[#D6A84F]',
}) => (
  <svg
    viewBox="25 25 50 50"
    className={`shrink-0 inline-block ${className}`}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={glifoDe(id)} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
  </svg>
);
