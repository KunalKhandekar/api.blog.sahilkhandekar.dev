/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Models
 */
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import Like from '@/models/like';
import User from '@/models/user';

/**
 * Types
 */
import type { Request, Response } from 'express';

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  const blogId = req.params.blogId;
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (blog?.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to delete a blog without permission', {
        userId,
        blog,
      });
      return;
    }

    // Delete the banner image from cloudinary
    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info('Blog banner deleted from Cloudinary', {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });

    // remove likes and comments associated with the blog
    await Comment.deleteMany({ blogId });
    await Like.deleteMany({ blogId });

    logger.info('Blog deleted successfully', { blogId });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while blog deletion', error);
  }
};

export default deleteBlog;
