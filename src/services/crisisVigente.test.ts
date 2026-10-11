import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearCrisisVigente, crisisEnChatGuardado } from './crisisVigente';
import { crisisAbiertaDesde } from './crisisSupport';

const esperar = (ms = 20) => new Promise(r => setTimeout(r, ms));
/** Espera a que se cumpla (los mensajes entre pestañas tardan más con la máquina cargada). */
async function hastaQue(cond: () => boolean, tope = 2000) {
  const fin = Date.now() + tope;
  while (!cond() && Date.now() < fin) await esperar(10);
  return cond();
}
let n = 0;
/** Pestañas de mentira que se hablan por un BroadcastChannel de verdad (Node lo tiene). */
const pestana = (canal: string) => crearCrisisVigente(() => new BroadcastChannel(`prueba-crisis-${canal}`), 60);
const nuevoCanal = () => `c-${++n}`;

describe('crisis vigente entre pestañas', () => {
  it('por cuenta y por crisis, sin mezclar cuentas', async () => {
    const a = pestana(nuevoCanal());
    await a.sincronizada();
    assert.equal(a.estado('cuenta-a'), 'cerrada');
    a.marcar('cuenta-a', 'm1');
    assert.equal(a.estado('cuenta-a'), 'abierta');
    assert.equal(a.estado('cuenta-b'), 'cerrada');
    a.marcar('cuenta-a', null, 'm1');
    assert.equal(a.estado('cuenta-a'), 'cerrada');
    a.cerrar();
  });

  it('regresión (Codex): una pestaña recién abierta está «pendiente» hasta saber lo de las demás, y luego se entera', async () => {
    const canal = nuevoCanal();
    const a = pestana(canal);
    a.marcar('cuenta', 'm1');
    const b = pestana(canal);
    assert.equal(b.estado('cuenta'), 'pendiente', 'no puede darla por cerrada aún');
    await b.sincronizada();
    assert.equal(await hastaQue(() => b.estado('cuenta') === 'abierta'), true);
    a.cerrar();
    b.cerrar();
  });

  it('una pestaña nueva se entera también de lo que contó otra que ya se cerró', async () => {
    const canal = nuevoCanal();
    const a = pestana(canal);
    const b = pestana(canal);
    b.marcar('cuenta', 'm1');
    assert.equal(await hastaQue(() => a.estado('cuenta') === 'abierta'), true);
    b.cerrar(); // la pestaña con la crisis (sin guardar) se cierra
    const c = pestana(canal);
    await c.sincronizada();
    assert.equal(await hastaQue(() => c.estado('cuenta') === 'abierta'), true);
    a.cerrar();
    c.cerrar();
  });

  it('regresión (Codex): un cierre explícito vale en todas, también para lo que contó una pestaña ya cerrada', async () => {
    const canal = nuevoCanal();
    const a = pestana(canal);
    const b = pestana(canal);
    b.marcar('cuenta', 'm1');
    assert.equal(await hastaQue(() => a.estado('cuenta') === 'abierta'), true);
    b.cerrar();
    const c = pestana(canal);
    c.marcar('cuenta', 'm1'); // recupera la conversación con esa crisis
    c.marcar('cuenta', null, 'm1'); // y la cierra con el botón
    assert.equal(await hastaQue(() => a.estado('cuenta') === 'cerrada'), true);
    await c.sincronizada();
    // Aunque A le cuente lo que dijo B (m1 abierta), m1 ya está cerrada.
    await esperar(50);
    assert.equal(c.estado('cuenta'), 'cerrada');
    a.cerrar();
    c.cerrar();
  });

  it('un chat sin esa crisis (incompleto) no la cierra, y cerrar una no cierra otra distinta', async () => {
    const canal = nuevoCanal();
    const a = pestana(canal);
    const b = pestana(canal);
    a.marcar('cuenta', 'm1');
    assert.equal(await hastaQue(() => b.estado('cuenta') === 'abierta'), true);
    b.marcar('cuenta', null); // su conversación no tiene el mensaje
    await esperar(50);
    assert.equal(a.estado('cuenta'), 'abierta');
    assert.equal(b.estado('cuenta'), 'abierta');
    b.marcar('cuenta', 'm2'); // otra crisis, en la otra pestaña
    b.marcar('cuenta', null, 'm2');
    await esperar(50);
    assert.equal(a.estado('cuenta'), 'abierta', 'm1 sigue abierta');
    a.cerrar();
    b.cerrar();
  });

  it('avisa a quien se suscribe al abrirse o cerrarse (también desde otra pestaña) y al terminar la sincronía', async () => {
    const canal = nuevoCanal();
    const a = pestana(canal);
    const b = pestana(canal);
    let avisos = 0;
    const dejar = b.suscribir(() => avisos++);
    await b.sincronizada();
    const trasSincronia = avisos;
    assert.ok(trasSincronia >= 1, 'avisa al terminar la sincronía');
    a.marcar('cuenta', 'm1');
    assert.equal(await hastaQue(() => avisos === trasSincronia + 1), true);
    a.marcar('cuenta', null, 'm1');
    assert.equal(await hastaQue(() => avisos === trasSincronia + 2), true);
    dejar();
    a.cerrar();
    b.cerrar();
  });
});

describe('la crisis de una conversación', () => {
  const crisis = { id: 'c1', role: 'user', content: 'Ya no quiero seguir viviendo' };
  it('se identifica por el mensaje que la abrió, hasta que el botón la cierra', () => {
    assert.equal(crisisAbiertaDesde([{ id: 'u1', role: 'user', content: 'Hola' }]), null);
    assert.equal(crisisAbiertaDesde([crisis, { id: 'c2', role: 'user', content: 'Ya no quiero seguir viviendo' }]), 'c1');
  });
});

describe('crisis en el chat guardado', () => {
  it('sin chat guardado no hay crisis; con una, sí', () => {
    assert.equal(crisisEnChatGuardado(null), false);
    assert.equal(crisisEnChatGuardado(JSON.stringify([{ id: 'm1', role: 'user', content: 'Hola' }])), false);
    assert.equal(crisisEnChatGuardado(JSON.stringify([{ id: 'm1', role: 'user', content: 'Ya no quiero seguir viviendo' }])), true);
  });

  it('regresión (Codex): un chat guardado que no se puede leer cuenta como crisis abierta', () => {
    assert.equal(crisisEnChatGuardado('{roto'), true);
    assert.equal(crisisEnChatGuardado('{"no":"es una lista"}'), true);
  });
});
