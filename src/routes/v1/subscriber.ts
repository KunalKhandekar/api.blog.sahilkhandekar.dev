/**
 * Node modules
 */
import { Router } from 'express';
import { body } from 'express-validator';

/**
 * Controllers
 */
import { createSubscriber } from '@/controllers/v1/subscriber/create_subscriber';

/**
 * Middlewares
 */
import ValidationError from '@/middlewares/validationError';

const router = Router();

router.post(
  '/create',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address'),
  ValidationError,
  createSubscriber,
);

export default router;
