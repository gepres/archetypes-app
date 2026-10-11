import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DependenciasLectura, crearLecturas } from './lecturaCore';
import { barajar, calcularResultadoDilemas, dilemasDelTest } from './dilemas';
import { AssessmentResult } from '../types';

function resultado(semilla: string): AssessmentResult {
  const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `${semilla}-${d.id}`)[0].arquetipo }));
  return calcularResultadoDilemas(respuestas, 'quick', 'male');
}

/** Unas dependencias de mentira: el asistente responde cuando se le dice. */
function falsas(extra: Partial<DependenciasLectura> = {}) {
  const almacen = new Map<string, string>();
  const enviadas: string[] = [];
  const pendientes: ((texto: string) => void)[] = [];
  const estado = { dueno: 'cuenta-1', existentes: new Set<string>(), crisis: false };
  const deps: DependenciasLectura = {
    enviar: prompt => {
      enviadas.push(prompt);
      return new Promise(resolve => pendientes.push(texto => resolve({ text: texto, modelUsed: 'modelo', provider: 'openrouter' })));
    },
    maxDaily: () => 10,
    dueno: () => estado.dueno,
    resultadoExiste: id => estado.existentes.has(id),
    crisisAbierta: async () => estado.crisis,
    textoDeCuidado: 'Sigo aquí contigo.',
    almacen: { getItem: k => almacen.get(k) ?? null, setItem: (k, v) => void almacen.set(k, v) },
    ...extra,
  };
  return { deps, almacen, enviadas, pendientes, estado };
}

const tick = () => new Promise(r => setTimeout(r, 0));

describe('lectura con IA: cuidados', () => {
  it('regresión (Codex): con una crisis abierta en el chat no se llama a la IA y se responde con el cuidado', async () => {
    const f = falsas();
    f.estado.crisis = true;
    const l = crearLecturas(f.deps);
    const r = await l.pedir(resultado('crisis'), 'male');
    assert.equal(f.enviadas.length, 0);
    assert.deepEqual(r, { ok: false, motivo: 'Sigo aquí contigo.', cuidado: true });
  });

  it('regresión (Codex): si se borran los datos mientras llega la respuesta, ni se guarda ni se muestra', async () => {
    const f = falsas();
    const r = resultado('borrado');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const p = l.pedir(r, 'male');
    await tick();
    f.estado.existentes.clear(); // la persona reinicia sus datos
    f.almacen.clear();
    f.pendientes[0]('Una lectura personal.');
    const res = await p;
    assert.equal(res.ok, false);
    assert.equal(f.almacen.size, 0, 'no debe recrear la caché borrada');
  });

  it('regresión (Codex): si se cambia de cuenta mientras llega, ni se guarda ni se muestra', async () => {
    const f = falsas();
    const r = resultado('cuenta');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const p = l.pedir(r, 'male');
    await tick();
    f.estado.dueno = 'cuenta-2';
    f.pendientes[0]('Texto de la cuenta 1.');
    assert.equal((await p).ok, false);
    assert.equal(f.almacen.size, 0);
  });

  it('regresión (Codex): un resultado que no es de la cuenta abierta no se envía a la IA', async () => {
    const f = falsas();
    const r = resultado('ajeno'); // no está en los datos de la cuenta
    const res = await crearLecturas(f.deps).pedir(r, 'male');
    assert.equal(res.ok, false);
    assert.equal(f.enviadas.length, 0);
  });

  it('regresión (Codex): si se abre una crisis mientras llega, no se entrega ni se guarda la interpretación', async () => {
    const f = falsas();
    const r = resultado('crisis-espera');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const primera = l.pedir(r, 'male');
    await tick();
    const compartida = l.pedir(r, 'male');
    f.estado.crisis = true;
    f.pendientes[0]('Una interpretación.');
    for (const res of [await primera, await compartida]) assert.deepEqual(res, { ok: false, motivo: 'Sigo aquí contigo.', cuidado: true });
    assert.equal(f.almacen.size, 0);
  });

  it('regresión (Codex): pedir dos veces lo mismo (A→B→A) comparte la petición y no gasta otra consulta', async () => {
    const f = falsas();
    const r = resultado('doble');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const a1 = l.pedir(r, 'male');
    l.pedir(r, 'female');
    const a2 = l.pedir(r, 'male');
    await tick();
    assert.equal(f.enviadas.length, 2, 'una por perspectiva, no tres');
    assert.ok(l.pendiente(l.clave(r, 'male')));
    f.pendientes[0]('Lectura en masculino.');
    assert.deepEqual(await a2, await a1);
  });

  it('regresión (Codex): con respuestas fuera de orden, cada una se guarda bajo su propia perspectiva', async () => {
    const f = falsas();
    const r = resultado('orden');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const masculina = l.pedir(r, 'male');
    const femenina = l.pedir(r, 'female');
    await tick();
    f.pendientes[1]('Lectura en femenino.');
    f.pendientes[0]('Lectura en masculino.');
    await Promise.all([masculina, femenina]);
    assert.equal(l.leer(l.clave(r, 'male')), 'Lectura en masculino.');
    assert.equal(l.leer(l.clave(r, 'female')), 'Lectura en femenino.');
    assert.equal(l.pendiente(l.clave(r, 'male')), undefined);
  });

  it('regresión (Codex): borrar o cambiar de cuenta invalida (para que la pantalla quite también la lectura anterior)', async () => {
    const f = falsas();
    const r = resultado('invalida');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const p = l.pedir(r, 'male');
    await tick();
    f.estado.existentes.clear();
    f.pendientes[0]('Texto.');
    const res = await p;
    assert.equal(res.ok, false);
    assert.equal(!res.ok && res.invalidada, true);
    // Un fallo de conexión no invalida: la anterior puede quedarse.
    const g = falsas({ enviar: async () => ({ text: ['x', '---', '*No pude conectar.*'].join('\n'), modelUsed: 'Fallback Local', provider: 'local' }) });
    g.estado.existentes.add(r.id);
    const res2 = await crearLecturas(g.deps).pedir(r, 'male');
    assert.equal(!res2.ok && res2.invalidada, undefined);
  });

  it('regresión (Codex): si la conexión falla al llegar, también se miran crisis, cuenta y resultado', async () => {
    const casos: [string, (e: { crisis: boolean; dueno: string; existentes: Set<string> }) => void, (r: unknown) => boolean][] = [
      ['crisis', e => { e.crisis = true; }, r => (r as { cuidado?: boolean }).cuidado === true],
      ['cuenta', e => { e.dueno = 'cuenta-2'; }, r => (r as { invalidada?: boolean }).invalidada === true],
      ['borrado', e => { e.existentes.clear(); }, r => (r as { invalidada?: boolean }).invalidada === true],
    ];
    for (const [nombre, cambiar, esperado] of casos) {
      let soltar: () => void = () => {};
      const f = falsas({
        enviar: () => new Promise(resolve => {
          soltar = () => resolve({ text: ['reflexión local', '---', '*No pude conectar.*'].join('\n'), modelUsed: 'Fallback Local', provider: 'local' });
        }),
      });
      const r = resultado(`fallo-${nombre}`);
      f.estado.existentes.add(r.id);
      const p = crearLecturas(f.deps).pedir(r, 'male');
      await tick();
      cambiar(f.estado);
      soltar();
      assert.ok(esperado(await p), nombre);
    }
  });

  it('expone si hay una crisis abierta y lo que se muestra en su lugar', async () => {
    const f = falsas();
    const l = crearLecturas(f.deps);
    assert.equal(await l.crisisAbierta(), false);
    f.estado.crisis = true;
    assert.equal(await l.crisisAbierta(), true);
    assert.deepEqual(l.cuidado, { ok: false, motivo: 'Sigo aquí contigo.', cuidado: true });
  });

  it('la caché es por cuenta: otra cuenta del mismo dispositivo no ve la lectura', async () => {
    const f = falsas();
    const r = resultado('cuentas');
    f.estado.existentes.add(r.id);
    const l = crearLecturas(f.deps);
    const p = l.pedir(r, 'male');
    await tick();
    f.pendientes[0]('Lectura de la cuenta 1.');
    await p;
    assert.equal(l.leer(l.clave(r, 'male')), 'Lectura de la cuenta 1.');
    f.estado.dueno = 'cuenta-2';
    assert.equal(l.leer(l.clave(r, 'male')), null);
  });

  it('si respondió el mapa simbólico y no una IA, no hay lectura ni se guarda', async () => {
    const f = falsas({ enviar: async () => ({ text: 'reflexión local', modelUsed: 'Cupo diario agotado', provider: 'local' }) });
    const r = resultado('local');
    f.estado.existentes.add(r.id);
    const res = await crearLecturas(f.deps).pedir(r, 'male');
    assert.equal(res.ok, false);
    assert.equal(f.almacen.size, 0);
  });
});
