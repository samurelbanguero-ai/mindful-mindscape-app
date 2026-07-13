class SupportDTO {
  toRequestResponse(request, messages = [], journalEntries = []) {
    if (!request) return null;

    const formattedMessages = messages.map(m => this.toMessageResponse(m));
    const formattedJournal = journalEntries.map(e => {
      let situations = [];
      try {
        situations = typeof e.situations === 'string'
          ? JSON.parse(e.situations || '[]')
          : (e.situations || []);
      } catch (_) {
        situations = [];
      }
      return {
        ...e,
        situations
      };
    });

    return {
      request: {
        id: request.id,
        user_id: request.user_id,
        psychologist_id: request.psychologist_id,
        status: request.status,
        message: request.message,
        share_journal: request.share_journal,
        created_at: request.created_at,
        // Mantener compatibilidad con mapeo del frontend si inyecta autor
        username: request.username,
        alias: request.alias,
        visibility: request.visibility,
        user_name: request.user_name
      },
      messages: formattedMessages,
      journal_entries: formattedJournal
    };
  }

  toMessageResponse(message) {
    if (!message) return null;
    return {
      id: message.id,
      request_id: message.request_id,
      sender_id: message.sender_id,
      sender_username: message.sender_username,
      message: message.message,
      is_read: message.is_read,
      created_at: message.created_at
    };
  }
}

module.exports = new SupportDTO();
