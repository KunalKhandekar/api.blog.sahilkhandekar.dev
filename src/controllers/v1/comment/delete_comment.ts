/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import User from '@/models/user';

/**
 * Types
 */
import type { Request, Response } from 'express';

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  const commentId = req.params.commentId;
  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId').lean()
      .exec();
    const user = await User.findById(userId).select('role').lean().exec();

    if (!comment) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Comment not found',
      });
      return;
    }

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Comment not found',
      });
      return;
    }

    console.log({comment, userId, user});

    if (!comment.userId.equals(userId) && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to delete another comment without permission', {
        userId,
        commentId,
      });
      return;
    }

    await Comment.deleteOne({ _id: commentId });
    logger.info('Comment deleted successfully', { commentId });
    blog.commentsCount--;
    await blog.save();

    logger.info('Blog comments count updated', {
      blogId: blog._id,
      CommentsCount: blog.commentsCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while deleting commnet', error);
  }
};

export default deleteComment;
