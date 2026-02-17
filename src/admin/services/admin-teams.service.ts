import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminTeamsService {
    async getTeams(params: {
        page?: number;
        limit?: number;
        search?: string;
        city?: string;
        status?: string;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.search) {
            where.name = { contains: params.search, mode: 'insensitive' };
        }

        if (params.city) {
            where.city = { contains: params.city, mode: 'insensitive' };
        }

        if (params.status === 'active') {
            where.isActive = true;
        } else if (params.status === 'inactive') {
            where.isActive = false;
        }

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where,
                include: {
                    members: {
                        where: { status: 'ACCEPTED' },
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
                        select: {
                            members: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.team.count({ where }),
        ]);

        return {
            teams,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

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
                                email: true,
                                profilePhoto: true,
                                city: true,
                            },
                        },
                    },
                },
            },
        });

        if (!team) {
            throw new Error('Team not found');
        }

        return team;
    }

    async removeTeamMember(teamId: string, userId: string, adminId: string, ipAddress?: string) {
        await prisma.teamMember.deleteMany({
            where: {
                teamId,
                userId,
            },
        });

        await auditLogService.log({
            adminId,
            actionType: 'REMOVE_TEAM_MEMBER',
            entityType: 'TEAM',
            entityId: teamId,
            details: { removedUserId: userId },
            ipAddress,
        });
    }

    async deleteTeam(teamId: string, adminId: string, ipAddress?: string) {
        await prisma.team.delete({ where: { id: teamId } });

        await auditLogService.log({
            adminId,
            actionType: 'DELETE_TEAM',
            entityType: 'TEAM',
            entityId: teamId,
            ipAddress,
        });
    }
}
