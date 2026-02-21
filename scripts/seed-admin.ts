/**
 * Admin Seed Script
 * Creates an admin user in the database for testing
 * Run: npx ts-node scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@matesvilla.com';
const ADMIN_PASSWORD = 'Admin@123456';

async function seedAdmin() {
    console.log('🌱 Seeding admin user...');

    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
        if (!existing.isAdmin) {
            // Upgrade to admin
            await prisma.user.update({
                where: { email: ADMIN_EMAIL },
                data: { isAdmin: true },
            });
            console.log(`✅ Upgraded existing user "${ADMIN_EMAIL}" to admin.`);
        } else {
            console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists. Skipping.`);
        }
    } else {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                passwordHash,
                firstName: 'Super',
                lastName: 'Admin',
                isAdmin: true,
                isActive: true,
                emailVerified: true,
                authProvider: 'email',
            },
        });
        console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    }

    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('🌐 Admin Panel URL: http://localhost:8080/admin/login');

    await prisma.$disconnect();
}

seedAdmin().catch((e) => {
    console.error('❌ Seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
});
