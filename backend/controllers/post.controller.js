const postService = require('../services/post.service');
const postDTO = require('../dto/post.dto');
const { sendSuccess } = require('../responses/success');

class PostController {
  async getPosts(req, res, next) {
    try {
      const { posts, reactionsByPost, userReactionByPost, repliesByPost, limit, offset } =
        await postService.getPosts(req.user, req.query.limit, req.query.offset);

      const formatted = posts.map(post => {
        return postDTO.toResponse(
          post,
          reactionsByPost,
          userReactionByPost,
          repliesByPost[post.id]
        );
      });

      const responseData = {
        posts: formatted,
        total: formatted.length,
        offset,
        limit
      };

      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async createPost(req, res, next) {
    try {
      const { post, flagged } = await postService.createPost(req.user.id, req.body);
      const responseData = {
        post: postDTO.toResponse(post),
        flagged
      };
      return sendSuccess(res, responseData, 201);
    } catch (err) {
      next(err);
    }
  }

  async replyPost(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      const replyData = await postService.replyPost(
        req.user.id,
        req.user.visibility,
        req.user.alias,
        req.user.username,
        postId,
        req.body
      );

      const responseData = {
        reply: replyData
      };

      return sendSuccess(res, responseData, 201);
    } catch (err) {
      next(err);
    }
  }

  async reactPost(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      const result = await postService.reactPost(req.user.id, postId, req.body.reaction);
      const responseData = {
        success: true,
        action: result.action
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async reportPost(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      await postService.reportPost(postId);
      const responseData = {
        success: true,
        message: 'Publicación reportada con éxito'
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  // Métodos de Administración
  async approvePost(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      await postService.approvePost(req.user.id, postId);
      const responseData = {
        success: true,
        message: 'Publicación aprobada y restaurada'
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async rejectPost(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      await postService.rejectPost(req.user.id, postId);
      const responseData = {
        success: true,
        message: 'Publicación rechazada'
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async editPostAdmin(req, res, next) {
    try {
      const postId = Number(req.params.postId);
      await postService.editPostAdmin(req.user.id, postId, req.body);
      const responseData = {
        success: true,
        message: 'Publicación editada'
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostController();
