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
import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';
import deleteUser from '@/controllers/v1/user/delete_user';
import getAllUsers from '@/controllers/v1/user/get_all_users';
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import getUser from '@/controllers/v1/user/get_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';

/**
 * Validators
 */
import { paginationValidations } from '@/validators/v1';
import {
  updateCurrentUserValidations,
  userIdValidation,
} from '@/validators/v1/user';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  paginationValidations,
  ValidationError,
  getAllUsers,
);

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

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  userIdValidation,
  ValidationError,
  getUser,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  userIdValidation,
  ValidationError,
  deleteUser,
);

export default router;
