import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EstadoIA, describirEstadoIA, fechaLocal, motivoAmable, notaConsultasAgotadas } from './estadoAsistente';

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

describe('consultas agotadas: lo que promete el estado es lo que hace el chat (Codex)', () => {
  it('el estado promete respuesta desde el mapa simbólico, y la nota del chat la acompaña', () => {
    assert.match(describirEstadoIA({ activeKeySource: 'app', remainingCourtesy: 0, maxDaily: 10 }).detalle, /te respondo desde tu mapa simbólico/);
    const nota = notaConsultasAgotadas(10);
    assert.match(nota, /esta respuesta sale de tu mapa simbólico/);
    assert.match(nota, /mañana se renuevan/);
    assert.doesNotMatch(nota.replace('**Ajustes de IA**', ''), JERGA, nota);
  });
});

describe('motivoAmable: qué hacer según lo que falló (Codex)', () => {
  it('sin saldo en tu cuenta: revisar el uso o cambiar la conexión, no «prueba en un rato»', () => {
    const t = motivoAmable(new Error('You exceeded your current quota, please check your plan and billing details.'), true);
    assert.match(t, /sin saldo o sin cupo/);
    assert.doesNotMatch(t, /en un rato/);
  });

  it('sin saldo en la incluida: no se le pide a la persona que revise una cuenta que no es suya', () => {
    const t = motivoAmable(new Error('Insufficient credits'), false);
    assert.doesNotMatch(t, /tu cuenta de IA se quedó/i);
    assert.match(t, /conectar tu propia cuenta/);
  });

  it('clave mal en tu cuenta: revisar la clave', () => {
    assert.match(motivoAmable(new Error('Incorrect API key provided'), true), /revisa la clave/);
  });

  it('saturación pasajera: esperar sí lo arregla', () => {
    assert.match(motivoAmable(new Error('Rate limit exceeded, retry later'), true), /en un rato/);
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
      for (const propia of [true, false]) {
        const texto = motivoAmable(new Error(e), propia).replace('**Ajustes de IA**', '');
        // «revisa la clave» es lo que hay que hacer con tu propia cuenta: se permite la palabra.
        assert.doesNotMatch(texto.replace('revisa la clave', ''), JERGA, texto);
        assert.match(texto, /mapa simbólico/);
      }
    });
  }
});

describe('fechaLocal: las consultas se renuevan a medianoche de quien usa la app', () => {
  it('usa el calendario local, no el de UTC', () => {
    const noche = new Date(2026, 9, 10, 23, 30); // 10 de octubre, 23:30 hora local
    assert.equal(fechaLocal(noche), '2026-10-10');
  });
});
