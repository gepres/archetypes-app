/**
 * El reloj.
 *
 * Existe para que ningun caso de uso llame directamente a la hora del sistema.
 * Un caso de uso que lee el reloj por su cuenta no se puede probar: no hay
 * forma de preguntarle que carta saca el 25 de octubre sin cambiar la hora de
 * la maquina. Con el reloj como puerto, el test le pasa la fecha que quiera.
 */
export interface Clock {
  now(): Date;
}

/** El reloj de verdad. Los adaptadores lo usan; los tests, no. */
export const systemClock: Clock = {
  now: () => new Date(),
};

/** Un reloj detenido en un instante, para pruebas. */
export function fixedClock(instant: Date): Clock {
  return { now: () => new Date(instant.getTime()) };
}
