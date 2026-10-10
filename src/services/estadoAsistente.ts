/**
 * Cómo se le dice a la persona el estado del asistente de IA y por qué no respondió. Puro y sin
 * dependencias del entorno, para poder probarlo.
 */

/** Lo que devuelve AIProviderService.getUsageStatus: aquí sin importar el servicio, que lee el entorno de Vite. */
export interface EstadoIA {
  activeKeySource: 'custom' | 'app' | 'local' | 'none';
  remainingCourtesy: number;
  maxDaily: number;
}

/**
 * Cómo está el asistente, dicho para quien lo usa: cuántas consultas le quedan hoy o de dónde
 * sale la respuesta. Sin nombres de modelos, proveedores, claves ni tokens: eso vive dentro de
 * Ajustes de IA, para quien quiera configurarlo. `etiqueta` cabe en una pastilla; `detalle` es
 * una frase.
 */
export function describirEstadoIA(estado: EstadoIA): { etiqueta: string; detalle: string; aviso: boolean } {
  switch (estado.activeKeySource) {
    case 'custom':
      return { etiqueta: 'Sin límite', detalle: 'Conversas sin límite con tu propia cuenta de IA.', aviso: false };
    case 'app':
      return estado.remainingCourtesy > 0
        ? {
            etiqueta: `Te quedan ${estado.remainingCourtesy} hoy`,
            detalle: `Te quedan ${estado.remainingCourtesy} de ${estado.maxDaily} consultas hoy.`,
            aviso: estado.remainingCourtesy <= 2,
          }
        : {
            etiqueta: 'Sin consultas hoy',
            detalle: 'Hoy ya usaste tus consultas: mañana se renuevan. Mientras, te respondo desde tu mapa simbólico.',
            aviso: true,
          };
    case 'local':
      return { etiqueta: 'Sin conexión', detalle: 'Te respondo desde tu mapa simbólico, sin necesidad de internet.', aviso: false };
    default:
      return {
        etiqueta: 'Mapa simbólico',
        detalle: 'Te respondo desde tu mapa simbólico. Para conversar con un asistente de IA, conéctalo en Ajustes de IA.',
        aviso: true,
      };
  }
}

/** Por qué no respondió el asistente, sin códigos ni mensajes del proveedor en inglés. */
export function motivoAmable(err: unknown): string {
  const m = String((err as { message?: string })?.message || '');
  if (/clave|key|401|403|unauthori[sz]ed|invalid/i.test(m)) {
    return 'No pude conectar con el asistente de IA: revisa la conexión en **Ajustes de IA**. Mientras, te respondo desde tu mapa simbólico.';
  }
  if (/429|quota|rate|limit/i.test(m)) {
    return 'El asistente de IA está saturado ahora mismo, así que te respondo desde tu mapa simbólico. Prueba de nuevo en un rato.';
  }
  return 'No pude conectar con el asistente de IA ahora mismo, así que te respondo desde tu mapa simbólico. Prueba de nuevo en un rato.';
}
