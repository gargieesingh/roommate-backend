import { z } from 'zod';

/** POST /api/v1/teams - Create team */
export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').max(100, 'Team name must be 100 characters or fewer'),
    description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
    budgetMin: z.number().int().positive('Budget minimum must be positive').optional(),
    budgetMax: z.number().int().positive('Budget maximum must be positive').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    maxMembers: z.number().int().min(2, 'Team must allow at least 2 members').max(10, 'Team cannot have more than 10 members').optional(),
  }).refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: 'Budget minimum must be less than or equal to budget maximum',
      path: ['budgetMin'],
    }
  ),
});

/** PUT /api/v1/teams/:id - Update team */
export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters').max(100, 'Team name must be 100 characters or fewer').optional(),
    description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
    budgetMin: z.number().int().positive('Budget minimum must be positive').optional(),
    budgetMax: z.number().int().positive('Budget maximum must be positive').optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    maxMembers: z.number().int().min(2, 'Team must allow at least 2 members').max(10, 'Team cannot have more than 10 members').optional(),
    isActive: z.boolean().optional(),
  }).refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: 'Budget minimum must be less than or equal to budget maximum',
      path: ['budgetMin'],
    }
  ),
});

/** GET /api/v1/teams - Search teams */
export const searchTeamsSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    budgetMin: z.string().regex(/^\d+$/, 'Budget minimum must be a number').transform(Number).optional(),
    budgetMax: z.string().regex(/^\d+$/, 'Budget maximum must be a number').transform(Number).optional(),
    isActive: z.string().regex(/^(true|false)$/, 'isActive must be true or false').transform((val) => val === 'true').optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  }),
});

/** GET /api/v1/teams/:id - Get team by ID */
export const teamIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid team ID format'),
  }),
});

/** POST /api/v1/teams/:id/members/:userId/accept - Accept member */
/** POST /api/v1/teams/:id/members/:userId/reject - Reject member */
export const memberActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid team ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  }),
});
