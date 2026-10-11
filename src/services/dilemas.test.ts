import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DILEMAS, DILEMAS_RAPIDO_IDS } from '../data/dilemasData';
import { ARCHETYPES_LIST, DIMENSIONS } from '../data/archetypesData';
import { ArchetypeId, DimensionId, RespuestaDilema } from '../types';
import {
  MAX_DESEMPATES,
  TipoTest,
  barajar,
  calcularResultadoDilemas,
  candidatosDesempate,
  dilemaDeDesempate,
  dilemasDelTest,
  esDesempate,
  puntuacionesDilemas,
} from './dilemas';
import { getMapLead } from './scoringEngine';

const IDS = ARCHETYPES_LIST.map(a => a.id as ArchetypeId);
const DIM_DE = Object.fromEntries(
  (Object.keys(DIMENSIONS) as DimensionId[]).flatMap(d => DIMENSIONS[d].archetypes.map(id => [id, d]))
) as Record<ArchetypeId, DimensionId>;

/** Una persona coherente: en cada pantalla elige a la primera de su orden que aparezca. */
function responder(tipo: TipoTest, orden: ArchetypeId[]): RespuestaDilema[] {
  return dilemasDelTest(tipo).map(d => {
    const elegida = [...d.opciones].sort((a, b) => orden.indexOf(a.arquetipo) - orden.indexOf(b.arquetipo))[0];
    return { dilemaId: d.id, arquetipo: elegida.arquetipo };
  });
}

/** Completa los desempates eligiendo según el mismo orden. */
function desempatar(respuestas: RespuestaDilema[], tipo: TipoTest, orden: ArchetypeId[]): RespuestaDilema[] {
  const todas = [...respuestas];
  let candidatos = candidatosDesempate(todas, tipo);
  while (candidatos) {
    const elegida = [...candidatos].sort((a, b) => orden.indexOf(a) - orden.indexOf(b))[0];
    todas.push({ dilemaId: dilemaDeDesempate(candidatos, todas.filter(esDesempate).length + 1).id, arquetipo: elegida, entre: candidatos });
    candidatos = candidatosDesempate(todas, tipo);
  }
  return todas;
}

const parejas = (ids: ArchetypeId[]) => ids.flatMap((a, i) => ids.slice(i + 1).map(b => [a, b].sort().join('|')));

describe('los dilemas: un reparto equilibrado', () => {
  const rapido = DILEMAS.filter(d => DILEMAS_RAPIDO_IDS.includes(d.id));
  const resto = DILEMAS.filter(d => !DILEMAS_RAPIDO_IDS.includes(d.id));

  it('36 en el completo y 18 en el rápido, con ids únicos', () => {
    assert.equal(DILEMAS.length, 36);
    assert.equal(rapido.length, 18);
    assert.equal(new Set(DILEMAS.map(d => d.id)).size, 36);
  });

  it('cada figura aparece 4 veces en cada mitad: ninguna tiene más ocasiones que otra', () => {
    for (const [nombre, mitad] of [
      ['rápido', rapido],
      ['resto', resto],
    ] as const) {
      for (const id of IDS) {
        const veces = mitad.filter(d => d.opciones.some(o => o.arquetipo === id)).length;
        assert.equal(veces, 4, `${id} aparece ${veces} veces en ${nombre}`);
      }
    }
  });

  it('cuatro figuras distintas por pantalla, de al menos tres dimensiones', () => {
    for (const d of DILEMAS) {
      const ids = d.opciones.map(o => o.arquetipo);
      assert.equal(new Set(ids).size, 4, d.id);
      assert.ok(new Set(ids.map(id => DIM_DE[id])).size >= 3, `${d.id}: pocas dimensiones`);
    }
  });

  it('ninguna pareja se repite dentro de una mitad', () => {
    for (const mitad of [rapido, resto]) {
      const todas = mitad.flatMap(d => parejas(d.opciones.map(o => o.arquetipo)));
      assert.equal(new Set(todas).size, todas.length);
    }
  });

  it('textos presentes y cortos (se leen en el móvil y en voz alta)', () => {
    for (const d of DILEMAS) {
      assert.ok(d.situacion.length > 10 && d.situacion.length <= 90, `${d.id}: situación de ${d.situacion.length}`);
      assert.ok(d.pregunta.endsWith('?'), d.id);
      for (const o of d.opciones) assert.ok(o.texto.length > 10 && o.texto.length <= 80, `${d.id}/${o.arquetipo}: ${o.texto.length}`);
      assert.equal(new Set(d.opciones.map(o => o.texto)).size, 4, d.id);
    }
  });
});

describe('puntuación: la proporción de veces que se eligió cuando aparecía', () => {
  it('quien elige siempre a una figura le da 100, y a las que nunca elige 0', () => {
    const orden = ['sanador', ...IDS.filter(id => id !== 'sanador')] as ArchetypeId[];
    const p = puntuacionesDilemas(responder('full', orden), 'full');
    assert.equal(p.sanador, 100);
    assert.equal(p[orden.at(-1)!], 0);
  });

  it('solo cuentan las respuestas de esta versión: un progreso del otro test no se cuela', () => {
    const completo = responder('full', IDS);
    const ajenas = completo.filter(r => !DILEMAS_RAPIDO_IDS.includes(r.dilemaId));
    const p = puntuacionesDilemas(ajenas, 'quick');
    assert.ok(IDS.every(id => p[id] === 0));
  });

  it('una respuesta que no estaba entre las opciones no cuenta', () => {
    const d = dilemasDelTest('quick')[0];
    const fuera = IDS.find(id => !d.opciones.some(o => o.arquetipo === id))!;
    const p = puntuacionesDilemas([{ dilemaId: d.id, arquetipo: fuera }], 'quick');
    assert.ok(IDS.every(id => p[id] === 0));
  });
});

describe('desempate', () => {
  it('no se ofrece hasta haber respondido todas las situaciones', () => {
    const todas = responder('quick', IDS);
    assert.equal(candidatosDesempate(todas.slice(0, -1), 'quick'), null);
  });

  it('con un empate arriba, se ofrece entre las empatadas y lo resuelve con una diferencia real', () => {
    // Buscamos un orden que deje un empate en cabeza.
    for (let s = 0; s < 400; s++) {
      const orden = barajar(IDS, `orden-${s}`);
      const respuestas = responder('quick', orden);
      const p = puntuacionesDilemas(respuestas, 'quick');
      const max = Math.max(...IDS.map(id => p[id]));
      const lideres = IDS.filter(id => p[id] === max);
      if (lideres.length < 2 || lideres.length > 6) continue;
      assert.deepEqual(candidatosDesempate(respuestas, 'quick')?.slice().sort(), lideres.slice().sort());
      const final = desempatar(respuestas, 'quick', orden);
      const pf = puntuacionesDilemas(final, 'quick');
      const ganadora = [...lideres].sort((a, b) => orden.indexOf(a) - orden.indexOf(b))[0];
      assert.ok(lideres.every(id => id === ganadora || pf[ganadora] - pf[id] >= 5), 'la diferencia es real');
      // Nadie de fuera del empate adelanta a las empatadas.
      const fuera = IDS.filter(id => !lideres.includes(id));
      assert.ok(lideres.every(l => fuera.every(f => pf[l] > pf[f])));
      return;
    }
    assert.fail('no se encontró un empate de prueba');
  });

  it('como mucho tres desempates', () => {
    for (let s = 0; s < 200; s++) {
      const orden = barajar(IDS, `tope-${s}`);
      const final = desempatar(responder('quick', orden), 'quick', orden);
      assert.ok(final.filter(esDesempate).length <= MAX_DESEMPATES);
    }
  });

  it('las opciones del desempate dicen lo que mueve a cada figura, sin su nombre', () => {
    const d = dilemaDeDesempate(['rey', 'bufon'], 1);
    assert.deepEqual(
      d.opciones.map(o => o.texto),
      ['Quiero poner orden y asumir la responsabilidad.', 'Quiero aligerar el peso con juego y humor.']
    );
    for (const o of d.opciones) assert.doesNotMatch(o.texto, /rey|bufón|bufon/i);
  });
});

describe('el resultado', () => {
  it('una persona coherente sale con su pareja al frente, sin empates ni mapa plano', () => {
    let sinEmpate = 0;
    for (let s = 0; s < 60; s++) {
      const orden = barajar(IDS, `persona-${s}`);
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const r = calcularResultadoDilemas(desempatar(responder(tipo, orden), tipo, orden), tipo, 'universal');
        assert.equal(r.instrumento, 'dilemas');
        assert.equal(r.ranking[0].archetypeId, orden[0], 'quien siempre se elige, encabeza');
        const lead = getMapLead(r, 'universal');
        assert.notEqual(lead.kind, 'flat');
        if (lead.kind === 'single' && r.compositeProfile.pair) sinEmpate++;
      }
    }
    // Con los desempates, casi siempre hay una pareja clara al frente.
    assert.ok(sinEmpate >= 100, `solo ${sinEmpate} de 120 con pareja clara`);
  });

  it('«por qué te salió» cita las situaciones en que se eligió a cada figura del podio', () => {
    const orden = barajar(IDS, 'cita');
    const respuestas = desempatar(responder('full', orden), 'full', orden);
    const r = calcularResultadoDilemas(respuestas, 'full', 'male');
    for (const s of r.top3) {
      const citas = r.evidence?.[s.archetypeId] ?? [];
      assert.ok(citas.length <= 2);
      for (const c of citas) {
        assert.ok(c.dilemaId && !c.dilemaId.startsWith('desempate'));
        assert.equal(respuestas.find(x => x.dilemaId === c.dilemaId)?.arquetipo, s.archetypeId);
      }
    }
  });

  it('las puntuaciones visibles van de 10 a 98 y las dimensiones salen de ellas', () => {
    const orden = barajar(IDS, 'rango');
    const r = calcularResultadoDilemas(desempatar(responder('full', orden), 'full', orden), 'full', 'female');
    for (const s of r.ranking) assert.ok(s.normalizedScore >= 10 && s.normalizedScore <= 98);
    for (const d of Object.values(r.dimensionScores)) assert.ok(d >= 10 && d <= 98);
  });
});
