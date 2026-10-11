/**
 * La lectura personal con IA del resultado: lo que se le pide al asistente y qué decir cuando no
 * la puede escribir. Puro, para probarlo sin conexión; la llamada la hace la pantalla.
 *
 * El resultado lo calcula siempre el código (determinista, comparable y explicable). La IA solo
 * lo interpreta: recibe el mapa ya calculado y lo que la persona eligió en cada situación, y no
 * puede cambiarlo ni discutirlo. Sin el nombre de la persona: no hace falta para leer un mapa.
 */
import { getArchetype } from '../data/archetypesData';
import { DILEMAS } from '../data/dilemasData';
import { AssessmentResult, GenderMode } from '../types';
import { getMapLead, listNames } from './scoringEngine';

const DILEMA = new Map(DILEMAS.map(d => [d.id, d]));

/** Solo los resultados del test por dilemas guardan lo elegido en cada situación. */
export function admiteLectura(result: AssessmentResult): boolean {
  return result.instrumento === 'dilemas' && !!result.elecciones?.length;
}

/** Lo que se le pide al asistente, o null si el resultado no trae las elecciones. */
export function promptLectura(result: AssessmentResult, gender: GenderMode): string | null {
  if (!admiteLectura(result)) return null;
  const nombre = (id: Parameters<typeof getArchetype>[0]) => getArchetype(id, gender).name;

  const elecciones = result.elecciones!.flatMap(e => {
    const d = DILEMA.get(e.dilemaId);
    const o = d?.opciones.find(x => x.arquetipo === e.arquetipo);
    return d && o ? [`- ${d.ambito}: «${d.situacion}» Elegí: «${o.texto}» (${nombre(e.arquetipo)})`] : [];
  });

  const lead = getMapLead(result, gender);
  const p = result.compositeProfile;
  let calculado: string;
  let sobreLaCabeza: string;
  let regla: string;
  if (lead.kind === 'flat') {
    calculado = 'Mi mapa no tiene un polo claro: ninguna figura destaca sobre las demás.';
    sobreLaCabeza = 'qué puede significar en el día a día que ninguna figura mande sobre las demás';
    regla = 'No me atribuyas un arquetipo dominante ni una pareja.';
  } else if (lead.kind === 'tie') {
    calculado = `En cabeza de mi mapa van a la par, sin un único dominante: ${listNames(lead.ids.map(nombre))}.`;
    sobreLaCabeza = 'cómo puede vivirse en el día a día que esas figuras tiren a la vez';
    regla = 'No presentes a ninguna de ellas como mi arquetipo dominante.';
  } else if (p.pair) {
    const [a, b] = p.pair.map(nombre);
    calculado = `Mi mapa lo encabeza la pareja ${a} y ${b}.${p.tension ? ` La pregunta que abre su tensión: ${p.tension}` : ''}`;
    sobreLaCabeza = `cómo puede vivirse en el día a día la tensión entre ${a} y ${b}`;
    regla = 'No nombres otra pareja ni otro arquetipo como el que encabeza mi mapa.';
  } else if (p.companions?.length) {
    calculado = `Mi mapa lo encabeza ${nombre(lead.ids[0])}, con ${listNames(p.companions.map(nombre))} a la par detrás.`;
    sobreLaCabeza = `cómo puede vivirse en el día a día lo que mueve a ${nombre(lead.ids[0])} junto a lo que traen las otras dos`;
    regla = 'No elijas a una de las dos de detrás como si pesara más que la otra.';
  } else {
    calculado = `Mi mapa lo encabeza ${nombre(lead.ids[0])}.`;
    sobreLaCabeza = `cómo puede vivirse en el día a día lo que mueve a ${nombre(lead.ids[0])}`;
    regla = 'No nombres otro arquetipo como el que encabeza mi mapa.';
  }

  return [
    'Escribe una lectura personal de mi mapa de arquetipos, para mostrarla debajo de mi resultado.',
    '',
    `Lo que ya está calculado, y que no debes cambiar ni discutir: ${calculado}`,
    '',
    'Lo que elegí en cada situación del test:',
    ...elecciones,
    '',
    'Cómo escribirla:',
    '- Tres párrafos breves, entre 150 y 220 palabras en total, hablándome de tú, con un tono cálido y concreto.',
    '- Empieza directamente por lo concreto, sin frases de relleno como «se observa un patrón interesante».',
    '- Primero, el patrón que se ve en mis elecciones según los ámbitos de mi vida; cita dos o tres situaciones concretas de la lista.',
    `- Después, ${sobreLaCabeza}, con sus luces y sus sombras.`,
    '- Termina con una sola pregunta para que la explore, sola en la última línea y en cursiva (entre asteriscos).',
    `- ${regla} Usa los nombres de los arquetipos tal como aparecen aquí; los que llevan barra (como «Rey / Reina») van sin artículo delante.`,
    '- Lenguaje neutro: no uses formas con género para referirte a mí (como «ti mismo» o «cansado»); elige expresiones que valgan para cualquiera.',
    '- Español latinoamericano neutro: sin «vosotros» ni expresiones propias de España.',
    '- Sin títulos, listas, porcentajes ni puntuaciones. No diagnostiques ni hables de trastornos: es un modelo simbólico.',
  ].join('\n');
}

/**
 * Por qué no hay lectura, dicho para quien la pidió, a partir de lo que devolvió el asistente
 * cuando no pudo usar la IA (el chat responde entonces desde el mapa simbólico, pero una
 * «lectura con IA» que no la escribió una IA sería engañosa: se dice que no está disponible).
 */
export function motivoSinLectura(respuesta: { modelUsed: string; text: string }, maxDaily: number): string {
  if (respuesta.modelUsed === 'Cupo diario agotado') {
    return (
      `Hoy ya usaste tus ${maxDaily} consultas con el asistente: mañana se renuevan y podrás pedir tu lectura. ` +
      'Si la quieres hoy, en **Ajustes de IA** puedes conectar tu propia cuenta de un servicio de IA.'
    );
  }
  if (respuesta.modelUsed === 'Motor Simbólico Local') {
    return 'Ahora no hay un asistente de IA conectado. Puedes conectar uno en **Ajustes de IA**.';
  }
  // Tras un fallo, el asistente explica el motivo en la última línea, en cursiva. Viene escrito
  // para el chat («te respondo desde tu mapa simbólico»): aquí no hay respuesta de reserva.
  const partes = respuesta.text.split('\n---\n');
  const motivo =
    partes.length > 1
      ? partes[partes.length - 1]
          .trim()
          .replace(/^\*|\*$/g, '')
          .replace(/,? así que te respondo desde tu mapa simbólico/g, '')
          .replace(/\s*Mientras, te respondo desde tu mapa simbólico\./g, '')
          .trim()
      : '';
  return motivo || 'No se pudo conectar con el asistente de IA ahora mismo. Inténtalo en un rato.';
}

/**
 * La lectura, con la pregunta final sola en su línea y en cursiva, como se pidió. Los modelos a
 * menudo la meten dentro de una frase («te invito a reflexionar sobre ¿cómo…?»): se saca la
 * pregunta y se quita esa entradilla. Si ya está bien, o no hay pregunta, no se toca.
 */
export function pulirLectura(texto: string): string {
  const limpio = texto.trim();
  const parrafos = limpio.split(/\n\s*\n/);
  const ultimo = parrafos[parrafos.length - 1].trim();
  if (/^[*_]¿[^*_]+\?[*_]$/.test(ultimo)) return limpio;
  const abre = ultimo.lastIndexOf('¿');
  const cierra = ultimo.indexOf('?', abre);
  if (abre < 0 || cierra < 0) return limpio;
  const pregunta = ultimo.slice(abre, cierra + 1).replace(/[*_]/g, '').trim();
  // Lo de antes de la pregunta, hasta donde empieza su frase: la entradilla («te invito a
  // reflexionar sobre», «la pregunta es:») se descarta.
  const antes = ultimo.slice(0, abre);
  const finFraseAnterior = Math.max(antes.lastIndexOf('. '), antes.lastIndexOf('! '), antes.lastIndexOf('? '));
  const resto = (finFraseAnterior >= 0 ? antes.slice(0, finFraseAnterior + 1) : '').trim();
  // Una entradilla en su propio párrafo justo antes («La pregunta que surge es:») también sobra.
  const previos = parrafos.slice(0, -1).map(p => p.trim());
  if (!resto && previos.length && /:$/.test(previos[previos.length - 1]) && previos[previos.length - 1].length <= 140) previos.pop();
  const conMayuscula = pregunta.charAt(0) + pregunta.charAt(1).toLocaleUpperCase('es') + pregunta.slice(2);
  return [...previos, ...(resto ? [resto] : []), `*${conMayuscula}*`].join('\n\n');
}

export interface ParrafoLectura {
  /** Todo el párrafo en cursiva (la pregunta final). */
  cursiva: boolean;
  partes: { texto: string; enlace?: string }[];
}

/**
 * El texto en párrafos para pintarlo sin un intérprete de Markdown (la V2): cursiva si el párrafo
 * entero va entre asteriscos, enlaces [texto](url) y, del resto del formato, solo el texto.
 */
export function parrafosLectura(texto: string): ParrafoLectura[] {
  return texto
    .trim()
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      const cursiva = /^\*[^*].*\*$/.test(p) && !p.startsWith('**');
      const cuerpo = (cursiva ? p.slice(1, -1) : p).replace(/\*\*|__|\*|_/g, '');
      const partes: ParrafoLectura['partes'] = [];
      let resto = cuerpo;
      for (let m = resto.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/); m; m = resto.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/)) {
        if (m.index! > 0) partes.push({ texto: resto.slice(0, m.index) });
        partes.push({ texto: m[1], enlace: m[2] });
        resto = resto.slice(m.index! + m[0].length);
      }
      if (resto) partes.push({ texto: resto });
      return { cursiva, partes };
    });
}

/** El texto para leerlo en voz alta: sin asteriscos, enlaces ni saltos raros. */
export function textoParaVoz(texto: string): string {
  return parrafosLectura(texto)
    .map(p => p.partes.map(x => x.texto).join(''))
    .join('\n\n');
}
