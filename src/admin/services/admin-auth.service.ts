import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { generateAdminAccessToken, generateAdminRefreshToken } from '../utils/admin-jwt.util';

export class AdminAuthService {
    /**
     * Admin login - verify credentials and confirm admin status
     */
    async login(email: string, password: string) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                isActive: true,
                isBanned: true,
                suspendedUntil: true,
            },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if user has a password set (might be OAuth user)
        if (!user.passwordHash) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Check if user is an admin
        if (!user.isAdmin) {
            throw new Error('Access denied. Admin privileges required.');
        }

        // Check if account is active
        if (!user.isActive) {
            throw new Error('Account is inactive');
        }

        // Check if account is banned
        if (user.isBanned) {
            throw new Error('Account is banned');
        }

        // Check if account is suspended
        if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
            throw new Error('Account is suspended');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const accessToken = generateAdminAccessToken({
            userId: user.id,
            email: user.email,
        });

        const refreshToken = generateAdminRefreshToken({
            userId: user.id,
            email: user.email,
        });

        // Return admin data and tokens
        return {
            admin: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
            },
            token: accessToken,
            refreshToken,
        };
    }

    /**
     * Get current admin profile
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user || !user.isAdmin) {
            throw new Error('Admin not found');
        }

        return user;
    }
}
