/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import User, { IUser } from '@/models/user';

/**
 * Types
 */
import type { Request, Response } from 'express';

const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  const { email, password, role, username, firstName, lastName, socialLinks } =
    (req?.body as IUser) || {};

  try {
    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password;
    if (role !== undefined) user.role = role;
    if (username !== undefined) user.username = username;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    if (!user.socialLinks) {
      user.socialLinks = {};
    }

    if (socialLinks?.website !== undefined)
      user.socialLinks.website = socialLinks.website;
    if (socialLinks?.linkedIn !== undefined)
      user.socialLinks.linkedIn = socialLinks.linkedIn;
    if (socialLinks?.facebook !== undefined)
      user.socialLinks.facebook = socialLinks.facebook;
    if (socialLinks?.instagram !== undefined)
      user.socialLinks.instagram = socialLinks.instagram;
    if (socialLinks?.youtube !== undefined)
      user.socialLinks.youtube = socialLinks.youtube;
    if (socialLinks?.x !== undefined) user.socialLinks.x = socialLinks.x;

    await user.save();

    res.status(200).json({
      user,
    });

    logger.info('User update successfully', user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });

    logger.info('Error while updating current user', error);
  }
};

export default updateCurrentUser;
