/**
 * Custom modules
 */
import config from '@/config';
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Comment from '@/models/comment';

/**
 * Types
 */
import type { Request, Response } from 'express';

const getAllComments = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
  const offset =
    parseInt(req.query.offset as string) || config.defaultResOffset;
  const total = await Comment.countDocuments();

  try {
    const comments = await Comment.find()
      .select('-__v')
      .populate('blogId', 'banner title slug')
      .populate('userId', 'username')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });

    logger.info('Error while getting all comments', error);
  }
};

export default getAllComments;
