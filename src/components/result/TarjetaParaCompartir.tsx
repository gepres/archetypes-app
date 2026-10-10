import React, { forwardRef } from 'react';
import { ArchetypeIllustratedArtwork } from '../archetypes/ArchetypeIllustratedArtwork';
import { DIMENSIONS } from '../../data/archetypesData';
import { ContenidoTarjeta } from '../../services/tarjetaCompartir';
import { DimensionId } from '../../types';

/** Los colores de la tarjeta. */
export interface TemaTarjeta {
  fondo: string;
  borde: string;
  acento: string;
  caja: string;
  brillo: string;
}

export const TEMAS_TARJETA = {
  esmeralda: {
    fondo: 'linear-gradient(180deg, #0B1511 0%, #0E1B15 50%, #070D0B 100%)',
    borde: '#315C45',
    acento: '#D6A84F',
    caja: 'rgba(16, 31, 24, 0.9)',
    brillo: 'rgba(214, 168, 79, 0.22)',
  },
  obsidiana: {
    fondo: 'linear-gradient(180deg, #0A0E1A 0%, #10172A 50%, #070912 100%)',
    borde: '#2E3C66',
    acento: '#60A5FA',
    caja: 'rgba(17, 25, 46, 0.9)',
    brillo: 'rgba(96, 165, 250, 0.22)',
  },
  carmesi: {
    fondo: 'linear-gradient(180deg, #180A0E 0%, #240F16 50%, #0E0508 100%)',
    borde: '#5A2332',
    acento: '#F59E0B',
    caja: 'rgba(32, 12, 19, 0.9)',
    brillo: 'rgba(245, 158, 11, 0.22)',
  },
} satisfies Record<string, TemaTarjeta>;

interface TarjetaParaCompartirProps {
  contenido: ContenidoTarjeta;
  formato: 'story' | 'square';
  tema: TemaTarjeta;
  /** Un nombre o alias, si se quiere firmar la tarjeta. */
  nombre?: string;
  /** Las cuatro dimensiones, si se quieren añadir. */
  dimensiones?: Record<DimensionId, number> | null;
  /** Los tres primeros, si se quieren añadir. */
  top3?: { emoji: string; name: string; score: number }[] | null;
  /** El dominio que se lee al pie. */
  sitio?: string;
}

const SERIF = "var(--font-serif, 'Cormorant Garamond', Georgia, serif)";
const SANS = "var(--font-sans, system-ui, sans-serif)";

/**
 * La imagen que se comparte. Cuenta la pareja (o lo que encabeza el mapa) con una frase propia,
 * y nada más salvo lo que se pida. Va con estilos en línea, no con clases: así sale igual en la
 * V1 y en la V2, que generan sus estilos por separado, y la captura (html-to-image) no depende
 * de qué clases llegaron a cada hoja de estilos.
 */
export const TarjetaParaCompartir = forwardRef<HTMLDivElement, TarjetaParaCompartirProps>(
  ({ contenido, formato, tema, nombre, dimensiones, top3, sitio = 'archetypes-mystical.web.app' }, ref) => {
    const historia = formato === 'story';
    const lado = contenido.figuras.length > 1 ? 84 : 112;

    return (
      <div
        ref={ref}
        style={{
          width: historia ? 360 : 380,
          minHeight: historia ? 620 : 380,
          maxWidth: '100%',
          boxSizing: 'border-box',
          padding: historia ? 24 : 20,
          borderRadius: 24,
          border: `1px solid ${tema.borde}`,
          background: tema.fondo,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 14,
          color: '#F2EFE6',
          fontFamily: SANS,
          userSelect: 'none',
        }}
      >
        {/* Brillos de fondo */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: tema.brillo, filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 170, height: 170, borderRadius: '50%', background: tema.brillo, filter: 'blur(48px)' }} />

        {/* Cabecera */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 999,
              border: `1px solid ${tema.acento}66`,
              color: tema.acento,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Los 18 arquetipos · Mapa simbólico
          </span>
          {nombre && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#E5D7B7' }}>{nombre}</p>}
        </div>

        {/* El corazón: los retratos, quién encabeza y la frase */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
          {contenido.figuras.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {contenido.figuras.map((id, i) => (
                <div
                  key={id}
                  style={{
                    width: lado,
                    height: lado,
                    marginLeft: i === 0 ? 0 : -14,
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: `2px solid ${tema.acento}`,
                    background: '#0E1513',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
                    position: 'relative',
                    zIndex: contenido.figuras.length - i,
                  }}
                >
                  <ArchetypeIllustratedArtwork archetypeId={id} className="w-full h-full" />
                </div>
              ))}
            </div>
          )}

          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A6B2A8' }}>
              {contenido.etiqueta}
            </p>
            <h3 style={{ margin: '4px 0 0', fontFamily: SERIF, fontSize: historia ? 28 : 24, fontWeight: 700, lineHeight: 1.1 }}>
              {contenido.titulo}
            </h3>
          </div>

          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: historia ? 17 : 15, lineHeight: 1.35, color: '#E5D7B7' }}>
            {contenido.frase}
          </p>

          {(contenido.pregunta || contenido.mantra) && (
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.45, color: tema.acento }}>
              {contenido.pregunta ?? `«${contenido.mantra}»`}
            </p>
          )}
        </div>

        {/* Lo que se quiera añadir */}
        {(dimensiones || (top3 && top3.length > 0)) && (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dimensiones && (
              <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${tema.borde}`, background: tema.caja }}>
                {(['mente', 'accion', 'corazon', 'construccion'] as const).map(dim => (
                  <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: dim === 'mente' ? 0 : 4 }}>
                    <span style={{ width: 76, fontSize: 9, color: '#A6B2A8' }}>{DIMENSIONS[dim].name.split(' & ')[0]}</span>
                    <span style={{ flex: 1, height: 5, borderRadius: 999, background: '#0E1513', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${dimensiones[dim] || 0}%`, background: DIMENSIONS[dim].color, borderRadius: 999 }} />
                    </span>
                    <span style={{ width: 28, textAlign: 'right', fontSize: 9, fontWeight: 700 }}>{dimensiones[dim] || 0}%</span>
                  </div>
                ))}
              </div>
            )}
            {top3 && top3.length > 0 && (
              <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${tema.borde}`, background: tema.caja }}>
                {top3.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: i === 0 ? 0 : 4 }}>
                    <span style={{ width: 12, fontSize: 9, fontWeight: 700, color: tema.acento }}>{i + 1}</span>
                    <span style={{ fontSize: 11 }}>{item.emoji}</span>
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: 12, fontWeight: 700 }}>{item.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: tema.acento }}>{item.score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pie */}
        <div
          style={{
            position: 'relative',
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9,
            color: '#7A8880',
          }}
        >
          <span>Descubre tu mapa interior</span>
          <span style={{ fontWeight: 600, color: '#A6B2A8' }}>{sitio}</span>
        </div>
      </div>
    );
  }
);
TarjetaParaCompartir.displayName = 'TarjetaParaCompartir';
