/**
 * Node modules
 */
import { param, query } from 'express-validator';

export const paginationValidations = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
];

export const mongoIdValidator = (field: string) => {
  return [param(field).notEmpty().isMongoId().withMessage(`Invalid ${field}`)];
};
