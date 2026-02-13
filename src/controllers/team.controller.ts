import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';

const teamService = new TeamService();

export class TeamController {
  /** GET /api/v1/teams - Browse teams */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;
      const result = await teamService.getTeams(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/teams - Create team */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const team = await teamService.createTeam(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/teams/:id - Get team details */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);

      res.json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/teams/:id - Update team */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const team = await teamService.updateTeam(id, userId, req.body);

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/teams/:id - Delete team */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await teamService.deleteTeam(id, userId);

      res.json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/teams/:id/join - Request to join team */
  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const membership = await teamService.joinTeam(id, userId);

      res.json({
        success: true,
        message: 'Join request sent successfully',
        data: { membership },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/teams/:id/members/:userId/accept - Accept member */
  async acceptMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId: memberId } = req.params;
      const leaderId = req.user!.userId;
      const membership = await teamService.acceptMember(id, leaderId, memberId);

      res.json({
        success: true,
        message: 'Member accepted successfully',
        data: { membership },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/teams/:id/members/:userId/reject - Reject member */
  async rejectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId: memberId } = req.params;
      const leaderId = req.user!.userId;
      const membership = await teamService.rejectMember(id, leaderId, memberId);

      res.json({
        success: true,
        message: 'Member rejected',
        data: { membership },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/teams/:id/leave - Leave team */
  async leave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await teamService.leaveTeam(id, userId);

      res.json({
        success: true,
        message: 'You have left the team',
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/teams/my-teams - Get current user's teams */
  async getMyTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const teams = await teamService.getMyTeams(userId);

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      next(error);
    }
  }
}
