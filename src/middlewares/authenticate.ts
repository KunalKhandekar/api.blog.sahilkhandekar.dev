/**
 * Node modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

/**
 * @function authenticate
 * @description Middleware to verify the user's access token from the authorization header.
 *              If the token is valid, the user's ID is attached to the req body.
 *              otherwise, it returns an appropriate error response.
 *
 * @param { Request } req - Express request object. Expects a bearer token in the Authorization header.
 * @param { Response } res - Express response object used to send error responses if authentication fails.
 * @param {NextFunction} next - Express next function to pass the control to the next middleware.
 *
 * @returns {void}
 */
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // If there's no Bearer token, respond with 401 Unauthorized
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }

  // Split out token from the 'Bearer' prefix
  const [_, token] = authHeader.split(' ');
  try {
    // Verify the token and extract the userId from the payload.
    const payload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // Attach the userId to the request object for later use.
    req.userId = payload.userId;

    // Proceed to the next middleware or route handler
    return next();
  } catch (error) {
    // Handle token expiry error
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, request a new with refresh token',
      });
      return;
    }

    // Handle invalid token error
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid ',
      });
      return;
    }

    // Catch-all for other errors
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during authentication', error);
  }
};

export default authenticate;
