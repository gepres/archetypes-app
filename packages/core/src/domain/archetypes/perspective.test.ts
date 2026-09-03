import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ARCHETYPES_LIST } from './archetypes.data';
import {
  ARCHETYPE_NAMES,
  DEFAULT_PERSPECTIVE,
  PERSPECTIVES,
  archetypeName,
  isPerspective,
} from './perspective';
import { oracleNarrative } from '../../application/draw-daily-oracle';

describe('perspectiva: la voz con la que se nombra el mapa', () => {
  it('nombra a los doce arquetipos en las tres perspectivas', () => {
    for (const archetype of ARCHETYPES_LIST) {
      for (const perspective of PERSPECTIVES) {
        const name = archetypeName(archetype.id, perspective);
        assert.ok(name.length > 0, `${archetype.id} no tiene nombre en ${perspective}`);
      }
    }
  });

  it('da un nombre distinto a cada perspectiva encarnada', () => {
    assert.equal(archetypeName('rey', 'male'), 'El Rey');
    assert.equal(archetypeName('rey', 'female'), 'La Reina');
    assert.equal(archetypeName('rey', 'universal'), 'Rey / Reina');
  });

  it('deja que una figura sin par comparta nombre sin duplicar la entrada', () => {
    // Amante y Rebelde no cambian de palabra al cambiar de genero: solo de
    // articulo. Que el universal coincida con la raiz no es un olvido.
    assert.equal(ARCHETYPE_NAMES.amante.universal, 'Amante');
    assert.equal(ARCHETYPE_NAMES.rebelde.universal, 'Rebelde');
  });

  it('rechaza lo que no es una perspectiva', () => {
    assert.equal(isPerspective('male'), true);
    assert.equal(isPerspective('universal'), true);
    assert.equal(isPerspective('masculina'), false);
    assert.equal(isPerspective(null), false);
    assert.equal(isPerspective(undefined), false);
  });

  it('arranca en universal para quien no ha elegido', () => {
    assert.equal(DEFAULT_PERSPECTIVE, 'universal');
    assert.ok(isPerspective(DEFAULT_PERSPECTIVE));
  });
});

describe('la carta del dia habla en la perspectiva elegida', () => {
  it('nombra al arquetipo con la voz activa en los tres textos', () => {
    const enMasculino = oracleNarrative('rey', 'male');
    const enFemenino = oracleNarrative('rey', 'female');

    assert.ok(enMasculino.affirmation.includes('El Rey'));
    assert.ok(enFemenino.affirmation.includes('La Reina'));
    assert.ok(enFemenino.morningReflection.includes('La Reina'));
  });

  it('la sombra no cambia de nombre: es la misma en las tres voces', () => {
    // La sombra del Rey se llama igual mirada desde donde se mire; solo cambia
    // quien la proyecta. Si esto empieza a fallar es que alguien tradujo de mas.
    const voces = (['male', 'female', 'universal'] as const).map(
      perspective => oracleNarrative('rey', perspective).eveningInquiry
    );
    const sombras = new Set(voces.map(text => text.slice(text.indexOf('sombra'))));
    assert.equal(sombras.size, 1);
  });
});
