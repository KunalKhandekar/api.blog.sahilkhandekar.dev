/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import config from '@/config';
import { createSubscriber, generateUsername } from '@/utils';
import agenda from '@/lib/agenda';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { SEND_WELCOME_EMAIL_JOB } from '@/jobs/welcome_subscriber';

/**
 * Models
 */
import User from '@/models/user';
import Token from '@/models/token';

/**
 * Types
 */
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type userData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as userData;

  if (role === 'admin' && !config.WHITELIST_ADMIN_MAILS.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You cannot register as an admin',
    });

    logger.warn(
      `User with email ${email} tried to register as an admin but is not in the whitelist`,
    );
    return;
  }

  try {
    const username = generateUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // Generate access token and refresh token for new user
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token in database
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });

    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });  

    res.status(201).json({
      message: 'New user created',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      accessToken,
    });

    await createSubscriber(email);
    await agenda.now(SEND_WELCOME_EMAIL_JOB, { email: newUser.email });
    
    logger.info('User register successfully.', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
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

export default register;
