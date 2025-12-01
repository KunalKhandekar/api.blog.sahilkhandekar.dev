/**
 * Node modules
 */
import { body, param } from 'express-validator';

export const createBlogValidations = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 180 })
    .withMessage('Title must be less than 180 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be one of the value, draft or published'),
];

export const updateBlogValidations = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 180 })
    .withMessage('Title must be less than 180 characters'),
  body('content').optional(),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be one of the value, draft or published'),
];

export const slugValidation = [
  param('slug').notEmpty().withMessage('Slug is required'),
];
