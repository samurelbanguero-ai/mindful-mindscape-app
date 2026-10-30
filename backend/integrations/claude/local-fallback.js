// Simulador local del Diario con IA (AI_MODE=offline).
// No entiende el texto como un modelo real: detecta temas por palabras clave y
// elige, entre varias respuestas del tema, una que no se haya dicho ya en la
// conversación, para no repetirse.

/** Minúsculas y sin tildes, para que "estrés" y "estres" coincidan. */
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// El orden importa: gana el primer tema que coincide. La crisis va siempre primero.
const TOPICS = [
  {
    id: 'crisis',
    pattern: /(suicid|matarme|quitarme la vida|no quiero vivir|quiero morir|me quiero morir|hacerme dano|lastimarme|cortarme|no vale la pena vivir|desaparecer para siempre)/,
    replies: [
      (n) => `${n}, gracias por confiarme algo tan difícil. Lo que sientes importa, y no tienes que cargarlo en soledad. Te pido que hables ahora mismo con alguien de confianza o con una línea de apoyo: en Colombia puedes llamar a la Línea 192 (opción 4, salud mental); en México, a la Línea de la Vida (800 911 2000); en España, al 024. Si estás en peligro inmediato, llama al 123, 911 o 112. Puedes también pedir apoyo a un psicólogo desde Emowave. Sigo aquí contigo: ¿hay alguien cerca a quien puedas escribirle en este momento?`,
    ],
  },
  {
    id: 'despedida',
    pattern: /^(adios|chao|chau|hasta luego|hasta manana|bye|nos vemos|me voy)\b/,
    replies: [
      (n) => `Gracias por darte este rato, ${n}. Que el resto del día te trate con calma. Aquí estará tu diario cuando quieras volver 🌿`,
      (n) => `Cuídate mucho, ${n}. Lo que escribiste hoy ya es un paso para entenderte mejor. Vuelve cuando lo necesites.`,
    ],
  },
  {
    id: 'gracias',
    pattern: /^(gracias|muchas gracias|mil gracias|graciass|ok gracias|vale gracias)\b/,
    replies: [
      (n) => `Con gusto, ${n}. Me alegra que este espacio te sirva. ¿Quieres seguir contándome algo más o lo dejamos aquí por hoy?`,
      (n) => `Gracias a ti por abrirte, ${n}. ¿Hay algo más que te esté rondando la cabeza?`,
    ],
  },
  {
    id: 'saludo',
    pattern: /^(hola+|buenas|buen dia|buenos dias|buenas tardes|buenas noches|que tal|hey)\b/,
    replies: [
      (n, ctx) => ctx.lastMood
        ? `¡Hola, ${n}! Veo en tu diario que últimamente has registrado ${ctx.lastMood}. ¿Cómo te sientes hoy con eso?`
        : `¡Hola, ${n}! Este es tu espacio para escribir sin filtros. ¿Cómo ha estado tu día?`,
      (n) => `Hola de nuevo, ${n}. Aquí sigo. ¿Qué te gustaría contarme ahora?`,
    ],
  },
  {
    id: 'concentracion',
    pattern: /(concentr|enfoc|distraig|distrai|disperso|dispersa|la mente en blanco|no rindo|procrastin|no avanzo)/,
    replies: [
      (n) => `Qué frustrante es querer avanzar y que la cabeza no acompañe, ${n}. Muchas veces no es falta de voluntad: la mente se dispersa cuando está cansada o cargando preocupaciones. ¿Sientes que hay algo rondándote mientras intentas concentrarte, o es más bien agotamiento?`,
      (n) => `Algo que suele ayudar, ${n}, es achicar la meta: elige una sola tarea, pon un temporizador de 15 minutos y deja el celular en otra habitación. Al terminar, date 5 minutos de pausa de verdad. ¿Qué es lo que tienes pendiente y te está costando empezar?`,
      (n) => `A veces la falta de concentración es una señal de que el cuerpo pide algo: dormir mejor, comer, moverte un poco o desahogarte. ¿Cómo has dormido estos últimos días, ${n}?`,
    ],
  },
  {
    id: 'academico',
    pattern: /(examen|parcial|tarea|trabajo final|universidad|clase|notas|semestre|estudiar|estudio|entrega|profe|jefe|trabajo)/,
    replies: [
      (n) => `Suena a que las responsabilidades te están pesando, ${n}. Cuando todo parece urgente, ayuda escribir la lista completa y elegir solo una cosa para hoy. ¿Qué es lo que más te preocupa de todo lo que tienes encima?`,
      (n) => `Es normal sentir presión con eso, ${n}, y no dice nada malo de ti. ¿Qué parte depende de ti y cuál no? A veces separar eso quita bastante peso.`,
    ],
  },
  {
    id: 'sueno',
    pattern: /(no puedo dormir|no duermo|insomnio|dormi mal|duermo mal|desvel|no he dormido)/,
    replies: [
      (n) => `Dormir mal lo vuelve todo más cuesta arriba, ${n}. Esta noche puedes probar algo sencillo: deja las pantallas media hora antes y escribe en un papel lo que te da vueltas, para que no se quede en la cabeza. ¿Hay algo que te quite el sueño últimamente?`,
      (n) => `El cansancio de no dormir también afecta el ánimo y la paciencia, así que sé amable contigo hoy, ${n}. ¿Te pasa desde hace mucho o es algo de estos días?`,
    ],
  },
  {
    id: 'tristeza',
    pattern: /(triste|tristeza|llor|bajon|deprim|vacio|desanim|me siento sol|estoy sol|soledad|nadie me|no estoy bien|no me siento bien|\bmal\b|fatal|horrible)/,
    replies: [
      (n) => `Siento que estés pasando por esto, ${n}. Está bien no estar bien, y no necesitas tener una explicación para sentirte así. ¿Quieres contarme qué ha pasado, o prefieres solo desahogarte un rato?`,
      (n) => `Gracias por decírmelo, ${n}. Cuando todo pesa, incluso escribir cuesta, así que ya hiciste algo. ¿Desde cuándo te sientes así?`,
      (n) => `Te leo, ${n}. Si te ayuda, piensa en algo pequeño que podrías hacer hoy por ti: un vaso de agua, salir un rato a caminar o escribirle a alguien que quieras. ¿Hay alguna persona con la que puedas hablar de esto?`,
    ],
  },
  {
    id: 'ansiedad',
    pattern: /(ansie|nervios|estres|estresad|preocup|miedo|presion|asustad|angusti|panico|abrumad)/,
    replies: [
      (n) => `Noto mucha inquietud en lo que escribes, ${n}. Antes de seguir, prueba esto: inhala por 4 segundos, sostén 4 y exhala lento por 6. Repítelo tres veces. Cuando puedas, cuéntame qué es lo que más te preocupa.`,
      (n) => `Cuando la ansiedad sube, la mente salta al peor escenario. Vamos a lo concreto, ${n}: ¿qué es lo que está pasando ahora mismo y qué es lo que temes que pase?`,
      (n) => `Un truco para bajar el ritmo, ${n}: nombra 5 cosas que ves, 4 que puedes tocar y 3 que escuchas. Ayuda a volver al presente. ¿Cómo te sientes después de intentarlo?`,
    ],
  },
  {
    id: 'cansancio',
    pattern: /(cansad|agotad|sin energia|exhaust|fatiga|sin ganas|no tengo ganas|quemad)/,
    replies: [
      (n) => `Suena a que llevas un buen tiempo dando mucho, ${n}. Descansar no es perder el tiempo, es parte de cuidarte. ¿Hay algo que puedas soltar o dejar para mañana?`,
      (n) => `El cansancio a veces es del cuerpo y a veces es emocional, ${n}. ¿Cuál dirías que pesa más en ti ahora?`,
    ],
  },
  {
    id: 'enojo',
    pattern: /(enoj|rabia|\bira\b|furi|molest|bronca|injust|odio|harto|harta)/,
    replies: [
      (n) => `El enojo es válido, ${n}: suele aparecer cuando algo importante para ti no se respetó. ¿Qué fue lo que pasó?`,
      (n) => `Está bien sacarlo aquí, ${n}. Escribir lo que te molesta, sin filtros, ayuda a bajarle intensidad. ¿Qué te gustaría que hubiera sido diferente?`,
    ],
  },
  {
    id: 'relaciones',
    pattern: /(pareja|novi|\bex\b|familia|mama|papa|herman|amig|discut|pelea|peleamos|terminamos|me termino)/,
    replies: [
      (n) => `Las situaciones con las personas que nos importan suelen doler más, ${n}. ¿Qué pasó y cómo te dejó?`,
      (n) => `Te escucho, ${n}. ¿Cómo te gustaría que quedaran las cosas con esa persona?`,
    ],
  },
  {
    id: 'alegria',
    pattern: /(feliz|content|alegr|emocionad|me fue bien|estoy bien|muy bien|genial|excelente|orgullos|logre)/,
    replies: [
      (n) => `¡Qué bueno leer eso, ${n}! Vale la pena detenerse a notar los días buenos. ¿Qué fue lo que más sumó hoy?`,
      (n) => `Me alegra mucho, ${n}. Guardar estos momentos en tu diario ayuda a recordarlos en días más grises. ¿Quieres contarme un poco más?`,
    ],
  },
  {
    id: 'no-se',
    pattern: /^(no se|no sabria|ni idea|no lo se|no se que decir|no se que siento|nose|no sabria decir|no estoy segur)/,
    replies: [
      (n) => `Está bien no tenerlo claro, ${n}; a veces es lo más honesto. Probemos con algo más simple: si tu ánimo de hoy fuera un clima, ¿sería soleado, nublado, lluvioso o tormenta?`,
      (n) => `No tienes que saberlo todo ahora, ${n}. ¿Se parece más a cansancio, preocupación, tristeza o desánimo? Elige lo que más se acerque, aunque no sea exacto.`,
      (n) => `Sin presión, ${n}. Puedes empezar por algo concreto: cuéntame qué hiciste hoy y vamos viendo desde ahí.`,
    ],
  },
  {
    id: 'corto',
    pattern: /^(si|no|ok|vale|bueno|aja|mmm+|tal vez|puede ser|creo que si|creo que no|mas o menos)$/,
    replies: [
      (n) => `Entiendo, ${n}. Si quieres, cuéntame un poco más; aquí no hay prisa.`,
      (n) => `Vale. ¿Qué es lo que más te ronda la cabeza en este momento, ${n}?`,
      (n) => `Gracias por responder, ${n}. Si prefieres, también podemos hacer una pausa de respiración juntos. ¿Te gustaría?`,
    ],
  },
];

const GENERIC = [
  (n) => `Gracias por contármelo, ${n}. ¿Cómo te hace sentir eso?`,
  (n) => `Te leo, ${n}. ¿Qué es lo que más te pesa de esa situación?`,
  (n) => `Entiendo. ¿Desde cuándo te pasa esto, ${n}?`,
  (n) => `Eso suena importante para ti, ${n}. ¿Qué te gustaría que pasara?`,
  (n) => `Sigue, ${n}, te estoy leyendo. ¿Qué más hay detrás de eso?`,
];

/**
 * Elige la primera respuesta de la lista que no se haya dicho ya en el historial.
 * Si ya se usaron todas, rota según cuántas veces habló el asistente.
 */
function pickUnused(candidates, said, name, ctx) {
  const texts = candidates.map((fn) => fn(name, ctx));
  const fresh = texts.find((t) => !said.has(t));
  return fresh || texts[said.size % texts.length];
}

function buildLocalReply(message, history = [], systemPrompt = '') {
  const text = normalize(message);

  const nameMatch = String(systemPrompt).match(/- nombre:\s*([^\n]+)/);
  const name = nameMatch ? nameMatch[1].trim() : 'tú';
  const moodMatch = String(systemPrompt).match(/Emoción:\s*([^\s|]+)/);
  const ctx = { lastMood: moodMatch ? moodMatch[1].toLowerCase() : null };

  const said = new Set(
    (Array.isArray(history) ? history : [])
      .filter((m) => m && m.role === 'assistant')
      .map((m) => String(m.content))
  );

  const topic = TOPICS.find((t) => t.pattern.test(text));
  return pickUnused(topic ? topic.replies : GENERIC, said, name, ctx);
}

module.exports = { buildLocalReply, normalize };
