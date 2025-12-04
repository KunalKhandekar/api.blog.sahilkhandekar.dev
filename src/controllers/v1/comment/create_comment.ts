/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { sanitizeContent } from '@/utils';

/**
 * Models
 */
import Blog from '@/models/blog';
import Comment from '@/models/comment';

/**
 * Types
 */
import { IComment } from '@/models/comment';
import type { Request, Response } from 'express';

type commentData = Pick<IComment, 'content'>;

const createComment = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body as commentData;
  const userId = req.userId;
  const blogId = req.params.blogId;
  try {
    const blog = await Blog.findById(blogId).select('commentsCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = sanitizeContent(content);

    const newComment = await Comment.create({
      blogId: blog._id,
      content: cleanContent,
      userId,
    });

    logger.info('New comment created', newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info('Blog comments count updated', {
      blogId,
      CommentsCount: blog.commentsCount,
    });

    res.status(201).json({
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while creating commnet', error);
  }
};

export default createComment;
