import React from 'react';
import { ArchetypeId, DimensionId } from '../../types';

/**
 * Las ilustraciones de los arquetipos como escena simbólica: sin figura humana (vale igual para
 * las perspectivas masculina, femenina y universal), con los objetos de su símbolo, el dorado de
 * la app y el color de su dimensión. Lienzo de 320×380.
 *
 * Cada escena recibe `id`, que da identificadores únicos para sus degradados: el mismo dibujo se
 * pinta varias veces en una página (galería, selector, ficha), y si dos copias compartieran un
 * id, al ocultarse una, la otra perdería los colores.
 */
export type Escena = (id: (nombre: string) => string) => React.ReactElement;

const ORO_CLARO = '#FFF1BF';

/**
 * El tono de cada dimensión: el fondo (centro, medio y borde), la luz del halo y un acento para
 * los detalles. Los acentos son los colores de dimensión de la app; la luz, una versión más suave.
 */
const PALETAS: Record<DimensionId, { fondo: [string, string, string]; luz: string; acento: string }> = {
  construccion: { fondo: ['#1D2C24', '#0E1814', '#060B09'], luz: '#E9BE62', acento: '#D6A84F' },
  accion: { fondo: ['#2E1B18', '#170D0B', '#0A0605'], luz: '#E8775E', acento: '#EF4444' },
  mente: { fondo: ['#18223A', '#0C1222', '#060912'], luz: '#77A6F2', acento: '#3B82F6' },
  corazon: { fondo: ['#15302A', '#0B1A16', '#050D0B'], luz: '#52D2A6', acento: '#10B981' },
};

/**
 * Degradados comunes a todas las escenas: `fondo` y `luz` (en el tono de la dimensión), `acento`
 * (el color de la dimensión, de claro a oscuro), `oro` y `piedra`.
 */
const Comunes: React.FC<{ id: (n: string) => string; dimension: DimensionId }> = ({ id, dimension }) => {
  const { fondo, luz, acento } = PALETAS[dimension];
  return (
    <>
      <radialGradient id={id('fondo')} cx="50%" cy="44%" r="78%">
        <stop offset="0%" stopColor={fondo[0]} />
        <stop offset="55%" stopColor={fondo[1]} />
        <stop offset="100%" stopColor={fondo[2]} />
      </radialGradient>
      <radialGradient id={id('luz')} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={luz} stopOpacity="0.55" />
        <stop offset="45%" stopColor={luz} stopOpacity="0.18" />
        <stop offset="100%" stopColor={luz} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('acento')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={luz} />
        <stop offset="100%" stopColor={acento} />
      </linearGradient>
      <linearGradient id={id('oro')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={ORO_CLARO} />
        <stop offset="45%" stopColor="#E2B65A" />
        <stop offset="100%" stopColor="#94681F" />
      </linearGradient>
      <linearGradient id={id('piedra')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={fondo[0]} />
        <stop offset="100%" stopColor={fondo[1]} />
      </linearGradient>
    </>
  );
};

/**
 * La escena de un arquetipo, o `undefined` si aún no la tiene. Se busca solo entre las propias:
 * uno de los ids es `constructor`, y en un objeto normal `ESCENAS.constructor` es la función de
 * JavaScript, no una escena.
 */
export const escenaDe = (id: ArchetypeId): Escena | undefined =>
  Object.hasOwn(ESCENAS, id) ? ESCENAS[id] : undefined;

const ESCENAS: Record<string, Escena> = {
  // Rey / Reina: el trono con la corona sobre el cojín y el cetro apoyado; la luz sale de la corona.
  rey: id => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
        <linearGradient id={id('terciopelo')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A2433" />
          <stop offset="100%" stopColor="#2A0F17" />
        </linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Luz que sale de la corona */}
      <circle cx="160" cy="214" r="150" fill={`url(#${id('luz')})`} />
      <g stroke={`url(#${id('oro')})`} strokeLinecap="round" opacity="0.32">
        <line x1="160" y1="114" x2="160" y2="82" strokeWidth="1.4" />
        <line x1="210" y1="127" x2="226" y2="99" strokeWidth="1.2" />
        <line x1="247" y1="164" x2="275" y2="148" strokeWidth="1.2" />
        <line x1="110" y1="127" x2="94" y2="99" strokeWidth="1.2" />
        <line x1="73" y1="164" x2="45" y2="148" strokeWidth="1.2" />
        <line x1="185" y1="117" x2="193" y2="93" strokeWidth="0.8" />
        <line x1="230" y1="143" x2="250" y2="125" strokeWidth="0.8" />
        <line x1="135" y1="117" x2="127" y2="93" strokeWidth="0.8" />
        <line x1="90" y1="143" x2="70" y2="125" strokeWidth="0.8" />
      </g>
      <circle cx="160" cy="214" r="104" stroke={`url(#${id('oro')})`} strokeWidth="1" strokeDasharray="2 6" opacity="0.35" />
      <circle cx="160" cy="214" r="126" stroke={`url(#${id('oro')})`} strokeWidth="0.8" opacity="0.14" />

      {/* Trono */}
      <path
        d="M100 318 L100 178 C100 140 126 116 160 109 C194 116 220 140 220 178 L220 318 Z"
        fill={`url(#${id('piedra')})`}
        stroke={`url(#${id('oro')})`}
        strokeWidth="1.8"
      />
      <path
        d="M114 304 L114 182 C114 152 134 133 160 127 C186 133 206 152 206 182 L206 304"
        stroke={`url(#${id('oro')})`}
        strokeWidth="1"
        opacity="0.45"
      />
      <path d="M160 92 L167 102 L160 112 L153 102 Z" fill={`url(#${id('oro')})`} />
      <rect x="80" y="240" width="26" height="50" rx="7" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <rect x="214" y="240" width="26" height="50" rx="7" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <rect x="92" y="272" width="136" height="20" rx="5" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M108 274 Q160 252 212 274 Z" fill={`url(#${id('terciopelo')})`} stroke={`url(#${id('oro')})`} strokeWidth="1" opacity="0.9" />

      {/* Corona, sobre el cojín */}
      <path
        d="M112 266 L116 214 L138 236 L160 196 L182 236 L204 214 L208 266 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="109" y="256" width="102" height="12" rx="3" fill="#B98B33" stroke={`url(#${id('oro')})`} strokeWidth="1" />
      <circle cx="116" cy="212" r="5" fill={ORO_CLARO} />
      <circle cx="160" cy="193" r="6" fill={ORO_CLARO} />
      <circle cx="204" cy="212" r="5" fill={ORO_CLARO} />
      <circle cx="160" cy="262" r="4" fill="#9E2A3A" stroke={ORO_CLARO} strokeWidth="0.8" />
      <circle cx="134" cy="262" r="2.5" fill="#2E6B52" />
      <circle cx="186" cy="262" r="2.5" fill="#2E6B52" />
      <path d="M160 214 L160 246 M146 238 L174 238" stroke="#7A5418" strokeWidth="1.2" opacity="0.5" />

      {/* Cetro apoyado en el trono */}
      <line x1="238" y1="322" x2="256" y2="196" stroke={`url(#${id('oro')})`} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="257" cy="186" r="9" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="0.8" />
      <path d="M257 168 L257 177 M252.5 172.5 L261.5 172.5" stroke={ORO_CLARO} strokeWidth="1.6" strokeLinecap="round" />

      {/* Gradas */}
      <rect x="72" y="318" width="176" height="11" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1" opacity="0.9" />
      <rect x="56" y="329" width="208" height="11" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1" opacity="0.7" />
      <rect x="40" y="340" width="240" height="13" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1" opacity="0.5" />
      <ellipse cx="160" cy="352" rx="150" ry="16" fill="#D6A84F" opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M58 104 L60 110 L66 112 L60 114 L58 120 L56 114 L50 112 L56 110 Z" opacity="0.7" />
        <path d="M266 92 L267.5 96.5 L272 98 L267.5 99.5 L266 104 L264.5 99.5 L260 98 L264.5 96.5 Z" opacity="0.6" />
        <circle cx="84" cy="200" r="1.4" opacity="0.6" />
        <circle cx="282" cy="236" r="1.2" opacity="0.5" />
        <circle cx="44" cy="262" r="1.2" opacity="0.4" />
        <circle cx="236" cy="70" r="1" opacity="0.5" />
      </g>
    </>
  ),
};
