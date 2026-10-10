import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FLAT_MAX_LEAD,
  FLAT_MAX_RANGE,
  TIE_MAX_GAP,
  adaptAssessmentResultToGender,
  calculateAssessmentResult,
  getMapLead,
} from './scoringEngine';
import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../data/questionsData';
import { ARCHETYPE_DRIVES, getDimensionTension } from '../data/archetypePairs';
import { ARCHETYPES_LIST, DIMENSIONS } from '../data/archetypesData';
import { AssessmentResult, DimensionId, GenderMode } from '../types';

const todas = (valor: number) => QUESTIONS_DATA.map(q => ({ questionId: q.id, value: valor }));

// Generador determinista para que las pruebas no dependan de la suerte.
function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const respuestasAlAzar = (r: () => number) => QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 1 + Math.floor(r() * 5) }));

/**
 * Un resultado con Amante, Cuidador y Bufón empatados en cabeza. Se fabrica sobre el ranking,
 * y se recompone el perfil con la lógica real, para no depender de qué afirmaciones lleve el
 * test rápido en cada momento.
 */
function conEmpateDeTres(gender: GenderMode): AssessmentResult {
  const base = calculateAssessmentResult(respuestasAlAzar(azar(17)), 'full', gender);
  const arriba = ['amante', 'cuidador', 'bufon'];
  const resto = base.ranking.filter(s => !arriba.includes(s.archetypeId));
  const ranking = [
    ...arriba.map((id, i) => ({ ...base.ranking.find(s => s.archetypeId === id)!, normalizedScore: 90, rank: i + 1 })),
    ...resto.map((s, i) => ({ ...s, normalizedScore: 70 - i * 2, rank: i + 4 })),
  ];
  return adaptAssessmentResultToGender({ ...base, ranking, dominantArchetype: ranking[0], top3: ranking.slice(0, 3) }, gender);
}

describe('mapa sin polo claro', () => {
  for (const valor of [1, 3, 5]) {
    it(`todo a ${valor}: no se inventa un dominante`, () => {
      const { compositeProfile: p } = calculateAssessmentResult(todas(valor), 'full', 'male');
      assert.equal(p.isFlat, true);
      assert.equal(p.title, 'Un mapa sin un polo claro');
      assert.equal(p.pair, undefined);
      assert.deepEqual(p.developmentArchetypes, []);
      assert.deepEqual(p.strengths, []);
    });
  }

  it('los extremos siguen dentro de 0 a 100', () => {
    for (const valor of [1, 5]) {
      const r = calculateAssessmentResult(todas(valor), 'full', 'male');
      for (const s of Object.values(r.scores)) assert.ok(s >= 0 && s <= 100);
    }
  });
});

describe('perfil por pareja', () => {
  const r = azar(7);
  const resultados = Array.from({ length: 600 }, (_, i) =>
    calculateAssessmentResult(respuestasAlAzar(r), i % 2 ? 'full' : 'quick', (['male', 'female', 'universal'] as GenderMode[])[i % 3])
  );

  const lideres = (res: AssessmentResult) =>
    res.ranking.filter(s => res.ranking[0].normalizedScore - s.normalizedScore <= TIE_MAX_GAP);

  it('con uno o dos en cabeza, el título es la pareja; o solo el líder si detrás van varias a la par', () => {
    for (const res of resultados.filter(x => !x.compositeProfile.isFlat && lideres(x).length <= 2)) {
      const [a, b] = res.ranking;
      const segundos = res.ranking.slice(1).filter(s => b.normalizedScore - s.normalizedScore <= TIE_MAX_GAP);
      const rango = a.normalizedScore - res.ranking[res.ranking.length - 1].normalizedScore;
      if (lideres(res).length === 1 && segundos.length >= 2 && (rango <= FLAT_MAX_RANGE || segundos.length >= 3)) {
        assert.equal(res.compositeProfile.title, a.name);
        assert.equal(res.compositeProfile.pair, undefined, 'no se elige pareja entre empatadas');
        continue;
      }
      if (lideres(res).length === 1 && segundos.length === 2) {
        // Dos empatadas detrás: se nombran las dos, sin elegir una para la pareja.
        assert.equal(res.compositeProfile.pair, undefined);
        assert.deepEqual([...(res.compositeProfile.companions ?? [])].sort(), segundos.map(s => s.archetypeId).sort());
        continue;
      }
      assert.equal(res.compositeProfile.title, `${a.name} + ${b.name}`);
      assert.deepEqual(res.compositeProfile.pair, [a.archetypeId, b.archetypeId]);
      assert.ok(res.compositeProfile.tension && res.compositeProfile.tension.length > 0);
    }
  });

  it('dos segundos empatados: intercambiarlos no cambia a quién se nombra (quinta revisión de Codex)', () => {
    // Bufón 66, Sacerdote 63, Héroe 63 y Rebelde 61: rango 30.
    const conPuntos = (orden: string[]) => {
      const base = calculateAssessmentResult(respuestasAlAzar(azar(23)), 'full', 'male');
      const puntos: Record<string, number> = { bufon: 66, [orden[0]]: 63, [orden[1]]: 63, rebelde: 61 };
      const resto = base.ranking.filter(s => !(s.archetypeId in puntos));
      const ranking = [
        ...['bufon', orden[0], orden[1], 'rebelde'].map((id, i) => ({ ...base.ranking.find(s => s.archetypeId === id)!, normalizedScore: puntos[id], rank: i + 1 })),
        ...resto.map((s, i) => ({ ...s, normalizedScore: 55 - i * 2, rank: i + 5 })),
      ];
      return adaptAssessmentResultToGender({ ...base, ranking, dominantArchetype: ranking[0], top3: ranking.slice(0, 3) }, 'male').compositeProfile;
    };
    const p1 = conPuntos(['sacerdote', 'heroe']);
    const p2 = conPuntos(['heroe', 'sacerdote']);
    assert.equal(p1.pair, undefined);
    assert.deepEqual([...(p1.companions ?? [])].sort(), ['heroe', 'sacerdote']);
    assert.deepEqual([...(p2.companions ?? [])].sort(), ['heroe', 'sacerdote']);
    assert.deepEqual([...p1.strengths].sort(), [...p2.strengths].sort());
    assert.deepEqual([...p1.risksAndShadows].sort(), [...p2.risksAndShadows].sort());
    assert.equal(p1.tension ?? '', p2.tension ?? '');
  });

  it('la lista de arriba de «lo que menos apareció» es la misma que la del perfil', () => {
    for (const res of resultados) {
      assert.deepEqual(res.developmentArchetypes.map(s => s.archetypeId), res.compositeProfile.developmentArchetypes.map(d => d.archetypeId));
    }
    // Y en el caso de Codex (quince empatadas abajo) las dos están vacías.
    const res = calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: q.id === 33 ? 3 : 2 })), 'full', 'male');
    assert.deepEqual(res.developmentArchetypes, []);
  });

  it('«lo que menos apareció» nunca elige entre figuras empatadas', () => {
    for (const res of resultados) {
      const elegidas = res.compositeProfile.developmentArchetypes.map(d => d.archetypeId);
      for (const id of elegidas) {
        const puntos = res.ranking.find(s => s.archetypeId === id)!.normalizedScore;
        const empatadas = res.ranking.filter(s => Math.abs(s.normalizedScore - puntos) <= TIE_MAX_GAP).map(s => s.archetypeId);
        for (const e of empatadas) assert.ok(elegidas.includes(e), `${id} elegida, pero ${e} está empatada y no`);
      }
    }
  });

  it('un líder con muchas empatadas detrás y abajo (caso de la tercera revisión de Codex)', () => {
    // Todo a 2 salvo la afirmación 33 a 3: 30, 26, 26 y quince figuras empatadas a 25.
    const res = calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: q.id === 33 ? 3 : 2 })), 'full', 'male');
    const p = res.compositeProfile;
    assert.equal(p.isFlat, false);
    assert.equal(p.pair, undefined);
    assert.equal(p.title, res.ranking[0].name);
    assert.deepEqual(p.developmentArchetypes, [], 'no se recomienda entre quince empatadas');
    assert.doesNotMatch(p.synthesis, /detrás\.$|con .* detrás/);
  });

  it('el empate se marca exactamente cuando dos o más figuras están a la par en cabeza', () => {
    for (const res of resultados.filter(x => !x.compositeProfile.isFlat)) {
      const grupo = lideres(res);
      assert.equal(res.compositeProfile.isTie, grupo.length >= 2);
      if (grupo.length >= 2) assert.deepEqual(res.compositeProfile.tiedLeaders, grupo.map(s => s.archetypeId));
      else assert.equal('tiedLeaders' in res.compositeProfile, false);
    }
  });

  it('el mapa plano se marca exactamente cuando todo cabe en pocos puntos y nadie se despega', () => {
    for (const res of resultados) {
      const s = res.ranking.map(x => x.normalizedScore);
      const plano = s[0] - s[s.length - 1] <= FLAT_MAX_RANGE && s[0] - s[1] <= FLAT_MAX_LEAD;
      assert.equal(!!res.compositeProfile.isFlat, plano);
    }
  });

  it('un perfil suave pero coherente no es plano (caso de la segunda revisión de Codex)', () => {
    // 4 a las afirmaciones 6, 19, 20 y 23, y 3 al resto: el Explorador se despega diez puntos.
    const res = calculateAssessmentResult(
      QUESTIONS_DATA.map(q => ({ questionId: q.id, value: [6, 19, 20, 23].includes(q.id) ? 4 : 3 })),
      'full',
      'male'
    );
    assert.equal(res.compositeProfile.isFlat, false);
    assert.equal(res.dominantArchetype.archetypeId, 'explorador');
    assert.ok((res.evidence?.explorador ?? []).length > 0, 'cuenta por qué le salió');
  });

  // Los dos casos que encontró la revisión de Codex
  const rapidas = QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id));

  it('un mapa contrastado no es plano aunque arriba haya muchos empatados', () => {
    // Acción a 1 y todo lo demás a 5: once figuras arriba y tres abajo, a 88 puntos.
    const res = calculateAssessmentResult(rapidas.map(q => ({ questionId: q.id, value: q.dimensionFocus === 'accion' ? 1 : 5 })), 'quick', 'male');
    const p = res.compositeProfile;
    assert.equal(p.isFlat, false);
    assert.equal(p.isTie, true);
    assert.ok((p.tiedLeaders ?? []).length >= 3);
    assert.equal(p.pair, undefined, 'no se elige una pareja entre empatados');
    assert.match(p.title, /a la par/);
    assert.ok(p.developmentArchetypes.length > 0, 'el contraste sí se cuenta: lo que menos apareció');
  });

  it('un empate de tres no se reduce a una pareja con el tercero «detrás»', () => {
    // Amante, Cuidador y Bufón empatados arriba, como en el caso de Codex.
    const res = conEmpateDeTres('male');
    const p = res.compositeProfile;
    const grupo = lideres(res);
    assert.ok(grupo.length >= 3, `solo ${grupo.length} en cabeza`);
    assert.equal(p.pair, undefined);
    for (const s of grupo) assert.ok(p.title.includes(s.name) || p.synthesis.includes(s.name), `${s.name} no aparece`);
    for (const s of grupo) assert.doesNotMatch(p.synthesis, new RegExp(`con ${s.name} detrás`));
  });

  it('ya no hay seis títulos fijos ni «El Integrador X»', () => {
    const titulos = new Set(resultados.map(x => x.compositeProfile.title));
    assert.ok(titulos.size > 60, `solo ${titulos.size} títulos distintos`);
    for (const t of titulos) assert.doesNotMatch(t, /^(El|La) Integrador(a)? (El|La) /);
  });

  it('ningún texto del perfil queda con «del El» o «de La»', () => {
    for (const res of resultados) {
      const p = res.compositeProfile;
      const todo = [p.synthesis, ...p.strengths, ...p.risksAndShadows, ...p.developmentArchetypes.map(d => d.reason)].join(' ');
      assert.doesNotMatch(todo, /\bdel El\b|\bde El\b|\bde La\b/);
    }
  });

  it('los de desarrollo no prometen equilibrio', () => {
    for (const res of resultados.filter(x => !x.compositeProfile.isFlat)) {
      for (const d of res.compositeProfile.developmentArchetypes) {
        assert.match(d.reason, /apareció poco en tus respuestas/);
        assert.doesNotMatch(d.reason, /equilibrar/);
      }
    }
  });
});

describe('por qué te salió', () => {
  it('solo cuenta respuestas de acuerdo con afirmaciones que puntúan ese arquetipo', () => {
    const r = azar(11);
    for (let i = 0; i < 200; i++) {
      const respuestas = respuestasAlAzar(r);
      const res = calculateAssessmentResult(respuestas, 'full', 'male');
      for (const [id, lista] of Object.entries(res.evidence ?? {})) {
        assert.ok(lista.length <= 2);
        for (const e of lista) {
          const q = QUESTIONS_DATA.find(x => x.id === e.questionId)!;
          const peso = q.weights.find(w => w.archetypeId === id)?.weight ?? 0;
          assert.ok(peso >= 2, `la ${e.questionId} no pesa lo bastante en ${id} (peso ${peso})`);
          assert.ok(e.value >= 4);
          assert.equal(respuestas.find(x => x.questionId === e.questionId)!.value, e.value);
        }
      }
    }
  });

  it('en el test rápido solo cita afirmaciones del rápido', () => {
    const quick = QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id)).map(q => ({ questionId: q.id, value: 5 }));
    const res = calculateAssessmentResult(quick, 'quick', 'male');
    for (const lista of Object.values(res.evidence ?? {})) {
      for (const e of lista) assert.ok(QUICK_QUESTION_IDS.includes(e.questionId));
    }
  });

  it('si nadie estuvo de acuerdo con nada, no inventa un motivo', () => {
    const res = calculateAssessmentResult(todas(3), 'full', 'male');
    for (const lista of Object.values(res.evidence ?? {})) assert.deepEqual(lista, []);
  });
});

describe('resultados guardados', () => {
  it('se recomponen con la lógica de ahora y dejan de engordar', () => {
    const nuevo = calculateAssessmentResult(respuestasAlAzar(azar(3)), 'full', 'male');
    // Así se guardaba antes: perfil con título fijo y el arquetipo entero dentro del dominante.
    const antiguo = {
      ...nuevo,
      compositeProfile: { ...nuevo.compositeProfile, title: 'El Integrador El Creador', synthesis: 'la fuerza de El Creador' },
      dominantArchetype: { ...nuevo.dominantArchetype, ...ARCHETYPES_LIST[0], variants: ARCHETYPES_LIST[0].variants },
    } as unknown as AssessmentResult;
    delete (antiguo.compositeProfile as any).pair;

    const recompuesto = adaptAssessmentResultToGender(antiguo, 'female');
    assert.notEqual(recompuesto.compositeProfile.title, 'El Integrador El Creador');
    assert.ok(recompuesto.compositeProfile.pair || recompuesto.compositeProfile.isFlat);
    assert.equal('variants' in recompuesto.dominantArchetype, false);
    assert.deepEqual(Object.keys(recompuesto.dominantArchetype).sort(), ['archetypeId', 'dimension', 'emoji', 'name', 'normalizedScore', 'rank', 'rawScore']);
    assert.ok(JSON.stringify(recompuesto).length < JSON.stringify(antiguo).length);
  });
});

describe('getMapLead: ninguna pantalla proclama un dominante que no hay', () => {
  const rapidas = QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id));

  it('mapa plano', () => {
    const lead = getMapLead(calculateAssessmentResult(todas(3), 'full', 'male'), 'male');
    assert.deepEqual(lead, { kind: 'flat', ids: [], label: 'Sin un polo claro' });
  });

  it('empate de tres: los nombra a los tres', () => {
    const lead = getMapLead(conEmpateDeTres('female'), 'female');
    assert.equal(lead.kind, 'tie');
    assert.deepEqual(lead.ids, ['amante', 'cuidador', 'bufon']);
    assert.equal(lead.label, 'La Amante, La Cuidadora y La Bufona, a la par');
  });

  it('un dominante claro se nombra solo', () => {
    const r = azar(5);
    for (let i = 0; i < 200; i++) {
      const res = calculateAssessmentResult(respuestasAlAzar(r), 'full', 'male');
      const lead = getMapLead(res, 'male');
      if (!res.compositeProfile.isFlat && !res.compositeProfile.isTie) {
        assert.equal(lead.kind, 'single');
        assert.deepEqual(lead.ids, [res.dominantArchetype.archetypeId]);
      }
    }
  });
});

describe('textos de las parejas', () => {
  it('cada arquetipo tiene su impulso', () => {
    for (const a of ARCHETYPES_LIST) assert.ok(ARCHETYPE_DRIVES[a.id]?.length > 0, a.id);
  });

  it('las diez combinaciones de dimensiones tienen pregunta, en cualquier orden', () => {
    const dims = Object.keys(DIMENSIONS) as DimensionId[];
    for (const x of dims) for (const y of dims) {
      assert.ok(getDimensionTension(x, y).length > 0, `${x}|${y}`);
      assert.equal(getDimensionTension(x, y), getDimensionTension(y, x));
    }
  });
});
