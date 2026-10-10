import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService, backupBelongsTo, emptyAccountData, hasOwnData, mergeAccountData, mergeChallengeProgress, ordenarConversacion } from './storageService';
import { FirebaseService } from './firebaseService';
import { calculateAssessmentResult } from './scoringEngine';
import { QUESTIONS_DATA } from '../data/questionsData';
import { AssessmentResult, Challenge, UserProfile } from '../types';

describe('chat: reiniciar y cerrar una crisis', () => {
  const montar = () => {
    const mem = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, String(v)),
      removeItem: (k: string) => void mem.delete(k),
      clear: () => mem.clear(),
    };
    const perfil: UserProfile = { id: 'uidX', name: 'Ana', email: 'ana@ejemplo.com', isGuest: false, createdAt: '', lastActive: '' };
    mem.set('archetypes_user_profile', JSON.stringify(perfil));
    const subidas: any[] = [];
    const original = FirebaseService.syncFullDataToCloud;
    FirebaseService.syncFullDataToCloud = async (_id, data) => {
      subidas.push(JSON.parse(JSON.stringify(data)));
      return true;
    };
    return { subidas, restaurar: () => { FirebaseService.syncFullDataToCloud = original; } };
  };

  it('reiniciar la conversación se sube, para que no vuelva desde la nube', () => {
    const { subidas, restaurar } = montar();
    try {
      StorageService.saveChatMessages([{ id: 'm1', role: 'user', content: 'Quiero suicidarme', timestamp: '' }]);
      subidas.length = 0;
      const vacia = StorageService.clearChatMessages();
      assert.equal(subidas.length, 1);
      assert.deepEqual(subidas[0].chatMessages.map((m: any) => m.id), ['msg-welcome-1']);
      assert.deepEqual(vacia.map(m => m.id), ['msg-welcome-1']);
    } finally {
      restaurar();
    }
  });

  it('cerrar la crisis la cierra sin borrar el historial', async () => {
    const { restaurar } = montar();
    try {
      const { crisisInConversation } = await import('./crisisSupport');
      StorageService.saveChatMessages([{ id: 'm1', role: 'user', content: 'Quiero suicidarme', timestamp: '' }]);
      assert.equal(crisisInConversation(StorageService.getChatMessages()), true);
      const despues = StorageService.closeCrisis();
      assert.equal(crisisInConversation(despues), false);
      assert.equal(despues[0].content, 'Quiero suicidarme', 'el historial se conserva');
    } finally {
      restaurar();
    }
  });
});

describe('chat: una respuesta tardía no pisa ni se pierde', () => {
  const montar = () => {
    const mem = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, String(v)),
      removeItem: (k: string) => void mem.delete(k),
      clear: () => mem.clear(),
    };
    const perfil: UserProfile = { id: 'uidX', name: 'Ana', email: 'ana@ejemplo.com', isGuest: false, createdAt: '', lastActive: '' };
    mem.set('archetypes_user_profile', JSON.stringify(perfil));
    const original = FirebaseService.syncFullDataToCloud;
    FirebaseService.syncFullDataToCloud = async () => true;
    return () => { FirebaseService.syncFullDataToCloud = original; };
  };
  const msg = (id: string, role: 'user' | 'model', minuto = 0, extra: object = {}) => ({
    id,
    role,
    content: id,
    timestamp: `2026-10-10T10:${String(minuto).padStart(2, '0')}:00.000Z`,
    ...extra,
  });
  const ids = (xs?: { id: string }[] | null) => xs?.map(m => m.id);

  it('se guarda detrás de su pregunta aunque entretanto se haya escrito otra (volver a la pestaña)', () => {
    const restaurar = montar();
    try {
      StorageService.saveChatMessages([msg('msg-welcome-1', 'model'), msg('q1', 'user'), msg('q2', 'user')]);
      const tras = StorageService.addChatReply('uidX', 'q1', msg('r1', 'model'));
      assert.deepEqual(ids(tras?.messages), ['msg-welcome-1', 'q1', 'r1', 'q2']);
      assert.equal(tras?.guardada, true);
      assert.deepEqual(ids(StorageService.getChatMessages()), ['msg-welcome-1', 'q1', 'r1', 'q2']);
      assert.equal(StorageService.getChatMessages()[2].replyTo, 'q1', 'la respuesta recuerda su pregunta');
    } finally {
      restaurar();
    }
  });

  it('se descarta si la conversación se reinició mientras llegaba', () => {
    const restaurar = montar();
    try {
      StorageService.saveChatMessages([msg('msg-welcome-1', 'model'), msg('q1', 'user')]);
      StorageService.clearChatMessages();
      assert.equal(StorageService.addChatReply('uidX', 'q1', msg('r1', 'model')), null);
      assert.deepEqual(StorageService.getChatMessages().map(m => m.id), ['msg-welcome-1']);
    } finally {
      restaurar();
    }
  });

  it('se descarta si la cuenta abierta ya no es la que preguntó', () => {
    const restaurar = montar();
    try {
      StorageService.saveChatMessages([msg('msg-welcome-1', 'model'), msg('q1', 'user')]);
      assert.equal(StorageService.addChatReply('otraCuenta', 'q1', msg('r1', 'model')), null);
      assert.deepEqual(StorageService.getChatMessages().map(m => m.id), ['msg-welcome-1', 'q1']);
    } finally {
      restaurar();
    }
  });

  it('un mensaje del modelo con el mismo id no se toma por la pregunta', () => {
    const restaurar = montar();
    try {
      StorageService.saveChatMessages([msg('q1', 'model')]);
      assert.equal(StorageService.addChatReply('uidX', 'q1', msg('r1', 'model')), null);
    } finally {
      restaurar();
    }
  });

  it('si no se puede guardar, la respuesta se devuelve igual para que se vea (octava revisión de Codex)', () => {
    const restaurar = montar();
    try {
      StorageService.saveChatMessages([msg('msg-welcome-1', 'model'), msg('q1', 'user')]);
      const ls = (globalThis as any).localStorage;
      const setItem = ls.setItem;
      ls.setItem = (k: string, v: string) => {
        if (k === 'archetypes_chat_messages') throw new Error('QuotaExceededError');
        setItem(k, v);
      };
      const tras = StorageService.addChatReply('uidX', 'q1', msg('r1', 'model'));
      ls.setItem = setItem;
      assert.equal(tras?.guardada, false);
      assert.deepEqual(ids(tras?.messages), ['msg-welcome-1', 'q1', 'r1']);
      // Y la siguiente escritura, con esa conversación, la guarda.
      assert.equal(StorageService.saveChatMessages(tras!.messages), true);
      assert.deepEqual(ids(StorageService.getChatMessages()), ['msg-welcome-1', 'q1', 'r1']);
    } finally {
      restaurar();
    }
  });

  it('una respuesta tardía sigue detrás de su pregunta al salir y volver a la cuenta (octava revisión de Codex)', () => {
    const restaurar = montar();
    try {
      const A: UserProfile = { id: 'uidA', name: 'A', email: 'a@x.com', isGuest: false, createdAt: '', lastActive: '' };
      const B: UserProfile = { id: 'uidB', name: 'B', email: 'b@x.com', isGuest: false, createdAt: '', lastActive: '' };
      StorageService.enterAccount(A, null);
      // q1 a las 10:01; q2 a las 10:02 con su respuesta a las 10:03; la de q1 llega a las 10:04.
      StorageService.saveChatMessages([msg('w', 'model', 0), msg('q1', 'user', 1), msg('q2', 'user', 2), msg('r2', 'model', 3, { replyTo: 'q2' })]);
      StorageService.addChatReply('uidA', 'q1', msg('r1', 'model', 4));
      const esperado = ['w', 'q1', 'r1', 'q2', 'r2'];
      assert.deepEqual(ids(StorageService.getChatMessages()), esperado);

      StorageService.enterAccount(B, null);
      StorageService.enterAccount(A, null);
      assert.deepEqual(ids(StorageService.getChatMessages()), esperado, 'al volver de otra cuenta');

      // Y combinada con la copia de la nube, que llega con el mismo historial.
      const nube = { ...emptyAccountData(), chatMessages: StorageService.getChatMessages() };
      StorageService.enterAccount(A, nube);
      assert.deepEqual(ids(StorageService.getChatMessages()), esperado, 'al combinar con la nube');
    } finally {
      restaurar();
    }
  });
});

describe('ordenarConversacion', () => {
  const m = (id: string, role: 'user' | 'model', minuto: number, replyTo?: string) => ({
    id,
    role,
    content: id,
    timestamp: `2026-10-10T10:${String(minuto).padStart(2, '0')}:00.000Z`,
    ...(replyTo ? { replyTo } : {}),
  });
  const ids = (xs: { id: string }[]) => xs.map(x => x.id);

  it('ordena por hora lo que no dice a qué contesta (conversaciones de antes)', () => {
    assert.deepEqual(ids(ordenarConversacion([m('r1', 'model', 2), m('q1', 'user', 1)])), ['q1', 'r1']);
  });

  it('cada respuesta va detrás de su pregunta aunque llegara la última', () => {
    const lista = [m('q1', 'user', 1), m('q2', 'user', 2), m('r2', 'model', 3, 'q2'), m('r1', 'model', 4, 'q1')];
    assert.deepEqual(ids(ordenarConversacion(lista)), ['q1', 'r1', 'q2', 'r2']);
  });

  it('una respuesta cuya pregunta no está se queda en su hora, y no se pierde nada', () => {
    const lista = [m('q2', 'user', 2), m('r1', 'model', 4, 'q1'), m('r2', 'model', 3, 'q2')];
    assert.deepEqual(ids(ordenarConversacion(lista)), ['q2', 'r2', 'r1']);
  });

  it('un replyTo que apunta a otra respuesta no la saca de la conversación', () => {
    const lista = [m('q1', 'user', 1), m('r1', 'model', 2, 'q1'), m('rr', 'model', 3, 'r1')];
    assert.deepEqual(ids(ordenarConversacion(lista)), ['q1', 'r1', 'rr']);
  });
});

describe('cuentas: cada una ve y sube solo lo suyo', () => {
  type Mundo = { mem: Map<string, string>; subidas: { id: string; data: any }[]; fin: () => void };
  const mundo = (): Mundo => {
    const mem = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, String(v)),
      removeItem: (k: string) => void mem.delete(k),
      clear: () => mem.clear(),
    };
    const subidas: { id: string; data: any }[] = [];
    const original = FirebaseService.syncFullDataToCloud;
    FirebaseService.syncFullDataToCloud = async (id, data) => {
      subidas.push({ id, data: JSON.parse(JSON.stringify(data)) });
      return true;
    };
    return { mem, subidas, fin: () => { FirebaseService.syncFullDataToCloud = original; } };
  };
  const resultado = (id: string, dia: number): AssessmentResult => ({
    ...calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 1 + ((q.id + dia) % 5) })), 'full', 'male'),
    id,
    date: `2026-10-${String(dia).padStart(2, '0')}T10:00:00.000Z`,
  });
  const nota = (id: string, title: string) => ({ id, date: '2026-10-05T10:00:00.000Z', title, content: 'x', relatedArchetypes: [] });
  const cuenta = (id: string, email: string): UserProfile => ({ id, name: id, email, isGuest: false, createdAt: '', lastActive: '' });
  const ids = (xs: { id: string }[]) => xs.map(x => x.id).sort();

  it('cambiar de A a una cuenta B vacía no le pasa nada de A (el caso de Codex)', () => {
    const m = mundo();
    try {
      const A = cuenta('uidA', 'a@x.com');
      const B = cuenta('uidB', 'b@x.com');
      StorageService.enterAccount(A, null);
      StorageService.saveCurrentResult(resultado('rA', 2));
      StorageService.addJournalEntry({ title: 'Privado de A', content: 'x', relatedArchetypes: [] });
      m.subidas.length = 0;

      StorageService.enterAccount(B, null);

      const aB = m.subidas.filter(s => s.id === 'uidB');
      assert.equal(m.subidas.length, 1, 'una sola subida');
      assert.equal(aB.length, 1, 'y es a la cuenta que entra');
      assert.equal(aB[0].data.currentResult, null);
      assert.deepEqual(aB[0].data.history, []);
      assert.ok(!aB[0].data.journalEntries.some((e: any) => e.title === 'Privado de A'));
      assert.equal(StorageService.getCurrentResult(), null, 'en pantalla tampoco queda nada de A');
      // Lo de A queda aparcado en su copia local, y vuelve al volver a A.
      StorageService.enterAccount(A, null);
      assert.equal(StorageService.getCurrentResult()?.id, 'rA');
      assert.ok(StorageService.getJournalEntries().some(e => e.title === 'Privado de A'));
    } finally {
      m.fin();
    }
  });

  it('volver a la misma cuenta combina lo local y lo de la nube sin perder nada (el caso de Codex)', () => {
    const m = mundo();
    try {
      const A = cuenta('uidA', 'a@x.com');
      StorageService.enterAccount(A, null);
      StorageService.saveCurrentResult(resultado('local', 3));
      StorageService.saveJournalEntries([nota('n-local', 'Local')]);
      m.subidas.length = 0;

      StorageService.enterAccount(A, {
        currentResult: resultado('nube', 4),
        history: [resultado('nube', 4), resultado('nube-vieja', 1)],
        journalEntries: [nota('n-nube', 'Nube')],
      });

      assert.equal(m.subidas.length, 1);
      const subida = m.subidas[0].data;
      assert.deepEqual(ids(subida.history), ['local', 'nube', 'nube-vieja']);
      assert.deepEqual(ids(subida.journalEntries), ['n-local', 'n-nube']);
      assert.equal(subida.currentResult.id, 'nube', 'el resultado actual es el más reciente');
    } finally {
      m.fin();
    }
  });

  it('lo del invitado pasa a la cuenta solo si se elige', () => {
    const m = mundo();
    try {
      StorageService.saveCurrentResult(resultado('invitado', 2));
      assert.ok(hasOwnData(StorageService.readActiveData()));

      // Sin llevarlo: la cuenta no lo recibe, y el invitado lo recupera al salir.
      StorageService.enterAccount(cuenta('uidA', 'a@x.com'), null, { bringGuestData: false });
      assert.equal(StorageService.getCurrentResult(), null);
      StorageService.switchToGuestMode();
      assert.equal(StorageService.getCurrentResult()?.id, 'invitado');

      // Llevándolo: la cuenta lo recibe y el hueco del invitado se vacía.
      StorageService.enterAccount(cuenta('uidB', 'b@x.com'), null, { bringGuestData: true });
      assert.equal(StorageService.getCurrentResult()?.id, 'invitado');
      StorageService.switchToGuestMode();
      assert.equal(StorageService.getCurrentResult(), null);
    } finally {
      m.fin();
    }
  });

  it('cerrar sesión no deja a la vista los datos de la cuenta', () => {
    const m = mundo();
    try {
      StorageService.enterAccount(cuenta('uidA', 'a@x.com'), null);
      StorageService.saveCurrentResult(resultado('rA', 2));
      StorageService.saveChatMessages([{ id: 'c1', role: 'user', content: 'algo mío', timestamp: '' }]);
      StorageService.switchToGuestMode();
      assert.equal(StorageService.getCurrentResult(), null);
      assert.ok(!StorageService.getChatMessages().some(c => c.content === 'algo mío'));
      assert.equal(StorageService.getUserProfile().isGuest, true);
    } finally {
      m.fin();
    }
  });

  it('importar una copia combina con lo que hay, sin pisarlo', () => {
    const m = mundo();
    try {
      StorageService.enterAccount(cuenta('uidA', 'a@x.com'), null);
      StorageService.saveJournalEntries([nota('n1', 'Antes')]);
      StorageService.applyAccountData({ journalEntries: [nota('n2', 'Importada')] });
      assert.deepEqual(ids(StorageService.getJournalEntries()), ['n1', 'n2']);
    } finally {
      m.fin();
    }
  });
});

describe('mergeAccountData', () => {
  const vacio = () => emptyAccountData();
  it('un reto completado en cualquiera de las dos copias queda completado, con su fecha', () => {
    const r = (completed: boolean, completedAt?: string) => ({ id: 'r1', archetypeId: 'rey' as const, title: '', description: '', actionGuidance: '', timeEstimate: '', difficulty: 'accesible' as const, completed, ...(completedAt ? { completedAt } : {}) });
    const res = mergeAccountData({ ...vacio(), challenges: [r(false)] }, { ...vacio(), challenges: [r(true, '2026-10-01')] });
    assert.equal(res.challenges[0].completed, true);
    assert.equal(res.challenges[0].completedAt, '2026-10-01');
    const sinFecha = mergeAccountData({ ...vacio(), challenges: [r(false)] }, { ...vacio(), challenges: [r(false)] });
    assert.equal('completedAt' in sinFecha.challenges[0], false, 'sin undefined para Firestore');
  });

  it('un mensaje repetido en las dos copias aparece una vez', () => {
    const c = { id: 'msg-welcome-1', role: 'model' as const, content: 'hola', timestamp: '2026-10-01' };
    const res = mergeAccountData({ ...vacio(), chatMessages: [c] }, { ...vacio(), chatMessages: [{ ...c, timestamp: '2026-10-02' }] });
    assert.equal(res.chatMessages.length, 1);
  });
});

const reto = (id: string, extra: Partial<Challenge> = {}): Challenge => ({
  id,
  archetypeId: 'guerrero',
  title: `Título ${id}`,
  description: `Descripción ${id}`,
  actionGuidance: `Guía ${id}`,
  timeEstimate: '5 min',
  difficulty: 'accesible',
  completed: false,
  ...extra,
});

describe('mergeChallengeProgress', () => {
  it('el texto sale del catálogo aunque lo guardado sea antiguo', () => {
    const catalogo = [reto('a', { actionGuidance: 'Texto corregido' })];
    const guardado = [reto('a', { actionGuidance: 'Texto antiguo' })];
    assert.equal(mergeChallengeProgress(catalogo, guardado)[0].actionGuidance, 'Texto corregido');
  });

  it('conserva si estaba completado y cuándo', () => {
    const guardado = [reto('a', { completed: true, completedAt: '2026-10-01T10:00:00.000Z' })];
    const [r] = mergeChallengeProgress([reto('a')], guardado);
    assert.equal(r.completed, true);
    assert.equal(r.completedAt, '2026-10-01T10:00:00.000Z');
  });

  it('los retos nuevos del catálogo aparecen sin completar', () => {
    const res = mergeChallengeProgress([reto('a'), reto('nuevo')], [reto('a', { completed: true })]);
    assert.deepEqual(res.map(r => [r.id, r.completed]), [['a', true], ['nuevo', false]]);
  });

  it('un reto retirado se conserva solo si estaba completado', () => {
    const guardado = [reto('viejo-hecho', { completed: true }), reto('viejo-pendiente')];
    const ids = mergeChallengeProgress([reto('a')], guardado).map(r => r.id);
    assert.deepEqual(ids, ['a', 'viejo-hecho']);
  });

  it('no deja ningún campo indefinido, que Firestore rechazaría', () => {
    const guardado = [reto('a'), reto('b', { completed: true, completedAt: '2026-10-01T10:00:00.000Z' })];
    const res = mergeChallengeProgress([reto('a'), reto('b'), reto('c')], guardado);
    for (const r of res) {
      for (const [campo, valor] of Object.entries(r)) assert.notEqual(valor, undefined, `${r.id}.${campo}`);
    }
    assert.equal('completedAt' in res[0], false);
  });

  it('no modifica el catálogo', () => {
    const catalogo = [reto('a')];
    mergeChallengeProgress(catalogo, [reto('a', { completed: true })]);
    assert.equal(catalogo[0].completed, false);
  });
});

describe('backupBelongsTo: una copia solo se importa en su cuenta', () => {
  const p = (id: string, email = '', isGuest = false): UserProfile => ({ id, name: id, email, isGuest, createdAt: '', lastActive: '' });
  it('la copia de la misma cuenta, sí', () => assert.equal(backupBelongsTo(p('uidA', 'a@x.com'), p('uidA', 'a@x.com')), true));
  it('una copia antigua sin perfil, sí (en la cuenta abierta)', () => assert.equal(backupBelongsTo(p('uidA'), undefined), true));
  it('la de otra cuenta, no', () => assert.equal(backupBelongsTo(p('uidB', 'b@x.com'), p('uidA', 'a@x.com')), false));
  it('mismo correo pero otra identidad (local frente a Firebase), no', () =>
    assert.equal(backupBelongsTo(p('uidFirebase', 'a@x.com'), p('user-123', 'a@x.com')), false));
  it('una copia hecha sin cuenta, solo sin cuenta', () => {
    assert.equal(backupBelongsTo(p('user-guest', '', true), p('user-guest', '', true)), true);
    assert.equal(backupBelongsTo(p('uidA', 'a@x.com'), p('user-guest', '', true)), false);
  });
});
