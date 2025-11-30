/**
 * Node modules
 */
import { Router } from 'express';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import ValidationError from '@/middlewares/validationError';

/**
 * Controllers
 */
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';

/**
 * Models
 */
import User from '@/models/user';

/**
 * Validators
*/
import { updateCurrentUserValidations } from '@/validators/v1/user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  updateCurrentUserValidations,
  ValidationError,
  updateCurrentUser,
);

export default router;
