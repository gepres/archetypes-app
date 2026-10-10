import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRISIS_FOLLOWUP,
  CRISIS_PROTOCOL,
  CRISIS_RESPONSE,
  crisisInConversation,
  detectCrisis,
} from './crisisSupport';

describe('crisisInConversation', () => {
  it('la crisis sigue abierta en los mensajes siguientes aunque no se repitan las palabras', () => {
    assert.equal(crisisInConversation(['Quiero suicidarme esta noche', 'Estoy en casa, a oscuras']), true);
  });

  it('no caduca: sigue abierta aunque pasen muchos mensajes sin repetir la señal', () => {
    // El caso de Codex: con una ventana de tres mensajes, el quinto volvía a recibir arquetipos.
    const despues = ['Estoy solo', 'Tengo miedo', 'No sé qué hacer', 'Sigo aquí', 'No puedo dormir', 'Es tarde'];
    assert.equal(crisisInConversation(['Quiero suicidarme esta noche', ...despues]), true);
  });

  it('una conversación normal no la abre', () => {
    assert.equal(crisisInConversation(['¿Cómo equilibro mi Guerrero?', 'Gracias, me sirve']), false);
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
