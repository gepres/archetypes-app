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

/**
 * Por qué no respondió el asistente, sin códigos ni mensajes del proveedor en inglés, pero con
 * lo que hay que hacer: no es lo mismo una saturación pasajera (esperar) que una cuenta sin
 * saldo o con la clave mal (ir a arreglarlo). `clavePropia`: la cuenta de IA es de la persona
 * (puede arreglarla ella); si no, es la incluida con la app.
 */
export function motivoAmable(err: unknown, clavePropia = false): string {
  const m = String((err as { message?: string })?.message || '');
  // Sin saldo o sin cupo en la cuenta del proveedor: esperar no lo arregla.
  if (/402|insufficient|quota|billing|credit|balance|payment|saldo/i.test(m)) {
    return clavePropia
      ? 'Tu cuenta de IA se quedó sin saldo o sin cupo: revisa su uso en el servicio que conectaste, o cambia la conexión en **Ajustes de IA**. Mientras, te respondo desde tu mapa simbólico.'
      : 'El asistente incluido no está disponible ahora mismo, así que te respondo desde tu mapa simbólico. Si quieres, puedes conectar tu propia cuenta de IA en **Ajustes de IA**.';
  }
  if (/clave|api key|401|403|unauthori[sz]ed|invalid/i.test(m)) {
    return clavePropia
      ? 'No pude conectar con tu cuenta de IA: revisa la clave en **Ajustes de IA**. Mientras, te respondo desde tu mapa simbólico.'
      : 'No pude conectar con el asistente de IA ahora mismo, así que te respondo desde tu mapa simbólico. Prueba de nuevo en un rato.';
  }
  if (/429|rate|too many|overloaded|503|unavailable/i.test(m)) {
    return 'El asistente de IA está saturado ahora mismo, así que te respondo desde tu mapa simbólico. Prueba de nuevo en un rato.';
  }
  return 'No pude conectar con el asistente de IA ahora mismo, así que te respondo desde tu mapa simbólico. Prueba de nuevo en un rato.';
}

/**
 * La fecha de hoy en el calendario de quien usa la app (AAAA-MM-DD). Con toISOString sería la de
 * UTC, y las consultas se renovarían a las 19:00 en Perú en vez de a medianoche.
 */
export function fechaLocal(d: Date = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** La nota que acompaña a la respuesta cuando ya se usaron las consultas incluidas de hoy. */
export function notaConsultasAgotadas(maxDaily: number): string {
  return (
    `Hoy ya usaste tus ${maxDaily} consultas con el asistente: mañana se renuevan. Mientras, esta respuesta sale de tu mapa simbólico. ` +
    'Si quieres seguir hoy con el asistente, en **Ajustes de IA** puedes conectar tu propia cuenta de un servicio de IA; varios tienen un uso gratuito.'
  );
}
