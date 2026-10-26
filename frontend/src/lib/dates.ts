// Fechas de EmoWave en hora de Colombia. El diario guarda días como "YYYY-MM-DD";
// usar toISOString() (UTC) hacía que desde las 7 p. m. el registro quedara con la
// fecha del día siguiente y la racha se rompiera.

export const APP_TIME_ZONE = "America/Bogota";

const dateKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Día (YYYY-MM-DD) en Colombia del instante dado. */
export function toDateKey(date: Date): string {
  return dateKeyFormat.format(date);
}

/** Hoy en Colombia (YYYY-MM-DD). */
export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

/** Suma o resta días a una fecha YYYY-MM-DD (aritmética de calendario, sin zonas horarias). */
export function shiftDateKey(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Convierte un instante del backend a Date. SQLite guarda CURRENT_TIMESTAMP en UTC
 * sin zona ("2026-10-26 22:15:00"); sin la "Z" el navegador lo tomaría como hora local.
 */
export function parseServerTimestamp(value: string | number): Date {
  if (typeof value === "number") return new Date(value);
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasZone ? iso : `${iso}Z`);
}

const dateTimeFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: APP_TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "26 oct, 5:15 p. m." en hora de Colombia. */
export function formatDateTime(value: string | number): string {
  const d = parseServerTimestamp(value);
  return isNaN(d.getTime()) ? String(value) : dateTimeFormat.format(d);
}
