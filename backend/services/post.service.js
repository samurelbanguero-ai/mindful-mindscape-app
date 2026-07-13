const postRepository = require('../repositories/post.repository');
const auditRepository = require('../repositories/audit.repository');
const postValidator = require('../validators/post.validator');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');
const { sanitizeText } = require('../utils/sanitizer');
const { BAD_WORDS_REGEX } = require('../shared/regex');
const moderatorService = require('./moderator.service');

class PostService {
  async getPosts(currentUser, limitQuery, offsetQuery) {
    const limit = Math.min(Number(limitQuery) || 20, 100);
    const offset = Number(offsetQuery) || 0;
    const isAdmin = currentUser.role === 'admin';

    // Obtener posts (para admin, todos; para usuario, solo aprobados)
    const posts = postRepository.findAll(limit, offset, !isAdmin);
    const replies = postRepository.findAllReplies();
    const reactions = postRepository.findAllReactions();

    const reactionsByPost = {};
    const userReactionByPost = {};
    for (const rx of reactions) {
      if (!reactionsByPost[rx.post_id]) {
        reactionsByPost[rx.post_id] = {};
      }
      reactionsByPost[rx.post_id][rx.reaction_type] = (reactionsByPost[rx.post_id][rx.reaction_type] || 0) + 1;
      if (rx.user_id === currentUser.id) {
        userReactionByPost[rx.post_id] = rx.reaction_type;
      }
    }

    const repliesByPost = {};
    for (const reply of replies) {
      if (!repliesByPost[reply.post_id]) {
        repliesByPost[reply.post_id] = [];
      }

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
        timeVal = new Date(reply.created_at.replace(' ', 'T') + 'Z').getTime();
      } catch (_) {}

      repliesByPost[reply.post_id].push({
        id: String(reply.id),
        author: authorDisplay,
        anon: reply.is_anonymous === 1,
        text: reply.content,
        createdAt: timeVal || Date.now()
      });
    }

    return {
      posts,
      reactionsByPost,
      userReactionByPost,
      repliesByPost,
      limit,
      offset
    };
  }

  async createPost(userId, data) {
    postValidator.validatePost(data);

    const { title = '', body = '', content = '', mood = '', is_anonymous = false } = data;
    const postBody = body || content;

    const cleanTitle = sanitizeText(title.trim());
    const cleanBody = sanitizeText(postBody.trim());

    const isFlagged = (await moderatorService.isToxic(cleanTitle)) || (await moderatorService.isToxic(cleanBody));
    const status = isFlagged ? 'pending' : 'approved';

    const postId = postRepository.createPost({
      user_id: userId,
      title: cleanTitle,
      body: cleanBody,
      content: cleanBody,
      mood,
      is_anonymous: is_anonymous ? 1 : 0,
      status
    });

    const post = postRepository.findById(postId);
    return { post, flagged: isFlagged };
  }

  async replyPost(userId, currentUserVisibility, currentUserAlias, currentUserUsername, postId, data) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postValidator.validateReply(data);

    const { content = '', is_anonymous = false } = data;
    const cleanContent = sanitizeText(content.trim());

    const isToxic = await moderatorService.isToxic(cleanContent, post);
    if (isToxic) {
      throw new ValidationError('Por favor, mantén un tono constructivo y de apoyo. Emowave es una comunidad segura de bienestar.');
    }

    const replyId = postRepository.createReply({
      post_id: postId,
      user_id: userId,
      content: cleanContent,
      is_anonymous: is_anonymous ? 1 : 0
    });

    const reply = postRepository.findReplyById(replyId);

    let authorDisplay = 'anónimo';
    if (!is_anonymous) {
      if (currentUserVisibility === 'alias') {
        authorDisplay = currentUserAlias || currentUserUsername;
      } else if (currentUserVisibility === 'publico') {
        authorDisplay = currentUserUsername;
      }
    }

    return {
      id: String(reply.id),
      author: authorDisplay,
      anon: reply.is_anonymous === 1,
      text: reply.content,
      createdAt: Date.now()
    };
  }

  async reactPost(userId, postId, reaction) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postValidator.validateReaction(reaction);

    const existing = postRepository.findReaction(postId, userId);

    if (existing) {
      if (existing.reaction_type === reaction) {
        postRepository.deleteReaction(existing.id);
        return { action: 'removed' };
      } else {
        postRepository.updateReaction(existing.id, reaction);
        return { action: 'updated' };
      }
    } else {
      postRepository.createReaction(postId, userId, reaction);
      return { action: 'added' };
    }
  }

  async reportPost(postId) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postRepository.reportPost(postId);
    return true;
  }

  // Métodos de administración
  async approvePost(adminUserId, postId) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postRepository.approvePost(postId);
    auditRepository.createLog(adminUserId, 'approve_post', JSON.stringify({ postId }));
    return true;
  }

  async rejectPost(adminUserId, postId) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postRepository.rejectPost(postId);
    auditRepository.createLog(adminUserId, 'reject_post', JSON.stringify({ postId }));
    return true;
  }

  async editPostAdmin(adminUserId, postId, data) {
    const post = postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post no encontrado');
    }

    postValidator.validatePost(data);

    const { title = '', body = '' } = data;
    const cleanTitle = sanitizeText(title.trim());
    const cleanBody = sanitizeText(body.trim());

    postRepository.updatePost(postId, cleanTitle, cleanBody);
    auditRepository.createLog(adminUserId, 'edit_post', JSON.stringify({ postId, title: cleanTitle, body: cleanBody }));
    return true;
  }
}

module.exports = new PostService();
