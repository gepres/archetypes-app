import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService, emptyAccountData, hasOwnData, mergeAccountData, mergeChallengeProgress } from './storageService';
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
