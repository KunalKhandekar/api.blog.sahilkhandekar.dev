/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Blog from '@/models/blog';
import Comment from '@/models/commnet';

/**
 * Types
 */
import type { Request, Response } from 'express';

const getCommentsByBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const blogId = req.params.blogId;
  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();
    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const allCommnents = await Comment.find({ userId, blogId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      comment: allCommnents,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while retrieving commnets by blog', error);
  }
};

export default getCommentsByBlog;
