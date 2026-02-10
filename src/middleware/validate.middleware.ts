import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Express middleware factory that validates the request against a Zod schema.
 * Returns 400 with field-level errors if validation fails.
 * Compatible with Zod v4 API.
 * @param schema - Zod schema to validate against (should wrap body/query/params)
 */
export const validate = (schema: z.ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
