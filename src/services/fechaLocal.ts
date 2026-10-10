/**
 * Fechas en el calendario de quien usa la app. Con toISOString serían las de UTC, y lo que
 * cambia «cada día» (la Carta del Día, las consultas del asistente) cambiaría a las 19:00 en
 * Perú en vez de a medianoche.
 */

const dos = (n: number) => String(n).padStart(2, '0');

/** La fecha de hoy en el calendario local: AAAA-MM-DD. */
export function fechaLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** El número del día local (días desde 1970), para rotar algo una vez al día. */
export function numeroDeDia(d: Date = new Date()): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}
