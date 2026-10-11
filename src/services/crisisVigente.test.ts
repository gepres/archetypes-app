import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearCrisisVigente, crisisEnChatGuardado } from './crisisVigente';

const esperar = (ms = 30) => new Promise(r => setTimeout(r, ms));
/** Espera a que se cumpla (los mensajes entre pestañas tardan más con la máquina cargada). */
async function hastaQue(cond: () => boolean, tope = 2000) {
  const fin = Date.now() + tope;
  while (!cond() && Date.now() < fin) await esperar(10);
  return cond();
}
let n = 0;
/** Pestañas de mentira que se hablan por un BroadcastChannel de verdad (Node lo tiene). */
const pestana = (nombre: string) => crearCrisisVigente(() => new BroadcastChannel(`prueba-crisis-${nombre}`));

describe('crisis vigente entre pestañas', () => {
  it('se marca y se desmarca por cuenta, sin mezclar cuentas', () => {
    const a = pestana(`sola-${++n}`);
    assert.equal(a.abierta('cuenta-a'), false);
    a.marcar('cuenta-a', true);
    assert.equal(a.abierta('cuenta-a'), true);
    assert.equal(a.abierta('cuenta-b'), false);
    a.marcar('cuenta-a', false);
    assert.equal(a.abierta('cuenta-a'), false);
    a.cerrar();
  });

  it('regresión (Codex): una pestaña que se abre después se entera de la crisis de otra', async () => {
    const canal = `union-${++n}`;
    const a = pestana(canal);
    a.marcar('cuenta', true);
    const b = pestana(canal);
    b.abierta('cuenta'); // se incorpora: pregunta
    assert.equal(await hastaQue(() => b.abierta('cuenta')), true);
    a.cerrar();
    b.cerrar();
  });

  it('regresión (Codex): un chat sin esa crisis en otra pestaña no la cierra', async () => {
    const canal = `incompleta-${++n}`;
    const a = pestana(canal);
    const b = pestana(canal);
    a.marcar('cuenta', true);
    assert.equal(await hastaQue(() => b.abierta('cuenta')), true);
    b.marcar('cuenta', false); // su conversación no tiene el mensaje (no se pudo guardar)
    await esperar();
    assert.equal(a.abierta('cuenta'), true);
    assert.equal(b.abierta('cuenta'), true);
    a.marcar('cuenta', false); // quien la tenía, la cierra
    assert.equal(a.abierta('cuenta'), false);
    assert.equal(await hastaQue(() => !b.abierta('cuenta')), true);
    a.cerrar();
    b.cerrar();
  });

  it('avisa a quien se suscribe cuando se abre o se cierra (también desde otra pestaña)', async () => {
    const canal = `aviso-${++n}`;
    const a = pestana(canal);
    const b = pestana(canal);
    let avisos = 0;
    const dejar = b.suscribir(() => avisos++);
    a.marcar('cuenta', true);
    assert.equal(await hastaQue(() => avisos === 1), true);
    a.marcar('cuenta', false);
    assert.equal(await hastaQue(() => avisos === 2), true);
    dejar();
    a.cerrar();
    b.cerrar();
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
