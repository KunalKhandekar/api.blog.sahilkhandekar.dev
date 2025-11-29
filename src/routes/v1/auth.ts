/**
 * Node modules
 */
import { Router } from 'express';
import { body } from 'express-validator';

/**
 * Controllers
 */
import register from '@/controllers/v1/auth/register';
import User from '@/models/user';

/**
 * Middlewares
*/
import ValidationError from '@/middlewares/validationError';

/**
 * Models
 */

const router = Router();

router.post(
  '/register',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value }).lean();
      if (userExists) {
        throw new Error('User email or password is invalid');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  ValidationError,
  register,
);

export default router;
