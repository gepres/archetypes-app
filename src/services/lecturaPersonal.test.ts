import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { admiteLectura, motivoSinLectura, promptLectura, pulirLectura } from './lecturaPersonal';
import { motivoAmable } from './estadoAsistente';
import { barajar, calcularResultadoDilemas, dilemasDelTest } from './dilemas';
import { calculateAssessmentResult, getMapLead } from './scoringEngine';
import { detectCrisis } from './crisisSupport';
import { DILEMAS } from '../data/dilemasData';
import { ARCHETYPES_LIST, getArchetype } from '../data/archetypesData';
import { QUESTIONS_DATA } from '../data/questionsData';
import { ArchetypeId, AssessmentResult, GenderMode } from '../types';

const IDS = ARCHETYPES_LIST.map(a => a.id as ArchetypeId);

function resultadoAlAzar(semilla: string, tipo: 'quick' | 'full' = 'quick', gender: GenderMode = 'male'): AssessmentResult {
  const respuestas = dilemasDelTest(tipo).map(d => ({ dilemaId: d.id, arquetipo: barajar(d.opciones, `${semilla}-${d.id}`)[0].arquetipo }));
  return calcularResultadoDilemas(respuestas, tipo, gender);
}

describe('lectura personal: qué se le pide a la IA', () => {
  it('solo con el test por dilemas: un resultado del test de frases no trae lo elegido', () => {
    const viejo = calculateAssessmentResult(QUESTIONS_DATA.map(q => ({ questionId: q.id, value: 3 })), 'full', 'male');
    assert.equal(admiteLectura(viejo), false);
    assert.equal(promptLectura(viejo, 'male'), null);
    assert.equal(admiteLectura(resultadoAlAzar('nuevo')), true);
  });

  it('el resultado guarda lo elegido en cada situación, en el orden del test', () => {
    const r = resultadoAlAzar('orden', 'full');
    assert.deepEqual(
      r.elecciones!.map(e => e.dilemaId),
      dilemasDelTest('full').map(d => d.id)
    );
  });

  it('cita cada elección con su texto y el nombre en la perspectiva elegida', () => {
    for (const gender of ['male', 'female', 'universal'] as GenderMode[]) {
      const r = resultadoAlAzar('citas', 'quick', gender);
      const prompt = promptLectura(r, gender)!;
      for (const e of r.elecciones!) {
        const d = DILEMAS.find(x => x.id === e.dilemaId)!;
        const o = d.opciones.find(x => x.arquetipo === e.arquetipo)!;
        assert.ok(prompt.includes(`«${o.texto}» (${getArchetype(e.arquetipo, gender).name})`), `${gender}: falta ${d.id}`);
      }
    }
  });

  it('dice lo calculado tal cual y prohíbe contradecirlo, sea pareja, empate o sin polo claro', () => {
    const vistos = new Set<string>();
    for (let s = 0; s < 300; s++) {
      const r = resultadoAlAzar(`forma-${s}`);
      const prompt = promptLectura(r, 'male')!;
      const lead = getMapLead(r, 'male');
      const p = r.compositeProfile;
      if (lead.kind === 'tie') {
        vistos.add('tie');
        for (const id of lead.ids) assert.ok(prompt.includes(getArchetype(id, 'male').name), `caso ${s}`);
        assert.match(prompt, /No presentes a ninguna de ellas como mi arquetipo dominante/);
      } else if (lead.kind === 'flat') {
        vistos.add('flat');
        assert.match(prompt, /No me atribuyas un arquetipo dominante/);
      } else if (p.pair) {
        vistos.add('pair');
        const [a, b] = p.pair.map(id => getArchetype(id, 'male').name);
        assert.ok(prompt.includes(`la pareja ${a} y ${b}`), `caso ${s}`);
        assert.match(prompt, /No nombres otra pareja/);
      } else {
        vistos.add('otro');
        assert.ok(prompt.includes(getArchetype(lead.ids[0], 'male').name), `caso ${s}`);
      }
    }
    assert.ok(vistos.has('pair') && vistos.has('tie'), [...vistos].join(','));
  });

  it('no envía el nombre de la persona ni nada fuera del mapa', () => {
    const r = { ...resultadoAlAzar('nombre'), title: 'Mapa de Ana Privada' };
    assert.doesNotMatch(promptLectura(r, 'male')!, /Ana Privada/);
  });

  it('ninguna situación ni opción del test dispara por error el protocolo de crisis', () => {
    // La lectura viaja por el mismo camino que el chat, que ante una crisis no llama a la IA.
    for (const d of DILEMAS) {
      assert.equal(detectCrisis(d.situacion), false, d.id);
      for (const o of d.opciones) assert.equal(detectCrisis(`Elegí: «${o.texto}»`), false, `${d.id}/${o.arquetipo}`);
    }
    for (let s = 0; s < 50; s++) assert.equal(detectCrisis(promptLectura(resultadoAlAzar(`crisis-${s}`, 'full'), 'universal')!), false);
  });
});

describe('lectura personal: la pregunta final, sola y en cursiva', () => {
    it('saca la pregunta metida en una frase y quita su entradilla', () => {
      const t = 'Primer párrafo.\n\nEn este contexto, te invito a reflexionar sobre ¿cómo puedes integrar la prudencia y la osadía?';
      assert.equal(pulirLectura(t), 'Primer párrafo.\n\n*¿Cómo puedes integrar la prudencia y la osadía?*');
    });

    it('si la pregunta es su propia frase, conserva lo de antes en su párrafo', () => {
      const t = 'Uno.\n\nEsta dinámica influye en todo. ¿Cómo puedes integrar estas dos facetas?';
      assert.equal(pulirLectura(t), 'Uno.\n\nEsta dinámica influye en todo.\n\n*¿Cómo puedes integrar estas dos facetas?*');
    });

    it('quita la entradilla con dos puntos, en la misma frase o en su propio párrafo', () => {
      assert.equal(
        pulirLectura('Uno.\n\nEsto pesa. La pregunta es: ¿qué eliges hoy?'),
        'Uno.\n\nEsto pesa.\n\n*¿Qué eliges hoy?*'
      );
      assert.equal(
        pulirLectura('Uno.\n\nLa pregunta que surge de esta tensión es:\n\n¿Cómo puedes equilibrar las dos?'),
        'Uno.\n\n*¿Cómo puedes equilibrar las dos?*'
      );
    });

    it('si ya viene bien, o no hay pregunta, no se toca', () => {
      assert.equal(pulirLectura('Uno.\n\n*¿Qué te mueve hoy?*'), 'Uno.\n\n*¿Qué te mueve hoy?*');
      assert.equal(pulirLectura('Uno.\n\nSin pregunta.'), 'Uno.\n\nSin pregunta.');
    });
  });

describe('lectura personal: cuando no la puede escribir una IA', () => {
  it('con el cupo agotado, lo dice y cuándo vuelve', () => {
    assert.match(motivoSinLectura({ modelUsed: 'Cupo diario agotado', text: '…' }, 10), /usaste tus 10 consultas.*mañana/);
  });

  it('sin asistente conectado, dice dónde conectarlo', () => {
    assert.match(motivoSinLectura({ modelUsed: 'Motor Simbólico Local', text: '…' }, 10), /Ajustes de IA/);
  });

  it('el motivo no promete una respuesta del mapa simbólico que aquí no hay', () => {
    const errores = ['402 insufficient credit', '401 invalid api key', '429 too many requests', 'algo raro'];
    for (const e of errores)
      for (const propia of [true, false]) {
        const texto = `reflexión local\n\n---\n*${motivoAmable(new Error(e), propia)}*`;
        const motivo = motivoSinLectura({ modelUsed: 'Fallback Local', text: texto }, 10);
        assert.doesNotMatch(motivo, /mapa simbólico/, motivo);
        assert.ok(motivo.length > 20, motivo);
      }
  });

  it('tras un fallo, usa el motivo que da el asistente, o uno genérico', () => {
    assert.equal(
      motivoSinLectura({ modelUsed: 'Fallback Local', text: 'reflexión local\n\n---\n*Se acabó el saldo de tu cuenta de IA.*' }, 10),
      'Se acabó el saldo de tu cuenta de IA.'
    );
    assert.match(motivoSinLectura({ modelUsed: 'Fallback Local', text: 'sin motivo' }, 10), /Inténtalo en un rato/);
  });
});
