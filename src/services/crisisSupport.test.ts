import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRISIS_CLOSED_NOTE,
  CRISIS_FOLLOWUP,
  CRISIS_PROTOCOL,
  CRISIS_RESPONSE,
  crisisInConversation,
  detectCrisis,
} from './crisisSupport';

const yo = (content: string) => ({ role: 'user', content });
const app = (content: string) => ({ role: 'model', content });
// El cierre de verdad: el que pone el botón «Ya estoy a salvo», con su marca.
const cierre = () => ({ role: 'model', content: CRISIS_CLOSED_NOTE, crisisClosed: true });

describe('crisisInConversation', () => {
  it('la crisis sigue abierta en los mensajes siguientes aunque no se repitan las palabras', () => {
    assert.equal(crisisInConversation([yo('Quiero suicidarme esta noche'), app(CRISIS_RESPONSE), yo('Estoy en casa, a oscuras')]), true);
  });

  it('no caduca: sigue abierta aunque pasen muchos mensajes sin repetir la señal', () => {
    // El caso de Codex: con una ventana de tres mensajes, el quinto volvía a recibir arquetipos.
    const despues = ['Estoy solo', 'Tengo miedo', 'No sé qué hacer', 'Sigo aquí', 'No puedo dormir', 'Es tarde'].flatMap(t => [yo(t), app(CRISIS_FOLLOWUP)]);
    assert.equal(crisisInConversation([yo('Quiero suicidarme esta noche'), app(CRISIS_RESPONSE), ...despues]), true);
  });

  it('se cierra cuando la persona dice que está a salvo, sin borrar el historial', () => {
    const conv = [yo('Quiero suicidarme esta noche'), app(CRISIS_RESPONSE), yo('Ya hablé con mi hermana'), cierre()];
    assert.equal(crisisInConversation(conv), false);
    assert.equal(crisisInConversation([...conv, yo('¿Qué me dice mi Rey de esta semana?')]), false);
  });

  it('una señal posterior al cierre la vuelve a abrir', () => {
    const conv = [yo('Quiero suicidarme'), cierre(), yo('Otra vez pienso en hacerme daño')];
    assert.equal(crisisInConversation(conv), true);
  });

  it('el texto de cierre escrito por el usuario no cierra nada', () => {
    assert.equal(crisisInConversation([yo('Quiero suicidarme'), yo(CRISIS_CLOSED_NOTE)]), true);
  });

  it('un cierre guardado antes de existir la marca se sigue reconociendo por el id del botón', () => {
    const antiguo = { id: 'msg-safe-1700000000000', role: 'model', content: CRISIS_CLOSED_NOTE };
    assert.equal(crisisInConversation([yo('Quiero suicidarme'), antiguo]), false);
    // Pero una respuesta del modelo con su propio id y el mismo texto sigue sin cerrar nada.
    const cita = { id: 'msg-ai-1700000000000', role: 'model', content: CRISIS_CLOSED_NOTE };
    assert.equal(crisisInConversation([yo('Quiero suicidarme'), cita]), true);
  });

  it('una respuesta del modelo que cite la nota de cierre no cierra nada (quinta revisión de Codex)', () => {
    assert.equal(crisisInConversation([yo('Quiero suicidarme'), app(CRISIS_CLOSED_NOTE)]), true);
  });

  it('una conversación normal no la abre', () => {
    assert.equal(crisisInConversation([yo('¿Cómo equilibro mi Guerrero?'), app('…'), yo('Gracias, me sirve')]), false);
  });

  it('el seguimiento tampoco inventa teléfonos ni habla del mapa', () => {
    assert.doesNotMatch(CRISIS_FOLLOWUP, /\d{3}/);
    assert.doesNotMatch(CRISIS_FOLLOWUP, /arquetipo|sombra|mapa/i);
  });
});

describe('detectCrisis', () => {
  const crisis = [
    'A veces pienso en suicidarme',
    'He pensado en el suicidio',
    'Quiero quitarme la vida',
    'quiero acabar con mi vida',
    'Me quiero morir',
    'Ya no quiero vivir',
    'No quiero despertar mañana',
    'Todos estarían mejor sin mí',
    'Ojalá no despertar',
    'Me hago daño cuando estoy así',
    'Tengo ganas de hacerme daño',
    'Pienso en cortarme las venas',
    'He vuelto a autolesionarme',
    'Mi pareja me pega',
    'Mi padre me maltrata',
    'Abusaron de mí cuando era niña',
    'Creo que me va a matar',
    'Estoy en peligro',
    'Vivo violencia doméstica',
    'Voy a matar a mi jefe',
    'SUICIDIO',
    // Los que se escapaban en la revisión de Codex
    'Me voy a matar esta noche',
    'Me voy a hacer daño',
    'Mi pareja me está pegando ahora',
    'Si sigue así me mato',
    'Estoy solo y ya tengo las pastillas en la mano',
    'Me corto a propósito cuando me siento así',
    // Segunda revisión de Codex: lo deliberado en pasado, o diciendo dónde
    'Me hice daño a propósito anoche',
    'Me lastimé a propósito',
    'Me hago daño en los brazos a propósito',
    'Me corté adrede',
    'Me hago daño en los brazos cuando me agobio',
    'Pienso en tomarme todas las pastillas',
    // Tercera revisión de Codex: tiempos compuestos e intención antes del acto
    'Me he cortado a propósito anoche',
    'A propósito me hice daño anoche',
    'Adrede me he lastimado',
    'Quiero tragarme un bote de pastillas',
    // Quinta revisión de Codex
    'Voy a tomarme las pastillas para no despertar',
    'Me voy a\nmatar',
    'Me he cortado a propósito en el brazo',
    // Sexta revisión de Codex: partes del cuerpo con artículo, intención antes y después
    'Me he cortado el brazo a propósito',
    'Me corté las muñecas adrede',
    'A propósito me corté la piel',
    'Adrede me he cortado los brazos',
    // Séptima revisión de Codex: el artículo indefinido no vuelve inocuo cualquier corte
    'Me corté una vez a propósito',
    'Me corté un brazo adrede',
    'Me he cortado yo misma los brazos a propósito',
    // Octava revisión de Codex: lo que no es inequívocamente cosmético, y la sangre
    'Me corté la punta del dedo a propósito',
    'Me corté una ceja adrede hasta sangrar',
    'Me corté las puntas de los dedos a propósito',
    'Me corté las uñas a propósito hasta sangrar',
    // Novena revisión de Codex: una parte del cuerpo detrás de lo cosmético lo convierte en lesión
    'Me corté las puntas del pulgar y del índice a propósito',
    'Me corté el pelo y los brazos a propósito',
    // Décima revisión de Codex: negar la finalidad no niega la lesión
    'Me corté las muñecas, no queriendo morir sino sentir algo',
    'Me corté las muñecas',
    'Me corto para sentir algo',
    'Me hago daño para castigarme',
    // Undécima revisión de Codex: la autolesión en curso
    'Me estoy cortando las muñecas',
    'Me estoy cortando para sentir algo',
    'Estoy cortándome a propósito',
    'Me estoy haciendo daño a propósito',
    // Duodécima revisión de Codex: finalidades emocionales y la forma en curso sin intención
    'Me corto para calmar la ansiedad',
    'Me corté para aliviar el dolor emocional',
    'Me corto para no sentir',
    'Me estoy haciendo daño en los brazos',
    'Me estoy haciendo daño y no sé cómo parar',
    'Estoy haciéndome daño otra vez',
    'Estoy haciéndome daño en las muñecas',
    'Me corto para no sentir nada',
    // Decimocuarta revisión de Codex: «no sentir» seguido de otra cláusula
    'Me corto para no sentir y no sé cómo parar',
    'Me corto para no sentir…',
    'Me corto para no sentir el dolor emocional',
    'Me corto para no sentir tanto dolor por dentro',
    // Revisión de cierre de Codex: «no despertar» y «no seguir aquí» con un medio de riesgo
    'Quiero dormirme para no despertar más',
    'Quiero cerrar los ojos para no despertar',
    'Voy a tomarme todo para no seguir aquí',
    'Me voy a tirar para no seguir aquí',
    'Me tomaré las pastillas para no volver a despertar nunca',
    'Voy a tomarme todos los somníferos',
    'Ojalá dormirme para no despertar',
  ];

  for (const frase of crisis) {
    it(`detecta: «${frase}»`, () => {
      assert.equal(detectCrisis(frase), true);
    });
  }

  const sinCrisis = [
    'Me muero de risa con mi Bufón',
    'Me voy a morir de hambre si no como ya',
    'Me muero de ganas de empezar el proyecto',
    '¿Cómo equilibro mi Guerrero con mi Amante?',
    '¿Qué sombra podría estar jugándome en contra?',
    'Quiero cortarme el pelo para empezar una etapa nueva',
    'No quiero seguir con este trabajo',
    'Siento miedo de fracasar',
    'Mi Rey interior quiere controlarlo todo',
    'La muerte simbólica del ego en el Héroe',
    // Falsos positivos que señaló Codex: lo accidental y lo negado no son crisis
    'Me lastimé entrenando y quiero adaptar el reto',
    'No quiero hacerme daño, quiero aprender a poner límites',
    'Me hice daño en la rodilla corriendo',
    'Me hago daño en la espalda cuando entreno',
    'Esta semana me voy a matar a trabajar',
    'Me mato de risa con la Bufona',
    'No pienso en morirme, pienso en cambiar de trabajo',
    // Segunda revisión de Codex
    'Tengo las pastillas que me recetó el médico y quiero organizar mis rutinas',
    'No me quiero hacer daño, quiero poner límites',
    'No me voy a rendir aunque cueste',
    // Tercera revisión de Codex: la medicación habitual no es una crisis
    'Voy a tomarme las pastillas que me recetó el médico',
    'No quiero tomarme las pastillas porque me dan sueño',
    'Hice a propósito un plan distinto esta semana',
    // Quinta revisión de Codex
    'Me he cortado el pelo a propósito',
    'No me he cortado a propósito, fue un accidente',
    'Me corté las uñas adrede',
    'A propósito me corté el flequillo',
    'Me corto la barba a propósito para el verano',
    // Séptima revisión de Codex: cortes cotidianos con artículo indefinido
    'Me corté un mechón de pelo a propósito',
    'A propósito me corté una uña que estaba rota',
    'Me corté un poco el flequillo adrede',
    'Me he cortado yo misma el pelo a propósito',
    'Me corté las puntas a propósito',
    'Me corté las puntas del pelo a propósito',
    'Me corté cocinando hasta sangrar',
    // Novena revisión de Codex: la intención negada no es intención, y el pelo es pelo
    'Me corté las uñas hasta sangrar sin querer, no a propósito',
    'Me hice daño, pero no lo hice a propósito',
    'Me corté las puntas de mi pelo a propósito',
    'Me corté las uñas de las manos a propósito',
    'Me corté el pelo para sentirme mejor',
    'Me corté el flequillo para sentir algo distinto',
    'No me corté las muñecas',
    // Undécima revisión de Codex: aliviar el dolor de un accidente no es una finalidad de autolesión
    'Me lastimé la rodilla entrenando y tomé ibuprofeno para aliviar el dolor',
    'Me corté cocinando y me puse hielo para aliviar el dolor',
    'Me estoy cortando el pelo a propósito',
    'No me hago daño, solo estoy cansada',
    'Me estoy haciendo daño en la espalda entrenando',
    // Decimotercera revisión de Codex: la mejoría negada y el analgésico tras un accidente
    'Ya no me estoy haciendo daño en los brazos',
    'No estoy haciéndome daño en las muñecas',
    'Me lastimé entrenando y tomé ibuprofeno para no sentir dolor',
    'Me hice daño en la rodilla y me puse hielo para no sentir nada de dolor',
    // Decimoquinta revisión de Codex: cuantificadores del dolor físico
    'Me lastimé entrenando y tomé ibuprofeno para no sentir tanto dolor',
    'Me corté cocinando y me puse hielo para no sentir más dolor',
    'Me hice daño y tomé algo para no sentir ningún dolor',
    // Revisión de cierre de Codex: finalidades cotidianas
    'Me pongo auriculares para no despertar a mi pareja',
    'Busco otro trabajo para no seguir aquí',
    'Pongo la alarma para no despertar tarde',
    'Tomo melatonina para no despertar a las 4',
    // Segunda revisión de cierre de Codex: los despertares nocturnos de quien duerme mal
    'Voy a tomar melatonina para no despertar en mitad de la noche',
    'Tomo pastillas para no despertar durante la noche',
    'Tomo pastillas para no despertar cada dos horas',
    'Quiero tomar melatonina para no despertar.',
  ];

  for (const frase of sinCrisis) {
    it(`no salta: «${frase}»`, () => {
      assert.equal(detectCrisis(frase), false);
    });
  }
});

describe('textos de cuidado', () => {
  it('la respuesta no inventa teléfonos', () => {
    assert.doesNotMatch(CRISIS_RESPONSE, /\d{3}/);
  });

  it('la respuesta deja fuera los arquetipos y deriva a ayuda real', () => {
    assert.match(CRISIS_RESPONSE, /emergencias/);
    assert.match(CRISIS_RESPONSE, /alguien de confianza/);
    assert.match(CRISIS_RESPONSE, /findahelpline\.com/);
  });

  it('el protocolo prohíbe inventar teléfonos y suspende la interpretación', () => {
    assert.match(CRISIS_PROTOCOL, /No inventes números de teléfono/);
    assert.match(CRISIS_PROTOCOL, /suspende por completo la interpretación arquetípica/);
  });
});
