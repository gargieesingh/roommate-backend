import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminSettingsService {
    /**
     * Get all platform settings
     */
    async getSettings() {
        const settings = await prisma.platformSettings.findMany();

        // Convert to key-value object
        const settingsObj: any = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        return settingsObj;
    }

    /**
     * Update platform settings
     */
    async updateSettings(data: any, adminId: string, ipAddress?: string) {
        // Upsert each setting
        const updates = Object.entries(data).map(([key, value]) =>
            prisma.platformSettings.upsert({
                where: { key },
                update: { value: String(value) },
                create: {
                    key,
                    value: String(value),
                    description: `Setting for ${key}`,
                },
            })
        );

        await Promise.all(updates);

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'UPDATE_SETTINGS',
            entityType: 'SETTINGS',
            entityId: 'platform',
            details: { changes: data },
            ipAddress,
        });

        return this.getSettings();
    }

    /**
     * Get admin team members
     */
    async getAdminTeam() {
        const admins = await prisma.user.findMany({
            where: { isAdmin: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return admins;
    }

    /**
     * Invite new admin (set isAdmin to true)
     */
    async inviteAdmin(email: string, adminId: string, ipAddress?: string) {
        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Update existing user to admin
            user = await prisma.user.update({
                where: { email },
                data: { isAdmin: true },
            });
        } else {
            throw new Error('User not found. Create the user account first.');
        }

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'INVITE_ADMIN',
            entityType: 'USER',
            entityId: user.id,
            details: { email },
            ipAddress,
        });

        return user;
    }

    /**
     * Remove admin access
     */
    async removeAdmin(userId: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isAdmin: false },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'REMOVE_ADMIN',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }
}
