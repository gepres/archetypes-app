import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LECTURAS, REFERENCIAS } from './referencias';
import { ARCHETYPES } from './archetypesData';

describe('lecturas para profundizar', () => {
  it('cada uno de los 18 arquetipos tiene dos o tres lecturas, todas del catálogo y sin repetir', () => {
    const ids = Object.keys(ARCHETYPES);
    assert.equal(ids.length, 18);
    for (const id of ids) {
      const lecturas = LECTURAS[id as keyof typeof LECTURAS];
      assert.ok(lecturas && lecturas.length >= 2 && lecturas.length <= 3, id);
      assert.equal(new Set(lecturas.map(l => l.ref)).size, lecturas.length, `${id} repite una lectura`);
      for (const l of lecturas) {
        assert.ok(REFERENCIAS[l.ref], `${id}: ${l.ref} no está en el catálogo`);
        assert.ok(l.porQue.trim().length > 20, `${id}: falta el porqué de ${l.ref}`);
      }
    }
  });

  it('todas las referencias tienen enlace https y autoría', () => {
    for (const [id, r] of Object.entries(REFERENCIAS)) {
      assert.match(r.url, /^https:\/\//, id);
      assert.ok(r.autores.length > 3, id);
      // Los libros enlazan a su ficha en Open Library.
      if (r.tipo === 'libro') assert.match(r.url, /^https:\/\/openlibrary\.org\/works\//, id);
    }
  });
});
