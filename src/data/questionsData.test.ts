import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from './questionsData';
import { ARCHETYPES_LIST } from './archetypesData';

describe('test rápido', () => {
  const rapidas = QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id));

  it('son 24 afirmaciones del test completo, sin repetir', () => {
    assert.equal(QUICK_QUESTION_IDS.length, 24);
    assert.equal(new Set(QUICK_QUESTION_IDS).size, 24);
    assert.equal(rapidas.length, 24);
  });

  it('ningún arquetipo depende de una o dos afirmaciones', () => {
    for (const a of ARCHETYPES_LIST) {
      const cuantas = rapidas.filter(q => q.weights.some(w => w.archetypeId === a.id)).length;
      assert.ok(cuantas >= 3, `${a.id} solo aparece en ${cuantas}`);
    }
  });

  it('cada arquetipo es el principal (peso 3) de al menos una', () => {
    for (const a of ARCHETYPES_LIST) {
      assert.ok(rapidas.some(q => q.weights.some(w => w.archetypeId === a.id && w.weight === 3)), a.id);
    }
  });

  it('ninguna dimensión queda con menos de cinco', () => {
    for (const d of ['mente', 'accion', 'corazon', 'construccion']) {
      assert.ok(rapidas.filter(q => q.dimensionFocus === d).length >= 5, d);
    }
  });
});
