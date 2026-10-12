/**
 * El cuerpo de una petición a la API de OpenAI (chat y prueba de conexión). GPT-6 Luna y Sol
 * razonan por defecto (esfuerzo medio), y así no admiten temperature: con reasoning_effort
 * 'none', que los dos aceptan, la conservan y responden sin gastar tokens en razonar.
 * max_completion_tokens es el límite que aceptan los modelos actuales (max_tokens está en desuso).
 */
export function cuerpoOpenAI(
  model: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature?: number
): Record<string, unknown> {
  return {
    model,
    messages,
    max_completion_tokens: maxTokens,
    ...(/^gpt-6-(luna|sol)$/.test(model) ? { reasoning_effort: 'none' } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
  };
}
