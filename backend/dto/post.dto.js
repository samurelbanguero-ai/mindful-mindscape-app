const { ANONYMOUS_NAME, publicDisplayName } = require('../shared/helpers');

// Autor de una publicación o respuesta, respetando si se publicó como anónimo
// y la visibilidad elegida por la persona.
function authorOf(row) {
  if (row.is_anonymous === 1) return ANONYMOUS_NAME;
  return publicDisplayName({
    visibility: row.author_visibility,
    alias: row.author_alias,
    username: row.author_username
  });
}

// SQLite guarda CURRENT_TIMESTAMP en UTC sin zona ("2026-10-26 22:15:00")
function createdAtMs(row) {
  if (!row.created_at) return Date.now();
  const ms = new Date(row.created_at.replace(' ', 'T') + 'Z').getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
}

class PostDTO {
  toResponse(post, reactionsByPost = {}, userReactionByPost = {}, repliesByPost = []) {
    return {
      id: String(post.id),
      author: authorOf(post),
      anon: post.is_anonymous === 1,
      title: post.title || 'Publicación',
      body: post.body || post.content || '',
      mood: post.mood || undefined,
      createdAt: createdAtMs(post),
      reactions: reactionsByPost[post.id] || {},
      reactedBy: userReactionByPost[post.id],
      comments: repliesByPost || [],
      reported: post.reported === 1,
      status: post.status
    };
  }

  toReplyResponse(reply) {
    return {
      id: String(reply.id),
      author: authorOf(reply),
      anon: reply.is_anonymous === 1,
      text: reply.content,
      createdAt: createdAtMs(reply)
    };
  }
}

module.exports = new PostDTO();
