import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService, mergeChallengeProgress } from './storageService';
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

describe('applyAccountData: restaurar una cuenta sin pisar la nube', () => {
  it('aplica el historial de la nube y sube una sola vez el estado completo', () => {
    // El caso de Codex: cuenta activa, historial local [A] y en la nube [B, C, D].
    const mem = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, String(v)),
      removeItem: (k: string) => void mem.delete(k),
      clear: () => mem.clear(),
    };
    const resultado = (id: string): AssessmentResult => ({
      ...calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 1 + (q.id % 5) })), 'full', 'male'),
      id,
    });
    const perfil: UserProfile = { id: 'uidX', name: 'Ana', email: 'ana@ejemplo.com', isGuest: false, createdAt: '', lastActive: '' };
    mem.set('archetypes_user_profile', JSON.stringify(perfil));
    mem.set('archetypes_history', JSON.stringify([resultado('A')]));

    const subidas: any[] = [];
    const original = FirebaseService.syncFullDataToCloud;
    FirebaseService.syncFullDataToCloud = async (_id, data) => {
      subidas.push(JSON.parse(JSON.stringify(data)));
      return true;
    };
    try {
      StorageService.applyAccountData(
        {
          currentResult: resultado('B'),
          history: [resultado('B'), resultado('C'), resultado('D')],
          journalEntries: [{ id: 'j1', date: '', title: 'Nube', content: 'x', relatedArchetypes: [] }],
          challenges: [],
          chatMessages: [{ id: 'm1', role: 'user', content: 'hola', timestamp: '' }],
        },
        perfil
      );
    } finally {
      FirebaseService.syncFullDataToCloud = original;
    }

    assert.equal(subidas.length, 1, `hubo ${subidas.length} subidas`);
    assert.deepEqual(subidas[0].history.map((h: AssessmentResult) => h.id), ['B', 'C', 'D']);
    assert.equal(subidas[0].currentResult.id, 'B');
    assert.equal(subidas[0].journalEntries[0].title, 'Nube');
    assert.equal(subidas[0].chatMessages[0].content, 'hola');
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
