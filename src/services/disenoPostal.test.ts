import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Caja, DatosPostal, FuentePostal, Medir, Postal, cajaDeCarta, datosPostalDe, disenarPostal, partirEnLineas } from './disenoPostal';
import { calculateAssessmentResult } from './scoringEngine';
import { ARCHETYPES_LIST } from '../data/archetypesData';
import { QUESTIONS_DATA } from '../data/questionsData';
import { ArchetypeId, AssessmentResult, CompositeProfile, GenderMode } from '../types';

/**
 * Una medida aproximada de la letra. `holgura` > 1 imita una fuente de reserva más ancha (la que
 * sale si la buena no cargó): con ella tampoco puede montarse nada.
 */
const medida =
  (holgura: number): Medir =>
  (texto: string, f: FuentePostal) => {
    const letras = [...texto].length;
    const base = f.familia === 'serif' ? 0.47 : 0.56;
    return letras * f.tamano * base * (f.cursiva ? 0.92 : 1) * (f.peso >= 700 ? 1.06 : 1) * holgura + (f.espaciado ?? 0) * Math.max(0, letras - 1);
  };
const NORMAL = medida(1);
const ANCHA = medida(1.22);

const IDS = ARCHETYPES_LIST.map(a => a.id as ArchetypeId);

function mapa(cabeza: ArchetypeId[], perfil: Partial<CompositeProfile>): AssessmentResult {
  const base = calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 3 })), 'full', 'male');
  const porId = new Map(base.ranking.map(s => [s.archetypeId, s]));
  const orden = [...cabeza, ...IDS.filter(id => !cabeza.includes(id))];
  const ranking = orden.map((id, i) => ({ ...porId.get(id)!, normalizedScore: 95 - i * 4, rank: i + 1 }));
  return {
    ...base,
    id: 'r',
    ranking,
    dominantArchetype: ranking[0],
    compositeProfile: { ...base.compositeProfile, isFlat: false, isTie: false, pair: undefined, companions: undefined, tiedLeaders: undefined, tension: undefined, ...perfil },
  };
}

const solapan = (a: Caja, b: Caja) => a.x < b.x + b.ancho - 0.5 && b.x < a.x + a.ancho - 0.5 && a.y < b.y + b.alto - 0.5 && b.y < a.y + a.alto - 0.5;
const dentro = (a: Caja, b: Caja) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5 && a.x + a.ancho <= b.x + b.ancho + 0.5 && a.y + a.alto <= b.y + b.alto + 0.5;

/** Lo que se le exige a cualquier postal: cabe, nada se monta y todo se lee dentro de la zona segura. */
function comprobar(postal: Postal, medir: Medir, caso: string) {
  assert.ok(postal.cabe, `${caso}: no cabe`);
  const lienzo = { x: 0, y: 0, ancho: postal.ancho, alto: postal.alto };
  for (const b of postal.bloques) {
    assert.ok(dentro(b.caja, postal.zonaSegura), `${caso}: «${b.clave}» se sale de la zona segura`);
    assert.ok(!solapan(b.caja, postal.heroe), `${caso}: «${b.clave}» pisa las cartas o la huella`);
    if (b.tipo === 'texto') {
      for (const l of b.lineas) assert.ok(medir(l, b.fuente) <= postal.zonaSegura.ancho + 0.5, `${caso}: una línea de «${b.clave}» es más ancha que la postal`);
    }
  }
  for (let i = 0; i < postal.bloques.length; i++)
    for (let j = i + 1; j < postal.bloques.length; j++)
      assert.ok(!solapan(postal.bloques[i].caja, postal.bloques[j].caja), `${caso}: «${postal.bloques[i].clave}» y «${postal.bloques[j].clave}» se montan`);
  assert.ok(dentro(postal.heroe, lienzo), `${caso}: las cartas o la huella se salen de la imagen`);
  for (const c of postal.cartas) {
    assert.ok(dentro(cajaDeCarta(c), lienzo), `${caso}: la carta ${c.id} se sale`);
    for (const l of c.rotulo?.lineas ?? []) assert.ok(medir(l, c.rotulo!.fuente) <= c.ancho * 0.82 + 0.5, `${caso}: el nombre de ${c.id} se sale de su carta`);
    // Las cartas, dentro del anillo: no tapan ningún rayo.
    for (const [ex, ey] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = c.cx + (ex * c.ancho * Math.cos(c.giro)) / 2 - (ey * c.alto * Math.sin(c.giro)) / 2;
      const y = c.cy + (ex * c.ancho * Math.sin(c.giro)) / 2 + (ey * c.alto * Math.cos(c.giro)) / 2;
      assert.ok(Math.hypot(x - postal.huella.cx, y - postal.huella.cy) <= postal.huella.radioInterior + 0.5, `${caso}: la carta ${c.id} pisa los rayos`);
    }
  }
}

describe('disenarPostal: medidas reales de redes', () => {
  it('historia 1080×1920 y cuadrado 1080×1080, de verdad', () => {
    const r = mapa(['creador', 'rebelde'], { pair: ['creador', 'rebelde'], tension: '¿Cuándo toca lanzarse y cuándo echar cimientos?' });
    const h = disenarPostal(datosPostalDe(r, 'male', { formato: 'story' }), NORMAL);
    const c = disenarPostal(datosPostalDe(r, 'male', { formato: 'square' }), NORMAL);
    assert.deepEqual([h.ancho, h.alto], [1080, 1920]);
    assert.deepEqual([c.ancho, c.alto], [1080, 1080]);
  });

  it('las cartas tienen la proporción del retrato (320×380): sin franjas a los lados', () => {
    const r = mapa(['creador', 'rebelde', 'constructor'], { companions: ['rebelde', 'constructor'] });
    for (const formato of ['story', 'square'] as const) {
      for (const c of disenarPostal(datosPostalDe(r, 'male', { formato }), NORMAL).cartas) {
        assert.ok(Math.abs(c.alto / c.ancho - 380 / 320) < 0.01, `${formato}: ${c.ancho}×${c.alto}`);
      }
    }
  });

  it('solo una carta sola lleva su nombre al pie (con varias, las de detrás lo tendrían tapado)', () => {
    const sola = disenarPostal(datosPostalDe(mapa(['mago'], {}), 'male', { formato: 'story' }), NORMAL);
    assert.deepEqual(sola.cartas[0].rotulo?.lineas, ['EL MAGO']);
    const par = disenarPostal(datosPostalDe(mapa(['mago', 'sabio'], { pair: ['mago', 'sabio'] }), 'male', { formato: 'story' }), NORMAL);
    assert.ok(par.cartas.every(c => c.rotulo === null));
  });

  it('quien encabeza va delante (se pinta la última)', () => {
    const par = disenarPostal(datosPostalDe(mapa(['mago', 'sabio'], { pair: ['mago', 'sabio'] }), 'male', { formato: 'story' }), NORMAL);
    assert.equal(par.cartas.at(-1)!.id, 'mago');
    const trio = disenarPostal(datosPostalDe(mapa(['mago', 'sabio', 'rey'], { companions: ['sabio', 'rey'] }), 'male', { formato: 'story' }), NORMAL);
    assert.equal(trio.cartas.at(-1)!.id, 'mago');
  });

  it('la huella lleva los 18, con los de cabeza destacados y su largo según la puntuación', () => {
    const r = mapa(['mago', 'sabio'], { pair: ['mago', 'sabio'] });
    const { huella } = disenarPostal(datosPostalDe(r, 'male', { formato: 'story' }), NORMAL);
    assert.equal(huella.rayos.length, 18);
    assert.deepEqual(new Set(huella.rayos.map(x => x.id)).size, 18);
    assert.deepEqual(huella.rayos.filter(x => x.destacado).map(x => x.id).sort(), ['mago', 'sabio']);
    const mago = huella.rayos.find(x => x.id === 'mago')!;
    const ultimo = huella.rayos.find(x => x.id === r.ranking.at(-1)!.archetypeId)!;
    assert.ok(mago.valor > ultimo.valor);
  });
});

describe('disenarPostal: nada se monta, con cualquier mapa', () => {
  const formatos = ['story', 'square'] as const;
  const generos: GenderMode[] = ['male', 'female', 'universal'];

  it('una figura sola, en cada perspectiva, con y sin extras', () => {
    for (const id of IDS)
      for (const g of generos)
        for (const formato of formatos)
          for (const extras of [false, true])
            for (const medir of [NORMAL, ANCHA]) {
              const d = datosPostalDe(mapa([id], {}), g, { formato, alias: extras ? '@un_alias_bastante_largo' : undefined, conDimensiones: extras, conTop3: extras });
              comprobar(disenarPostal(d, medir), medir, `${id} ${g} ${formato} extras=${extras}`);
            }
  });

  it('todas las parejas, con su pregunta, en cada perspectiva', () => {
    const pregunta = '¿Cuándo toca escuchar lo que necesitas y cuándo lo que necesitan los demás?';
    for (const a of IDS)
      for (const b of IDS) {
        if (a === b) continue;
        for (const g of generos)
          for (const formato of formatos) {
            const d = datosPostalDe(mapa([a, b], { pair: [a, b], tension: pregunta }), g, { formato });
            comprobar(disenarPostal(d, ANCHA), ANCHA, `${a}+${b} ${g} ${formato}`);
          }
      }
  });

  it('los tríos (una muestra de cada líder), en la perspectiva de nombres más largos y con los extras', () => {
    for (let i = 0; i < IDS.length; i++)
      for (let j = 0; j < IDS.length; j++)
        for (let k = j + 1; k < IDS.length; k++) {
          // Todos serían 2.448 por formato y tardan; uno de cada cinco cubre a cada líder con
          // acompañantes de todas las dimensiones.
          if (i === j || i === k || (i + j + k) % 5 !== 0) continue;
          const [a, b, c] = [IDS[i], IDS[j], IDS[k]];
          for (const formato of formatos) {
            const d = datosPostalDe(mapa([a, b, c], { companions: [b, c] }), 'universal', { formato, alias: 'Ana Lucía', conDimensiones: true, conTop3: true });
            comprobar(disenarPostal(d, ANCHA), ANCHA, `${a}+${b}+${c} ${formato}`);
          }
        }
  });

  it('a la par (con más de tres) y sin polo claro', () => {
    for (const formato of formatos) {
      const empate = mapa(['mago', 'sabio', 'rey', 'heroe'], { isTie: true, tiedLeaders: ['mago', 'sabio', 'rey', 'heroe'] });
      comprobar(disenarPostal(datosPostalDe(empate, 'universal', { formato, conDimensiones: true, conTop3: true }), ANCHA), ANCHA, `empate ${formato}`);
      const plano = disenarPostal(datosPostalDe(mapa([], { isFlat: true }), 'universal', { formato, conDimensiones: true, conTop3: true }), ANCHA);
      comprobar(plano, ANCHA, `plano ${formato}`);
      assert.equal(plano.cartas.length, 0);
      assert.ok(!plano.bloques.some(b => b.clave === 'top3'), 'sin polo claro no hay podio');
    }
  });
});

describe('partirEnLineas', () => {
  it('ninguna línea pasa del ancho, ni siquiera con una palabra sin espacios', () => {
    const f: FuentePostal = { familia: 'sans', peso: 600, tamano: 30 };
    const lineas = partirEnLineas('@un_alias_larguisimo_sin_espacios_que_no_cabe y algo más', f, 200, NORMAL);
    for (const l of lineas) assert.ok(NORMAL(l, f) <= 200, l);
    assert.equal(lineas.join('').replace(/\s/g, ''), '@un_alias_larguisimo_sin_espacios_que_no_cabeyalgomás');
  });

  it('el gancho y el sitio no se pierden en el formato de más espacio', () => {
    const d: DatosPostal = datosPostalDe(mapa(['sanador'], {}), 'male', { formato: 'story' });
    const claves = disenarPostal(d, NORMAL).bloques.map(b => b.clave);
    assert.ok(claves.includes('gancho') && claves.includes('sitio') && claves.includes('ceja'));
  });
});
