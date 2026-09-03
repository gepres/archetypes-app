import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ARCHETYPES_LIST } from '../domain/archetypes/archetypes.data';
import { drawDailyOracle, isOracleCardCurrent } from './draw-daily-oracle';
import { buildArchetypeDossier, suggestChallenges } from './explore-archetype';
import {
  createInMemoryStore,
  createOracleCardCache,
  createProfileRepository,
  createTestProgressRepository,
} from './keyed-repositories';
import { assessmentProgress, questionIdsFor, runAssessment } from './run-assessment';
import type { AssessmentResult } from '../domain/model';

describe('evaluacion: la frontera que valida', () => {
  const ids = questionIdsFor('full');
  const validas = ids.map(questionId => ({ questionId, value: 3 }));

  it('rechaza un juego vacio', () => {
    const outcome = runAssessment([]);
    assert.equal(outcome.ok, false);
    assert.equal(outcome.ok === false && outcome.rejection.reason, 'empty');
  });

  it('rechaza una respuesta a una pregunta que no existe', () => {
    const outcome = runAssessment([{ questionId: 999_999, value: 3 }]);
    assert.equal(outcome.ok, false);
    assert.equal(outcome.ok === false && outcome.rejection.reason, 'unknown-question');
  });

  it('rechaza valores fuera de la escala, por arriba y por abajo', () => {
    for (const value of [0, 6, -1, 99]) {
      const outcome = runAssessment([{ questionId: ids[0]!, value }]);
      assert.equal(outcome.ok, false, `acepto el valor ${value}`);
    }
  });

  it('rechaza valores que no son numeros finitos', () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY]) {
      const outcome = runAssessment([{ questionId: ids[0]!, value }]);
      assert.equal(outcome.ok, false, `acepto ${value}`);
    }
  });

  it('rechaza la misma pregunta respondida dos veces', () => {
    const outcome = runAssessment([
      { questionId: ids[0]!, value: 3 },
      { questionId: ids[0]!, value: 5 },
    ]);
    assert.equal(outcome.ok, false);
    assert.equal(outcome.ok === false && outcome.rejection.reason, 'duplicate-answer');
  });

  it('acepta un test completo valido', () => {
    assert.equal(runAssessment(validas, 'full').ok, true);
  });

  it('rechaza en el test rapido una pregunta que solo esta en el completo', () => {
    const soloDelCompleto = ids.find(id => !questionIdsFor('quick').includes(id));
    assert.ok(soloDelCompleto !== undefined);
    const outcome = runAssessment([{ questionId: soloDelCompleto!, value: 3 }], 'quick');
    assert.equal(outcome.ok, false);
  });

  it('el progreso va de cero a uno', () => {
    assert.equal(assessmentProgress([], 'full'), 0);
    assert.equal(assessmentProgress(validas, 'full'), 1);
    const mitad = validas.slice(0, Math.floor(validas.length / 2));
    const progreso = assessmentProgress(mitad, 'full');
    assert.ok(progreso > 0 && progreso < 1);
  });
});

describe('oraculo diario', () => {
  it('la misma fecha da siempre la misma carta', () => {
    const a = drawDailyOracle(new Date(2026, 8, 2));
    const b = drawDailyOracle(new Date(2026, 8, 2, 23, 59));
    assert.equal(a.archetypeId, b.archetypeId);
    assert.equal(a.date, b.date);
  });

  it('usa la fecha local en formato corto', () => {
    assert.equal(drawDailyOracle(new Date(2026, 0, 1)).date, '2026-01-01');
    assert.equal(drawDailyOracle(new Date(2026, 11, 31)).date, '2026-12-31');
  });

  it('recorre los doce arquetipos en doce dias seguidos', () => {
    const doce = Array.from({ length: 12 }, (_, i) => drawDailyOracle(new Date(2026, 0, 1 + i)));
    assert.equal(new Set(doce.map(c => c.archetypeId)).size, 12);
  });

  it('no salta un dia en el cambio de horario', () => {
    // El calculo anterior restaba marcas de tiempo, y el dia que cambia la hora
    // dura veintitres o veinticinco horas: la division entera se desplazaba y
    // dos dias seguidos podian dar el mismo arquetipo.
    for (const [mes, dia] of [[2, 29], [9, 25]] as const) {
      const hoy = drawDailyOracle(new Date(2026, mes, dia));
      const manana = drawDailyOracle(new Date(2026, mes, dia + 1));
      assert.notEqual(hoy.archetypeId, manana.archetypeId,
        `el ${dia} y el ${dia + 1} del mes ${mes + 1} repiten arquetipo`);
    }
  });

  it('la carta caduca al cambiar de dia', () => {
    const hoy = new Date(2026, 8, 2);
    const carta = drawDailyOracle(hoy);
    assert.equal(isOracleCardCurrent(carta, hoy), true);
    assert.equal(isOracleCardCurrent(carta, new Date(2026, 8, 3)), false);
    assert.equal(isOracleCardCurrent(null, hoy), false);
  });
});

describe('ficha de arquetipo', () => {
  it('resuelve dimension y sinergias de los doce', () => {
    for (const archetype of ARCHETYPES_LIST) {
      const dossier = buildArchetypeDossier(archetype.id);
      assert.equal(dossier.archetype.id, archetype.id);
      assert.ok(dossier.dimension?.name, `${archetype.id} sin dimension`);
      for (const synergy of dossier.synergies) {
        assert.ok(synergy.partner?.name, `${archetype.id} con sinergia sin resolver`);
      }
    }
  });

  it('sugiere retos de los arquetipos de desarrollo, nunca del dominante', () => {
    const outcome = runAssessment(questionIdsFor('full').map(id => ({ questionId: id, value: 3 })));
    assert.equal(outcome.ok, true);
    if (!outcome.ok) return;
    const desarrollo = outcome.result.developmentArchetypes.map(a => a.archetypeId);
    for (const challenge of suggestChallenges(outcome.result)) {
      assert.ok(desarrollo.includes(challenge.archetypeId));
    }
  });
});

describe('repositorios sobre el puerto de almacenamiento', () => {
  const unResultado = (id: string): AssessmentResult => {
    const outcome = runAssessment(questionIdsFor('quick').map(q => ({ questionId: q, value: 4 })), 'quick');
    assert.equal(outcome.ok, true);
    if (!outcome.ok) throw new Error('inesperado');
    return { ...outcome.result, id };
  };

  it('guardar un resultado lo mete en el historial sin duplicarlo', async () => {
    const repo = createProfileRepository(createInMemoryStore());
    const resultado = unResultado('uno');
    await repo.saveCurrentResult(resultado);
    await repo.saveCurrentResult(resultado);
    assert.equal((await repo.loadHistory()).length, 1);
  });

  it('el historial deja el mas reciente primero', async () => {
    const repo = createProfileRepository(createInMemoryStore());
    await repo.saveCurrentResult(unResultado('viejo'));
    await repo.saveCurrentResult(unResultado('nuevo'));
    const historial = await repo.loadHistory();
    assert.equal(historial.length, 2);
    assert.equal(historial[0]!.id, 'nuevo');
  });

  it('un dato corrupto devuelve vacio en vez de reventar', async () => {
    // Perder una entrada es malo; no poder abrir la aplicacion es peor.
    const roto = createProfileRepository(
      createInMemoryStore({
        archetypes_user_profile: '{esto no es json',
        archetypes_journal_entries: '"un texto donde deberia haber una lista"',
      })
    );
    assert.equal(await roto.loadProfile(), null);
    assert.deepEqual(await roto.loadJournal(), []);
  });

  it('el progreso del test se guarda, se lee y se borra', async () => {
    const repo = createTestProgressRepository(createInMemoryStore());
    assert.equal(await repo.load(), null);
    await repo.save({ answers: { 1: 3 }, currentIndex: 1, testType: 'quick' });
    assert.equal((await repo.load())?.currentIndex, 1);
    await repo.clear();
    assert.equal(await repo.load(), null);
  });

  it('la carta del oraculo sobrevive al guardado', async () => {
    const cache = createOracleCardCache(createInMemoryStore());
    const carta = drawDailyOracle(new Date(2026, 8, 2));
    await cache.save(carta);
    assert.deepEqual(await cache.load(), carta);
  });
});
