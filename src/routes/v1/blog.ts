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
import deleteBlog from '@/controllers/v1/blog/delete_blog';
import getAllBlogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogBySlug from '@/controllers/v1/blog/get_blog_by_slug';
import getBlogsByUser from '@/controllers/v1/blog/get_blogs_by_user';
import updateBlog from '@/controllers/v1/blog/update_blog';

/**
 * Validators
 */
import { paginationValidations, mongoIdValidator } from '@/validators/v1';
import {
  createBlogValidations,
  slugValidation,
  updateBlogValidations,
} from '@/validators/v1/blog';

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
  mongoIdValidator('userId'),
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

router.put(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  mongoIdValidator('blogId'),
  updateBlogValidations,
  ValidationError,
  uploadBlogBanner('put'),
  updateBlog,
);

router.delete(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  mongoIdValidator('blogId'),
  deleteBlog,
);

export default router;
