/**
 * Node modules
 */
import { Router } from 'express';

/**
 * Controllers
 */
import register from '@/controllers/v1/auth/register';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import logout from '@/controllers/v1/auth/logout';

/**
 * Middlewares
 */
import ValidationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';

/**
 * Validators
 */
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} from '@/validators/v1/auth';

const router = Router();

router.post('/register', registerValidation, ValidationError, register);
router.post('/login', loginValidation, ValidationError, login);
router.post(
  '/refresh-token',
  refreshTokenValidation,
  ValidationError,
  refreshToken,
);
router.post('/logout', authenticate, logout);

export default router;
