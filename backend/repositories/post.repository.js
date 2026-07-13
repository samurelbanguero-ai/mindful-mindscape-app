const db = require('../database/connection');

class PostRepository {
  findAll(limit, offset, approvedOnly = true) {
    const whereClause = approvedOnly ? "WHERE p.status = 'approved' OR p.status IS NULL" : "";
    return db.prepare(`
      SELECT p.*,
        u.username AS author_username,
        u.name AS author_name,
        u.alias AS author_alias,
        u.visibility AS author_visibility
      FROM community_posts p
      LEFT JOIN users u ON u.id = p.user_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  findAllReplies() {
    return db.prepare(`
      SELECT r.*,
        u.username AS author_username,
        u.name AS author_name,
        u.alias AS author_alias,
        u.visibility AS author_visibility
      FROM community_replies r
      LEFT JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at ASC
    `).all();
  }

  findAllReactions() {
    return db.prepare('SELECT post_id, user_id, reaction_type FROM post_reactions').all();
  }

  findById(id) {
    return db.prepare('SELECT * FROM community_posts WHERE id = ?').get(id);
  }

  createPost(post) {
    const { user_id, title, body, content, mood, is_anonymous, status } = post;
    const result = db.prepare(`
      INSERT INTO community_posts (user_id, title, body, content, mood, is_anonymous, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, title, body, content, mood, is_anonymous, status);
    return result.lastInsertRowid;
  }

  createReply(reply) {
    const { post_id, user_id, content, is_anonymous } = reply;
    const result = db.prepare(`
      INSERT INTO community_replies (post_id, user_id, content, is_anonymous)
      VALUES (?, ?, ?, ?)
    `).run(post_id, user_id, content, is_anonymous);
    return result.lastInsertRowid;
  }

  findReplyById(id) {
    return db.prepare('SELECT * FROM community_replies WHERE id = ?').get(id);
  }

  findReaction(postId, userId) {
    return db.prepare('SELECT id, reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?').get(postId, userId);
  }

  createReaction(postId, userId, reactionType) {
    db.prepare('INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)').run(postId, userId, reactionType);
    return true;
  }

  updateReaction(id, reactionType) {
    db.prepare('UPDATE post_reactions SET reaction_type = ? WHERE id = ?').run(reactionType, id);
    return true;
  }

  deleteReaction(id) {
    db.prepare('DELETE FROM post_reactions WHERE id = ?').run(id);
    return true;
  }

  reportPost(postId) {
    db.prepare("UPDATE community_posts SET reported = 1 WHERE id = ?").run(postId);
    return true;
  }

  approvePost(postId) {
    db.prepare("UPDATE community_posts SET status = 'approved', reported = 0 WHERE id = ?").run(postId);
    return true;
  }

  rejectPost(postId) {
    db.prepare("UPDATE community_posts SET status = 'rejected' WHERE id = ?").run(postId);
    return true;
  }

  updatePost(postId, title, body) {
    db.prepare("UPDATE community_posts SET title = ?, body = ?, content = ? WHERE id = ?").run(title, body, body, postId);
    return true;
  }
}

module.exports = new PostRepository();
