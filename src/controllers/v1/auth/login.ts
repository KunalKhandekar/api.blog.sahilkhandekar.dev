/**
 * Custom modules
 */
import config from '@/config';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Token from '@/models/token';
import User from '@/models/user';

/**
 * Types
 */
import type { Request, Response } from 'express';
import { IUser } from '@/models/user';

type UserData = Pick<IUser, 'email'>;

const login = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as UserData;
  try {
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if(!user) {
        res.status(404).json({
            code: "NotFound",
            message: "User not found",
        })
        return;
    }

    // Generate access token and refresh token for new user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in database
    await Token.create({
      token: refreshToken,
      userId: user._id,
    });

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'Logged in successfully',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info('User logged in successfully.', {
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during user registration', error);
  }
};

export default login;
