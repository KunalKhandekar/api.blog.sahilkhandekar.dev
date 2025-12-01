/**
 * Node modules
 */
import { Router } from 'express';
import multer from 'multer';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import ValidationError from '@/middlewares/validationError';

/**
 * Controllers
 */
import createBlog from '@/controllers/v1/blog/create_blog';
import getAllBlogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogBySlug from '@/controllers/v1/blog/get_blog_by_slug';
import getBlogsByUser from '@/controllers/v1/blog/get_blogs_by_user';

/**
 * Validators
 */
import { paginationValidations } from '@/validators/v1';
import { createBlogValidations, slugValidation } from '@/validators/v1/blog';
import { userIdValidation } from '@/validators/v1/user';

const upload = multer();

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  createBlogValidations,
  ValidationError,
  uploadBlogBanner('post'),
  createBlog,
);

router.get(
  '/',
  authenticate,
  authorize(['admin', 'user']),
  paginationValidations,
  ValidationError,
  getAllBlogs,
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin', 'user']),
  userIdValidation,
  paginationValidations,
  ValidationError,
  getBlogsByUser,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  slugValidation,
  ValidationError,
  getBlogBySlug,
);

export default router;
