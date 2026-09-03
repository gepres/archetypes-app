import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ARCHETYPES, ARCHETYPES_LIST, DIMENSIONS } from '../archetypes/archetypes.data';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from './questions.data';
import { calculateAssessmentResult } from './scoring-engine';
import type { AssessmentAnswer } from '../model';

/**
 * El motor de puntuacion convierte respuestas en el arquetipo de una persona.
 * Un fallo aqui es mudo: sale un perfil creible pero equivocado y nadie se
 * entera, asi que es lo que mas barato sale de probar y mas caro de romper.
 */

const allIds = QUESTIONS_DATA.map(q => q.id);
const answerAll = (value: number): AssessmentAnswer[] =>
  allIds.map(questionId => ({ questionId, value }));

describe('motor de puntuacion', () => {
  it('devuelve todos los arquetipos en el ranking, una sola vez cada uno', () => {
    const result = calculateAssessmentResult(answerAll(3));
    assert.equal(result.ranking.length, ARCHETYPES_LIST.length);
    assert.equal(new Set(result.ranking.map(r => r.archetypeId)).size, ARCHETYPES_LIST.length);
  });

  it('ordena el ranking de mayor a menor', () => {
    const { ranking } = calculateAssessmentResult(answerAll(4));
    for (let i = 1; i < ranking.length; i++) {
      assert.ok(
        ranking[i - 1]!.normalizedScore >= ranking[i]!.normalizedScore,
        `posicion ${i} rompe el orden`
      );
    }
  });

  it('mantiene las puntuaciones entre 0 y 100 en el extremo minimo', () => {
    const scores = Object.values(calculateAssessmentResult(answerAll(1)).scores);
    for (const score of scores) {
      assert.ok(score >= 0 && score <= 100, `puntuacion fuera de rango: ${score}`);
    }
  });

  it('mantiene las puntuaciones entre 0 y 100 en el extremo maximo', () => {
    const scores = Object.values(calculateAssessmentResult(answerAll(5)).scores);
    for (const score of scores) {
      assert.ok(score >= 0 && score <= 100, `puntuacion fuera de rango: ${score}`);
    }
  });

  it('el dominante es el primero del ranking', () => {
    const result = calculateAssessmentResult(answerAll(4));
    assert.equal(result.dominantArchetype.archetypeId, result.ranking[0]!.archetypeId);
  });

  it('top3 y top5 son prefijos del ranking', () => {
    const { ranking, top3, top5 } = calculateAssessmentResult(answerAll(3));
    assert.deepEqual(top3.map(s => s.archetypeId), ranking.slice(0, 3).map(s => s.archetypeId));
    assert.deepEqual(top5.map(s => s.archetypeId), ranking.slice(0, 5).map(s => s.archetypeId));
  });

  it('los arquetipos de desarrollo no son el dominante', () => {
    const result = calculateAssessmentResult(answerAll(3));
    const dominante = result.dominantArchetype.archetypeId;
    assert.ok(!result.developmentArchetypes.some(a => a.archetypeId === dominante));
  });

  it('es deterministico: las mismas respuestas dan el mismo perfil', () => {
    const answers = allIds.map((id, i) => ({ questionId: id, value: (i % 5) + 1 }));
    const a = calculateAssessmentResult(answers);
    const b = calculateAssessmentResult(answers);
    assert.deepEqual(a.scores, b.scores);
    assert.equal(a.dominantArchetype.archetypeId, b.dominantArchetype.archetypeId);
  });

  it('responder alto solo a las preguntas de un arquetipo lo hace dominante', () => {
    // Es la prueba que de verdad valida que los pesos hacen lo que dicen: si
    // alguien puntua alto solo donde pesa el guerrero, tiene que salir guerrero.
    for (const archetype of ARCHETYPES_LIST.slice(0, 4)) {
      const answers = QUESTIONS_DATA.map(question => ({
        questionId: question.id,
        value: question.weights.some(w => w.archetypeId === archetype.id) ? 5 : 1,
      }));
      const result = calculateAssessmentResult(answers);
      assert.equal(
        result.dominantArchetype.archetypeId,
        archetype.id,
        `respondiendo alto solo a lo de ${archetype.id} salio ${result.dominantArchetype.archetypeId}`
      );
    }
  });

  it('el test rapido es un subconjunto estricto del completo', () => {
    assert.ok(QUICK_QUESTION_IDS.length > 0);
    assert.ok(QUICK_QUESTION_IDS.length < allIds.length);
    for (const id of QUICK_QUESTION_IDS) {
      assert.ok(allIds.includes(id), `la pregunta rapida ${id} no existe en el completo`);
    }
  });

  it('el test rapido tambien puntua a todos', () => {
    const quickAnswers = QUICK_QUESTION_IDS.map(questionId => ({ questionId, value: 4 }));
    const result = calculateAssessmentResult(quickAnswers, 'quick');
    assert.equal(result.ranking.length, ARCHETYPES_LIST.length);
    assert.equal(result.type, 'quick');
  });

  it('el test rapido puede puntuar a cada arquetipo, no solo listarlo', () => {
    // Aparecer en el ranking con la puntuacion de suelo no es lo mismo que
    // poder salir dominante: si ninguna pregunta rapida pesa sobre un arquetipo,
    // el test corto lo tiene descartado de antemano.
    const rapidas = QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id));
    const conPeso = new Set(rapidas.flatMap(q => q.weights.map(w => w.archetypeId)));
    for (const archetype of ARCHETYPES_LIST) {
      assert.ok(conPeso.has(archetype.id), `el test rapido no puede puntuar a ${archetype.id}`);
    }
  });
});

describe('integridad de los datos del dominio', () => {
  it('hay exactamente dieciocho arquetipos', () => {
    // Un numero a mano, y a proposito. Cambiarlo es una decision de producto que
    // arrastra datos, sinergias, sigilos y el reparto por dimensiones: que la
    // prueba obligue a mirarlo de frente en vez de dejarlo pasar.
    assert.equal(ARCHETYPES_LIST.length, 18);
  });

  it('cada arquetipo esta en la dimension que dice, y en una sola', () => {
    const enDimensiones = Object.values(DIMENSIONS).flatMap(d => d.archetypes);
    assert.equal(enDimensiones.length, new Set(enDimensiones).size, 'hay repetidos');
    assert.equal(enDimensiones.length, ARCHETYPES_LIST.length, 'falta o sobra alguno');
    for (const d of Object.values(DIMENSIONS)) {
      for (const id of d.archetypes) {
        assert.equal(ARCHETYPES[id].dimension, d.id, `${id} dice otra dimension`);
      }
    }
  });

  it('cada arquetipo trae nombre en las tres perspectivas', () => {
    for (const a of ARCHETYPES_LIST) {
      for (const campo of ['masculineName', 'feminineName', 'universalName'] as const) {
        assert.ok(a[campo] && a[campo].trim().length > 0, `${a.id} no tiene ${campo}`);
      }
    }
  });

  it('las sinergias apuntan a arquetipos que existen', () => {
    const ids = new Set(ARCHETYPES_LIST.map(a => a.id));
    for (const archetype of ARCHETYPES_LIST) {
      for (const synergy of archetype.synergies) {
        assert.ok(ids.has(synergy.partnerId), `${archetype.id} apunta a ${synergy.partnerId}`);
      }
      assert.ok(!archetype.synergies.some(s => s.partnerId === archetype.id),
        `${archetype.id} tiene sinergia consigo mismo`);
    }
  });

  it('cada pregunta pesa sobre arquetipos que existen', () => {
    const ids = new Set(ARCHETYPES_LIST.map(a => a.id));
    for (const question of QUESTIONS_DATA) {
      assert.ok(question.weights.length > 0, `la pregunta ${question.id} no pesa sobre nada`);
      for (const weight of question.weights) {
        assert.ok(ids.has(weight.archetypeId), `la pregunta ${question.id} pesa sobre un id inexistente`);
        assert.ok(weight.weight > 0, `la pregunta ${question.id} tiene un peso no positivo`);
      }
    }
  });

  it('todos los arquetipos reciben peso de alguna pregunta', () => {
    // Un arquetipo sin preguntas nunca podria salir dominante, y el fallo seria
    // invisible: el test funcionaria, solo que ese arquetipo no existiria.
    const conPeso = new Set(QUESTIONS_DATA.flatMap(q => q.weights.map(w => w.archetypeId)));
    for (const archetype of ARCHETYPES_LIST) {
      assert.ok(conPeso.has(archetype.id), `ninguna pregunta pesa sobre ${archetype.id}`);
    }
  });
});
