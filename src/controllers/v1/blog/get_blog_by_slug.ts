/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Blog from '@/models/blog';
import User from '@/models/user';
import Comment from '@/models/comment';

/**
 * Types
 */
import type { Request, Response } from 'express';

const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  const slug = req.params.slug;

  try {
    const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'blog not found',
      });
      return;
    }

    const comments = await Comment.find({ blogId: blog?._id })
      .select('content userId createdAt')
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Show only the published blog to the nornmal user
    if (user?.role === 'user' && blog?.status == 'draft') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to access a draft blog', {
        userId,
        blog,
      });

      return;
    }

    res.status(200).json({
      blog,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });

    logger.error(`Error while fetching blogs by slug: `, error);
  }
};

export default getBlogBySlug;
