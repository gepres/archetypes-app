import { QUESTIONS_DATA, QUICK_QUESTION_IDS } from '../domain/assessment/questions.data';
import { calculateAssessmentResult } from '../domain/assessment/scoring-engine';
import type { AssessmentAnswer, AssessmentResult } from '../domain/model';

export type AssessmentType = 'full' | 'quick';

/** Motivo por el que un juego de respuestas no puede puntuarse. */
export type AssessmentRejection =
  | { reason: 'empty' }
  | { reason: 'unknown-question'; questionIds: number[] }
  | { reason: 'value-out-of-range'; questionIds: number[] }
  | { reason: 'duplicate-answer'; questionIds: number[] };

export type AssessmentOutcome =
  | { ok: true; result: AssessmentResult }
  | { ok: false; rejection: AssessmentRejection };

/** Extremos de la escala de acuerdo con la que se responde cada pregunta. */
export const ANSWER_MIN = 1;
export const ANSWER_MAX = 5;

/**
 * Puntua un test respondido.
 *
 * El motor de puntuacion asume que las respuestas son validas: si le llegan
 * respuestas a preguntas que no existen, o valores fuera de la escala, produce
 * un perfil igualmente y nadie se entera de que esta mal. Este caso de uso es
 * la frontera donde eso se comprueba, para que un error de entrada salga como
 * un rechazo explicito y no como un arquetipo dominante equivocado.
 *
 * Devuelve un resultado en vez de lanzar, porque una respuesta invalida es un
 * caso previsto del flujo y no una situacion excepcional.
 */
export function runAssessment(
  answers: AssessmentAnswer[],
  type: AssessmentType = 'full'
): AssessmentOutcome {
  if (answers.length === 0) {
    return { ok: false, rejection: { reason: 'empty' } };
  }

  const expectedIds = new Set(questionIdsFor(type));

  const unknown = answers.filter(a => !expectedIds.has(a.questionId));
  if (unknown.length > 0) {
    return {
      ok: false,
      rejection: { reason: 'unknown-question', questionIds: unknown.map(a => a.questionId) },
    };
  }

  const outOfRange = answers.filter(
    a => !Number.isFinite(a.value) || a.value < ANSWER_MIN || a.value > ANSWER_MAX
  );
  if (outOfRange.length > 0) {
    return {
      ok: false,
      rejection: { reason: 'value-out-of-range', questionIds: outOfRange.map(a => a.questionId) },
    };
  }

  const duplicates = findDuplicateQuestionIds(answers);
  if (duplicates.length > 0) {
    return { ok: false, rejection: { reason: 'duplicate-answer', questionIds: duplicates } };
  }

  return { ok: true, result: calculateAssessmentResult(answers, type) };
}

/** Las preguntas que componen un test de este tipo. */
export function questionIdsFor(type: AssessmentType): number[] {
  return type === 'quick'
    ? QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id)).map(q => q.id)
    : QUESTIONS_DATA.map(q => q.id);
}

/** Cuantas preguntas quedan por responder. */
export function remainingQuestionCount(answers: AssessmentAnswer[], type: AssessmentType): number {
  const answered = new Set(answers.map(a => a.questionId));
  return questionIdsFor(type).filter(id => !answered.has(id)).length;
}

/** Progreso de 0 a 1, para pintar una barra sin que la vista sepa contar preguntas. */
export function assessmentProgress(answers: AssessmentAnswer[], type: AssessmentType): number {
  const total = questionIdsFor(type).length;
  if (total === 0) return 0;
  return (total - remainingQuestionCount(answers, type)) / total;
}

function findDuplicateQuestionIds(answers: AssessmentAnswer[]): number[] {
  const seen = new Set<number>();
  const duplicated = new Set<number>();
  for (const answer of answers) {
    if (seen.has(answer.questionId)) duplicated.add(answer.questionId);
    seen.add(answer.questionId);
  }
  return [...duplicated];
}
