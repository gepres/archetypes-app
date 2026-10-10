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

  it('con mapa, alterna entre tus figuras y lo que menos apareció, y uno de cada tres días el general', () => {
    const r = mapa(3);
    const propias = new Set([...leadingArchetypes(r), ...growthArchetypes(r)]);
    for (let dia = 20000; dia < 20030; dia++) {
      const id = arquetipoDelDia(dia, r);
      if (dia % 3 === 0) assert.equal(id, arquetipoDelDia(dia, null), `día ${dia}: el general`);
      else assert.ok(propias.has(id), `día ${dia}: ${id} no sale de tu mapa`);
    }
    // Y pasan todas tus figuras, no siempre la misma.
    const delMapa = new Set(Array.from({ length: 30 }, (_, i) => arquetipoDelDia(20000 + i, r)).filter(id => propias.has(id)));
    assert.equal(delMapa.size, propias.size);
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
