import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  growthArchetypes,
  initialArchetypes,
  leadingArchetypes,
  recommendChallenges,
  suggestedPrompts,
} from './personalization';
import { calculateAssessmentResult } from './scoringEngine';
import { INITIAL_CHALLENGES } from '../data/challengesData';
import { QUESTIONS_DATA } from '../data/questionsData';
import { ArchetypeId, AssessmentResult, CompositeProfile, GenderMode } from '../types';

const TODOS: ArchetypeId[] = [
  'creador', 'rebelde', 'constructor', 'explorador', 'mago', 'sabio', 'heroe', 'guerrero', 'rey',
  'soberano', 'amante', 'padre', 'cuidador', 'bufon', 'sacerdote', 'mistico', 'integrador', 'sanador',
];

/** Un resultado a medida: el ranking en el orden dado y el perfil con los campos que importan. */
function resultado(perfil: Partial<CompositeProfile>, desarrollo: ArchetypeId[], ranking: ArchetypeId[] = TODOS): AssessmentResult {
  const scores = ranking.map((id, i) => ({ archetypeId: id, rawScore: 0, normalizedScore: 90 - i * 4 }));
  return {
    id: 'r',
    date: '2026-10-10T10:00:00.000Z',
    title: '',
    type: 'quick',
    scores: Object.fromEntries(scores.map(s => [s.archetypeId, s.normalizedScore])) as AssessmentResult['scores'],
    ranking: scores,
    dominantArchetype: scores[0],
    top3: scores.slice(0, 3),
    top5: scores.slice(0, 5),
    developmentArchetypes: desarrollo.map(id => scores.find(s => s.archetypeId === id)!),
    dimensionScores: {} as AssessmentResult['dimensionScores'],
    compositeProfile: { archetypeKey: '', title: '', archetypeCombination: '', synthesis: '', strengths: [], risksAndShadows: [], developmentArchetypes: [], ...perfil },
  } as AssessmentResult;
}

// El caso de la tarjeta: el Creador con el Rebelde, y lo que menos apareció, el Sanador.
const creador = () => resultado({ pair: ['creador', 'rebelde'] }, ['sanador']);
const figuras = (cs: { archetypeId: ArchetypeId }[]) => cs.map(c => c.archetypeId);

describe('recommendChallenges', () => {
  it('el caso de la tarjeta: con el Creador delante ya no salen el Rey y el Guerrero', () => {
    const elegidas = recommendChallenges(INITIAL_CHALLENGES, creador());
    assert.equal(elegidas.length, 4);
    // Una por figura antes de repetir: tras el mapa, la siguiente del ranking (el Constructor).
    assert.deepEqual(figuras(elegidas), ['creador', 'sanador', 'rebelde', 'constructor']);
    assert.ok(!elegidas.some(c => c.archetypeId === 'rey' || c.archetypeId === 'guerrero'));
  });

  it('alterna lo que encabeza con lo que menos apareció, una por figura antes de repetir', () => {
    const r = resultado({ companions: ['mago', 'sabio'] }, ['sanador', 'mistico']);
    assert.deepEqual(figuras(recommendChallenges(INITIAL_CHALLENGES, r)), ['creador', 'sanador', 'mago', 'mistico']);
  });

  it('las pendientes van antes que las hechas', () => {
    const primera = INITIAL_CHALLENGES.find(c => c.archetypeId === 'creador')!;
    const retos = INITIAL_CHALLENGES.map(c => (c.id === primera.id ? { ...c, completed: true } : c));
    const elegidas = recommendChallenges(retos, creador());
    assert.ok(!elegidas.some(c => c.id === primera.id), 'la hecha no ocupa sitio mientras haya pendientes');
    assert.equal(elegidas[0].archetypeId, 'creador', 'su figura sigue delante, con la otra práctica');
  });

  it('si todo está hecho, se recomiendan igual (hechas) en vez de quedarse en blanco', () => {
    const hechas = INITIAL_CHALLENGES.map(c => ({ ...c, completed: true }));
    assert.equal(recommendChallenges(hechas, creador()).length, 4);
  });

  it('sin polo claro, empieza por lo que menos apareció', () => {
    const r = resultado({ isFlat: true }, ['sanador']);
    assert.equal(recommendChallenges(INITIAL_CHALLENGES, r)[0].archetypeId, 'sanador');
  });

  it('con figuras a la par, todas entran antes de repetir ninguna', () => {
    const r = resultado({ isTie: true, tiedLeaders: ['creador', 'rebelde', 'constructor'] }, []);
    assert.deepEqual(figuras(recommendChallenges(INITIAL_CHALLENGES, r, 3)), ['creador', 'rebelde', 'constructor']);
  });

  it('con mapas reales: cuatro prácticas distintas, y la primera es de quien encabeza', () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const respuestas = QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 1 + ((q.id * semilla * 7 + semilla) % 5) }));
      const r = calculateAssessmentResult(respuestas, 'full', 'male');
      const elegidas = recommendChallenges(INITIAL_CHALLENGES, r);
      assert.equal(new Set(elegidas.map(c => c.id)).size, 4, `semilla ${semilla}`);
      const cabeza = leadingArchetypes(r);
      if (cabeza.length) assert.equal(elegidas[0].archetypeId, cabeza[0], `semilla ${semilla}`);
    }
  });
});

describe('leadingArchetypes y growthArchetypes', () => {
  it('el dominante con su pareja; sin polo claro, nadie', () => {
    assert.deepEqual(leadingArchetypes(creador()), ['creador', 'rebelde']);
    assert.deepEqual(leadingArchetypes(resultado({ isFlat: true }, [])), []);
  });

  it('lo que menos apareció no repite ninguna figura de cabeza', () => {
    assert.deepEqual(growthArchetypes(resultado({ pair: ['creador', 'rebelde'] }, ['rebelde', 'sanador'])), ['sanador']);
  });
});

describe('initialArchetypes: Sinergias y Comparador arrancan con tu mapa', () => {
  it('sin resultado, las de siempre', () => {
    assert.deepEqual(initialArchetypes(null, 2), ['rey', 'guerrero']);
  });

  it('con resultado, las que encabezan y luego las siguientes del ranking', () => {
    assert.deepEqual(initialArchetypes(creador(), 3), ['creador', 'rebelde', 'constructor']);
  });
});

describe('suggestedPrompts: el chat pregunta por tu mapa', () => {
  it('sin resultado no inventa nada: se usan las genéricas', () => {
    assert.equal(suggestedPrompts(null, 'male'), null);
  });

  it('nombra la pareja que encabeza y lo que menos apareció', () => {
    const p = suggestedPrompts(creador(), 'female')!;
    assert.match(p[0], /la Creadora y la Rebelde/);
    assert.match(p.join(' '), /a la Sanadora/);
    assert.ok(!p.join(' ').includes('Guerrer'), 'ya no sale la Guerrera de ejemplo');
  });

  it('a la par, y sin polo claro, lo dice en vez de inventar un dominante', () => {
    const aLaPar = suggestedPrompts(resultado({ isTie: true, tiedLeaders: ['creador', 'rebelde'] }, []), 'male')!;
    assert.match(aLaPar[0], /^El Creador y el Rebelde salieron a la par/);
    const plano = suggestedPrompts(resultado({ isFlat: true }, []), 'male')!;
    assert.match(plano[0], /no tiene un polo claro/);
  });

  it('en ninguna perspectiva queda «del El», «al El», «a La» ni un nombre universal sin artículo', () => {
    for (const g of ['male', 'female', 'universal'] as GenderMode[]) {
      for (const lider of TODOS) {
        const ranking = [lider, ...TODOS.filter(id => id !== lider)];
        const crecer = ranking[ranking.length - 1];
        const r = resultado({ pair: [lider, ranking[1]] }, [crecer], ranking);
        const texto = suggestedPrompts(r, g)!.join(' ');
        assert.doesNotMatch(texto, /\b(del|al|de|a) (El|La)\b/, `${lider} en ${g}: ${texto}`);
        assert.doesNotMatch(texto, /\ben mí [A-ZÁÉÍÓÚ]/, `${lider} en ${g}: ${texto}`);
      }
    }
  });
});
