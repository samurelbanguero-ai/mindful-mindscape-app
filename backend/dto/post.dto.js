class PostDTO {
  toResponse(post, reactionsByPost = {}, userReactionByPost = {}, repliesByPost = []) {
    let authorDisplay = 'anónimo';
    if (post.is_anonymous === 0) {
      if (post.author_visibility === 'alias') {
        authorDisplay = post.author_alias || post.author_username;
      } else if (post.author_visibility === 'publico') {
        authorDisplay = post.author_username;
      }
    }

    let timeVal = Date.now();
    try {
      if (post.created_at) {
        timeVal = new Date(post.created_at.replace(' ', 'T') + 'Z').getTime();
      }
    } catch (_) {}

    return {
      id: String(post.id),
      author: authorDisplay,
      anon: post.is_anonymous === 1,
      title: post.title || 'Publicación',
      body: post.body || post.content || '',
      mood: post.mood || undefined,
      createdAt: timeVal || Date.now(),
      reactions: reactionsByPost[post.id] || {},
      reactedBy: userReactionByPost[post.id],
      comments: repliesByPost || [],
      reported: post.reported === 1,
      status: post.status
    };
  }

  toReplyResponse(reply) {
    let authorDisplay = 'anónimo';
    if (reply.is_anonymous === 0) {
      if (reply.author_visibility === 'alias') {
        authorDisplay = reply.author_alias || reply.author_username;
      } else if (reply.author_visibility === 'publico') {
        authorDisplay = reply.author_username;
      }
    }

    let timeVal = Date.now();
    try {
      if (reply.created_at) {
        timeVal = new Date(reply.created_at.replace(' ', 'T') + 'Z').getTime();
      }
    } catch (_) {}

    return {
      id: String(reply.id),
      author: authorDisplay,
      anon: reply.is_anonymous === 1,
      text: reply.content,
      createdAt: timeVal || Date.now()
    };
  }
}

module.exports = new PostDTO();
