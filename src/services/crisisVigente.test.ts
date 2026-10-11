import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenCrisis, ILEGIBLE, RegistroCrisis, crearRegistroCrisis, crisisDelChatGuardado } from './crisisVigente';
import { crisisAbiertaDesde } from './crisisSupport';

/** Un almacén en memoria, como el IndexedDB que comparten las pestañas. */
function almacenEnMemoria() {
  const datos = new Map<string, RegistroCrisis>();
  const fallo = { leer: false, escribir: false };
  const almacen: AlmacenCrisis = {
    deDueno: async dueno => {
      if (fallo.leer) throw new Error('no se puede leer');
      return [...datos.values()].filter(r => r.dueno === dueno);
    },
    poner: async r => {
      if (fallo.escribir) throw new Error('no se puede escribir');
      datos.set(r.clave, { ...r });
    },
  };
  return { almacen, datos, fallo };
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
  it('se identifica por el mensaje que la abrió, hasta que el botón la cierra', () => {
    assert.equal(crisisAbiertaDesde([{ id: 'u1', role: 'user', content: 'Hola' }]), null);
    assert.equal(crisisAbiertaDesde([{ id: 'c1', role: 'user', content: CRISIS }, { id: 'c2', role: 'user', content: CRISIS }]), 'c1');
  });

  it('en el chat guardado: el mensaje, null, o ilegible', () => {
    assert.equal(crisisDelChatGuardado(null), null);
    assert.equal(crisisDelChatGuardado(chatCon({ id: 'm1', role: 'user', content: 'Hola' })), null);
    assert.equal(crisisDelChatGuardado(chatCon({ id: 'm1', role: 'user', content: CRISIS })), 'm1');
    assert.equal(crisisDelChatGuardado('{roto'), ILEGIBLE);
    assert.equal(crisisDelChatGuardado('{"no":"lista"}'), ILEGIBLE);
  });
});
