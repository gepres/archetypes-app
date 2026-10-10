import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EstadoIA, describirEstadoIA, motivoAmable } from './estadoAsistente';

// Lo que no debe llegar a las pantallas de uso: nombres de modelos y proveedores, claves y tokens.
const JERGA = /llama|gpt|gemini|openrouter|openai|claude|deepseek|api|token|clave|motor|modelo|http|\b\d{3}\b/i;

const estados: [string, EstadoIA][] = [
  ['con clave propia', { activeKeySource: 'custom', remainingCourtesy: 0, maxDaily: 0 }],
  ['con consultas incluidas', { activeKeySource: 'app', remainingCourtesy: 7, maxDaily: 10 }],
  ['con las incluidas agotadas', { activeKeySource: 'app', remainingCourtesy: 0, maxDaily: 10 }],
  ['en modo sin conexión', { activeKeySource: 'local', remainingCourtesy: 0, maxDaily: 0 }],
  ['sin ningún asistente', { activeKeySource: 'none', remainingCourtesy: 0, maxDaily: 0 }],
];

describe('describirEstadoIA: el estado del asistente, sin jerga', () => {
  for (const [nombre, estado] of estados) {
    it(`${nombre}: ni modelos, ni claves, ni tokens`, () => {
      const { etiqueta, detalle } = describirEstadoIA(estado);
      assert.doesNotMatch(etiqueta, JERGA, etiqueta);
      // El detalle puede remitir a «Ajustes de IA», que es donde se configura; nada más técnico.
      assert.doesNotMatch(detalle.replace('Ajustes de IA', ''), JERGA, detalle);
    });
  }

  it('dice cuántas consultas quedan hoy', () => {
    assert.equal(describirEstadoIA(estados[1][1]).detalle, 'Te quedan 7 de 10 consultas hoy.');
    assert.equal(describirEstadoIA(estados[1][1]).etiqueta, 'Te quedan 7 hoy');
  });

  it('avisa cuando quedan pocas o ninguna', () => {
    assert.equal(describirEstadoIA({ activeKeySource: 'app', remainingCourtesy: 2, maxDaily: 10 }).aviso, true);
    assert.equal(describirEstadoIA(estados[2][1]).aviso, true);
    assert.equal(describirEstadoIA(estados[1][1]).aviso, false);
  });
});

describe('motivoAmable: por qué no respondió, sin códigos ni mensajes del proveedor', () => {
  const errores = [
    'Error HTTP OpenRouter: 429',
    'Rate limit exceeded for meta-llama/llama-3.3-70b-instruct',
    'Error HTTP OpenAI: 401',
    'Incorrect API key provided: sk-abc',
    'Respuesta vacía de Gemini',
    'Failed to fetch',
  ];
  for (const e of errores) {
    it(`«${e}»`, () => {
      const texto = motivoAmable(new Error(e)).replace('**Ajustes de IA**', '');
      assert.doesNotMatch(texto, JERGA, texto);
      assert.match(texto, /mapa simbólico/);
    });
  }
});
