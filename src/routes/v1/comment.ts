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
 * Validators
 */
import { mongoIdValidator, paginationValidations } from '@/validators/v1';
import { createCommentValidation } from '@/validators/v1/comment';

/**
 * Controllers
 */
import createComment from '@/controllers/v1/comment/create_comment';
import getCommentsByBlog from '@/controllers/v1/comment/get_comments_by_blog';
import deleteComment from '@/controllers/v1/comment/delete_comment';
import getAllComments from '@/controllers/v1/comment/get_all_comments';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  paginationValidations,
  ValidationError,
  getAllComments,
);

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  mongoIdValidator('blogId', 'param'),
  createCommentValidation,
  ValidationError,
  createComment,
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  mongoIdValidator('blogId', 'param'),
  ValidationError,
  getCommentsByBlog,
);

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  mongoIdValidator('commentId', 'param'),
  ValidationError,
  deleteComment,
);

export default router;
