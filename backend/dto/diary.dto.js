class DiaryDTO {
  toResponse(entry) {
    if (!entry) return null;
    
    let situations = [];
    try {
      situations = typeof entry.situations === 'string'
        ? JSON.parse(entry.situations || '[]')
        : (entry.situations || []);
    } catch (_) {
      situations = [];
    }

    return {
      id: entry.id,
      date: entry.date,
      mood: entry.mood,
      intensity: entry.intensity,
      note: entry.note || entry.content || '',
      situations
    };
  }

  toCollectionResponse(entries) {
    return {
      entries: entries.map(e => this.toResponse(e))
    };
  }
}

module.exports = new DiaryDTO();
