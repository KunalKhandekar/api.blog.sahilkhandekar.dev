/**
 * Node modules
 */
import { body, param, query } from 'express-validator';

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

export const mongoIdValidator = (
  field: string,
  at: 'param' | 'body' | 'query',
) => {
  const source = at === 'param' ? param : at === 'body' ? body : query;

  return [
    source(field)
      .notEmpty()
      .withMessage(`${field} is required`)
      .isMongoId()
      .withMessage(`Invalid ${field}`),
  ];
};
