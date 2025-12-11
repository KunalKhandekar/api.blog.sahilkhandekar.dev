/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { v2 as cloudinary } from 'cloudinary';
import { ObjectId, Types } from 'mongoose';

/**
 * Models
 */
import User from '@/models/user';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import Like from '@/models/like';
import Token from '@/models/token';
import Subscriber from '@/models/subscriber';

/**
 * Types
 */
import type { Request, Response } from 'express';

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).select('email').lean().exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFoundError',
        message: 'User not found',
      });
      return;
    }

    const blogs = await Blog.find({ author: userId })
      .select('_id banner.publicId')
      .lean()
      .exec();

    const blogIds = blogs.map((blog) => blog._id);
    const publicIds = blogs
      .map((blog) => blog.banner?.publicId)
      .filter(Boolean);

    const deleteCloudinaryResources = publicIds.length
      ? cloudinary.api.delete_resources(publicIds)
      : null;

    const deleteBlogRelated = blogIds.length
      ? [
          Comment.deleteMany({ blogId: { $in: blogIds } }),
          Like.deleteMany({ blogId: { $in: blogIds } }),
          Blog.deleteMany({ author: userId }),
        ]
      : [];

    // Independent user related records cleanup
    const deleteUserRelated = [
      Comment.deleteMany({ userId }),
      Like.deleteMany({ userId }),
      Token.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ];

    // decrease the like and comment count from other blogs
    const likeAdjustments = await Like.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: '$blogId', count: { $sum: 1 } } },
    ]);
    const commentAdjustments = await Comment.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: '$blogId', count: { $sum: 1 } } },
    ]);
    const likeUpdates = likeAdjustments.map((l) =>
      Blog.updateOne({ _id: l._id }, { $inc: { likesCount: -l.count } }),
    );
    const commentUpdates = commentAdjustments.map((c) =>
      Blog.updateOne({ _id: c._id }, { $inc: { commentsCount: -c.count } }),
    );

    await Promise.all([
      deleteCloudinaryResources,
      ...deleteBlogRelated,
      ...deleteUserRelated,
      ...likeUpdates,
      ...commentUpdates,
    ]);

    await Subscriber.deleteOne({ email: user.email }).exec();

    logger.info('User account deleted successfully', {
      userId,
      blogsDeleted: blogIds.length,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
    logger.info('Error while deleting user account', error);
  }
};

export default deleteUser;
