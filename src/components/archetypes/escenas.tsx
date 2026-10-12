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
  accion: { fondo: ['#4A2219', '#211010', '#0B0605'], luz: '#F08A6A', acento: '#EF4444' },
  mente: { fondo: ['#1E2E57', '#0E1630', '#060A16'], luz: '#86B0F7', acento: '#3B82F6' },
  corazon: { fondo: ['#17473A', '#0B241D', '#050F0C'], luz: '#5FE0B4', acento: '#10B981' },
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
  // Guerrero / Guerrera: la espada erguida protege el centro de un escudo de límites.
  guerrero: id => (
    <>
      <defs>
        <Comunes id={id} dimension="accion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del discernimiento */}
      <circle cx="160" cy="197" r="149" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="160" cy="197" r="119" strokeWidth="1.4" />
        <circle cx="160" cy="197" r="137" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 46 V30 M68 104 L54 93 M252 104 L266 93" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Escudo redondo y borde de límites */}
      <circle cx="160" cy="217" r="94" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="3" />
      <circle cx="160" cy="217" r="85" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="9" />
      <circle cx="160" cy="217" r="73" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <g fill={`url(#${id('oro')})`}>
        <circle cx="160" cy="131" r="3" />
        <circle cx="74" cy="217" r="3" />
        <circle cx="246" cy="217" r="3" />
        <circle cx="99" cy="278" r="3" />
        <circle cx="221" cy="278" r="3" />
      </g>
      <path d="M112 173 Q87 215 110 254 M208 173 Q233 215 210 254" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2" opacity="0.4" />
      <circle cx="160" cy="217" r="26" fill={`url(#${id('oro')})`} />
      <circle cx="160" cy="217" r="19" fill={`url(#${id('piedra')})`} stroke={ORO_CLARO} strokeWidth="1.4" />

      {/* Espada recta, con filo luminoso */}
      <path
        d="M160 61 L177 96 L171 251 L149 251 L143 96 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M160 72 L160 244" stroke={ORO_CLARO} strokeWidth="2.5" />
      <path d="M161 93 L170 102 L166 240 L161 240 Z" fill={`url(#${id('piedra')})`} opacity="0.35" />
      <path d="M117 249 Q160 239 203 249 L203 259 Q160 252 117 259 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <rect x="153" y="259" width="14" height="47" rx="4" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <path d="M154 270 L166 266 M154 281 L166 277 M154 292 L166 288" stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <circle cx="160" cy="313" r="10" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" />

      {/* Tierra firme */}
      <path d="M38 337 L69 326 L118 331 L160 323 L206 330 L257 325 L284 338 L282 353 H38 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M65 340 L103 337 M124 346 L149 342 M194 342 L247 337" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.4" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M57 117 L59 123 L65 125 L59 127 L57 133 L55 127 L49 125 L55 123 Z" opacity="0.7" />
        <path d="M263 73 L265 79 L271 81 L265 83 L263 89 L261 83 L255 81 L261 79 Z" opacity="0.6" />
        <circle cx="93" cy="67" r="1.5" opacity="0.6" />
        <circle cx="276" cy="245" r="1.3" opacity="0.5" />
        <circle cx="44" cy="276" r="1.2" opacity="0.4" />
        <circle cx="217" cy="48" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Mago / Maga: una esfera de órbitas flota sobre una red circular de sistemas.
  mago: id => (
    <>
      <defs>
        <Comunes id={id} dimension="mente" />
        <radialGradient id={id('esfera')} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor={ORO_CLARO} />
          <stop offset="40%" stopColor="#86B0F7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1E2E57" />
        </radialGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo alquímico */}
      <circle cx="160" cy="163" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.25">
        <circle cx="160" cy="163" r="117" strokeWidth="1.4" />
        <circle cx="160" cy="163" r="136" strokeWidth="1" strokeDasharray="2 9" />
        <path d="M160 42 V26 M52 162 H35 M268 162 H285" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Esfera luminosa y órbitas */}
      <ellipse cx="160" cy="177" rx="108" ry="41" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2.4" transform="rotate(-30 160 177)" />
      <ellipse cx="160" cy="177" rx="108" ry="41" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="3" transform="rotate(38 160 177)" />
      <circle cx="160" cy="165" r="67" fill={`url(#${id('esfera')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.8" />
      <path d="M114 145 Q123 115 151 113" fill="none" stroke={ORO_CLARO} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M135 223 Q176 238 205 199" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="3" opacity="0.6" />
      <ellipse cx="160" cy="177" rx="108" ry="41" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2.4" strokeDasharray="160 210" transform="rotate(-30 160 177)" />
      <circle cx="68" cy="222" r="6" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <circle cx="245" cy="212" r="5" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <circle cx="237" cy="122" r="4" fill={`url(#${id('oro')})`} />

      {/* Diagrama de sistemas, sin pentagrama */}
      <ellipse cx="160" cy="290" rx="105" ry="44" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.2" />
      <ellipse cx="160" cy="290" rx="87" ry="34" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="1.8" />
      <g fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8">
        <path d="M87 291 L122 269 L197 269 L233 291 L199 312 L123 312 Z" />
        <path d="M87 291 H233 M122 269 L160 291 L197 269 M123 312 L160 291 L199 312" />
        <path d="M122 269 L123 312 M197 269 L199 312" opacity="0.45" />
      </g>
      <g fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4">
        <circle cx="87" cy="291" r="4" />
        <circle cx="122" cy="269" r="4" />
        <circle cx="197" cy="269" r="4" />
        <circle cx="233" cy="291" r="4" />
        <circle cx="123" cy="312" r="4" />
        <circle cx="199" cy="312" r="4" />
        <circle cx="160" cy="291" r="7" fill={`url(#${id('acento')})`} />
      </g>

      {/* Base de piedra */}
      <path d="M55 291 V303 A105 44 0 0 0 265 303 V291 A105 44 0 0 1 55 291 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <ellipse cx="160" cy="350" rx="140" ry="13" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M67 82 L69 88 L75 90 L69 92 L67 98 L65 92 L59 90 L65 88 Z" opacity="0.7" />
        <path d="M265 251 L267 257 L273 259 L267 261 L265 267 L263 261 L257 259 L263 257 Z" opacity="0.6" />
        <circle cx="99" cy="46" r="1.4" opacity="0.6" />
        <circle cx="279" cy="156" r="1.3" opacity="0.5" />
        <circle cx="43" cy="255" r="1.2" opacity="0.4" />
        <circle cx="221" cy="62" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Sabio / Sabia: un libro abierto en un atril recibe la luz de una linterna lateral.
  sabio: id => (
    <>
      <defs>
        <Comunes id={id} dimension="mente" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Luz que sale de la linterna */}
      <circle cx="231" cy="169" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.25">
        <circle cx="231" cy="169" r="87" strokeWidth="1.2" />
        <path d="M231 65 V48 M284 95 L296 80 M194 84 L184 64 M279 238 L293 253" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Atril de piedra */}
      <path d="M107 226 L155 226 L150 304 L174 324 H87 L112 304 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.2" />
      <path d="M122 244 H140 L137 301 H125 Z" fill={`url(#${id('oro')})`} opacity="0.5" />
      <path d="M52 227 L72 207 H196 L212 227 L208 239 H55 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M64 234 H200" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.5" />

      {/* Libro abierto, páginas y lomo */}
      <path d="M47 156 Q89 139 130 164 Q166 139 206 156 L212 221 Q169 207 132 231 Q92 207 48 221 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="3" strokeLinejoin="round" />
      <path d="M54 150 Q89 135 130 159 L130 223 Q95 202 55 214 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M130 159 Q166 135 199 150 L205 214 Q164 202 130 223 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M130 160 V222" stroke={`url(#${id('piedra')})`} strokeWidth="2.2" />
      <g fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="1.4" opacity="0.55">
        <path d="M65 166 Q91 160 118 174 M65 177 Q91 171 118 185" />
        <path d="M65 188 Q91 182 118 196 M65 199 Q91 193 118 207" />
        <path d="M143 174 Q168 160 190 166 M143 185 Q168 171 191 177" />
        <path d="M143 196 Q168 182 192 188 M143 207 Q168 193 193 199" />
      </g>
      <path d="M169 143 L181 142 L185 205 L179 200 L173 208 Z" fill={`url(#${id('acento')})`} />

      {/* Linterna de Diógenes */}
      <path d="M217 124 V107 Q231 87 245 107 V124" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="3" />
      <path d="M209 130 L220 117 H242 L253 130 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <rect x="211" y="131" width="40" height="65" rx="4" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.5" />
      <rect x="218" y="138" width="26" height="49" rx="2" fill={`url(#${id('luz')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <path d="M231 146 Q216 166 231 177 Q246 166 231 146 Z" fill={`url(#${id('oro')})`} />
      <path d="M231 157 Q226 166 231 169 Q237 165 231 157 Z" fill={ORO_CLARO} />
      <path d="M215 190 H247 L254 200 H208 Z" fill={`url(#${id('oro')})`} />
      <path d="M212 201 L216 291 M250 201 L246 291" stroke={`url(#${id('oro')})`} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="231" cy="295" rx="30" ry="7" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />

      {/* Suelo del estudio */}
      <rect x="61" y="325" width="195" height="12" rx="3" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M37 346 H280 M82 337 L64 351 M219 337 L240 351" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.25" />
      <ellipse cx="160" cy="352" rx="146" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M55 105 L57 111 L63 113 L57 115 L55 121 L53 115 L47 113 L53 111 Z" opacity="0.7" />
        <path d="M273 219 L275 225 L281 227 L275 229 L273 235 L271 229 L265 227 L271 225 Z" opacity="0.6" />
        <circle cx="108" cy="77" r="1.4" opacity="0.6" />
        <circle cx="277" cy="138" r="1.3" opacity="0.5" />
        <circle cx="37" cy="272" r="1.2" opacity="0.4" />
        <circle cx="177" cy="58" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Sacerdote / Sacerdotisa: un cáliz de oro ante el velo translúcido del misterio.
  sacerdote: id => (
    <>
      <defs>
        <Comunes id={id} dimension="mente" />
        <linearGradient id={id('velo')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#86B0F7" stopOpacity="0.06" />
          <stop offset="45%" stopColor="#86B0F7" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#86B0F7" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del cáliz */}
      <circle cx="160" cy="186" r="147" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.22">
        <circle cx="160" cy="186" r="105" strokeWidth="1.4" />
        <circle cx="160" cy="186" r="127" strokeWidth="1" strokeDasharray="2 7" />
        <path d="M160 58 V38 M85 88 L74 72 M235 88 L246 72" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Velo suspendido y pliegues transparentes */}
      <path d="M65 80 Q112 71 160 82 Q207 71 255 80 L267 288 Q237 276 212 290 Q186 277 160 290 Q132 277 108 290 Q81 277 53 288 Z" fill={`url(#${id('velo')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" strokeOpacity="0.25" />
      <path d="M66 78 Q160 61 254 78" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2" opacity="0.45" />
      <g fill="none" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.16">
        <path d="M86 83 Q95 175 77 276" />
        <path d="M111 80 Q117 171 105 278" />
        <path d="M139 83 Q143 175 134 280" />
        <path d="M183 83 Q177 175 187 280" />
        <path d="M210 80 Q202 171 215 278" />
        <path d="M237 83 Q226 175 246 276" />
      </g>

      {/* Copa y borde del cáliz */}
      <path
        d="M106 154 H214 C210 205 193 227 166 231 L166 265 Q182 270 188 281 H132 Q138 270 154 265 L154 231 C127 227 110 205 106 154 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="160" cy="154" rx="54" ry="12" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="3" />
      <ellipse cx="160" cy="154" rx="43" ry="6" fill={`url(#${id('acento')})`} opacity="0.85" />
      <path d="M120 174 Q126 207 147 215" fill="none" stroke={ORO_CLARO} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M191 176 Q187 206 174 216" fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="3" opacity="0.35" />
      <path d="M149 187 L160 176 L171 187 L160 202 Z" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <ellipse cx="160" cy="281" rx="32" ry="6" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <path d="M155 132 Q149 118 157 104 M166 134 Q176 118 167 98" fill="none" stroke={ORO_CLARO} strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />

      {/* Mesa de piedra sencilla */}
      <rect x="62" y="289" width="196" height="18" rx="3" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <rect x="85" y="307" width="25" height="38" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <rect x="210" y="307" width="25" height="38" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M73 298 H245 M95 315 V337 M220 315 V337" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.3" />
      <path d="M44 348 H276" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.3" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M48 130 L50 136 L56 138 L50 140 L48 146 L46 140 L40 138 L46 136 Z" opacity="0.7" />
        <path d="M274 102 L276 108 L282 110 L276 112 L274 118 L272 112 L266 110 L272 108 Z" opacity="0.6" />
        <circle cx="97" cy="49" r="1.4" opacity="0.6" />
        <circle cx="278" cy="229" r="1.3" opacity="0.5" />
        <circle cx="36" cy="282" r="1.2" opacity="0.4" />
        <circle cx="212" cy="47" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Amante: un corazón radiante de oro se eleva sobre un loto abierto en el agua.
  amante: id => (
    <>
      <defs>
        <Comunes id={id} dimension="corazon" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del corazón */}
      <circle cx="160" cy="165" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.27">
        <circle cx="160" cy="165" r="110" strokeWidth="1.4" />
        <circle cx="160" cy="165" r="132" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 49 V29 M95 71 L84 54 M225 71 L236 54 M51 149 L33 146 M269 149 L287 146" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* Corazón de oro suspendido */}
      <path
        d="M160 119 C124 72 76 108 86 148 C94 181 134 207 160 228 C186 207 226 181 234 148 C244 108 196 72 160 119 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M105 137 C103 116 128 109 142 129" fill="none" stroke={ORO_CLARO} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M218 142 Q208 174 164 210" fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="3" opacity="0.35" />
      <path d="M147 225 Q160 237 173 225" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.4" />

      {/* Loto abierto: pétalos laterales y cáliz central */}
      <path d="M160 305 Q80 315 50 251 Q120 244 160 305 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <path d="M160 305 Q240 315 270 251 Q200 244 160 305 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <path d="M160 301 Q92 289 83 224 Q145 235 160 301 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M160 301 Q228 289 237 224 Q175 235 160 301 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M160 302 Q117 271 125 227 Q158 246 160 302 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M160 302 Q203 271 195 227 Q162 246 160 302 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M160 310 Q124 281 160 239 Q196 281 160 310 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <g fill="none" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.5">
        <path d="M160 298 V256" />
        <path d="M140 296 Q112 278 96 244" />
        <path d="M180 296 Q208 278 224 244" />
        <path d="M121 299 Q87 286 67 263" />
        <path d="M199 299 Q233 286 253 263" />
      </g>
      <ellipse cx="160" cy="311" rx="49" ry="7" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />

      {/* Agua y reflejo tenue */}
      <path d="M27 320 Q87 307 160 320 Q233 307 293 320 V359 H27 Z" fill={`url(#${id('piedra')})`} opacity="0.9" />
      <g fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.4">
        <ellipse cx="160" cy="324" rx="89" ry="9" opacity="0.5" />
        <ellipse cx="160" cy="332" rx="119" ry="13" opacity="0.25" />
        <path d="M35 346 H88 M234 346 H285 M120 351 H194" opacity="0.25" />
      </g>
      <ellipse cx="160" cy="350" rx="145" ry="15" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M51 98 L53 104 L59 106 L53 108 L51 114 L49 108 L43 106 L49 104 Z" opacity="0.7" />
        <path d="M268 206 L270 212 L276 214 L270 216 L268 222 L266 216 L260 214 L266 212 Z" opacity="0.6" />
        <circle cx="112" cy="49" r="1.4" opacity="0.6" />
        <circle cx="282" cy="132" r="1.3" opacity="0.5" />
        <circle cx="41" cy="238" r="1.2" opacity="0.4" />
        <circle cx="219" cy="61" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Padre / Madre: un árbol de raíces visibles cobija un nido entre sus ramas.
  padre: id => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo protector de la copa */}
      <circle cx="160" cy="177" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="160" cy="177" r="125" strokeWidth="1.4" />
        <circle cx="160" cy="177" r="142" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 29 V17 M64 66 L53 54 M256 66 L267 54" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Copa amplia con masas de hojas */}
      <path d="M70 216 C37 207 40 170 58 156 C40 124 63 95 94 98 C96 66 129 56 151 72 C174 42 210 64 218 89 C258 80 281 110 265 142 C291 164 276 198 253 207 C235 234 202 224 181 213 C158 236 128 222 114 214 C95 229 78 226 70 216 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.6" />
      <path d="M67 145 Q59 113 91 113 M108 97 Q112 78 138 84 M180 78 Q203 74 207 101 M228 107 Q254 101 255 129" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2" opacity="0.5" />
      <path d="M61 173 Q49 194 76 203 M242 170 Q266 167 263 190" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.4" />

      {/* Tronco ramificado y raíces */}
      <path
        d="M148 290 L146 222 L120 198 L95 164 L105 160 L134 189 L151 198 L151 145 L163 145 L166 187 L192 160 L214 130 L223 136 L202 171 L171 207 L173 289 L204 309 L240 320 L238 330 L192 317 L164 305 L145 322 L102 333 L91 326 L127 310 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M159 216 L160 291 L143 310 M167 294 L193 310 M146 224 L149 269" fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="2.4" opacity="0.5" />
      <path d="M152 291 Q130 294 118 309 L75 321 M167 294 Q186 294 207 304 L257 319" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="3" strokeLinecap="round" />

      {/* Hojas doradas y acento de la dimensión */}
      <g fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4">
        <path d="M93 164 Q70 145 82 123 Q105 135 93 164 Z" />
        <path d="M151 153 Q129 129 141 109 Q164 123 151 153 Z" />
        <path d="M165 143 Q164 115 188 107 Q193 134 165 143 Z" />
        <path d="M219 139 Q212 113 233 104 Q246 126 219 139 Z" />
      </g>
      <path d="M112 202 Q87 204 84 184 Q108 176 112 202 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M216 209 Q237 185 249 204 Q239 224 216 209 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />

      {/* Nido protector, con tres huevos */}
      <path d="M166 203 Q190 214 220 200 Q216 225 192 229 Q170 225 166 203 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <ellipse cx="183" cy="201" rx="6" ry="9" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" transform="rotate(-15 183 201)" />
      <ellipse cx="195" cy="199" rx="6" ry="9" fill={ORO_CLARO} />
      <ellipse cx="207" cy="201" rx="6" ry="9" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.4" transform="rotate(15 207 201)" />
      <path d="M167 205 Q192 218 220 202 M174 214 Q196 223 214 211 M182 223 L205 216" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" strokeLinecap="round" />

      {/* Tierra y raíces asentadas */}
      <path d="M34 339 Q90 324 160 335 Q223 322 286 338 L284 356 H36 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <path d="M57 347 L88 341 M111 348 L135 343 M205 346 L247 340" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.35" />
      <ellipse cx="160" cy="351" rx="148" ry="15" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M45 84 L47 90 L53 92 L47 94 L45 100 L43 94 L37 92 L43 90 Z" opacity="0.7" />
        <path d="M272 247 L274 253 L280 255 L274 257 L272 263 L270 257 L264 255 L270 253 Z" opacity="0.6" />
        <circle cx="105" cy="42" r="1.4" opacity="0.6" />
        <circle cx="285" cy="126" r="1.3" opacity="0.5" />
        <circle cx="45" cy="276" r="1.2" opacity="0.4" />
        <circle cx="230" cy="51" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Cuidador / Cuidadora: dos contornos de palmas abiertas sostienen tierra y un brote.
  cuidador: id => (
    <>
      <defs>
        <Comunes id={id} dimension="corazon" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del brote */}
      <circle cx="160" cy="190" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="160" cy="190" r="112" strokeWidth="1.4" />
        <circle cx="160" cy="190" r="135" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 49 V31 M80 90 L66 76 M240 90 L254 76" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Palmas abiertas, sin brazos ni relleno */}
      <g fill="none" stroke={`url(#${id('oro')})`} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M143 311 C115 309 86 299 73 280 C60 262 52 231 52 214 C52 204 61 203 65 212 L77 239 L65 192 C63 182 72 177 77 187 L93 227 L83 179 C81 170 91 166 96 176 L110 219 L105 184 C104 175 114 174 118 184 L131 229 L139 214 C144 205 155 207 153 218 L145 253 C152 272 157 293 143 311 Z" />
        <path d="M177 311 C205 309 234 299 247 280 C260 262 268 231 268 214 C268 204 259 203 255 212 L243 239 L255 192 C257 182 248 177 243 187 L227 227 L237 179 C239 170 229 166 224 176 L210 219 L215 184 C216 175 206 174 202 184 L189 229 L181 214 C176 205 165 207 167 218 L175 253 C168 272 163 293 177 311 Z" />
      </g>

      {/* Montículo de tierra sostenido entre las palmas */}
      <path
        d="M113 253 Q129 238 145 242 Q160 226 177 242 Q194 238 208 253 L199 270 Q161 283 121 270 Z"
        fill={`url(#${id('piedra')})`}
        stroke={`url(#${id('oro')})`}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M130 257 L141 253 M151 264 L164 260 M180 253 L189 257" stroke={`url(#${id('oro')})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <circle cx="143" cy="268" r="2" fill={`url(#${id('oro')})`} opacity="0.5" />
      <circle cx="178" cy="267" r="2.5" fill={`url(#${id('oro')})`} opacity="0.4" />

      {/* Brote verde de hojas grandes */}
      <path d="M160 242 Q169 193 158 154" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="6" strokeLinecap="round" />
      <path d="M160 206 Q111 205 101 156 Q149 149 160 206 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <path d="M163 179 Q167 126 213 115 Q223 164 163 179 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <path d="M157 156 Q130 132 149 104 Q177 127 157 156 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <g fill="none" stroke={ORO_CLARO} strokeWidth="1.8" strokeLinecap="round" opacity="0.65">
        <path d="M159 203 L113 166 M133 181 L132 169 M143 190 L127 191" />
        <path d="M168 174 L203 129 M183 155 L184 140 M191 145 L206 143" />
        <path d="M157 148 L152 119" />
      </g>
      <path d="M152 244 L148 251 M164 242 L171 251" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.5" />

      {/* Suelo y luz de abrigo */}
      <path d="M40 345 Q97 331 160 342 Q224 331 280 345" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.4" />
      <path d="M61 353 H112 M205 353 H259" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.25" />
      <ellipse cx="160" cy="350" rx="145" ry="15" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M57 112 L59 118 L65 120 L59 122 L57 128 L55 122 L49 120 L55 118 Z" opacity="0.7" />
        <path d="M259 88 L261 94 L267 96 L261 98 L259 104 L257 98 L251 96 L257 94 Z" opacity="0.6" />
        <circle cx="112" cy="65" r="1.4" opacity="0.6" />
        <circle cx="282" cy="235" r="1.3" opacity="0.5" />
        <circle cx="40" cy="294" r="1.2" opacity="0.4" />
        <circle cx="215" cy="51" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Bufón / Bufona: un espejo sin rostro refleja destellos junto a tres cascabeles.
  bufon: id => (
    <>
      <defs>
        <Comunes id={id} dimension="corazon" />
        <linearGradient id={id('reflejo')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5FE0B4" stopOpacity="0.5" />
          <stop offset="45%" stopColor={ORO_CLARO} stopOpacity="0.18" />
          <stop offset="100%" stopColor="#17473A" />
        </linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la risa */}
      <circle cx="150" cy="187" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="150" cy="187" r="118" strokeWidth="1.4" />
        <circle cx="150" cy="187" r="137" strokeWidth="1" strokeDasharray="2 9" />
        <path d="M89 66 L80 50 M224 88 L240 75 M33 174 H19" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Espejo de mano ovalado */}
      <g transform="rotate(-15 127 195)">
        <path d="M118 246 H136 L141 312 Q127 328 113 312 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="2" />
        <path d="M124 263 V304" stroke={ORO_CLARO} strokeWidth="2" opacity="0.6" />
        <ellipse cx="127" cy="165" rx="66" ry="91" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="4" />
        <ellipse cx="127" cy="165" rx="56" ry="80" fill={`url(#${id('reflejo')})`} stroke={`url(#${id('oro')})`} strokeWidth="3" />
        <ellipse cx="127" cy="165" rx="48" ry="71" fill="none" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.35" />
        <path d="M90 146 Q95 113 119 102 M137 225 Q158 212 168 187" fill="none" stroke={ORO_CLARO} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M97 175 L145 119 M106 192 L155 135" stroke={ORO_CLARO} strokeWidth="6" strokeLinecap="round" opacity="0.2" />
        <path d="M146 169 Q158 178 151 194" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.45" />
      </g>

      {/* Cinta colgada de una argolla, con tres cascabeles a los lados */}
      <circle cx="250" cy="90" r="10" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="3" />
      <path d="M243 100 H257 V298 L250 288 L243 298 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M250 106 V282" stroke={ORO_CLARO} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
      <g stroke={`url(#${id('oro')})`} strokeWidth="1.8" strokeLinecap="round">
        <path d="M243 126 L222 142" />
        <path d="M257 180 L276 196" />
        <path d="M243 234 L224 251" />
      </g>
      <g>
        <g>
          <circle cx="216" cy="158" r="17" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
          <circle cx="216" cy="164" r="3.5" fill={`url(#${id('piedra')})`} />
          <path d="M216 164 V174" stroke={`url(#${id('piedra')})`} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M205 150 Q212 143 222 148" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </g>
        <g>
          <circle cx="280" cy="212" r="17" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
          <circle cx="280" cy="218" r="3.5" fill={`url(#${id('piedra')})`} />
          <path d="M280 218 V228" stroke={`url(#${id('piedra')})`} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M269 204 Q276 197 286 202" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </g>
        <g>
          <circle cx="218" cy="268" r="18" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
          <circle cx="218" cy="274" r="3.5" fill={`url(#${id('piedra')})`} />
          <path d="M218 274 V284" stroke={`url(#${id('piedra')})`} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M207 260 Q214 253 224 258" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        </g>
      </g>

      {/* Pedestal bajo */}
      <ellipse cx="160" cy="333" rx="118" ry="17" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <path d="M42 333 V342 Q160 371 278 342 V333" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <ellipse cx="160" cy="352" rx="146" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M47 96 L49 102 L55 104 L49 106 L47 112 L45 106 L39 104 L45 102 Z" opacity="0.7" />
        <path d="M272 67 L274 73 L280 75 L274 77 L272 83 L270 77 L264 75 L270 73 Z" opacity="0.6" />
        <circle cx="122" cy="42" r="1.4" opacity="0.6" />
        <circle cx="287" cy="249" r="1.3" opacity="0.5" />
        <circle cx="40" cy="272" r="1.2" opacity="0.4" />
        <circle cx="199" cy="52" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Explorador / Exploradora: una brújula grande y un bastón abren el camino entre montañas.
  explorador: id => (
    <>
      <defs>
        <Comunes id={id} dimension="accion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la orientación */}
      <circle cx="151" cy="218" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.23">
        <circle cx="151" cy="218" r="117" strokeWidth="1.4" />
        <circle cx="151" cy="218" r="136" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M151 76 V57 M49 115 L36 103 M254 115 L267 103" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Montañas y camino que se pierde al fondo */}
      <path d="M25 190 L86 101 L135 171 L179 90 L253 184 L293 138 V288 H25 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.65" />
      <path d="M69 125 L86 101 L104 127 L87 119 Z M158 118 L179 90 L202 119 L180 109 Z" fill={`url(#${id('oro')})`} opacity="0.35" />
      <path d="M146 181 Q171 195 149 214 Q121 238 181 269 L220 349 H90 Q151 290 131 265 Q96 226 144 203 Q157 193 146 181 Z" fill={`url(#${id('oro')})`} opacity="0.18" />
      <path d="M146 181 Q171 195 149 214 M131 265 Q151 290 90 349" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.4" />

      {/* Bastón de peregrino, apoyado */}
      <path d="M235 330 L264 106 Q271 78 252 81 Q239 83 243 98" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="9" strokeLinecap="round" />
      <path d="M234 329 L263 106" stroke={ORO_CLARO} strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="M254 132 L267 134 M253 140 L266 142 M252 148 L265 150" stroke={`url(#${id('piedra')})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M263 152 Q282 167 268 180" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="4" strokeLinecap="round" />

      {/* Brújula de bronce en primer plano */}
      <circle cx="139" cy="124" r="12" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="4" />
      <circle cx="139" cy="229" r="93" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="2.2" />
      <circle cx="139" cy="229" r="81" fill={`url(#${id('piedra')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <circle cx="139" cy="229" r="69" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <g stroke={`url(#${id('oro')})`} strokeWidth="2" strokeLinecap="round">
        <path d="M139 153 V165 M139 293 V305 M63 229 H75 M203 229 H215" />
        <path d="M85 175 L93 183 M185 275 L193 283 M85 283 L93 275 M185 183 L193 175" />
      </g>
      <path d="M139 176 L151 217 L192 229 L151 241 L139 282 L127 241 L86 229 L127 217 Z" fill={`url(#${id('oro')})`} opacity="0.75" />
      <g transform="rotate(24 139 229)">
        <path d="M139 165 L155 229 L139 240 L123 229 Z" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
        <path d="M139 293 L123 229 L139 240 L155 229 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
        <path d="M139 173 V226" stroke={ORO_CLARO} strokeWidth="1.6" opacity="0.65" />
      </g>
      <circle cx="139" cy="229" r="8" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
      <path d="M65 207 Q74 167 108 157" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />

      {/* Tierra del sendero */}
      <path d="M30 340 L67 331 L101 337 L142 329 L190 337 L249 328 L288 340" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.6" />
      <path d="M56 349 H90 M203 349 H254" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.25" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M48 78 L50 84 L56 86 L50 88 L48 94 L46 88 L40 86 L46 84 Z" opacity="0.7" />
        <path d="M283 220 L285 226 L291 228 L285 230 L283 236 L281 230 L275 228 L281 226 Z" opacity="0.6" />
        <circle cx="122" cy="56" r="1.4" opacity="0.6" />
        <circle cx="284" cy="111" r="1.3" opacity="0.5" />
        <circle cx="33" cy="268" r="1.2" opacity="0.4" />
        <circle cx="219" cy="60" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Creador / Creadora: piedra a medio tallar, martillo, cincel y paleta del artista.
  creador: id => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la creación */}
      <circle cx="160" cy="205" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="160" cy="205" r="118" strokeWidth="1.4" />
        <circle cx="160" cy="205" r="138" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 59 V41 M69 104 L56 89 M251 104 L264 89" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Bloque irregular, con una faceta ya esculpida */}
      <path d="M79 170 L167 145 L216 177 L211 293 L165 318 L73 289 L66 235 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M79 170 L151 190 L216 177 M151 190 L165 318" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M90 190 L133 201 L143 279 L102 266 L84 235 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M90 190 L100 216 L84 235 M100 216 L133 201 M100 216 L143 279" fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="1.8" opacity="0.4" />
      <path d="M172 203 L199 194 L197 227 M175 257 L201 248 M180 283 L193 276" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.4" />
      <path d="M75 274 L85 280 L79 291 M115 296 L133 301" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.45" />

      {/* Martillo del escultor apoyado en diagonal */}
      <g transform="rotate(27 226 207)">
        <rect x="220" y="142" width="13" height="171" rx="4" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
        <path d="M221 254 H232 M221 263 H232 M221 272 H232 M221 281 H232" stroke={`url(#${id('piedra')})`} strokeWidth="2.4" />
        <path d="M193 114 L246 114 L260 125 L260 149 L246 157 H194 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
        <rect x="193" y="117" width="14" height="36" rx="2" fill={`url(#${id('oro')})`} />
        <path d="M214 124 H246 L250 128 V144 H214 Z" fill={`url(#${id('oro')})`} opacity="0.4" />
      </g>

      {/* Cincel, distinto del martillo */}
      <path d="M70 311 L109 219 L118 223 L80 314 L71 322 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
      <path d="M109 217 L122 222" stroke={`url(#${id('oro')})`} strokeWidth="5" strokeLinecap="round" />
      <path d="M76 309 L110 230" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.6" />

      {/* Paleta perforada con manchas de pintura */}
      <path d="M205 240 C230 225 271 239 273 266 C277 298 245 321 216 310 C196 303 195 289 208 281 C218 273 194 260 205 240 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="2" />
      <ellipse cx="218" cy="258" rx="7" ry="10" fill={`url(#${id('piedra')})`} stroke={ORO_CLARO} strokeWidth="1.4" transform="rotate(25 218 258)" />
      <circle cx="240" cy="247" r="7" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.4" />
      <circle cx="258" cy="265" r="8" fill="#9E2A3A" />
      <circle cx="249" cy="289" r="8" fill="#2E6B52" />
      <ellipse cx="225" cy="297" rx="8" ry="6" fill={`url(#${id('piedra')})`} />
      <path d="M236 245 L240 243 M254 263 L258 261 M245 287 L249 285" stroke={ORO_CLARO} strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />

      {/* Suelo del taller y fragmentos de piedra */}
      <path d="M35 339 H287" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.5" />
      <path d="M95 328 L104 319 L114 330 Z M157 329 L164 324 L174 332 Z M185 340 L196 330 L205 339 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <path d="M52 348 H87 M234 348 H271" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.25" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M55 119 L57 125 L63 127 L57 129 L55 135 L53 129 L47 127 L53 125 Z" opacity="0.7" />
        <path d="M273 92 L275 98 L281 100 L275 102 L273 108 L271 102 L265 100 L271 98 Z" opacity="0.6" />
        <circle cx="108" cy="65" r="1.4" opacity="0.6" />
        <circle cx="287" cy="207" r="1.3" opacity="0.5" />
        <circle cx="39" cy="267" r="1.2" opacity="0.4" />
        <circle cx="218" cy="58" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Héroe / Heroína: un rayo atraviesa el laurel de victoria sobre peldaños ascendentes.
  heroe: id => (
    <>
      <defs>
        <Comunes id={id} dimension="accion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la fuerza */}
      <circle cx="160" cy="176" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.25">
        <circle cx="160" cy="176" r="119" strokeWidth="1.4" />
        <circle cx="160" cy="176" r="138" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 31 V17 M67 79 L54 65 M253 79 L266 65" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Ramas circulares del laurel */}
      <path d="M154 280 C70 264 55 157 119 105 M166 280 C250 264 265 157 201 105" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="4" strokeLinecap="round" />
      <g fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6">
        <path d="M114 111 Q96 104 104 79 Q129 83 114 111 Z" />
        <path d="M98 129 Q70 134 70 105 Q94 102 98 129 Z" />
        <path d="M88 153 Q61 152 55 129 Q83 121 88 153 Z" />
        <path d="M83 180 Q56 173 50 153 Q77 149 83 180 Z" />
        <path d="M86 208 Q57 204 51 181 Q79 174 86 208 Z" />
        <path d="M98 237 Q67 240 61 216 Q87 201 98 237 Z" />
        <path d="M121 260 Q91 271 80 247 Q103 227 121 260 Z" />
        <path d="M143 275 Q125 295 108 274 Q119 255 143 275 Z" />
        <path d="M206 111 Q224 104 216 79 Q191 83 206 111 Z" />
        <path d="M222 129 Q250 134 250 105 Q226 102 222 129 Z" />
        <path d="M232 153 Q259 152 265 129 Q237 121 232 153 Z" />
        <path d="M237 180 Q264 173 270 153 Q243 149 237 180 Z" />
        <path d="M234 208 Q263 204 269 181 Q241 174 234 208 Z" />
        <path d="M222 237 Q253 240 259 216 Q233 201 222 237 Z" />
        <path d="M199 260 Q229 271 240 247 Q217 227 199 260 Z" />
        <path d="M177 275 Q195 295 212 274 Q201 255 177 275 Z" />
      </g>
      <path d="M151 279 Q135 289 131 304 L160 292 L189 304 Q185 289 169 279 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />

      {/* Rayo de fuerza, grande y compacto */}
      <path
        d="M167 65 L114 186 H153 L132 269 L211 151 H169 L192 65 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M172 80 L129 176 H165 L149 230 L194 163 H155 Z" fill={`url(#${id('acento')})`} opacity="0.65" />
      <path d="M167 92 L135 166" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />

      {/* Camino de peldaños que asciende */}
      <rect x="123" y="307" width="74" height="10" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <rect x="103" y="318" width="114" height="10" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <rect x="81" y="329" width="158" height="11" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <rect x="57" y="341" width="206" height="12" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <path d="M132 312 H188 M113 323 H207 M91 334 H229" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.3" />
      <ellipse cx="160" cy="353" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M45 102 L47 108 L53 110 L47 112 L45 118 L43 112 L37 110 L43 108 Z" opacity="0.7" />
        <path d="M276 244 L278 250 L284 252 L278 254 L276 260 L274 254 L268 252 L274 250 Z" opacity="0.6" />
        <circle cx="105" cy="48" r="1.4" opacity="0.6" />
        <circle cx="285" cy="149" r="1.3" opacity="0.5" />
        <circle cx="35" cy="271" r="1.2" opacity="0.4" />
        <circle cx="228" cy="45" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Rebelde: una antorcha encendida ilumina una cadena con un eslabón abierto.
  rebelde: id => (
    <>
      <defs>
        <Comunes id={id} dimension="accion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la llama */}
      <circle cx="160" cy="158" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.26">
        <circle cx="160" cy="158" r="105" strokeWidth="1.4" />
        <circle cx="160" cy="158" r="128" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M80 70 L67 55 M240 70 L253 55 M34 153 H19 M286 153 H301" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Llama alzada en acento y oro */}
      <path d="M148 206 C102 188 104 147 124 119 C133 106 139 81 134 68 C157 80 169 105 165 125 C188 106 189 80 180 54 C220 87 229 129 206 159 C225 167 217 201 179 211 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M149 201 C120 183 130 160 142 143 C152 129 153 114 151 104 C174 121 177 146 166 163 C182 159 190 140 190 129 C209 166 192 202 168 207 Z" fill={`url(#${id('oro')})`} />
      <path d="M155 199 Q142 183 158 165 Q171 148 164 134 Q190 170 171 199 Z" fill={ORO_CLARO} />
      <path d="M116 103 Q105 89 117 78 M217 111 Q229 98 221 88" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
      <path d="M159 60 Q151 47 159 37" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="3" strokeLinecap="round" />

      {/* Copa de la antorcha y mango */}
      <path
        d="M125 200 H195 L180 227 H140 Z"
        fill={`url(#${id('piedra')})`}
        stroke={`url(#${id('oro')})`}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M130 206 H190 M140 218 H180" stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M147 227 H173 L168 306 Q160 313 152 306 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M151 242 H170 M152 252 H170 M153 262 H169 M153 272 H168 M154 282 H167" stroke={`url(#${id('piedra')})`} strokeWidth="3" opacity="0.65" />
      <path d="M155 232 V240 M157 290 V302" stroke={ORO_CLARO} strokeWidth="2" strokeLinecap="round" />

      {/* Cadena y eslabón roto, con extremos separados */}
      <g fill="none" stroke={`url(#${id('oro')})`} strokeWidth="7" strokeLinecap="round">
        <ellipse cx="69" cy="310" rx="25" ry="12" transform="rotate(24 69 310)" />
        <ellipse cx="108" cy="326" rx="26" ry="12" transform="rotate(15 108 326)" />
        <path d="M164 322 L148 320 Q127 318 127 331 Q127 343 147 344 L167 345" />
        <ellipse cx="210" cy="323" rx="26" ry="12" transform="rotate(-20 210 323)" />
        <ellipse cx="248" cy="304" rx="25" ry="12" transform="rotate(-30 248 304)" />
      </g>
      <g fill="none" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.55">
        <path d="M48 301 Q68 293 85 307 M87 318 Q107 312 124 325" />
        <path d="M139 324 H155 M137 339 L154 340" />
        <path d="M190 321 Q209 304 228 316 M229 302 Q247 285 264 293" />
      </g>
      <path d="M176 318 L182 309 M177 338 L186 344" stroke={`url(#${id('acento')})`} strokeWidth="3" strokeLinecap="round" />

      {/* Tierra bajo la cadena */}
      <path d="M28 352 Q90 345 160 352 Q231 345 292 352" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.4" />
      <path d="M60 361 H108 M219 361 H258" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.2" />
      <ellipse cx="160" cy="355" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M49 95 L51 101 L57 103 L51 105 L49 111 L47 105 L41 103 L47 101 Z" opacity="0.7" />
        <path d="M274 228 L276 234 L282 236 L276 238 L274 244 L272 238 L266 236 L272 234 Z" opacity="0.6" />
        <circle cx="88" cy="43" r="1.4" opacity="0.6" />
        <circle cx="281" cy="122" r="1.3" opacity="0.5" />
        <circle cx="37" cy="247" r="1.2" opacity="0.4" />
        <circle cx="228" cy="38" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Sanador / Sanadora: un caduceo de serpientes simples acompaña un manantial de roca.
  sanador: id => (
    <>
      <defs>
        <Comunes id={id} dimension="corazon" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del manantial y la vara */}
      <circle cx="153" cy="197" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="153" cy="197" r="116" strokeWidth="1.4" />
        <circle cx="153" cy="197" r="136" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M153 53 V34 M62 92 L49 78 M244 92 L257 78" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Roca del manantial */}
      <path d="M149 285 L167 218 L200 198 L239 214 L267 270 L259 305 L213 320 L160 310 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M167 218 L198 239 L200 198 M198 239 L239 214 M198 239 L181 288 M225 264 L257 280" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.5" />
      <path d="M209 237 Q220 230 231 238 L236 252 H208 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />

      {/* Vara y alas pequeñas del caduceo */}
      <path d="M113 116 V303" stroke={`url(#${id('oro')})`} strokeWidth="7" strokeLinecap="round" />
      <circle cx="113" cy="108" r="9" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
      <path d="M111 132 C95 106 65 112 55 99 Q60 137 104 145 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M115 132 C131 106 161 112 171 99 Q166 137 122 145 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M65 114 Q79 131 98 131 M161 114 Q147 131 128 131" fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="1.8" opacity="0.5" />

      {/* Dos serpientes sin ojos ni detalles de rostro */}
      <path d="M101 145 C72 158 79 183 115 195 C151 207 149 229 114 242 C81 255 88 276 113 288" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M125 145 C154 158 147 183 111 195 C75 207 77 229 112 242 C145 255 138 276 113 288" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M98 149 Q82 159 87 169 M128 149 Q144 159 139 169 M87 213 Q88 225 104 231 M139 213 Q138 225 122 231" fill="none" stroke={ORO_CLARO} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="100" cy="145" rx="7" ry="5" fill={`url(#${id('oro')})`} transform="rotate(-25 100 145)" />
      <ellipse cx="126" cy="145" rx="7" ry="5" fill={`url(#${id('acento')})`} transform="rotate(25 126 145)" />
      <path d="M105 301 H121 L126 308 H100 Z" fill={`url(#${id('oro')})`} />

      {/* Agua pura que brota y cae a la poza */}
      <path d="M218 243 Q196 245 206 266 Q221 288 207 315 H232 Q247 290 225 266 Q216 255 229 245 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <path d="M222 249 Q209 252 220 270 Q237 292 221 312" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <path d="M202 291 Q198 299 202 303 Q209 300 202 291 Z M240 306 Q235 316 240 320 Q246 316 240 306 Z" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.4" />

      {/* Poza y ondas */}
      <ellipse cx="169" cy="330" rx="121" ry="23" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <g fill="none" stroke={`url(#${id('acento')})`} strokeWidth="1.8">
        <ellipse cx="218" cy="325" rx="25" ry="5" />
        <ellipse cx="208" cy="329" rx="49" ry="9" opacity="0.65" />
        <ellipse cx="185" cy="333" rx="84" ry="13" opacity="0.4" />
      </g>
      <path d="M64 337 H94 M122 346 H194" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.3" />
      <ellipse cx="160" cy="353" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M48 161 L50 167 L56 169 L50 171 L48 177 L46 171 L40 169 L46 167 Z" opacity="0.7" />
        <path d="M263 116 L265 122 L271 124 L265 126 L263 132 L261 126 L255 124 L261 122 Z" opacity="0.6" />
        <circle cx="86" cy="62" r="1.4" opacity="0.6" />
        <circle cx="281" cy="244" r="1.3" opacity="0.5" />
        <circle cx="35" cy="277" r="1.2" opacity="0.4" />
        <circle cx="211" cy="51" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Constructor / Constructora: una piedra angular cúbica y una escuadra ante un arco incompleto.
  constructor: (id: Parameters<Escena>[0]) => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la estructura */}
      <circle cx="160" cy="198" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.22">
        <circle cx="160" cy="198" r="119" strokeWidth="1.4" />
        <circle cx="160" cy="198" r="138" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 53 V35 M62 93 L48 80 M258 93 L272 80" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Arco y muro en construcción */}
      <g fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.6">
        <rect x="51" y="207" width="30" height="39" />
        <rect x="51" y="164" width="30" height="39" />
        <path d="M53 159 Q55 133 71 114 L94 136 Q84 147 82 159 Z" />
        <path d="M75 110 Q93 91 117 84 L127 115 Q109 122 97 133 Z" />
        <path d="M122 82 Q144 75 166 78 L163 110 Q146 109 132 113 Z" />
        <path d="M172 79 Q197 82 217 99 L197 124 Q183 113 169 111 Z" />
        <rect x="239" y="207" width="30" height="39" />
        <rect x="239" y="164" width="30" height="39" />
      </g>
      <path d="M217 100 Q252 126 254 159 M203 126 Q225 140 224 164" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.4" strokeDasharray="4 5" opacity="0.3" />

      {/* Piedra angular cúbica en primer plano */}
      <path d="M83 214 L165 183 L235 221 L153 253 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="2" strokeLinejoin="round" />
      <path d="M83 214 L153 253 V322 L83 283 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M153 253 L235 221 V291 L153 322 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M93 232 L142 260 V302 L93 277 Z" fill={`url(#${id('oro')})`} opacity="0.15" />
      <path d="M165 260 L224 237 V280 L165 305 Z" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6" opacity="0.35" />
      <path d="M104 210 L163 189 L209 214 M160 258 V311" fill="none" stroke={ORO_CLARO} strokeWidth="1.8" opacity="0.4" />

      {/* Escuadra grande de dos brazos perpendiculares */}
      <g transform="rotate(-12 125 231)">
        <path
          d="M92 132 H115 V265 H205 V288 H92 Z"
          fill={`url(#${id('oro')})`}
          stroke={ORO_CLARO}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M99 145 V280 H193" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="2.8" />
        <g stroke={`url(#${id('piedra')})`} strokeWidth="1.8">
          <path d="M104 152 H115 M108 167 H115 M104 182 H115 M108 197 H115 M104 212 H115 M108 227 H115 M104 242 H115" />
          <path d="M129 265 V276 M144 265 V272 M159 265 V276 M174 265 V272 M189 265 V276" />
        </g>
      </g>

      {/* Cimiento y piedras todavía sueltas */}
      <rect x="55" y="326" width="210" height="16" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <path d="M67 334 H253 M108 327 V341 M198 327 V341" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.35" />
      <path d="M242 302 L263 297 L279 306 L258 312 Z M242 302 V319 L258 329 V312 M258 329 L279 323 V306" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M43 110 L45 116 L51 118 L45 120 L43 126 L41 120 L35 118 L41 116 Z" opacity="0.7" />
        <path d="M278 263 L280 269 L286 271 L280 273 L278 279 L276 273 L270 271 L276 269 Z" opacity="0.6" />
        <circle cx="101" cy="54" r="1.4" opacity="0.6" />
        <circle cx="283" cy="143" r="1.3" opacity="0.5" />
        <circle cx="34" cy="279" r="1.2" opacity="0.4" />
        <circle cx="223" cy="51" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Soberano / Soberana: un gran sello geométrico domina un asiento sencillo bajo un arco.
  soberano: id => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
        <radialGradient id={id('lacre')} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#5A2433" />
          <stop offset="100%" stopColor="#2A0F17" />
        </radialGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo del sello interior */}
      <circle cx="160" cy="168" r="149" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.24">
        <circle cx="160" cy="168" r="114" strokeWidth="1.4" />
        <circle cx="160" cy="168" r="135" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 28 V14 M69 66 L57 51 M251 66 L263 51" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Arco abierto de piedra */}
      <path d="M58 317 V159 A102 102 0 0 1 262 159 V317 H240 V159 A80 80 0 0 0 80 159 V317 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <g stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.4">
        <path d="M59 198 H80 M59 242 H80 M59 286 H80 M240 198 H261 M240 242 H261 M240 286 H261" />
        <path d="M62 132 L83 138 M88 88 L105 104 M126 63 L134 84 M193 63 L186 84 M232 88 L215 104 M258 132 L237 138" />
      </g>

      {/* Sello circular de lacre con borde irregular */}
      <path d="M160 77 C180 72 192 88 208 90 C225 91 226 111 239 123 C250 136 241 152 246 169 C251 189 234 199 229 216 C225 233 205 235 194 248 C181 260 164 250 147 255 C129 260 118 245 103 241 C85 237 85 216 73 205 C61 192 72 175 67 159 C63 141 78 130 81 114 C85 96 106 97 119 85 C132 74 145 82 160 77 Z" fill={`url(#${id('lacre')})`} stroke={`url(#${id('oro')})`} strokeWidth="3" />
      <circle cx="157" cy="167" r="76" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="5" />
      <circle cx="157" cy="167" r="65" fill={`url(#${id('piedra')})`} stroke={`url(#${id('acento')})`} strokeWidth="2.4" />
      <circle cx="157" cy="167" r="57" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.5" />

      {/* Emblema geométrico sin corona ni cetro */}
      <path
        d="M157 119 L198 143 V191 L157 215 L116 191 V143 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M157 134 L183 149 V181 L157 198 L131 181 V149 Z" fill={`url(#${id('piedra')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <path d="M157 145 L172 167 L157 188 L142 167 Z" fill={`url(#${id('acento')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <path d="M91 137 Q102 109 129 100" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <path d="M188 232 Q215 218 225 194" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.4" />

      {/* Asiento interior: banco bajo, sin respaldo */}
      <path d="M112 281 H208 L217 292 H103 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <rect x="103" y="292" width="114" height="12" rx="2" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <rect x="116" y="304" width="18" height="22" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <rect x="186" y="304" width="18" height="22" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.6" />
      <path d="M115 297 H205" stroke={ORO_CLARO} strokeWidth="1.4" opacity="0.3" />

      {/* Losa de cimentación */}
      <rect x="43" y="327" width="234" height="17" rx="3" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <path d="M53 335 H267 M94 328 V343 M226 328 V343" stroke={`url(#${id('oro')})`} strokeWidth="1.4" opacity="0.3" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M42 94 L44 100 L50 102 L44 104 L42 110 L40 104 L34 102 L40 100 Z" opacity="0.7" />
        <path d="M278 246 L280 252 L286 254 L280 256 L278 262 L276 256 L270 254 L276 252 Z" opacity="0.6" />
        <circle cx="99" cy="42" r="1.4" opacity="0.6" />
        <circle cx="283" cy="130" r="1.3" opacity="0.5" />
        <circle cx="35" cy="278" r="1.2" opacity="0.4" />
        <circle cx="221" cy="40" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Místico / Mística: una espiral de estrellas acompaña una gota sobre el mar en calma.
  mistico: id => (
    <>
      <defs>
        <Comunes id={id} dimension="mente" />
        <linearGradient id={id('mar')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86B0F7" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1E2E57" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la galaxia */}
      <circle cx="160" cy="158" r="150" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.22">
        <circle cx="160" cy="158" r="113" strokeWidth="1.4" />
        <circle cx="160" cy="158" r="134" strokeWidth="1" strokeDasharray="2 9" />
        <path d="M160 19 V9 M54 76 L42 62 M266 76 L278 62" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Espiral galáctica de brazos continuos */}
      <path d="M165 157 C172 147 159 138 150 148 C135 165 162 184 181 169 C211 145 176 108 146 120 C102 138 117 201 170 204 C237 208 263 127 211 90 C148 44 58 103 67 172" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M156 156 C149 166 162 175 171 165 C186 148 159 129 140 144 C110 168 145 205 175 193 C219 175 204 112 151 109 C84 105 58 186 110 223 C173 269 263 210 254 141" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
      <path d="M127 128 Q101 153 125 182 M196 197 Q227 184 232 153 M91 102 Q116 77 153 77" fill="none" stroke={ORO_CLARO} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="160" cy="157" r="9" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6" />
      <g fill={`url(#${id('oro')})`}>
        <circle cx="148" cy="120" r="4" />
        <circle cx="178" cy="171" r="3" />
        <circle cx="211" cy="90" r="5" />
        <circle cx="67" cy="172" r="4" />
        <circle cx="113" cy="223" r="3.5" />
        <circle cx="245" cy="197" r="4" />
      </g>

      {/* Gota de oro en el umbral del océano */}
      <path
        d="M160 239 C156 252 140 268 140 280 A20 20 0 0 0 180 280 C180 268 164 252 160 239 Z"
        fill={`url(#${id('oro')})`}
        stroke={ORO_CLARO}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M154 264 Q146 276 151 284" fill="none" stroke={ORO_CLARO} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <path d="M160 305 V311" stroke={`url(#${id('oro')})`} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Mar tranquilo y ondas concéntricas */}
      <path d="M20 314 H300 V367 H20 Z" fill={`url(#${id('mar')})`} />
      <path d="M20 314 H300" stroke={`url(#${id('oro')})`} strokeWidth="1.8" opacity="0.45" />
      <g fill="none" stroke={`url(#${id('oro')})`} strokeWidth="1.6">
        <ellipse cx="160" cy="326" rx="25" ry="5" opacity="0.8" />
        <ellipse cx="160" cy="326" rx="52" ry="10" opacity="0.55" />
        <ellipse cx="160" cy="326" rx="84" ry="16" opacity="0.35" />
        <ellipse cx="160" cy="326" rx="121" ry="23" opacity="0.2" />
      </g>
      <path d="M32 354 H96 M223 354 H288 M125 362 H195" stroke={`url(#${id('acento')})`} strokeWidth="1.4" opacity="0.4" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M47 107 L49 113 L55 115 L49 117 L47 123 L45 117 L39 115 L45 113 Z" opacity="0.7" />
        <path d="M275 244 L277 250 L283 252 L277 254 L275 260 L273 254 L267 252 L273 250 Z" opacity="0.6" />
        <circle cx="93" cy="49" r="1.4" opacity="0.6" />
        <circle cx="284" cy="138" r="1.3" opacity="0.5" />
        <circle cx="37" cy="269" r="1.2" opacity="0.4" />
        <circle cx="227" cy="47" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
  // Integrador / Integradora: un uróboros sin ojos rodea el mandala de anillos y pétalos.
  integrador: id => (
    <>
      <defs>
        <Comunes id={id} dimension="construccion" />
      </defs>
      <rect width="320" height="380" fill={`url(#${id('fondo')})`} />

      {/* Halo de la totalidad */}
      <circle cx="160" cy="191" r="151" fill={`url(#${id('luz')})`} />
      <g fill="none" stroke={`url(#${id('oro')})`} opacity="0.23">
        <circle cx="160" cy="191" r="126" strokeWidth="1.4" />
        <circle cx="160" cy="191" r="145" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M160 39 V23 M52 86 L39 73 M268 86 L281 73" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Mandala de ocho pétalos, sin estrellas figurativas */}
      <circle cx="160" cy="191" r="91" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2" />
      <circle cx="160" cy="191" r="80" fill="none" stroke={`url(#${id('acento')})`} strokeWidth="3" />
      <g fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.6">
        <path d="M160 191 Q127 153 160 117 Q193 153 160 191 Z" />
        <path d="M160 191 Q193 229 160 265 Q127 229 160 191 Z" />
        <path d="M160 191 Q122 224 86 191 Q122 158 160 191 Z" />
        <path d="M160 191 Q198 158 234 191 Q198 224 160 191 Z" />
        <path d="M160 191 Q110 187 108 139 Q156 141 160 191 Z" />
        <path d="M160 191 Q210 195 212 243 Q164 241 160 191 Z" />
        <path d="M160 191 Q156 241 108 243 Q110 195 160 191 Z" />
        <path d="M160 191 Q164 141 212 139 Q210 187 160 191 Z" />
      </g>
      <g fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="1.8" opacity="0.5">
        <path d="M160 133 V171 M160 211 V249 M102 191 H140 M180 191 H218" />
        <path d="M120 151 L146 177 M174 205 L200 231 M120 231 L146 205 M174 177 L200 151" />
      </g>
      <circle cx="160" cy="191" r="31" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" />
      <circle cx="160" cy="191" r="21" fill={`url(#${id('acento')})`} stroke={ORO_CLARO} strokeWidth="1.8" />
      <circle cx="160" cy="191" r="9" fill={`url(#${id('oro')})`} />

      {/* Serpiente circular que muerde su cola, sin ojos */}
      <path d="M197 89 A109 109 0 1 0 224 103" fill="none" stroke={`url(#${id('oro')})`} strokeWidth="17" strokeLinecap="round" />
      <path d="M195 85 A113 113 0 1 0 230 105" fill="none" stroke={ORO_CLARO} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M216 95 L201 85 L188 87 L199 95 L216 104 Z" fill={`url(#${id('oro')})`} stroke={ORO_CLARO} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M222 97 Q211 82 196 88 L204 96 L197 102 Q213 114 230 110 Z" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M197 95 L210 99" stroke={ORO_CLARO} strokeWidth="1.8" strokeLinecap="round" />
      <g fill="none" stroke={`url(#${id('piedra')})`} strokeWidth="1.8" opacity="0.55">
        <path d="M150 74 L153 90 M107 87 L114 101 M71 118 L84 128" />
        <path d="M50 164 L66 168 M48 211 L64 208 M69 259 L82 249" />
        <path d="M111 291 L118 277 M155 306 V290 M206 296 L199 281" />
        <path d="M245 265 L232 255 M269 217 L253 213 M269 169 L253 172 M250 124 L237 134" />
      </g>

      {/* Pedestal circular de piedra */}
      <ellipse cx="160" cy="332" rx="103" ry="13" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.8" />
      <path d="M57 332 V342 Q160 367 263 342 V332" fill={`url(#${id('piedra')})`} stroke={`url(#${id('oro')})`} strokeWidth="1.4" />
      <ellipse cx="160" cy="352" rx="145" ry="14" fill={`url(#${id('oro')})`} opacity="0.06" />

      {/* Brillos */}
      <g fill={ORO_CLARO}>
        <path d="M42 98 L44 104 L50 106 L44 108 L42 114 L40 108 L34 106 L40 104 Z" opacity="0.7" />
        <path d="M280 262 L282 268 L288 270 L282 272 L280 278 L278 272 L272 270 L278 268 Z" opacity="0.6" />
        <circle cx="100" cy="49" r="1.4" opacity="0.6" />
        <circle cx="284" cy="138" r="1.3" opacity="0.5" />
        <circle cx="33" cy="269" r="1.2" opacity="0.4" />
        <circle cx="227" cy="47" r="1.2" opacity="0.5" />
      </g>
    </>
  ),
};
