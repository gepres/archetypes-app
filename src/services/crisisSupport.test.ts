import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CRISIS_PROTOCOL, CRISIS_RESPONSE, detectCrisis } from './crisisSupport';

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
