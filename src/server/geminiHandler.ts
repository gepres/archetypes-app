import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Allowed fallback models in order of priority
const MODELS_TO_TRY = [
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
];

export async function handleGeminiChat(body: {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  archetypePersona?: string; // Optional: 'rey', 'guerrero', 'mago', etc.
  archetypeContext?: {
    dominant: string;
    top3: string[];
    development: string[];
    dimensions: { mente: number; accion: number; corazon: number; construccion: number };
    compositeProfileTitle?: string;
  };
}) {
  const { message, history = [], archetypePersona, archetypeContext } = body;

  const ai = getAiClient();
  if (!ai) {
    return {
      text: generateSynthesizedArchetypalResponse(message, archetypeContext, archetypePersona)
    };
  }

  let personaInstruction = "";
  if (archetypePersona && archetypePersona !== 'general') {
    personaInstruction = `
MODO DE PERSONA ARQUETÍPICA ACTIVO:
Estás hablando EN PRIMERA PERSONA como la VOZ INTERIOR DEL ARQUETIPO: "${archetypePersona.toUpperCase()}".
- Encarna las virtudes, el ritmo, la agudeza y la visión de este arquetipo.
- Háblale al usuario de forma cercana, profunda, desafiante o sabia según corresponda a tu energía.
- Mantén la consciencia de que eres una parte viva de su propia psique invitándole a la maduración e integración.
`;
  }

  let contextPrompt = "";
  if (archetypeContext) {
    contextPrompt = `
CONTEXTO DEL MAPA ARQUETÍPICO DEL USUARIO (Modelo simbólico y reflexivo):
- Arquetipo Dominante: ${archetypeContext.dominant}
- Top 3 Arquetipos con mayor energía: ${archetypeContext.top3.join(", ")}
- Arquetipos de desarrollo sugeridos para equilibrio: ${archetypeContext.development.join(", ")}
- Balance Dimensional: Mente (${archetypeContext.dimensions.mente}%), Acción (${archetypeContext.dimensions.accion}%), Corazón (${archetypeContext.dimensions.corazon}%), Construcción (${archetypeContext.dimensions.construccion}%)
- Perfil Compuesto: ${archetypeContext.compositeProfileTitle || "Explorador reflexivo"}
`;
  }

  const systemInstruction = `
Eres un Asistente Filosófico y Guía de Reflexión Simbólica para una aplicación de autoconocimiento basada en 12 arquetipos masculinos (Rey, Guerrero, Mago, Amante, Padre, Cuidador, Bufón, Explorador, Creador, Sabio, Héroe, Rebelde).

DIRECTRICES ÉTICAS Y DE TONO FUNDAMENTALES:
1. NUNCA te presentes como psicólogo, terapeuta ni profesional clínico.
2. NO realices diagnósticos psicológicos ni afirmaciones clínicas categóricas.
3. Trata siempre los arquetipos como un MODELO SIMBÓLICO, metafórico y de indagación personal.
4. Utiliza un lenguaje reflexivo, socrático y matizado: "este modelo sugiere que...", "podría indicar...", "desde esta perspectiva simbólica...", "quizás valga la pena observar si...".
5. Estilo de comunicación: Serio, elegante, empático, profundo, sin clichés de masculinidad tóxica o dogmatismos.
6. Ayuda al usuario a:
   - Formular preguntas de autoindagación honesta.
   - Identificar cómo interactúan sus arquetipos dominantes (luces) y dónde pueden surgir sombras o desequilibrios.
   - Explorar vías prácticas y cotidianas para activar sus arquetipos de desarrollo.
   - Responder en un español natural, poético y reflexivo.

${personaInstruction}
${contextPrompt}
`;

  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.parts }]
  }));

  // Try across prioritized model list with fallback handling
  for (const modelName of MODELS_TO_TRY) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
        history: formattedHistory
      });

      const response = await chat.sendMessage({
        message: message
      });

      if (response.text && response.text.trim()) {
        return {
          text: response.text.trim(),
          modelUsed: modelName
        };
      }
    } catch (modelError: any) {
      console.warn(`Model ${modelName} encountered an error:`, modelError?.message || modelError);
      // Wait briefly before trying next fallback if rate-limited or busy
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // If all live API attempts fail (e.g. 503 high demand across all endpoints or network limitation)
  // Provide an intelligent, contextual archetypal reflection so user never sees a broken raw error
  return {
    text: generateSynthesizedArchetypalResponse(message, archetypeContext, archetypePersona)
  };
}

function generateSynthesizedArchetypalResponse(
  message: string,
  context?: {
    dominant: string;
    top3: string[];
    development: string[];
    dimensions: { mente: number; accion: number; corazon: number; construccion: number };
    compositeProfileTitle?: string;
  },
  persona?: string
): string {
  const queryLower = message.toLowerCase();

  if (persona && persona !== 'general') {
    return (
      `Como la voz de tu ${persona.toUpperCase()} interior, escucho lo que planteas: "${message}". ` +
      `En este momento, mi energía te invita a recordar tu centro de poder. No te apresures en reaccionar desde la costumbre; observa qué territorio requiere que te mantengas firme y dónde es necesario soltar el control para permitir que la sabiduría guíe tu paso.`
    );
  }

  if (queryLower.includes('sombra') || queryLower.includes('miedo') || queryLower.includes('bloqueo')) {
    return (
      `La sombra en la psicología analítica no es una falla moral, sino una energía válida que ha sido reprimida o llevada al extremo por falta de integración consciente.\n\n` +
      `Si observas tu mapa simbólico${context ? ` (con ${context.dominant} como energía dominante)` : ''}, cuando nos encontramos bajo presión solemos sobreutilizar nuestros talentos más familiares hasta convertirlos en una trampa defensiva.\n\n` +
      `Pregunta para tu indagación:\n` +
      `• ¿Qué parte de esta situación estás intentando controlar en exceso por temor a la vulnerabilidad o al fracaso?\n` +
      `• ¿Qué pasaría si dieras un 10% más de espacio a la ternura del Amante o a la serenidad del Sabio en lugar de forzar una solución inmediata?`
    );
  }

  if (queryLower.includes('equilibrar') || queryLower.includes('balance') || queryLower.includes('integrar')) {
    const dev = context?.development[0] || 'tu arquetipo complementario';
    return (
      `El equilibrio arquetípico no consiste en apagar tu luz dominante${context ? ` (${context.dominant})` : ''}, sino en crear una alianza interna con ${dev}.\n\n` +
      `Una clave práctica de integración cotidiana:\n` +
      `1. **Reconocimiento sin juicio**: Acepta cuándo una energía está tomando el control absoluto de tus respuestas emocionales.\n` +
      `2. **Pausa deliberada**: Antes de responder a una demanda externa, haz 3 respiraciones profundas y pregúntate: "¿Qué necesita la totalidad de mi ser en este instante?".\n` +
      `3. **Micro-acción de desarrollo**: Realiza un pequeño gesto cotidiano vinculado a tu arquetipo de desarrollo hoy mismo.`
    );
  }

  return (
    `Analizando tu consulta desde la perspectiva simbólica${context ? ` y teniendo presente tu perfil "${context.compositeProfileTitle || context.dominant}"` : ''}:\n\n` +
    `Toda encrucijada vital nos convoca a revisar qué arquetipos están gobernando nuestras decisiones. A menudo, lo que experimentamos como tensión no es un conflicto externo, sino el diálogo no resuelto entre dos fuerzas internas (por ejemplo, el impulso de actuar del Guerrero frente a la necesidad de serenidad del Sabio).\n\n` +
    `Te sugiero reflexionar sobre:\n` +
    `• ¿Qué arquetipo tuyo siente que debe resolver todo por sí solo en esta situación?\n` +
    `• ¿Cuál de tus energías menos habituales${context ? ` (como ${context.development.join(', ')})` : ''} podría ofrecerte una salida más armónica y constructiva?`
  );
}

