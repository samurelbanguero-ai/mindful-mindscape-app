/**
 * Fichas de reconocimiento emocional.
 *
 * El contenido vive en el catálogo único `shared/emotions.json` (raíz del
 * repositorio), que también lee el backend. Está redactado en lenguaje
 * cotidiano y en segunda persona, sin términos clínicos. PENDIENTE DE REVISIÓN
 * POR UN PSICÓLOGO: mientras `validado` sea `false`, los ejemplos son una
 * propuesta inicial.
 */

import catalogo from "../../../shared/emotions.json";

export type EmotionType = "basica" | "compleja";

export type EmotionInfo = {
  id: string;
  nombre: string;
  emoji: string;
  /** "basica": emociones universales (alegría, tristeza, miedo, enojo). "compleja": mezcla o elaboración de varias. */
  tipo: EmotionType;
  /** Una frase corta que explica la emoción sin lenguaje diagnóstico. */
  definicion: string;
  /** Exactamente 3 ejemplos cotidianos, en segunda persona. */
  ejemplos: [string, string, string];
  /** Emociones con las que suele confundirse y cómo distinguirlas. */
  diferencias?: { id: string; texto: string }[];
  /** `true` solo cuando un profesional haya revisado definición y ejemplos. */
  validado: boolean;
};

export const EMOTION_TYPE_LABEL: Record<EmotionType, string> = {
  basica: "Emoción básica",
  compleja: "Emoción compleja",
};

export const EMOTIONS: EmotionInfo[] = catalogo.emociones.map((e) => ({
  id: e.id,
  nombre: e.nombre,
  emoji: e.emoji,
  tipo: e.tipo as EmotionType,
  definicion: e.definicion,
  ejemplos: e.ejemplos as [string, string, string],
  ...(e.diferencias ? { diferencias: e.diferencias } : {}),
  validado: e.validado,
}));

const BY_ID = new Map(EMOTIONS.map((e) => [e.id, e]));

export function getEmotionInfo(id: string): EmotionInfo | undefined {
  return BY_ID.get(id);
}

/** Texto que leen los lectores de pantalla (aria-describedby) para una emoción. */
export function describeForScreenReader(info: EmotionInfo): string {
  return `${EMOTION_TYPE_LABEL[info.tipo]}. ${info.definicion} Por ejemplo: ${info.ejemplos.join("; ")}.`;
}
