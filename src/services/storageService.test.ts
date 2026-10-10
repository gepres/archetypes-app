import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeChallengeProgress } from './storageService';
import { Challenge } from '../types';

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

  it('no modifica el catálogo', () => {
    const catalogo = [reto('a')];
    mergeChallengeProgress(catalogo, [reto('a', { completed: true })]);
    assert.equal(catalogo[0].completed, false);
  });
});
