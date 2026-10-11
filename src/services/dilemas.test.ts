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
  ordenDilemas,
  puntuacionesDilemas,
} from './dilemas';
import { adaptAssessmentResultToGender, getMapLead } from './scoringEngine';

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

describe('puntuación: la parte de sus comparaciones que ganó cada figura', () => {
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

/** Ninguna figura queda por delante de otra que le ganó, salvo si las dos están en un ciclo. */
function respetaPrecedencias(respuestas: RespuestaDilema[], tipo: TipoTest) {
  const delTest = new Map(dilemasDelTest(tipo).map(d => [d.id, d]));
  const gano = new Map<ArchetypeId, Set<ArchetypeId>>(IDS.map(id => [id, new Set()]));
  for (const r of respuestas) {
    const otras = r.entre ?? delTest.get(r.dilemaId)!.opciones.map(o => o.arquetipo);
    for (const o of otras) if (o !== r.arquetipo) gano.get(r.arquetipo)!.add(o);
  }
  const alcanza = (a: ArchetypeId, b: ArchetypeId) => {
    const vistos = new Set([a]);
    const pila = [a];
    while (pila.length) for (const y of gano.get(pila.pop()!)!) {
      if (y === b) return true;
      if (!vistos.has(y)) { vistos.add(y); pila.push(y); }
    }
    return false;
  };
  const pos = new Map(calcularResultadoDilemas(respuestas, tipo, 'male').ranking.map((x, i) => [x.archetypeId, i]));
  for (const [a, vencidas] of gano)
    for (const b of vencidas)
      if (!alcanza(b, a)) assert.ok(pos.get(a)! < pos.get(b)!, `${a} ganó a ${b} y quedó detrás`);
}

/** Las figuras de un desempate van en cabeza: ninguna de su ciclo perdió contra alguien de fuera. */
function candidatosEnCabeza(respuestas: RespuestaDilema[], tipo: TipoTest, candidatos: ArchetypeId[], caso: string) {
  const delTest = new Map(dilemasDelTest(tipo).map(d => [d.id, d]));
  const { cabeza } = ordenDilemas(respuestas, tipo);
  // Si se desempata el segundo puesto, el primero ya está colocado.
  const colocadas = new Set(cabeza[0].length > 1 ? [] : cabeza[0]);
  const gano = new Map<ArchetypeId, Set<ArchetypeId>>(IDS.map(id => [id, new Set()]));
  for (const r of respuestas) {
    const otras = r.entre ?? delTest.get(r.dilemaId)!.opciones.map(o => o.arquetipo);
    for (const o of otras) if (o !== r.arquetipo && !colocadas.has(o) && !colocadas.has(r.arquetipo)) gano.get(r.arquetipo)!.add(o);
  }
  const alcanza = (a: ArchetypeId, b: ArchetypeId) => {
    const vistos = new Set([a]);
    const pila = [a];
    while (pila.length) for (const y of gano.get(pila.pop()!)!) {
      if (y === b) return true;
      if (!vistos.has(y)) { vistos.add(y); pila.push(y); }
    }
    return false;
  };
  // Todo lo que llega a una candidata tiene que estar en su ciclo (ella también llega).
  for (const x of candidatos)
    for (const y of IDS)
      if (y !== x && !colocadas.has(y) && alcanza(y, x)) assert.ok(alcanza(x, y), `${caso}: ${x} va al desempate, pero ${y} le gana desde fuera de su ciclo`);
}

describe('desempate', () => {
  it('no se ofrece hasta haber respondido todas las situaciones', () => {
    const todas = responder('quick', IDS);
    assert.equal(candidatosDesempate(todas.slice(0, -1), 'quick'), null);
  });

  it('regresión (Codex): creador > rebelde > constructor da la pareja Creador + Rebelde', () => {
    // El Constructor nunca coincide con las dos primeras en el rápido y salía «elegido siempre»;
    // el Rebelde perdió una vez contra el Creador. Contar elecciones daba la pareja equivocada.
    const orden = ['creador', 'rebelde', 'constructor', ...IDS.filter(id => !['creador', 'rebelde', 'constructor'].includes(id))] as ArchetypeId[];
    const r = calcularResultadoDilemas(desempatar(responder('quick', orden), 'quick', orden), 'quick', 'male');
    assert.deepEqual(r.compositeProfile.pair, ['creador', 'rebelde']);
  });

  it('regresión (Codex): un desempate no deja que otra figura adelante a las del grupo', () => {
    // creador > heroe > constructor > rebelde: perder dos desempates no puede dejar al
    // Constructor por detrás del Rebelde, que no jugó ninguno.
    const orden = ['creador', 'heroe', 'constructor', 'rebelde', ...IDS.filter(id => !['creador', 'heroe', 'constructor', 'rebelde'].includes(id))] as ArchetypeId[];
    const r = calcularResultadoDilemas(desempatar(responder('quick', orden), 'quick', orden), 'quick', 'male');
    const pos = (id: ArchetypeId) => r.ranking.findIndex(s => s.archetypeId === id);
    assert.deepEqual([pos('creador'), pos('heroe')], [0, 1]);
    assert.ok(pos('constructor') < pos('rebelde'), `constructor ${pos('constructor')} · rebelde ${pos('rebelde')}`);
  });

  it('los desempates ordenan, pero no cambian la puntuación de nadie', () => {
    for (let s = 0; s < 80; s++) {
      const orden = barajar(IDS, `puntua-${s}`);
      const respuestas = responder('quick', orden);
      const antes = puntuacionesDilemas(respuestas, 'quick');
      const despues = puntuacionesDilemas(desempatar(respuestas, 'quick', orden), 'quick');
      assert.deepEqual(despues, antes);
    }
  });

  it('con cualquier persona coherente, la pareja son sus dos preferidas de verdad', () => {
    let casos = 0;
    let acierta = 0;
    for (let s = 0; s < 300; s++) {
      const orden = barajar(IDS, `verdad-${s}`);
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const r = calcularResultadoDilemas(desempatar(responder(tipo, orden), tipo, orden), tipo, 'universal');
        casos++;
        if (r.ranking[0].archetypeId === orden[0] && r.ranking[1].archetypeId === orden[1]) acierta++;
      }
    }
    assert.equal(acierta, casos, `acierta ${acierta} de ${casos}`);
  });

  it('regresión (Codex): tras desempatar, nadie de fuera del grupo se cuela por delante de quien le ganó', () => {
    // integrador > padre > sabio > rey: el Sabio le ganó al Rey y solo perdió con las dos
    // primeras; el Rey no puede acabar tercero por delante de él.
    const orden = ['integrador', 'padre', 'sabio', 'rey', ...IDS.filter(id => !['integrador', 'padre', 'sabio', 'rey'].includes(id))] as ArchetypeId[];
    const r = calcularResultadoDilemas(desempatar(responder('quick', orden), 'quick', orden), 'quick', 'male');
    assert.deepEqual(r.top3.map(s => s.archetypeId), ['integrador', 'padre', 'sabio']);
  });

  it('regresión (Codex): lo que se elige en un desempate no cambia ningún número ni el balance de dimensiones', () => {
    let probados = 0;
    for (let s = 0; s < 200 && probados < 25; s++) {
      const orden = barajar(IDS, `numeros-${s}`);
      const respuestas = responder('quick', orden);
      if (!candidatosDesempate(respuestas, 'quick')) continue;
      probados++;
      // Mismas situaciones; en los desempates, una vez se elige según el orden y otra al revés.
      const a = calcularResultadoDilemas(desempatar(respuestas, 'quick', orden), 'quick', 'male');
      const b = calcularResultadoDilemas(desempatar(respuestas, 'quick', [...orden].reverse()), 'quick', 'male');
      assert.deepEqual(b.scores, a.scores);
      assert.deepEqual(b.dimensionScores, a.dimensionScores);
    }
    assert.ok(probados >= 10, `solo ${probados} casos con desempate`);
  });

  it('el orden nunca pone a una figura delante de otra que le ganó directamente', () => {
    for (let s = 0; s < 200; s++) {
      const orden = barajar(IDS, `capas-${s}`);
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const respuestas = desempatar(responder(tipo, orden), tipo, orden);
        const pos = new Map(calcularResultadoDilemas(respuestas, tipo, 'male').ranking.map((x, i) => [x.archetypeId, i]));
        const delTest = new Map(dilemasDelTest(tipo).map(d => [d.id, d]));
        for (const r of respuestas) {
          const otras = r.entre ?? delTest.get(r.dilemaId)!.opciones.map(o => o.arquetipo);
          for (const o of otras) if (o !== r.arquetipo) assert.ok(pos.get(r.arquetipo)! < pos.get(o)!, `${r.arquetipo} le ganó a ${o}`);
        }
      }
    }
  });

  it('regresión (Codex): con respuestas que se contradicen, el perfil respeta lo que se decidió en los desempates', () => {
    // Elegir «la primera» de cada pantalla barajada deja ciclos (A gana a B, B a C, C a A).
    const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `2-${d.id}`)[0].arquetipo }));
    const preferencia = ['mago', 'sacerdote', ...IDS.filter(id => id !== 'mago' && id !== 'sacerdote')] as ArchetypeId[];
    const r = calcularResultadoDilemas(desempatar(respuestas, 'quick', preferencia), 'quick', 'male');
    const lead = getMapLead(r, 'male');
    assert.equal(lead.kind, 'single', `sale ${lead.label}`);
    assert.equal(lead.ids[0], r.ranking[0].archetypeId);
  });

  it('con respuestas al azar, lo que deciden los desempates es lo que dice el perfil', () => {
    for (let s = 0; s < 300; s++) {
      const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `azar-${s}-${d.id}`)[0].arquetipo }));
      const preferencia = barajar(IDS, `pref-${s}`);
      const r = calcularResultadoDilemas(desempatar(respuestas, 'quick', preferencia), 'quick', 'male');
      const resueltos = r.cabezaResuelta ?? 0;
      if (resueltos >= 1) {
        assert.equal(r.compositeProfile.isTie, false, `caso ${s}`);
        assert.equal(getMapLead(r, 'male').ids[0], r.ranking[0].archetypeId, `caso ${s}`);
      }
      if (resueltos >= 2 && r.compositeProfile.pair) assert.deepEqual(r.compositeProfile.pair, [r.ranking[0].archetypeId, r.ranking[1].archetypeId], `caso ${s}`);
    }
  });

  it('regresión (Codex): un ciclo ajeno no borra una precedencia que sí se puede respetar', () => {
    // Integrador ganó a Sanador y Sanador no tiene ningún camino de victorias hasta Integrador:
    // Sanador no puede quedar por delante.
    const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `noise-2704-${d.id}`)[0].arquetipo }));
    respetaPrecedencias(desempatar(respuestas, 'quick', IDS), 'quick');
  });

  it('con respuestas al azar (con ciclos), nadie va delante de quien le ganó salvo dentro de un ciclo', () => {
    for (let s = 0; s < 300; s++) {
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const respuestas = dilemasDelTest(tipo).map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `ciclo-${s}-${d.id}`)[0].arquetipo }));
        respetaPrecedencias(desempatar(respuestas, tipo, barajar(IDS, `pref-${s}`)), tipo);
      }
    }
  });

  it('regresión (Codex): un desempate solo ofrece figuras de un ciclo al que nadie de fuera ha ganado', () => {
    // Antes bastaba con que cada figura alcanzase a quien le ganó directamente: Mago entraba al
    // desempate aunque Rebelde gana a Padre y Padre a Mago, sin camino de vuelta.
    for (let s = 0; s < 300; s++) {
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const todas: RespuestaDilema[] = dilemasDelTest(tipo).map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `fuente-${s}-${d.id}`)[0].arquetipo }));
        const preferencia = barajar(IDS, `fpref-${s}`);
        let candidatos = candidatosDesempate(todas, tipo);
        while (candidatos) {
          candidatosEnCabeza(todas, tipo, candidatos, `caso ${s} ${tipo}`);
          const elegida = [...candidatos].sort((a, b) => preferencia.indexOf(a) - preferencia.indexOf(b))[0];
          todas.push({ dilemaId: dilemaDeDesempate(candidatos, todas.filter(esDesempate).length + 1).id, arquetipo: elegida, entre: candidatos });
          candidatos = candidatosDesempate(todas, tipo);
        }
      }
    }
  });

  it('regresión (Codex): casos en que se ofrecía al desempate una figura dominada desde fuera de su ciclo', () => {
    // Encontrados comparando con el criterio anterior: ofrecía también a Sabio, Héroe o Sacerdote.
    for (const s of [1373, 5737, 12124]) {
      const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `busca-${s}-${d.id}`)[0].arquetipo }));
      const candidatos = candidatosDesempate(respuestas, 'quick');
      assert.ok(candidatos, `caso ${s}: sin desempate`);
      candidatosEnCabeza(respuestas, 'quick', candidatos!, `caso ${s}`);
    }
  });

  it('regresión (Codex): sin desempate posible, el empate que anuncia el perfil es el del primer puesto', () => {
    // Siete figuras en la primera capa (no se ofrece desempate): el Místico, que perdió contra
    // dos de ellas, no puede aparecer «a la par en el primer puesto» por tener muchos puntos.
    const respuestas = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `probe-156-${d.id}`)[0].arquetipo }));
    const r = calcularResultadoDilemas(respuestas, 'quick', 'male');
    assert.deepEqual([...getMapLead(r, 'male').ids].sort(), [...r.cabeza![0]].sort());
    for (let s = 0; s < 300; s++) {
      const azar = dilemasDelTest('quick').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `perfil-${s}-${d.id}`)[0].arquetipo }));
      const res = calcularResultadoDilemas(desempatar(azar, 'quick', barajar(IDS, `pp-${s}`)), 'quick', 'male');
      const lead = getMapLead(res, 'male');
      if (lead.kind === 'tie') assert.deepEqual([...lead.ids].sort(), [...res.cabeza![0]].sort(), `caso ${s}`);
      if (lead.kind === 'single') assert.deepEqual(res.cabeza![0], [lead.ids[0]], `caso ${s}`);
    }
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
        if (lead.kind === 'single' && r.compositeProfile.pair?.join() === orden.slice(0, 2).join()) sinEmpate++;
      }
    }
    // Con los desempates, la pareja al frente es la de verdad, sin empates.
    assert.equal(sinEmpate, 120, `solo ${sinEmpate} de 120 con su pareja`);
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

  it('regresión (Codex): «lo que menos apareció» se busca por puntuación, no por la última posición', () => {
    // Con el orden por capas, las últimas no son las de menos puntos: aquí Rey, Padre y Creador
    // tienen 10 y nunca se eligieron; con tres empatadas abajo no se recomienda ninguna.
    const respuestas = dilemasDelTest('full').map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `adversarial-220-${d.id}`)[0].arquetipo }));
    const preferencia = ['cuidador', ...IDS.filter(id => id !== 'cuidador')] as ArchetypeId[];
    const r = calcularResultadoDilemas(desempatar(respuestas, 'full', preferencia), 'full', 'male');
    assert.deepEqual(r.developmentArchetypes.map(s => s.archetypeId), []);
    assert.deepEqual(adaptAssessmentResultToGender(r, 'female').developmentArchetypes.map(s => s.archetypeId), []);
  });

  it('lo que se recomienda desarrollar nunca tiene más puntos que otra figura que no se recomienda', () => {
    for (let s = 0; s < 300; s++) {
      for (const tipo of ['quick', 'full'] as TipoTest[]) {
        const respuestas = dilemasDelTest(tipo).map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `minimos-${s}-${d.id}`)[0].arquetipo }));
        const r = calcularResultadoDilemas(desempatar(respuestas, tipo, barajar(IDS, `mp-${s}`)), tipo, 'male');
        for (const res of [r, adaptAssessmentResultToGender(r, 'universal')]) {
          const dev = new Set(res.developmentArchetypes.map(x => x.archetypeId));
          const maxDev = Math.max(...res.ranking.filter(x => dev.has(x.archetypeId)).map(x => x.normalizedScore));
          for (const x of res.ranking) if (!dev.has(x.archetypeId)) assert.ok(!dev.size || x.normalizedScore >= maxDev, `caso ${s} ${tipo}: ${x.archetypeId} (${x.normalizedScore}) tiene menos que lo recomendado`);
        }
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
