import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cuerpoOpenAI } from './peticionOpenAI';

const mensajes = [{ role: 'user', content: 'Hola' }];

describe('petición a OpenAI', () => {
  it('regresión (Codex): GPT-6 Luna y Sol van sin razonar, para poder llevar temperature', () => {
    for (const modelo of ['gpt-6-luna', 'gpt-6-sol']) {
      const c = cuerpoOpenAI(modelo, mensajes, 950, 0.7);
      assert.equal(c.reasoning_effort, 'none', modelo);
      assert.equal(c.temperature, 0.7);
      assert.equal(c.max_completion_tokens, 950);
      assert.equal('max_tokens' in c, false);
    }
  });

  it('otros modelos no llevan reasoning_effort, y sin temperature no se envía', () => {
    const c = cuerpoOpenAI('gpt-4.1-mini', mensajes, 16);
    assert.equal('reasoning_effort' in c, false);
    assert.equal('temperature' in c, false);
    // Una variante que no admite 'none' (como GPT-6.1 Sol) no lo recibe.
    assert.equal('reasoning_effort' in cuerpoOpenAI('gpt-6.1-sol', mensajes, 16), false);
  });
});
