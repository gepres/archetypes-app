import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ORACLE_TEXTS } from '../data/oracleTexts';
import { ARCHETYPES_LIST, getArchetype } from '../data/archetypesData';
import { StorageService, composeDailyOracleTexts } from './storageService';
import { arquetipoDelDia, leadingArchetypes, growthArchetypes, relacionConTuMapa } from './personalization';
import { fechaLocal, numeroDeDia } from './fechaLocal';
import { calculateAssessmentResult } from './scoringEngine';
import { QUESTIONS_DATA } from '../data/questionsData';
import { ArchetypeId, AssessmentResult } from '../types';

const memoria = () => {
  const mem = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  };
  return mem;
};

const mapa = (semilla: number): AssessmentResult => ({
  ...calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 1 + ((q.id * semilla * 7 + semilla) % 5) })), 'full', 'male'),
  id: `r${semilla}`,
});

describe('los textos de la Carta del Día', () => {
  it('cada uno de los 18 tiene su pregunta de mañana y de noche', () => {
    for (const a of ARCHETYPES_LIST) {
      const t = ORACLE_TEXTS[a.id as ArchetypeId];
      assert.ok(t, a.id);
      for (const p of [t.manana, t.noche]) {
        assert.match(p, /^¿.*\?$/, `${a.id}: ${p}`);
        assert.ok(p.length <= 120, `${a.id} demasiado larga: ${p}`);
      }
    }
  });

  it('ninguna se repite entre arquetipos', () => {
    const todas = Object.values(ORACLE_TEXTS).flatMap(t => [t.manana, t.noche]);
    assert.equal(new Set(todas).size, todas.length);
  });

  it('sin marcas de género, para que valgan en las tres perspectivas', () => {
    const marcas = /\b(o\/a|duro|dura|cercano|cercana|cansado|cansada|solo|sola|listo|lista)\b(?! por)/i;
    for (const t of Object.values(ORACLE_TEXTS)) {
      for (const p of [t.manana, t.noche]) assert.doesNotMatch(p.replace('solo por', ''), marcas, p);
    }
  });

  it('la carta ya no usa las plantillas genéricas de antes', () => {
    for (const g of ['male', 'female', 'universal'] as const) {
      const textos = composeDailyOracleTexts(getArchetype('rey', g));
      assert.doesNotMatch(Object.values(textos).join(' '), /energía luminosa|espíritu del|fiel a tu centro/);
      assert.match(textos.affirmation, /^Hoy elijo .+\.$/);
    }
  });
});

describe('qué arquetipo trae la carta', () => {
  it('sin mapa, el mismo para todos, rotando por los 18', () => {
    const vistos = new Set(Array.from({ length: 18 }, (_, i) => arquetipoDelDia(20000 + i, null)));
    assert.equal(vistos.size, 18);
  });

  it('con mapa, dos de cada tres días sale de él, y el tercero del ciclo general', () => {
    const r = mapa(3);
    const propias = new Set([...leadingArchetypes(r), ...growthArchetypes(r)]);
    for (let dia = 20001; dia < 20031; dia++) {
      if (dia % 3 !== 0) assert.ok(propias.has(arquetipoDelDia(dia, r)), `día ${dia}: no sale de tu mapa`);
    }
  });

  // Un mapa a medida, con las figuras de cabeza y las de desarrollo que se quieran.
  const conFiguras = (cabeza: ArchetypeId[], crecer: ArchetypeId[]): AssessmentResult => {
    const base = mapa(1);
    const resto = ARCHETYPES_LIST.map(x => x.id as ArchetypeId).filter(id => !cabeza.includes(id) && !crecer.includes(id));
    const orden = [...cabeza, ...resto, ...crecer];
    const porId = new Map(base.ranking.map(s => [s.archetypeId, s]));
    const ranking = orden.map((id, i) => ({ ...porId.get(id)!, normalizedScore: 95 - i * 4, rank: i + 1 }));
    return {
      ...base,
      ranking,
      dominantArchetype: ranking[0],
      developmentArchetypes: crecer.map(id => ranking.find(s => s.archetypeId === id)!),
      compositeProfile: {
        ...base.compositeProfile,
        isFlat: false,
        isTie: cabeza.length > 2,
        tiedLeaders: cabeza.length > 2 ? cabeza : undefined,
        pair: cabeza.length === 2 ? [cabeza[0], cabeza[1]] : undefined,
        companions: undefined,
      },
    };
  };

  for (const [nombre, cabeza, crecer] of [
    ['tres figuras (el caso de Codex)', ['constructor', 'creador'], ['cuidador']],
    ['seis figuras', ['rey', 'mago', 'sabio'], ['bufon', 'amante', 'heroe']],
    ['dos figuras', ['explorador', 'rebelde'], []],
  ] as [string, ArchetypeId[], ArchetypeId[]][]) {
    it(`con ${nombre}, ninguna queda fuera de la rotación (Codex)`, () => {
      const r = conFiguras(cabeza, crecer);
      const propias = [...leadingArchetypes(r), ...growthArchetypes(r)];
      assert.equal(propias.length, cabeza.length + crecer.length);
      const salen = new Set(Array.from({ length: 60 }, (_, i) => arquetipoDelDia(20000 + i, r)));
      for (const id of propias) assert.ok(salen.has(id), `${id} nunca sale`);
    });
  }

  it('los días del ciclo general recorren los 18, no solo unos pocos (Codex)', () => {
    const r = conFiguras(['constructor', 'creador'], ['cuidador']);
    const generales = new Set<ArchetypeId>();
    for (let dia = 20001; generales.size < 18 && dia < 20001 + 18 * 3 + 3; dia++) {
      if (dia % 3 === 0) generales.add(arquetipoDelDia(dia, r));
    }
    assert.equal(generales.size, 18);
  });

  it('alterna lo que encabeza con lo que menos apareció', () => {
    const r = conFiguras(['rey', 'mago', 'sabio'], ['bufon', 'amante', 'heroe']);
    const propios = Array.from({ length: 12 }, (_, i) => 20000 + i).filter(d => d % 3 !== 0).map(d => arquetipoDelDia(d, r));
    const deCabeza = (id: ArchetypeId) => ['rey', 'mago', 'sabio'].includes(id);
    for (let i = 1; i < propios.length; i++) assert.notEqual(deCabeza(propios[i]), deCabeza(propios[i - 1]), propios.join(' → '));
  });

  it('dice si sale de tu mapa', () => {
    const r = mapa(3);
    assert.equal(relacionConTuMapa(leadingArchetypes(r)[0], r), 'cabeza');
    if (growthArchetypes(r).length) assert.equal(relacionConTuMapa(growthArchetypes(r)[0], r), 'crecer');
    assert.equal(relacionConTuMapa('rey', null), null);
  });
});

describe('getDailyOracleCard: cambia a medianoche local y sigue a tu mapa', () => {
  it('la fecha es la local: a las 23:30 sigue siendo hoy', () => {
    memoria();
    const noche = new Date(2026, 9, 10, 23, 30);
    assert.equal(StorageService.getDailyOracleCard(null, noche).date, '2026-10-10');
    assert.equal(fechaLocal(noche), '2026-10-10');
  });

  it('el mismo día y con el mismo mapa, la misma carta; al día siguiente, otra', () => {
    memoria();
    const hoy = new Date(2026, 9, 10, 9, 0);
    const luego = new Date(2026, 9, 10, 22, 0);
    const manana = new Date(2026, 9, 11, 0, 30);
    const a = StorageService.getDailyOracleCard(null, hoy);
    assert.equal(StorageService.getDailyOracleCard(null, luego).archetypeId, a.archetypeId);
    const b = StorageService.getDailyOracleCard(null, manana);
    assert.equal(b.date, '2026-10-11');
    assert.equal(b.archetypeId, arquetipoDelDia(numeroDeDia(manana), null));
  });

  it('si cambia el mapa, la carta se elige de nuevo para él', () => {
    memoria();
    const dia = new Date(2026, 9, 11, 10, 0); // un día que no es del ciclo general
    assert.notEqual(numeroDeDia(dia) % 3, 0);
    const sinMapa = StorageService.getDailyOracleCard(null, dia);
    const r = mapa(5);
    const conMapa = StorageService.getDailyOracleCard(r, dia);
    assert.equal(conMapa.basadaEn, r.id);
    assert.equal(conMapa.archetypeId, arquetipoDelDia(numeroDeDia(dia), r));
    assert.equal(sinMapa.basadaEn, null);
  });
});
