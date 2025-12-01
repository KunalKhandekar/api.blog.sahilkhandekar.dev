/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Blog from '@/models/blog';
import Like from '@/models/like';

/**
 * Types
 */
import type { Request, Response } from 'express';

const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
  const blogId = req.params.blogId;
  const userId = req.userId;
  try {

    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();

    if (!existingLike) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Like not found',
      });
      return;
    }

    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    await Like.deleteOne({ blogId, userId });
    blog.likesCount--;
    await blog.save();

    logger.info('Blog unliked successfully', {
      userId,
      blogId,
      likesCount: blog.likesCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while unliking blog', error);
  }
};

export default unlikeBlog;
