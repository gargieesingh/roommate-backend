import { PrismaClient, TeamRole, TeamMemberStatus } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface CreateTeamData {
  name: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  maxMembers?: number;
}

interface UpdateTeamData {
  name?: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  maxMembers?: number;
  isActive?: boolean;
}

interface SearchTeamsFilters {
  city?: string;
  budgetMin?: number;
  budgetMax?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class TeamService {
  /**
   * Create a new team with the creator as the leader
   */
  async createTeam(leaderId: string, data: CreateTeamData) {
    // Validate budget range
    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new AppError('Budget minimum cannot be greater than budget maximum', 400);
    }

    const team = await prisma.team.create({
      data: {
        ...data,
        members: {
          create: {
            userId: leaderId,
            role: TeamRole.LEADER,
            status: TeamMemberStatus.ACCEPTED,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                city: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  /**
   * Search teams with filters
   */
  async getTeams(filters: SearchTeamsFilters) {
    const { city, budgetMin, budgetMax, isActive = true, page = 1, limit = 20 } = filters;
    
    // Ensure page and limit are numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (budgetMin !== undefined || budgetMax !== undefined) {
      where.AND = [];
      if (budgetMin !== undefined) {
        where.AND.push({ budgetMax: { gte: budgetMin } });
      }
      if (budgetMax !== undefined) {
        where.AND.push({ budgetMin: { lte: budgetMax } });
      }
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          members: {
            where: { status: TeamMemberStatus.ACCEPTED },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePhoto: true,
                },
              },
            },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.team.count({ where }),
    ]);

    return {
      teams,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get team by ID with all members
   */
  async getTeamById(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                city: true,
                age: true,
                occupation: true,
              },
            },
          },
          orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    return team;
  }

  /**
   * Update team (leader only)
   */
  async updateTeam(teamId: string, userId: string, data: UpdateTeamData) {
    // Verify user is the leader
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        role: TeamRole.LEADER,
        status: TeamMemberStatus.ACCEPTED,
      },
    });

    if (!membership) {
      throw new AppError('Only team leader can update the team', 403);
    }

    // Validate budget range if both provided
    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new AppError('Budget minimum cannot be greater than budget maximum', 400);
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  /**
   * Delete team (soft delete - set isActive to false)
   */
  async deleteTeam(teamId: string, userId: string) {
    // Verify user is the leader
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        role: TeamRole.LEADER,
        status: TeamMemberStatus.ACCEPTED,
      },
    });

    if (!membership) {
      throw new AppError('Only team leader can delete the team', 403);
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { isActive: false },
    });
  }

  /**
   * Request to join a team
   */
  async joinTeam(teamId: string, userId: string) {
    // Check if team exists and is active
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { status: TeamMemberStatus.ACCEPTED },
        },
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    if (!team.isActive) {
      throw new AppError('This team is no longer active', 400);
    }

    // Check if already a member
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === TeamMemberStatus.PENDING) {
        throw new AppError('You already have a pending request to join this team', 400);
      }
      if (existingMembership.status === TeamMemberStatus.ACCEPTED) {
        throw new AppError('You are already a member of this team', 400);
      }
      // If rejected, allow re-joining
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      throw new AppError('This team is already full', 400);
    }

    // Create or update membership
    const membership = await prisma.teamMember.upsert({
      where: {
        teamId_userId: { teamId, userId },
      },
      create: {
        teamId,
        userId,
        role: TeamRole.MEMBER,
        status: TeamMemberStatus.PENDING,
      },
      update: {
        status: TeamMemberStatus.PENDING,
      },
    });

    return membership;
  }

  /**
   * Accept a member request (leader only)
   */
  async acceptMember(teamId: string, leaderId: string, memberId: string) {
    // Verify requester is the leader
    const leaderMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: leaderId,
        role: TeamRole.LEADER,
        status: TeamMemberStatus.ACCEPTED,
      },
    });

    if (!leaderMembership) {
      throw new AppError('Only team leader can accept members', 403);
    }

    // Check if team is full
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { status: TeamMemberStatus.ACCEPTED },
        },
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    if (team.members.length >= team.maxMembers) {
      throw new AppError('Team is already full', 400);
    }

    // Update member status
    const membership = await prisma.teamMember.update({
      where: {
        teamId_userId: { teamId, userId: memberId },
      },
      data: {
        status: TeamMemberStatus.ACCEPTED,
      },
    });

    return membership;
  }

  /**
   * Reject a member request (leader only)
   */
  async rejectMember(teamId: string, leaderId: string, memberId: string) {
    // Verify requester is the leader
    const leaderMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: leaderId,
        role: TeamRole.LEADER,
        status: TeamMemberStatus.ACCEPTED,
      },
    });

    if (!leaderMembership) {
      throw new AppError('Only team leader can reject members', 403);
    }

    // Update member status
    const membership = await prisma.teamMember.update({
      where: {
        teamId_userId: { teamId, userId: memberId },
      },
      data: {
        status: TeamMemberStatus.REJECTED,
      },
    });

    return membership;
  }

  /**
   * Leave a team
   */
  async leaveTeam(teamId: string, userId: string) {
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this team', 404);
    }

    // Leaders cannot leave, they must delete the team or transfer leadership
    if (membership.role === TeamRole.LEADER) {
      throw new AppError('Team leaders cannot leave. Please delete the team or transfer leadership first.', 400);
    }

    // Delete membership
    await prisma.teamMember.delete({
      where: {
        teamId_userId: { teamId, userId },
      },
    });
  }

  /**
   * Get user's teams
   */
  async getMyTeams(userId: string) {
    const memberships = await prisma.teamMember.findMany({
      where: {
        userId,
        status: TeamMemberStatus.ACCEPTED,
      },
      include: {
        team: {
          include: {
            members: {
              where: { status: TeamMemberStatus.ACCEPTED },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePhoto: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
    }));
  }
}
