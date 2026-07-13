const diaryRepository = require('../repositories/diary.repository');
const diaryValidator = require('../validators/diary.validator');
const NotFoundError = require('../exceptions/NotFoundError');
const { sanitizeText } = require('../utils/sanitizer');

class DiaryService {
  async getEntries(userId) {
    return diaryRepository.findAllByUserId(userId);
  }

  async createEntry(userId, data) {
    diaryValidator.validateEntry(data);

    const { date, mood, intensity = 5, situations = [], note = '' } = data;

    const cleanNote = sanitizeText(note);
    const cleanSituations = Array.isArray(situations) ? situations.map(s => sanitizeText(String(s))) : [];
    const situationsStr = JSON.stringify(cleanSituations);

    const existing = diaryRepository.findByUserIdAndDate(userId, date);

    let entryId;
    if (existing) {
      diaryRepository.update(existing.id, {
        mood,
        intensity: Number(intensity),
        situations: situationsStr,
        note: cleanNote
      });
      entryId = existing.id;
    } else {
      entryId = diaryRepository.create({
        user_id: userId,
        mood,
        date,
        intensity: Number(intensity),
        situations: situationsStr,
        note: cleanNote
      });
    }

    return {
      entry: diaryRepository.findById(entryId),
      isUpdated: !!existing
    };
  }

  async getEntryById(id, userId) {
    const entry = diaryRepository.findByIdAndUserId(id, userId);
    if (!entry) {
      throw new NotFoundError('Entrada no encontrada');
    }
    return entry;
  }

  async updateEntry(id, userId, data) {
    const existing = diaryRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new NotFoundError('Entrada no encontrada');
    }

    diaryValidator.validateUpdate(data);

    const { mood, intensity, situations, note } = data;

    let finalMood = existing.mood;
    if (mood !== undefined) {
      finalMood = mood;
    }

    let finalIntensity = existing.intensity;
    if (intensity !== undefined) {
      finalIntensity = Number(intensity);
    }

    const cleanNote = note !== undefined ? sanitizeText(note) : existing.note;
    const cleanSituations = situations !== undefined && Array.isArray(situations)
      ? situations.map(s => sanitizeText(String(s)))
      : (existing.situations ? JSON.parse(existing.situations) : []);

    diaryRepository.update(id, {
      mood: finalMood,
      intensity: finalIntensity,
      situations: JSON.stringify(cleanSituations),
      note: cleanNote
    });

    return diaryRepository.findById(id);
  }
}

module.exports = new DiaryService();
