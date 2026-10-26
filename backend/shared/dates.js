// Fechas en hora de Colombia, igual que el frontend (frontend/src/lib/dates.ts)
const APP_TIME_ZONE = 'America/Bogota';

const dateKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/** Día (YYYY-MM-DD) en Colombia del instante dado. */
function todayKey(now = new Date()) {
  return dateKeyFormat.format(now);
}

module.exports = {
  APP_TIME_ZONE,
  todayKey
};
