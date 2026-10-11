import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenCrisis, ILEGIBLE, RegistroCrisis, crearRegistroCrisis, senalesDelChatGuardado } from './crisisVigente';
import { CRISIS_CLOSED_NOTE, senalesDeCrisis } from './crisisSupport';

/**
 * Un almacén en memoria, como el IndexedDB que comparten las pestañas: cada `cambiar` es una
 * transacción (lee y escribe de una vez, tras una espera que se puede alargar para cruzarlas).
 */
function almacenEnMemoria() {
  const datos = new Map<string, RegistroCrisis>();
  const fallo = { leer: false, escribir: false };
  const espera = { ms: (): number => 0 };
  const pausa = () => new Promise(r => setTimeout(r, espera.ms()));
  const almacen: AlmacenCrisis = {
    deDueno: async dueno => {
      await pausa();
      if (fallo.leer) throw new Error('no se puede leer');
      return [...datos.values()].filter(r => r.dueno === dueno).map(r => ({ ...r }));
    },
    cambiar: async (dueno, cambios) => {
      await pausa();
      if (fallo.escribir) throw new Error('no se puede escribir');
      for (const r of cambios([...datos.values()].filter(x => x.dueno === dueno).map(x => ({ ...x })))) datos.set(r.clave, { ...r });
    },
    vaciar: async () => {
      await pausa();
      datos.clear();
    },
  };
  return { almacen, datos, fallo, espera };
}

const chatCon = (...mensajes: { id: string; role: string; content: string; crisisClosed?: boolean }[]) => JSON.stringify(mensajes);
const CRISIS = 'Ya no quiero seguir viviendo';

describe('registro de crisis', () => {
  it('se abre por el mensaje que la abrió y se cierra con «Ya estoy a salvo», por cuenta', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    assert.equal(await r.abierta('a', null), false);
    await r.abrir('a', 'm1');
    assert.equal(await r.abierta('a', null), true);
    assert.equal(await r.abierta('b', null), false);
    await r.cerrarTodas('a');
    assert.equal(await r.abierta('a', null), false);
  });

  it('regresión (Codex): dos pestañas comparten el registro: una recién abierta lo sabe al instante, sin esperas', async () => {
    const { almacen } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    await a.abrir('cuenta', 'm1');
    const nueva = crearRegistroCrisis(almacen); // se abre después: no hay nada que sincronizar
    assert.equal(await nueva.abierta('cuenta', null), true);
  });

  it('regresión (Codex): un cierre vale en todas, también para lo que apuntó una pestaña ya cerrada', async () => {
    const { almacen } = almacenEnMemoria();
    const b = crearRegistroCrisis(almacen);
    await b.abrir('cuenta', 'm1'); // B se cierra después; su crisis no se guardó en el chat
    const c = crearRegistroCrisis(almacen);
    await c.cerrarTodas('cuenta');
    const a = crearRegistroCrisis(almacen);
    assert.equal(await a.abierta('cuenta', null), false);
  });

  it('una crisis cerrada no se reabre aunque reaparezca una copia antigua del chat', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('cuenta', 'm1');
    await r.cerrarTodas('cuenta');
    await r.abrir('cuenta', 'm1'); // el chat recargado aún la tiene abierta
    assert.equal(await r.abierta('cuenta', null), false);
    await r.abrir('cuenta', 'm2'); // otra crisis, nueva: sí
    assert.equal(await r.abierta('cuenta', null), true);
  });

  it('regresión (Codex): si el cierre no llegó a guardarse en el chat, el registro manda', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    const chatAntiguo = chatCon({ id: 'm1', role: 'user', content: CRISIS });
    await r.cerrarTodas('cuenta', ['m1']);
    assert.equal(await r.abierta('cuenta', chatAntiguo), false);
    // Una crisis del chat guardado que el registro no conoce, cuenta.
    assert.equal(await r.abierta('cuenta', chatCon({ id: 'm9', role: 'user', content: CRISIS })), true);
  });

  it('chat ilegible o registro que no se puede leer: cuenta como abierta', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    assert.equal(await r.abierta('cuenta', '{roto'), true);
    fallo.leer = true;
    assert.equal(await r.abierta('cuenta', null), true);
  });

  it('si no se pudo apuntar, esta pestaña lo recuerda hasta «Ya estoy a salvo»', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await r.abrir('cuenta', 'm1');
    fallo.escribir = false;
    assert.equal(await r.abierta('cuenta', null), true);
    await r.cerrarTodas('cuenta');
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('regresión (Codex): una apertura a la vez que «Ya estoy a salvo» en otra pestaña no pisa el cierre', async () => {
    for (let i = 0; i < 60; i++) {
      const { almacen, espera } = almacenEnMemoria();
      espera.ms = () => Math.floor(Math.random() * 4);
      const a = crearRegistroCrisis(almacen); // el chat de A apunta la crisis m1
      const b = crearRegistroCrisis(almacen); // en B se pulsa «Ya estoy a salvo», conociendo m1
      const pasos = [() => a.abrir('cuenta', 'm1'), () => b.cerrarTodas('cuenta', ['m1'])];
      if (i % 2) pasos.reverse();
      await Promise.all(pasos.map(f => f()));
      assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false, `vuelta ${i}`);
    }
  });

  it('una apertura pedida antes de «Ya estoy a salvo» en la misma pestaña no se apunta después', async () => {
    const { almacen, espera } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    let lenta = true;
    espera.ms = () => (lenta ? ((lenta = false), 20) : 0); // la apertura llega al registro después
    const abriendo = r.abrir('cuenta', 'm1');
    await r.cerrarTodas('cuenta'); // sin conocer m1 (el chat no llegó a guardarla)
    await abriendo;
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('regresión (Codex): lo que esta pestaña no pudo apuntar respeta el cierre hecho en otra', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await a.abrir('cuenta', 'm1'); // A no puede apuntarla: la recuerda
    assert.equal(await a.abierta('cuenta', null), true); // y mientras no pueda, cuenta como abierta
    fallo.escribir = false;
    await b.cerrarTodas('cuenta', ['m1']); // B, que la conoce, la cierra
    assert.equal(await a.abierta('cuenta', null), false);
    assert.equal(await b.abierta('cuenta', null), false);
  });

  it('lo que esta pestaña no pudo apuntar se apunta en cuanto se puede, y cuenta para todas', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await a.abrir('cuenta', 'm1');
    fallo.escribir = false;
    await b.cerrarTodas('cuenta'); // B no conoce m1: no puede cerrarla
    assert.equal(await a.abierta('cuenta', null), true); // A la apunta ahora: sigue abierta…
    assert.equal(await b.abierta('cuenta', null), true); // …también para B
    await b.cerrarTodas('cuenta'); // y un «Ya estoy a salvo» en cualquiera la cierra
    assert.equal(await a.abierta('cuenta', null), false);
  });

  it('regresión (Codex): una señal nueva cuenta aunque otra pestaña cerrara las anteriores', async () => {
    const { almacen } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    await a.abrir('cuenta', 'm1');
    await b.cerrarTodas('cuenta'); // B pulsa «Ya estoy a salvo»; el chat de A sigue con m1 a la vista
    await a.abrir('cuenta', 'm1'); // A vuelve a apuntar lo que ve: m1 sigue cerrada
    assert.equal(await a.abierta('cuenta', null), false);
    await a.abrir('cuenta', 'm2'); // y escribe otra señal
    assert.equal(await b.abierta('cuenta', null), true);
  });

  it('una señal del chat guardado que el registro no tiene cerrada cuenta, aunque haya otra cerrada antes', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.cerrarTodas('cuenta', ['m1']);
    const chat = chatCon({ id: 'm1', role: 'user', content: CRISIS }, { id: 'm2', role: 'user', content: CRISIS });
    assert.equal(await r.abierta('cuenta', chat), true);
    await r.cerrarTodas('cuenta', ['m1', 'm2']);
    assert.equal(await r.abierta('cuenta', chat), false);
  });

  it('regresión (Codex): al apuntar tarde lo que no pudo, avisa a las demás pestañas', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const nombre = `prueba-tarde-${Date.now()}`;
    const a = crearRegistroCrisis(almacen, () => new BroadcastChannel(nombre));
    const b = crearRegistroCrisis(almacen, () => new BroadcastChannel(nombre));
    fallo.escribir = true;
    await a.abrir('cuenta', 'm1'); // A no puede apuntarla
    assert.equal(await b.abierta('cuenta', null), false); // B no lo sabe: puede enseñar una lectura
    let avisosEnB = 0;
    const dejar = b.suscribir(() => avisosEnB++);
    fallo.escribir = false;
    assert.equal(await a.abierta('cuenta', null), true); // A la apunta ahora…
    const fin = Date.now() + 2000;
    while (avisosEnB === 0 && Date.now() < fin) await new Promise(r => setTimeout(r, 10));
    assert.ok(avisosEnB > 0, 'B recibe el aviso para volver a comprobar'); // …y avisa
    assert.equal(await b.abierta('cuenta', null), true);
    dejar();
    a.cerrar();
    b.cerrar();
  });

  it('regresión (Codex): reiniciar los datos olvida el registro y lo que esta pestaña recordaba', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('cuenta', 'm1');
    fallo.escribir = true;
    await r.abrir('cuenta', 'm2'); // no se pudo apuntar: lo recuerda la pestaña
    fallo.escribir = false;
    await r.olvidarTodo();
    assert.equal(await r.abierta('cuenta', null), false);
    const sinRegistro = crearRegistroCrisis(null);
    await sinRegistro.abrir('cuenta', 'm3');
    await sinRegistro.olvidarTodo();
    assert.equal(await sinRegistro.abierta('cuenta', null), false);
  });

  it('sin registro (sin IndexedDB) se mira lo de esta pestaña y el chat guardado', async () => {
    const r = crearRegistroCrisis(null);
    assert.equal(await r.abierta('cuenta', chatCon({ id: 'm1', role: 'user', content: CRISIS })), true);
    assert.equal(await r.abierta('cuenta', null), false);
    await r.abrir('cuenta', 'm2');
    assert.equal(await r.abierta('cuenta', null), true);
  });

  it('avisa a quien se suscribe, aquí y en otra pestaña (para volver a comprobar)', async () => {
    const { almacen } = almacenEnMemoria();
    const nombre = `prueba-registro-${Date.now()}`;
    const a = crearRegistroCrisis(almacen, () => new BroadcastChannel(nombre));
    const b = crearRegistroCrisis(almacen, () => new BroadcastChannel(nombre));
    let enA = 0;
    let enB = 0;
    const dejarA = a.suscribir(() => enA++);
    const dejarB = b.suscribir(() => enB++);
    await a.abrir('cuenta', 'm1');
    const fin = Date.now() + 2000;
    while (enB === 0 && Date.now() < fin) await new Promise(r => setTimeout(r, 10));
    assert.equal(enA, 1);
    assert.equal(enB, 1);
    dejarA();
    dejarB();
    a.cerrar();
    b.cerrar();
  });
});

describe('la crisis de una conversación', () => {
  it('cada señal se identifica por su mensaje, desde el último cierre con el botón', () => {
    assert.deepEqual(senalesDeCrisis([{ id: 'u1', role: 'user', content: 'Hola' }]), []);
    assert.deepEqual(
      senalesDeCrisis([{ id: 'c1', role: 'user', content: CRISIS }, { id: 'c2', role: 'user', content: CRISIS }]),
      ['c1', 'c2']
    );
    const cierre = { id: 'msg-safe-1', role: 'assistant', content: CRISIS_CLOSED_NOTE, crisisClosed: true };
    assert.deepEqual(senalesDeCrisis([{ id: 'c1', role: 'user', content: CRISIS }, cierre]), []);
    assert.deepEqual(senalesDeCrisis([{ id: 'c1', role: 'user', content: CRISIS }, cierre, { id: 'c3', role: 'user', content: CRISIS }]), ['c3']);
  });

  it('en el chat guardado: sus señales, ninguna, o ilegible', () => {
    assert.deepEqual(senalesDelChatGuardado(null), []);
    assert.deepEqual(senalesDelChatGuardado(chatCon({ id: 'm1', role: 'user', content: 'Hola' })), []);
    assert.deepEqual(senalesDelChatGuardado(chatCon({ id: 'm1', role: 'user', content: CRISIS })), ['m1']);
    assert.equal(senalesDelChatGuardado('{roto'), ILEGIBLE);
    assert.equal(senalesDelChatGuardado('{"no":"lista"}'), ILEGIBLE);
  });
});
