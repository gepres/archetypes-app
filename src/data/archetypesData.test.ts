import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPES_LIST, DIMENSIONS, getArchetypeName, getDimensionShortName, withDe } from './archetypesData';
import { DimensionId, GenderMode } from '../types';

describe('withDe', () => {
  it('contrae el artículo masculino y conserva el femenino', () => {
    assert.equal(withDe('El Rey'), 'del Rey');
    assert.equal(withDe('La Reina'), 'de la Reina');
  });

  it('los nombres universales, sin artículo, van con «del arquetipo»', () => {
    assert.equal(withDe('Rey / Reina'), 'del arquetipo Rey / Reina');
  });

  it('ningún nombre real de los 18, en ninguna perspectiva, da «del El» ni «de La»', () => {
    for (const g of ['male', 'female', 'universal'] as GenderMode[]) {
      for (const a of ARCHETYPES_LIST) {
        const texto = withDe(getArchetypeName(a.id, g));
        assert.doesNotMatch(texto, /\bdel El\b|\bde La\b|\bdel La\b/, `${a.id} en ${g}: ${texto}`);
      }
    }
  });
});

describe('getDimensionShortName', () => {
  it('da el nombre con tildes, no el id', () => {
    assert.equal(getDimensionShortName('construccion'), 'Construcción');
    assert.equal(getDimensionShortName('accion'), 'Acción');
    assert.equal(getDimensionShortName('corazon'), 'Corazón');
    assert.equal(getDimensionShortName('mente'), 'Mente');
  });

  it('cubre todas las dimensiones', () => {
    for (const id of Object.keys(DIMENSIONS) as DimensionId[]) {
      assert.ok(getDimensionShortName(id).length > 0);
      assert.notEqual(getDimensionShortName(id), id === 'mente' ? 'x' : id);
    }
  });
});
