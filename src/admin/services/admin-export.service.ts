import prisma from '../../config/database';

export class AdminExportService {
    /**
     * Export users as CSV
     */
    async exportUsers(params: any): Promise<string> {
        const where: any = {};

        // Apply same filters as getUsers
        if (params.search) {
            where.OR = [
                { email: { contains: params.search, mode: 'insensitive' } },
                { firstName: { contains: params.search, mode: 'insensitive' } },
                { lastName: { contains: params.search, mode: 'insensitive' } },
            ];
        }

        if (params.status === 'active') {
            where.isActive = true;
            where.isBanned = false;
        } else if (params.status === 'banned') {
            where.isBanned = true;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                age: true,
                gender: true,
                city: true,
                occupation: true,
                emailVerified: true,
                phoneVerified: true,
                isActive: true,
                isBanned: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Convert to CSV
        const headers = [
            'ID',
            'Email',
            'Phone',
            'First Name',
            'Last Name',
            'Age',
            'Gender',
            'City',
            'Occupation',
            'Email Verified',
            'Phone Verified',
            'Active',
            'Banned',
            'Created At',
        ];

        const rows = users.map(user => [
            user.id,
            user.email,
            user.phone || '',
            user.firstName || '',
            user.lastName || '',
            user.age || '',
            user.gender || '',
            user.city || '',
            user.occupation || '',
            user.emailVerified,
            user.phoneVerified,
            user.isActive,
            user.isBanned,
            user.createdAt.toISOString(),
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return csv;
    }

    /**
     * Export listings as CSV
     */
    async exportListings(params: any): Promise<string> {
        const where: any = {};

        if (params.type) {
            where.type = params.type;
        }

        if (params.status === 'active') {
            where.isActive = true;
        } else if (params.status === 'inactive') {
            where.isActive = false;
        }

        const listings = await prisma.listing.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const headers = [
            'ID',
            'Title',
            'Type',
            'City',
            'Rent',
            'Deposit',
            'Owner Email',
            'Owner Name',
            'Active',
            'Flagged',
            'View Count',
            'Created At',
        ];

        const rows = listings.map(listing => [
            listing.id,
            listing.title,
            listing.type,
            listing.city,
            listing.rent,
            listing.deposit,
            listing.user.email,
            `${listing.user.firstName} ${listing.user.lastName}`,
            listing.isActive,
            listing.isFlagged,
            listing.viewCount,
            listing.createdAt.toISOString(),
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return csv;
    }
}
