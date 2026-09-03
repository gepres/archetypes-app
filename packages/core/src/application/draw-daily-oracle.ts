import { ARCHETYPES, ARCHETYPES_LIST } from '../domain/archetypes/archetypes.data';
import { DEFAULT_PERSPECTIVE, archetypeName, type Perspective } from '../domain/archetypes/perspective';
import type { ArchetypeId, DailyOracleCard } from '../domain/model';

/**
 * La carta del dia.
 *
 * Esta regla vivia dentro del servicio de almacenamiento de la web, enredada
 * con el guardado en el navegador. Son dos cosas distintas: QUE arquetipo toca
 * hoy es una regla de negocio, y GUARDAR la carta para no recalcularla es un
 * detalle de infraestructura. Aqui queda solo la regla.
 *
 * Es deterministica a proposito: la misma fecha da siempre la misma carta, en
 * cualquier dispositivo y sin consultar nada. Alguien que abra la app en el
 * movil y en la web el mismo dia ve el mismo arquetipo, que es justo lo que
 * un oraculo diario tiene que hacer para resultar creible.
 *
 * @param today Fecha para la que se tira la carta. Se pasa en vez de leerse
 *              del reloj para que la funcion sea pura y se pueda probar.
 */
export function drawDailyOracle(today: Date): DailyOracleCard {
  const archetype = ARCHETYPES_LIST[dayOfYear(today) % ARCHETYPES_LIST.length]!;

  return {
    date: toIsoDate(today),
    archetypeId: archetype.id,
    mantra: archetype.mantra,
    dailyFocus: archetype.centralQuestion,
    ...oracleNarrative(archetype.id, DEFAULT_PERSPECTIVE),
  };
}

/** Los tres textos de la carta que nombran al arquetipo. */
export interface OracleNarrative {
  affirmation: string;
  morningReflection: string;
  eveningInquiry: string;
}

/**
 * La voz de la carta, en una perspectiva concreta.
 *
 * Estos tres textos son los unicos de la carta que llevan el nombre del
 * arquetipo dentro, y por eso son los unicos que cambian con la perspectiva. Se
 * componen aparte —y no se guardan resueltos— porque la carta se cachea un dia
 * entero y la perspectiva se puede cambiar en cualquier momento: guardarlos ya
 * escritos significaria que quien cambia de voz a media manana sigue leyendo
 * «la energia luminosa del Rey» bajo un titulo que dice La Reina.
 */
export function oracleNarrative(id: ArchetypeId, perspective: Perspective): OracleNarrative {
  const archetype = ARCHETYPES[id];
  const name = archetypeName(id, perspective);

  return {
    // Las frases se construyen para que el nombre entre con su articulo sin
    // chocar: «de El Bufon» es correcto y suena mal, «que encarna El Bufon»
    // suena bien en las tres voces, incluida la doble de universal.
    affirmation: `Hoy elijo manifestar la energía luminosa que encarna ${name}: ${archetype.strength}`,
    morningReflection: `Al iniciar tu día: ¿cómo puedes responder a tus compromisos con la impecabilidad que trae ${name}?`,
    eveningInquiry: `Al cerrar tu jornada: ¿En qué momentos te mantuviste fiel a tu centro y dónde se asomó la sombra del ${archetype.shadow}?`,
  };
}

/** True si la carta guardada sigue siendo la de hoy. */
export function isOracleCardCurrent(card: DailyOracleCard | null, today: Date): boolean {
  return card !== null && card.date === toIsoDate(today);
}

/**
 * Dia del año, de 1 a 366.
 *
 * Se calcula sobre las fechas locales a medianoche y no sobre milisegundos
 * transcurridos: restar timestamps falla en los dias que cambia el horario de
 * verano, porque uno de ellos dura veintitres o veinticinco horas y la division
 * entera se desplaza un dia.
 */
function dayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay.getTime() - startOfYear.getTime()) / MS_PER_DAY) + 1;
}

/** Fecha local en formato ISO corto. */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
