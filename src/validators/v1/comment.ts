import { body } from "express-validator";

export const createCommentValidation = [
    body('content').trim().notEmpty().withMessage('Comment content cannot be empty').isLength({ max: 1000 }).withMessage("Comment content must be less than 1000 characters")
];

