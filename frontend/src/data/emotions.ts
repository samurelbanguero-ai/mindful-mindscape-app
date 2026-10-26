/**
 * Fichas de reconocimiento emocional.
 *
 * Contenido redactado para el prototipo EmoWave en lenguaje cotidiano y en
 * segunda persona, sin términos clínicos. PENDIENTE DE REVISIÓN POR UN
 * PSICÓLOGO: mientras `validado` sea `false`, los ejemplos son una propuesta
 * inicial. Este archivo está separado de los componentes para poder
 * reemplazarlo luego por ejemplos validados o extraídos de un dataset sin
 * tocar la interfaz.
 *
 * Los `id` deben coincidir con `MOODS` en `src/lib/mood.tsx` (lo verifica
 * `emotions.test.ts`).
 */

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

export const EMOTIONS: EmotionInfo[] = [
  // ── Agradables ────────────────────────────────────────────────────────────
  {
    id: "alegria",
    nombre: "Alegría",
    emoji: "☀️",
    tipo: "basica",
    definicion: "Una sensación ligera y agradable cuando algo sale bien o te hace sonreír.",
    ejemplos: [
      "Te sientes con energía y ganas de reír",
      "Quieres compartir lo que te pasa",
      "Sientes ganas de saltar o celebrar",
    ],
    validado: false,
  },
  {
    id: "felicidad",
    nombre: "Felicidad",
    emoji: "😊",
    tipo: "compleja",
    definicion: "Un bienestar más tranquilo y duradero que la alegría del momento.",
    ejemplos: [
      "Sientes que tu vida, en general, va por buen camino",
      "Disfrutas lo cotidiano: un café, una charla, tu música",
      "Te sientes a gusto contigo y con quienes te rodean",
    ],
    diferencias: [
      {
        id: "alegria",
        texto:
          "La alegría es una chispa del momento; la felicidad es un bienestar que se mantiene.",
      },
    ],
    validado: false,
  },
  {
    id: "gratitud",
    nombre: "Gratitud",
    emoji: "🙏",
    tipo: "compleja",
    definicion: "Reconocer y valorar algo bueno que recibiste o que tienes.",
    ejemplos: [
      "Piensas en alguien que te ayudó y te dan ganas de agradecerle",
      "Valoras cosas que antes dabas por hechas",
      "Sientes que tienes suerte de contar con ciertas personas",
    ],
    validado: false,
  },
  {
    id: "amor",
    nombre: "Amor",
    emoji: "❤️",
    tipo: "compleja",
    definicion: "Cariño y conexión profunda con alguien o con algo.",
    ejemplos: [
      "Quieres cuidar y estar cerca de alguien",
      "Te alegra de verdad que a esa persona le vaya bien",
      "Sientes calidez cuando piensas en tu familia, pareja o amistades",
    ],
    validado: false,
  },
  {
    id: "entusiasmo",
    nombre: "Entusiasmo",
    emoji: "🎉",
    tipo: "compleja",
    definicion: "Ilusión y ganas por algo que está por venir.",
    ejemplos: [
      "Cuentas los días para un viaje, un evento o un plan",
      "No paras de hablar de una idea nueva",
      "Te cuesta quedarte quieto/a de la emoción",
    ],
    validado: false,
  },
  {
    id: "orgullo",
    nombre: "Orgullo",
    emoji: "✨",
    tipo: "compleja",
    definicion: "Satisfacción por algo que lograste o por quien eres.",
    ejemplos: [
      "Sacaste una buena nota después de esforzarte",
      "Te das cuenta de lo mucho que has avanzado",
      "Quieres que alguien vea lo que hiciste",
    ],
    validado: false,
  },
  {
    id: "esperanza",
    nombre: "Esperanza",
    emoji: "🌱",
    tipo: "compleja",
    definicion: "Confiar en que algo puede mejorar, aunque hoy no esté resuelto.",
    ejemplos: [
      "Aunque la semana fue dura, sientes que lo que viene puede ser mejor",
      "Imaginas cómo te gustaría que salieran las cosas",
      "Te animas a intentarlo otra vez",
    ],
    validado: false,
  },
  {
    id: "energia",
    nombre: "Energía",
    emoji: "🔥",
    tipo: "compleja",
    definicion: "Sentir el cuerpo y la mente activos, con ganas de moverte.",
    ejemplos: [
      "Te levantas con ganas de hacer muchas cosas",
      "Te provoca salir, entrenar o bailar",
      "Sientes que el día te rinde",
    ],
    diferencias: [
      {
        id: "ansiedad",
        texto:
          "La energía se siente agradable y con rumbo; la ansiedad es una activación incómoda que no te deja descansar.",
      },
    ],
    validado: false,
  },
  {
    id: "motivacion",
    nombre: "Motivación",
    emoji: "💪",
    tipo: "compleja",
    definicion: "Tener un motivo claro que te impulsa a actuar.",
    ejemplos: [
      "Sabes qué quieres lograr y das el primer paso",
      "Te sientas a estudiar sin que nadie te lo pida",
      "Te propones una meta y te emociona cumplirla",
    ],
    validado: false,
  },
  {
    id: "alivio",
    nombre: "Alivio",
    emoji: "😌",
    tipo: "compleja",
    definicion: "Lo que sientes cuando algo que te pesaba por fin pasa o se resuelve.",
    ejemplos: [
      "Terminaste el parcial que te tenía tenso/a",
      "Respiras hondo y sientes que te quitaste un peso de encima",
      "Lo que temías al final no fue tan grave",
    ],
    validado: false,
  },

  // ── Tranquilas o neutras ──────────────────────────────────────────────────
  {
    id: "calma",
    nombre: "Calma",
    emoji: "🌿",
    tipo: "compleja",
    definicion: "Un estado tranquilo, sin prisa, en el que nada te inquieta mucho.",
    ejemplos: [
      "Tu respiración es lenta y el cuerpo se siente suelto",
      "Puedes concentrarte en una cosa a la vez",
      "No sientes urgencia por hacer nada",
    ],
    validado: false,
  },
  {
    id: "paz",
    nombre: "Paz",
    emoji: "☮️",
    tipo: "compleja",
    definicion: "Una calma más profunda: estar en armonía contigo y con lo que pasa.",
    ejemplos: [
      "Sientes que estás bien con tus decisiones",
      "No cargas rencores ni pendientes que te inquieten",
      "Aceptas lo que no puedes cambiar sin pelear contra ello",
    ],
    validado: false,
  },
  {
    id: "mixto",
    nombre: "Emoción Mixta",
    emoji: "🎭",
    tipo: "compleja",
    definicion: "Sentir varias emociones a la vez, incluso opuestas.",
    ejemplos: [
      "Estás feliz por graduarte pero triste por dejar a tus amigos",
      "Te emociona un cambio y al mismo tiempo te da nervios",
      "No sabes si reír o llorar",
    ],
    diferencias: [
      {
        id: "confusion",
        texto:
          "En la emoción mixta sí reconoces lo que sientes, solo que son varias cosas; en la confusión no logras ponerle nombre.",
      },
    ],
    validado: false,
  },
  {
    id: "confusion",
    nombre: "Confusión",
    emoji: "❓",
    tipo: "compleja",
    definicion: "No tener claro qué sientes, qué piensas o qué decidir.",
    ejemplos: [
      "Sabes que algo te pasa, pero no sabes qué es",
      "Cambias de opinión varias veces sobre lo mismo",
      "Te cuesta explicarle a otros cómo estás",
    ],
    validado: false,
  },
  {
    id: "aburrimiento",
    nombre: "Aburrimiento",
    emoji: "🥱",
    tipo: "compleja",
    definicion: "Falta de interés o de estímulo en lo que estás haciendo.",
    ejemplos: [
      "El tiempo pasa lento y miras el reloj a cada rato",
      "Nada de lo que hay para hacer te llama la atención",
      "Pasas de una app a otra sin quedarte en ninguna",
    ],
    diferencias: [
      {
        id: "cansancio",
        texto:
          "En el aburrimiento tienes energía pero nada te interesa; en el cansancio te falta la energía.",
      },
    ],
    validado: false,
  },

  // ── Difíciles ─────────────────────────────────────────────────────────────
  {
    id: "ansiedad",
    nombre: "Ansiedad",
    emoji: "🌫️",
    tipo: "compleja",
    definicion:
      "Una inquietud que se siente en la mente y en el cuerpo, muchas veces sin un motivo claro y pensando en lo que podría pasar.",
    ejemplos: [
      "Piensas todo el tiempo en lo que puede pasar mañana",
      "Sientes que te falta el aire o el pecho apretado",
      "Necesitas tener todo bajo control y te estresa si un plan cambia",
    ],
    diferencias: [
      {
        id: "preocupacion",
        texto:
          "La preocupación tiene un tema concreto y se calma al resolverlo; la ansiedad sigue ahí aunque no sepas bien por qué y la sientes también en el cuerpo.",
      },
      {
        id: "miedo",
        texto:
          "El miedo aparece ante algo que está pasando ahora; la ansiedad se anticipa a algo que podría pasar.",
      },
    ],
    validado: false,
  },
  {
    id: "preocupacion",
    nombre: "Preocupación",
    emoji: "😟",
    tipo: "compleja",
    definicion: "Darle vueltas a un problema concreto que todavía no se ha resuelto.",
    ejemplos: [
      "No dejas de pensar en cómo vas a pagar la matrícula",
      "Repasas una y otra vez la entrega de la próxima semana",
      "Te preguntas si un familiar enfermo va a estar bien",
    ],
    diferencias: [
      {
        id: "ansiedad",
        texto:
          "La preocupación tiene un motivo claro y suele bajar cuando haces algo al respecto; si la inquietud sigue sin un motivo claro y la sientes en el cuerpo, puede ser ansiedad.",
      },
    ],
    validado: false,
  },
  {
    id: "miedo",
    nombre: "Miedo",
    emoji: "😨",
    tipo: "basica",
    definicion: "Una alerta ante algo que sientes como peligroso o amenazante, aquí y ahora.",
    ejemplos: [
      "Se te acelera el corazón al caminar solo/a de noche",
      "Te quedas paralizado/a antes de exponer frente a la clase",
      "Quieres salir corriendo o esconderte",
    ],
    diferencias: [
      {
        id: "ansiedad",
        texto:
          'El miedo tiene un "qué" frente a ti; la ansiedad se anticipa a algo que todavía no ha pasado.',
      },
    ],
    validado: false,
  },
  {
    id: "tristeza",
    nombre: "Tristeza",
    emoji: "🌧️",
    tipo: "basica",
    definicion: "Un bajón que aparece cuando pierdes algo o algo no salió como esperabas.",
    ejemplos: [
      "Te dan ganas de llorar o lloras sin saber bien por qué",
      "Las cosas que te gustaban no te provocan igual",
      "Extrañas a alguien o algo que ya no está",
    ],
    diferencias: [
      {
        id: "soledad",
        texto:
          "La soledad tiene que ver con sentirte desconectado/a de los demás; la tristeza puede llegar aunque estés bien acompañado/a.",
      },
      {
        id: "cansancio",
        texto: "El cansancio mejora al descansar; la tristeza sigue ahí aunque hayas dormido bien.",
      },
    ],
    validado: false,
  },
  {
    id: "cansancio",
    nombre: "Cansancio",
    emoji: "💤",
    tipo: "compleja",
    definicion: "Falta de energía física o mental, como si tu batería estuviera baja.",
    ejemplos: [
      "Lees la misma línea varias veces y no se te queda",
      "Te pesa el cuerpo y solo quieres acostarte",
      "Hasta las tareas pequeñas te parecen enormes",
    ],
    diferencias: [
      {
        id: "tristeza",
        texto:
          "Si después de descansar te sientes mejor, era cansancio; si el bajón continúa, puede ser tristeza.",
      },
    ],
    validado: false,
  },
  {
    id: "frustracion",
    nombre: "Frustración",
    emoji: "😤",
    tipo: "compleja",
    definicion: "Impotencia cuando te esfuerzas y algo no sale como querías.",
    ejemplos: [
      "Estudiaste mucho y aun así te fue mal",
      "Intentas algo varias veces y sigue sin funcionar",
      "Sientes que das todo y no ves resultados",
    ],
    diferencias: [
      {
        id: "enojo",
        texto:
          "La frustración nace de un obstáculo o de no lograr algo; el enojo suele dirigirse a alguien o a algo que sientes injusto.",
      },
    ],
    validado: false,
  },
  {
    id: "enojo",
    nombre: "Enojo",
    emoji: "😡",
    tipo: "basica",
    definicion: "Una reacción fuerte cuando algo te parece injusto o alguien pasa tus límites.",
    ejemplos: [
      "Sientes calor en la cara y aprietas los dientes",
      "Te dan ganas de gritar o de responder feo",
      "No puedes dejar de pensar en lo que te hicieron",
    ],
    validado: false,
  },
  {
    id: "soledad",
    nombre: "Soledad",
    emoji: "👥",
    tipo: "compleja",
    definicion: "Sentirte desconectado/a de los demás, estés o no acompañado/a.",
    ejemplos: [
      "Sientes que te falta algo",
      "Prefieres aislarte aunque estés con gente",
      "Sientes que nadie te entiende",
    ],
    diferencias: [
      {
        id: "tristeza",
        texto:
          "La soledad se centra en la falta de conexión con otros; la tristeza puede tener muchas causas distintas.",
      },
    ],
    validado: false,
  },
];

const BY_ID = new Map(EMOTIONS.map((e) => [e.id, e]));

export function getEmotionInfo(id: string): EmotionInfo | undefined {
  return BY_ID.get(id);
}

/** Texto que leen los lectores de pantalla (aria-describedby) para una emoción. */
export function describeForScreenReader(info: EmotionInfo): string {
  return `${EMOTION_TYPE_LABEL[info.tipo]}. ${info.definicion} Por ejemplo: ${info.ejemplos.join("; ")}.`;
}
