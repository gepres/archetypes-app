import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AlmacenCrisis,
  ILEGIBLE,
  RegistroCrisis,
  cambiosDeReinicio,
  cerrarCrisisDeConversacion,
  crearRegistroCrisis,
  crisisDelChatGuardado,
} from './crisisVigente';
import { CRISIS_CLOSED_NOTE, senalesDeCrisis, ultimoCierreDeCrisis } from './crisisSupport';

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
      return [...datos.values()].filter(r => r.dueno === dueno || r.tipo === 'reinicio').map(r => ({ ...r }));
    },
    cambiar: async (dueno, cambios) => {
      await pausa();
      if (fallo.escribir) throw new Error('no se puede escribir');
      const c = cambios([...datos.values()].filter(x => x.dueno === dueno).map(x => ({ ...x })));
      for (const clave of c.quitar) datos.delete(clave);
      for (const r of c.poner) datos.set(r.clave, { ...r });
    },
    reiniciar: async reinicio => {
      await pausa();
      if (fallo.escribir) throw new Error('no se puede escribir');
      const c = cambiosDeReinicio([...datos.values()].map(x => ({ ...x })), reinicio);
      for (const clave of c.quitar) datos.delete(clave);
      for (const r of c.poner) datos.set(r.clave, { ...r });
    },
  };
  return { almacen, datos, fallo, espera };
}

/** Pestañas que se hablan por un canal propio de cada prueba. */
function conCanal() {
  const nombre = `prueba-crisis-${Date.now()}-${Math.random()}`;
  const abiertas: ReturnType<typeof crearRegistroCrisis>[] = [];
  const pestana = (almacen: AlmacenCrisis | null) => {
    const r = crearRegistroCrisis(almacen, () => new BroadcastChannel(nombre), 60);
    abiertas.push(r);
    return r;
  };
  const cerrarTodo = () => abiertas.forEach(r => r.cerrar());
  return { pestana, cerrarTodo };
}

const hastaQue = async (cond: () => Promise<boolean> | boolean, ms = 2000) => {
  const fin = Date.now() + ms;
  while (!(await cond()) && Date.now() < fin) await new Promise(r => setTimeout(r, 10));
};

const CRISIS = 'Ya no quiero seguir viviendo';
const senal = (id: string, momento: number) => ({ id, momento });
const iso = (momento: number) => new Date(momento).toISOString();
const chatCon = (...mensajes: { id: string; role: string; content: string; timestamp?: string; crisisClosed?: boolean }[]) =>
  JSON.stringify(mensajes);
const deCrisis = (id: string, momento: number) => ({ id, role: 'user', content: CRISIS, timestamp: iso(momento) });
const cierreEnChat = (momento: number) => ({
  id: `msg-safe-${momento}`,
  role: 'model',
  content: CRISIS_CLOSED_NOTE,
  timestamp: iso(momento),
  crisisClosed: true,
});

describe('registro de crisis', () => {
  it('se abre con una señal y «Ya estoy a salvo» la cierra, por cuenta', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    assert.equal(await r.abierta('a', null), false);
    await r.abrir('a', senal('m1', 100));
    assert.equal(await r.abierta('a', null), true);
    assert.equal(await r.abierta('b', null), false);
    await r.cerrarTodas('a', 200);
    assert.equal(await r.abierta('a', null), false);
  });

  it('el cierre vale hasta su momento: una señal posterior la vuelve a abrir', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('a', senal('m1', 100));
    await r.cerrarTodas('a', 200);
    await r.abrir('a', senal('m2', 300));
    assert.equal(await r.abierta('a', null), true);
    await r.cerrarTodas('a', 150); // un cierre más antiguo que el que hay no lo hace retroceder
    await r.cerrarTodas('a', 400);
    assert.equal(await r.abierta('a', null), false);
  });

  it('regresión (Codex): una pestaña recién abierta lo sabe por el registro, sin esperas', async () => {
    const { almacen } = almacenEnMemoria();
    await crearRegistroCrisis(almacen).abrir('cuenta', senal('m1', 100));
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), true);
  });

  it('regresión (Codex): un cierre vale en todas, también para lo que apuntó una pestaña ya cerrada', async () => {
    const { almacen } = almacenEnMemoria();
    await crearRegistroCrisis(almacen).abrir('cuenta', senal('m1', 100));
    await crearRegistroCrisis(almacen).cerrarTodas('cuenta', 200);
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false);
  });

  it('una señal ya cerrada no se reabre aunque se vuelva a apuntar (una copia antigua del chat)', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('cuenta', senal('m1', 100));
    await r.cerrarTodas('cuenta', 200);
    await r.abrir('cuenta', senal('m1', 100));
    assert.equal(await r.abierta('cuenta', null), false);
    // Ni apuntada por primera vez después del cierre: es anterior a él.
    await r.abrir('cuenta', senal('m0', 50));
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('regresión (Codex): si el cierre no llegó a guardarse en el chat, el registro manda', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.cerrarTodas('cuenta', 200);
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100))), false);
    // Una señal del chat guardado posterior al cierre, cuenta.
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100), deCrisis('m9', 300))), true);
  });

  it('el cierre guardado en el chat vale aunque no llegara al registro', async () => {
    const { almacen } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('cuenta', senal('m1', 100));
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100), cierreEnChat(200))), false);
    await r.abrir('cuenta', senal('m2', 300));
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100), cierreEnChat(200))), true);
  });

  it('chat ilegible o registro que no se puede leer: cuenta como abierta', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    assert.equal(await r.abierta('cuenta', '{roto'), true);
    fallo.leer = true;
    assert.equal(await r.abierta('cuenta', null), true);
  });

  it('si no se pudo apuntar, la pestaña lo recuerda, y «Ya estoy a salvo» lo cierra', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await r.abrir('cuenta', senal('m1', 100));
    assert.equal(await r.abierta('cuenta', null), true);
    await r.cerrarTodas('cuenta', 200); // tampoco se puede apuntar: lo recuerda también
    assert.equal(await r.abierta('cuenta', null), false);
    fallo.escribir = false;
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('regresión (Codex): una apertura a la vez que «Ya estoy a salvo» en otra pestaña no pisa el cierre', async () => {
    for (let i = 0; i < 60; i++) {
      const { almacen, espera } = almacenEnMemoria();
      espera.ms = () => Math.floor(Math.random() * 4);
      const a = crearRegistroCrisis(almacen);
      const b = crearRegistroCrisis(almacen);
      const pasos = [() => a.abrir('cuenta', senal('m1', 100)), () => b.cerrarTodas('cuenta', 200)];
      if (i % 2) pasos.reverse();
      await Promise.all(pasos.map(f => f()));
      assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false, `vuelta ${i}`);
    }
  });

  it('regresión (Codex): un cierre que llega tarde no cierra una señal posterior a él', async () => {
    const { almacen, espera } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    await a.abrir('cuenta', senal('m1', 100));
    let lenta = true;
    espera.ms = () => (lenta ? ((lenta = false), 30) : 0); // el cierre de A tarda en llegar al registro
    const cerrando = a.cerrarTodas('cuenta', 200);
    await b.abrir('cuenta', senal('m2', 300)); // B escribe otra señal después del cierre, y llega antes
    await cerrando;
    assert.equal(await b.abierta('cuenta', null), true);
    assert.equal(await a.abierta('cuenta', null), true);
  });

  it('regresión (Codex): lo que una pestaña no pudo apuntar respeta el cierre hecho en otra', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await a.abrir('cuenta', senal('m1', 100));
    fallo.escribir = false;
    await b.cerrarTodas('cuenta', 200);
    assert.equal(await a.abierta('cuenta', null), false); // la apunta ahora, y ya estaba cerrada
    assert.equal(await b.abierta('cuenta', null), false);
  });

  it('regresión (Codex): una señal nueva cuenta aunque otra pestaña cerrara las anteriores', async () => {
    const { almacen } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    await a.abrir('cuenta', senal('m1', 100));
    await b.cerrarTodas('cuenta', 200);
    await a.abrir('cuenta', senal('m1', 100)); // A vuelve a apuntar lo que ve: sigue cerrada
    assert.equal(await a.abierta('cuenta', null), false);
    await a.abrir('cuenta', senal('m2', 300));
    assert.equal(await b.abierta('cuenta', null), true);
  });

  it('regresión (Codex): un cierre que no llegó al registro, pero sí al chat, no deja que otra pestaña lo reabra', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    fallo.escribir = true;
    await b.abrir('cuenta', senal('m2', 100)); // B la guardó en el chat, pero no en el registro
    // A pulsa «Ya estoy a salvo»: se guarda en el chat, pero no en el registro.
    let guardado = '';
    const { registrado } = cerrarCrisisDeConversacion(a, 'cuenta', momento => {
      guardado = chatCon(deCrisis('m2', 100), cierreEnChat(momento.getTime()));
    });
    await registrado;
    fallo.escribir = false;
    // B reintenta apuntar m2: es anterior al cierre del chat; no se reabre.
    assert.equal(await b.abierta('cuenta', guardado), false);
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', guardado), false);
    // Y en cuanto A comprueba, su cierre llega también al registro.
    await a.abierta('cuenta', guardado);
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false);
  });

  it('regresión (Codex): sin poder guardar nada, las pestañas abiertas se lo cuentan (también a una nueva)', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      const b = pestana(almacen);
      fallo.escribir = true; // ni el chat ni el registro se pueden guardar
      assert.equal(await b.abierta('cuenta', null), false);
      await a.abrir('cuenta', senal('m1', 100));
      await hastaQue(() => b.abierta('cuenta', null));
      assert.equal(await b.abierta('cuenta', null), true, 'B, que estaba abierta, lo sabe');
      const c = pestana(almacen); // se abre después: lo pregunta y espera a saberlo
      assert.equal(await c.abierta('cuenta', null), true, 'C, que se abrió después, también');
      await b.cerrarTodas('cuenta', 200); // «Ya estoy a salvo» en B, que tampoco se puede guardar
      await hastaQue(async () => !(await a.abierta('cuenta', null)) && !(await c.abierta('cuenta', null)));
      assert.equal(await a.abierta('cuenta', null), false);
      assert.equal(await c.abierta('cuenta', null), false);
      await a.abrir('cuenta', senal('m3', 300)); // y una señal nueva vuelve a contar en todas
      await hastaQue(() => c.abierta('cuenta', null));
      assert.equal(await c.abierta('cuenta', null), true);
    } finally {
      cerrarTodo();
    }
  });

  it('regresión (Codex): al apuntar tarde lo que no pudo, avisa a las demás pestañas', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      const b = pestana(almacen);
      fallo.escribir = true;
      await a.abrir('cuenta', senal('m1', 100));
      let avisosEnB = 0;
      const dejar = b.suscribir(() => avisosEnB++);
      await hastaQue(() => avisosEnB > 0);
      avisosEnB = 0;
      fallo.escribir = false;
      assert.equal(await a.abierta('cuenta', null), true); // A la apunta ahora…
      await hastaQue(() => avisosEnB > 0);
      assert.ok(avisosEnB > 0, 'B recibe el aviso para volver a comprobar'); // …y avisa
      assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), true);
      dejar();
    } finally {
      cerrarTodo();
    }
  });

  it('regresión (Codex): un registro que no se entiende (de otra versión) cuenta como abierta, y «Ya estoy a salvo» lo limpia', async () => {
    const { almacen, datos } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    // Como los de la versión anterior: sin tipo ni momento.
    datos.set('cuenta:m0', { clave: 'cuenta:m0', dueno: 'cuenta', abierta: false, fecha: 'x' } as unknown as RegistroCrisis);
    assert.equal(await r.abierta('cuenta', null), true);
    await r.abrir('cuenta', senal('m1', 100));
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100))), true);
    await r.cerrarTodas('cuenta', 200);
    assert.equal(datos.has('cuenta:m0'), false);
    assert.equal(await r.abierta('cuenta', null), false);
    await r.abrir('cuenta', senal('m2', 300));
    assert.equal(await r.abierta('cuenta', null), true);
  });

  it('regresión (Codex): un registro dañado con la clave del cierre no se lleva el cierre nuevo', async () => {
    const { almacen, datos } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    await r.abrir('cuenta', senal('m1', 100));
    datos.set('cuenta:__cierre', { clave: 'cuenta:__cierre', dueno: 'cuenta', abierta: true } as unknown as RegistroCrisis);
    await r.cerrarTodas('cuenta', 200);
    assert.equal(datos.get('cuenta:__cierre')?.momento, 200);
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('regresión (Codex): un reinicio que tarda en escribirse no borra una señal apuntada mientras tanto', async () => {
    const { almacen, espera } = almacenEnMemoria();
    const a = crearRegistroCrisis(almacen);
    const b = crearRegistroCrisis(almacen);
    await a.abrir('cuenta', senal('m1', 100));
    let lenta = true;
    espera.ms = () => (lenta ? ((lenta = false), 30) : 0); // el reinicio de A tarda en llegar al registro
    const reiniciando = a.olvidarTodo();
    await b.abrir('cuenta', senal('m2', Date.now() + 60_000)); // B apunta una señal posterior, y llega antes
    await reiniciando;
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), true, 'm2 sigue en el registro');
    await b.cerrarTodas('cuenta', Date.now() + 120_000);
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false);
  });

  it('un reinicio borra lo anterior a él (de todas las cuentas) y no retrocede', () => {
    const r = (clave: string, dueno: string, tipo: RegistroCrisis['tipo'], momento: number): RegistroCrisis => ({
      clave,
      dueno,
      tipo,
      momento,
      mensajeId: tipo === 'senal' ? clave : undefined,
    });
    const todos = [r('a:1', 'a', 'senal', 100), r('b:2', 'b', 'senal', 300), r('a:__cierre', 'a', 'cierre', 150), r('__reinicio', '*', 'reinicio', 50)];
    const c = cambiosDeReinicio(todos, r('__reinicio', '*', 'reinicio', 200));
    assert.deepEqual(c.quitar.sort(), ['a:1', 'a:__cierre']);
    assert.deepEqual(c.poner.map(x => x.momento), [200]);
    assert.deepEqual(cambiosDeReinicio([r('__reinicio', '*', 'reinicio', 500)], r('__reinicio', '*', 'reinicio', 200)).poner, []);
  });

  it('regresión (Codex): un aviso de reinicio que llega tarde no borra una señal posterior al reinicio', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      const b = pestana(almacen);
      await a.abierta('cuenta', null);
      await b.abierta('cuenta', null);
      fallo.escribir = true;
      // B recibe una señal (posterior al reinicio que está a punto de hacer A) y no la puede apuntar.
      await b.abrir('cuenta', senal('m2', Date.now() + 60_000));
      await hastaQue(() => a.abierta('cuenta', null));
      await a.olvidarTodo(); // el reinicio de A, anterior a la señal; su aviso llega a B después
      await new Promise(r => setTimeout(r, 30));
      assert.equal(await b.abierta('cuenta', null), true, 'B la conserva');
      assert.equal(await a.abierta('cuenta', null), true, 'y A también');
    } finally {
      cerrarTodo();
    }
  });

  it('regresión (Codex): un cierre que solo llegó al chat se apunta en el registro, y no se pierde al reiniciar la conversación', async () => {
    const { almacen } = almacenEnMemoria();
    await crearRegistroCrisis(almacen).abrir('cuenta', senal('m1', 100));
    // El cierre llegó al chat pero no al registro, y la pestaña que lo hizo ya se cerró.
    const b = crearRegistroCrisis(almacen);
    assert.equal(await b.abierta('cuenta', chatCon(deCrisis('m1', 100), cierreEnChat(200))), false);
    // Se reinicia la conversación: ya no está la marca del chat, pero el registro la aprendió.
    assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false);
  });

  it('cuando una pestaña nueva pregunta, las demás reintentan apuntar lo que no pudieron', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      fallo.escribir = true;
      await a.abrir('cuenta', senal('m1', 100)); // A no la puede apuntar, y nadie más comprueba en A
      fallo.escribir = false; // el registro vuelve a funcionar
      const c = pestana(almacen); // C se abre: pregunta, y A, al oírlo, la apunta
      assert.equal(await c.abierta('cuenta', null), true);
      await hastaQue(() => crearRegistroCrisis(almacen).abierta('cuenta', null));
      assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), true, 'consta ya en el registro');
    } finally {
      cerrarTodo();
    }
  });

  it('regresión (Codex): reiniciar los datos olvida el registro y lo que sabían las pestañas', async () => {
    const { almacen, fallo } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      const b = pestana(almacen);
      await a.abrir('cuenta', senal('m1', 100));
      fallo.escribir = true;
      await b.abrir('cuenta', senal('m2', 200)); // no se pudo apuntar: lo saben las pestañas
      await hastaQue(() => a.abierta('cuenta', null));
      fallo.escribir = false;
      await a.olvidarTodo();
      // B puede no haberse enterado aún y apuntar tarde lo que sabía: el reinicio lo cierra igual.
      assert.equal(await b.abierta('cuenta', null), false);
      assert.equal(await a.abierta('cuenta', null), false);
      assert.equal(await crearRegistroCrisis(almacen).abierta('cuenta', null), false);
      // Lo que llegue después del reinicio, cuenta.
      await b.abrir('cuenta', senal('m4', Date.now() + 1000));
      assert.equal(await a.abierta('cuenta', null), true);
    } finally {
      cerrarTodo();
    }
    const sinRegistro = crearRegistroCrisis(null);
    await sinRegistro.abrir('cuenta', senal('m3', 300));
    await sinRegistro.olvidarTodo();
    assert.equal(await sinRegistro.abierta('cuenta', null), false);
  });

  it('sin registro (sin IndexedDB) se mira lo de esta pestaña y el chat guardado', async () => {
    const r = crearRegistroCrisis(null);
    assert.equal(await r.abierta('cuenta', null), false);
    assert.equal(await r.abierta('cuenta', chatCon(deCrisis('m1', 100))), true);
    // Lo aprendido del chat se recuerda aunque se reinicie la conversación: lo cierra «Ya estoy a salvo».
    assert.equal(await r.abierta('cuenta', null), true);
    await r.cerrarTodas('cuenta', 150);
    assert.equal(await r.abierta('cuenta', null), false);
    await r.abrir('cuenta', senal('m2', 200));
    assert.equal(await r.abierta('cuenta', null), true);
    await r.cerrarTodas('cuenta', 300);
    assert.equal(await r.abierta('cuenta', null), false);
  });

  it('avisa a quien se suscribe, aquí y en otra pestaña (para volver a comprobar)', async () => {
    const { almacen } = almacenEnMemoria();
    const { pestana, cerrarTodo } = conCanal();
    try {
      const a = pestana(almacen);
      const b = pestana(almacen);
      let enA = 0;
      let enB = 0;
      const dejarA = a.suscribir(() => enA++);
      const dejarB = b.suscribir(() => enB++);
      await new Promise(r => setTimeout(r, 30)); // las preguntas de al abrir ya pasaron
      enA = 0;
      enB = 0;
      await a.abrir('cuenta', senal('m1', 100));
      await hastaQue(() => enB > 0);
      assert.equal(enA, 1);
      assert.ok(enB >= 1);
      dejarA();
      dejarB();
    } finally {
      cerrarTodo();
    }
  });

  it('«Ya estoy a salvo» en una conversación: el registro y la marca del chat llevan el mismo momento', async () => {
    const { almacen, datos } = almacenEnMemoria();
    const r = crearRegistroCrisis(almacen);
    let marca = 0;
    const { resultado, registrado } = cerrarCrisisDeConversacion(r, 'cuenta', momento => {
      marca = momento.getTime();
      return 'guardada';
    });
    await registrado;
    assert.equal(resultado, 'guardada');
    assert.equal(datos.get('cuenta:__cierre')?.momento, marca);
  });
});

describe('la crisis de una conversación', () => {
  it('cada señal, con su mensaje y su momento, desde el último cierre con el botón', () => {
    assert.deepEqual(senalesDeCrisis([{ id: 'u1', role: 'user', content: 'Hola', timestamp: iso(1) }]), []);
    assert.deepEqual(senalesDeCrisis([deCrisis('c1', 100), deCrisis('c2', 200)]), [senal('c1', 100), senal('c2', 200)]);
    assert.deepEqual(senalesDeCrisis([deCrisis('c1', 100), cierreEnChat(150)]), []);
    assert.deepEqual(senalesDeCrisis([deCrisis('c1', 100), cierreEnChat(150), deCrisis('c3', 300)]), [senal('c3', 300)]);
    // Sin una fecha legible: 0 (abierta hasta el primer cierre).
    assert.deepEqual(senalesDeCrisis([{ id: 'c4', role: 'user', content: CRISIS, timestamp: '' }]), [senal('c4', 0)]);
  });

  it('el último cierre con el botón, por su momento', () => {
    assert.equal(ultimoCierreDeCrisis([deCrisis('c1', 100)]), null);
    assert.equal(ultimoCierreDeCrisis([deCrisis('c1', 100), cierreEnChat(150), deCrisis('c2', 200), cierreEnChat(250)]), 250);
    // Un texto que cita la nota de cierre no es un cierre.
    assert.equal(ultimoCierreDeCrisis([{ id: 'msg-ai-1', role: 'model', content: CRISIS_CLOSED_NOTE, timestamp: iso(300) }]), null);
  });

  it('en el chat guardado: sus señales y su cierre, nada, o ilegible', () => {
    assert.deepEqual(crisisDelChatGuardado(null), { senales: [], cierre: null });
    assert.deepEqual(crisisDelChatGuardado(chatCon({ id: 'm1', role: 'user', content: 'Hola' })), { senales: [], cierre: null });
    assert.deepEqual(crisisDelChatGuardado(chatCon(deCrisis('m1', 100), cierreEnChat(150), deCrisis('m2', 200))), {
      senales: [senal('m2', 200)],
      cierre: 150,
    });
    assert.equal(crisisDelChatGuardado('{roto'), ILEGIBLE);
    assert.equal(crisisDelChatGuardado('{"no":"lista"}'), ILEGIBLE);
  });
});
