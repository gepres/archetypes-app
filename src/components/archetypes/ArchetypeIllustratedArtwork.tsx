import React, { useId } from 'react';
import { ArchetypeId } from '../../types';
import { escenaDe } from './escenas';

interface ArchetypeIllustratedArtworkProps {
  archetypeId: ArchetypeId;
  className?: string;
}

/**
 * La ilustración de un arquetipo: su escena simbólica (escenas.tsx), igual para las tres
 * perspectivas. Los ids de sus degradados son únicos por copia, porque el mismo dibujo se pinta
 * varias veces en una página.
 */
export const ArchetypeIllustratedArtwork: React.FC<ArchetypeIllustratedArtworkProps> = ({
  archetypeId,
  className = 'w-full h-full',
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const escena = escenaDe(archetypeId);
  if (!escena) return null;
  return (
    <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {escena(nombre => `esc-${uid}-${nombre}`)}
    </svg>
  );
};
