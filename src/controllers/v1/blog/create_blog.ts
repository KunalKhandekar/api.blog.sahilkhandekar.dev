/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { sanitizeContent } from '@/utils';
import { NOTIFY_NEW_BLOG } from '@/jobs/notify_new_blog';
import agenda from '@/lib/agenda';

/**
 * Models
 */
import Blog from '@/models/blog';

/**
 * Types
 */
import { IBlog } from '@/models/blog';
import type { Request, Response } from 'express';

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

const createBlog = async (req: Request, res: Response): Promise<void> => {
  const { title, content, banner, status } = (req.body as BlogData) || {};
  const userId = req.userId;
  try {
    const cleanContent = sanitizeContent(content);
    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId,
    });

    logger.info('New blog created', newBlog);

    await agenda.now(NOTIFY_NEW_BLOG, { blogId: newBlog._id });

    res.status(201).json({
      newBlog,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });

    logger.error(`Error while creating blog: `, error);
  }
};

export default createBlog;
