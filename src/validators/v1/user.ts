/**
 * Node modules
 */
import { body, param, query } from 'express-validator';

/**
 * Models
 */
import User from '@/models/user';

const socialLinks = [
  'website',
  'linkedIn',
  'facebook',
  'instagram',
  'youtube',
  'x',
];

const socialLinksValidation = socialLinks.map((field) =>
  body(`socialLinks.${field}`)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`)
    .isLength({ max: 100 })
    .withMessage(`${field} URL must be less than 100 characters`),
);

export const updateCurrentUserValidations = [
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 characters')
    .custom(async (value) => {
      const usernameExists = await User.exists({ username: value });
      if (usernameExists) {
        throw new Error('This username is already in use');
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('This email is already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less than 20 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Last name must be less than 20 characters'),
  ...socialLinksValidation,
];

export const getAllUserValidations = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
];
