import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createTeamSchema,
  updateTeamSchema,
  searchTeamsSchema,
  teamIdParamSchema,
  memberActionSchema,
} from '../validators/team.validator';

const router = Router();
const teamController = new TeamController();

// ─── Public routes ──────────────────────────────────────────

/** GET /api/v1/teams - Browse teams */
router.get(
  '/',
  validate(searchTeamsSchema),
  teamController.search.bind(teamController)
);

/** GET /api/v1/teams/:id - Get team details */
router.get(
  '/:id',
  validate(teamIdParamSchema),
  teamController.getById.bind(teamController)
);

// ─── Protected routes (require valid JWT) ───────────────────

/** POST /api/v1/teams - Create team */
router.post(
  '/',
  authenticate,
  validate(createTeamSchema),
  teamController.create.bind(teamController)
);

/** GET /api/v1/teams/my-teams - Get current user's teams */
router.get(
  '/my-teams',
  authenticate,
  teamController.getMyTeams.bind(teamController)
);

/** PUT /api/v1/teams/:id - Update team */
router.put(
  '/:id',
  authenticate,
  validate(teamIdParamSchema),
  validate(updateTeamSchema),
  teamController.update.bind(teamController)
);

/** DELETE /api/v1/teams/:id - Delete team */
router.delete(
  '/:id',
  authenticate,
  validate(teamIdParamSchema),
  teamController.delete.bind(teamController)
);

/** POST /api/v1/teams/:id/join - Request to join team */
router.post(
  '/:id/join',
  authenticate,
  validate(teamIdParamSchema),
  teamController.join.bind(teamController)
);

/** POST /api/v1/teams/:id/members/:userId/accept - Accept member */
router.post(
  '/:id/members/:userId/accept',
  authenticate,
  validate(memberActionSchema),
  teamController.acceptMember.bind(teamController)
);

/** POST /api/v1/teams/:id/members/:userId/reject - Reject member */
router.post(
  '/:id/members/:userId/reject',
  authenticate,
  validate(memberActionSchema),
  teamController.rejectMember.bind(teamController)
);

/** POST /api/v1/teams/:id/leave - Leave team */
router.post(
  '/:id/leave',
  authenticate,
  validate(teamIdParamSchema),
  teamController.leave.bind(teamController)
);

export default router;
