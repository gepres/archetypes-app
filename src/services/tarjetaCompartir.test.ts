import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contenidoParaCompartir } from './tarjetaCompartir';
import { calculateAssessmentResult } from './scoringEngine';
import { ARCHETYPES_LIST, getArchetype } from '../data/archetypesData';
import { ARCHETYPE_DRIVES } from '../data/archetypePairs';
import { QUESTIONS_DATA } from '../data/questionsData';
import { ArchetypeId, AssessmentResult, CompositeProfile, GenderMode } from '../types';
import { composeDailyOracleTexts } from './storageService';
import { dilemaDeDesempate } from './dilemas';

/** Un mapa a medida: las figuras de cabeza primero y el perfil con lo que importa. */
function mapa(cabeza: ArchetypeId[], perfil: Partial<CompositeProfile>): AssessmentResult {
  const base = calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 3 })), 'full', 'male');
  const porId = new Map(base.ranking.map(s => [s.archetypeId, s]));
  const orden = [...cabeza, ...ARCHETYPES_LIST.map(a => a.id as ArchetypeId).filter(id => !cabeza.includes(id))];
  const ranking = orden.map((id, i) => ({ ...porId.get(id)!, normalizedScore: 95 - i * 4, rank: i + 1 }));
  return {
    ...base,
    id: 'r',
    ranking,
    dominantArchetype: ranking[0],
    compositeProfile: { ...base.compositeProfile, isFlat: false, isTie: false, pair: undefined, companions: undefined, tiedLeaders: undefined, tension: undefined, ...perfil },
  };
}

describe('contenidoParaCompartir: lo que cuenta la imagen', () => {
  it('con pareja: dos retratos, sus nombres y «una parte de mí quiere…; otra, …»', () => {
    const r = mapa(['creador', 'rebelde'], { pair: ['creador', 'rebelde'], tension: '¿Cuándo toca lanzarse y cuándo toca echar cimientos?' });
    const c = contenidoParaCompartir(r, 'male');
    assert.deepEqual(c.figuras, ['creador', 'rebelde']);
    assert.equal(c.titulo, 'El Creador y el Rebelde');
    assert.equal(c.etiqueta, 'La pareja que encabeza mi mapa');
    assert.equal(c.frase, `Una parte de mí quiere ${ARCHETYPE_DRIVES.creador}; otra, ${ARCHETYPE_DRIVES.rebelde}.`);
    assert.equal(c.pregunta, '¿Cuándo toca lanzarse y cuándo toca echar cimientos?');
  });

  it('los nombres van en la perspectiva elegida, y en la universal sin artículos', () => {
    const r = mapa(['creador', 'rebelde'], { pair: ['creador', 'rebelde'] });
    assert.equal(contenidoParaCompartir(r, 'female').titulo, 'La Creadora y la Rebelde');
    assert.equal(contenidoParaCompartir(r, 'universal').titulo, 'Creador / Creadora y Rebelde');
  });

  it('con un líder y dos acompañantes empatadas: los tres, sin elegir entre ellas', () => {
    const r = mapa(['creador', 'rebelde', 'constructor'], { companions: ['rebelde', 'constructor'] });
    const c = contenidoParaCompartir(r, 'male');
    assert.deepEqual(c.figuras, ['creador', 'rebelde', 'constructor']);
    assert.equal(c.frase, `Una parte de mí quiere ${ARCHETYPE_DRIVES.creador}; otra, ${ARCHETYPE_DRIVES.rebelde}; y otra, ${ARCHETYPE_DRIVES.constructor}.`);
    assert.equal(c.pregunta, undefined);
  });

  it('con una sola figura en cabeza: su retrato, lo que la mueve y su mantra', () => {
    const r = mapa(['sanador'], {});
    const c = contenidoParaCompartir(r, 'male');
    assert.deepEqual(c.figuras, ['sanador']);
    assert.equal(c.frase, `Lo que más me mueve: ${ARCHETYPE_DRIVES.sanador}.`);
    assert.ok(c.mantra);
  });

  it('a la par: lo dice, sin proclamar un dominante', () => {
    const r = mapa(['mago', 'sabio'], { isTie: true, tiedLeaders: ['mago', 'sabio'] });
    const c = contenidoParaCompartir(r, 'male');
    assert.equal(c.etiqueta, 'A la par en mi mapa');
    assert.deepEqual(c.figuras, ['mago', 'sabio']);
    assert.match(c.frase, /^A la vez, una parte de mí quiere .+; otra, .+.$/);
    assert.doesNotMatch(`${c.titulo} ${c.frase} ${c.texto}`, /dominante/i);
  });

  it('con más de tres a la par: no se eligen tres como si fueran las que mandan en el texto', () => {
    const ids: ArchetypeId[] = ['mago', 'sabio', 'rey', 'heroe'];
    const r = mapa(ids, { isTie: true, tiedLeaders: ids });
    const c = contenidoParaCompartir(r, 'male');
    assert.equal(c.titulo, '4 figuras a la par');
    assert.equal(c.frase, 'Varias partes de mí tiran a la vez, sin que ninguna mande.');
  });

  it('sin polo claro: ningún retrato ni dominante', () => {
    const r = mapa([], { isFlat: true });
    const c = contenidoParaCompartir(r, 'male');
    assert.deepEqual(c.figuras, []);
    assert.equal(c.titulo, 'Sin un polo claro');
    assert.doesNotMatch(c.texto, /dominante/i);
  });

  it('lo que dice en primera persona no se cuela en segunda: «una parte de mí quiere decidir sobre mi vida»', () => {
    // Antes salía «una parte de mí quiere decidir sobre tu propia vida» (y lo mismo con el Padre,
    // el Sacerdote y el Héroe), en la postal, en la Carta del Día y en el desempate del test.
    const segunda = /(tu|tus|ti|tienes|vives|te)/i;
    for (const a of ARCHETYPES_LIST.map(x => x.id as ArchetypeId)) {
      const b = a === 'rey' ? 'mago' : 'rey';
      assert.doesNotMatch(contenidoParaCompartir(mapa([a, b], { pair: [a, b] }), 'universal').frase, segunda, a);
      assert.doesNotMatch(contenidoParaCompartir(mapa([a], {}), 'universal').frase, segunda, a);
      assert.doesNotMatch(composeDailyOracleTexts(getArchetype(a, 'universal')).affirmation, segunda, a);
      for (const o of dilemaDeDesempate([a, b], 1).opciones) assert.doesNotMatch(o.texto, segunda, a);
    }
  });

  it('en ninguna perspectiva queda «del El», «y El» ni un artículo en mayúscula a media frase', () => {
    for (const g of ['male', 'female', 'universal'] as GenderMode[]) {
      for (const a of ARCHETYPES_LIST.map(x => x.id as ArchetypeId)) {
        const b = a === 'rey' ? 'mago' : 'rey';
        const c = contenidoParaCompartir(mapa([a, b], { pair: [a, b] }), g);
        assert.doesNotMatch(c.titulo, /\b(y|con) (El|La)\b/, `${a} en ${g}: ${c.titulo}`);
      }
    }
  });
});
