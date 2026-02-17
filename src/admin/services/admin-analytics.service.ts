import prisma from '../../config/database';

export class AdminAnalyticsService {
    /**
     * Get overview stats for dashboard
     */
    async getOverviewStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsersToday,
            newUsersThisWeek,
            emailVerifiedCount,
            totalListings,
            activeListings,
            newListingsThisWeek,
            totalTeams,
            pendingReports,
            newReportsToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.user.count({ where: { emailVerified: true } }),
            prisma.listing.count(),
            prisma.listing.count({ where: { isActive: true } }),
            prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.team.count(),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.report.count({ where: { createdAt: { gte: today } } }),
        ]);

        const emailVerificationRate = totalUsers > 0 ? (emailVerifiedCount / totalUsers) * 100 : 0;

        return {
            totalUsers,
            newUsersToday,
            newUsersThisWeek,
            emailVerificationRate: Math.round(emailVerificationRate),
            totalListings,
            activeListings,
            newListingsThisWeek,
            totalTeams,
            pendingReports,
            newReportsToday,
        };
    }

    /**
     * Get user analytics
     */
    async getUserAnalytics(dateRange: string) {
        const { startDate, endDate } = this.parseDateRange(dateRange);

        // Daily new signups
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
                gender: true,
                city: true,
                emailVerified: true,
                phoneVerified: true,
            },
        });

        // Group by date
        const dailySignups = this.groupByDate(users, startDate, endDate);

        // Gender distribution
        const genderCounts = users.reduce((acc: any, user) => {
            const gender = user.gender || 'unknown';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});

        // Top cities
        const cityCounts = users.reduce((acc: any, user) => {
            if (user.city) {
                acc[user.city] = (acc[user.city] || 0) + 1;
            }
            return acc;
        }, {});

        const topCities = Object.entries(cityCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));

        // Verification rates
        const emailVerified = users.filter(u => u.emailVerified).length;
        const phoneVerified = users.filter(u => u.phoneVerified).length;

        return {
            dailySignups,
            genderDistribution: genderCounts,
            topCities,
            verificationRates: {
                email: users.length > 0 ? Math.round((emailVerified / users.length) * 100) : 0,
                phone: users.length > 0 ? Math.round((phoneVerified / users.length) * 100) : 0,
            },
        };
    }

    /**
     * Get listing analytics
     */
    async getListingAnalytics(dateRange: string) {
        const { startDate, endDate } = this.parseDateRange(dateRange);

        const listings = await prisma.listing.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
                type: true,
                city: true,
                rent: true,
                isActive: true,
            },
        });

        // Daily new listings by type
        const dailyListings = this.groupByDate(listings, startDate, endDate, 'type');

        // Top cities
        const cityCounts = listings.reduce((acc: any, listing) => {
            if (listing.city) {
                acc[listing.city] = (acc[listing.city] || 0) + 1;
            }
            return acc;
        }, {});

        const topCities = Object.entries(cityCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));

        // Average rent by city
        const cityRents = listings.reduce((acc: any, listing) => {
            if (listing.city) {
                if (!acc[listing.city]) {
                    acc[listing.city] = { total: 0, count: 0 };
                }
                acc[listing.city].total += listing.rent;
                acc[listing.city].count += 1;
            }
            return acc;
        }, {});

        const avgRentByCity = Object.entries(cityRents).map(([city, data]: any) => ({
            city,
            avgRent: Math.round(data.total / data.count),
        }));

        // Active vs inactive
        const activeCount = listings.filter(l => l.isActive).length;
        const inactiveCount = listings.length - activeCount;

        return {
            dailyListings,
            topCities,
            avgRentByCity,
            activeVsInactive: {
                active: activeCount,
                inactive: inactiveCount,
            },
        };
    }

    /**
     * Get recent activity feed
     */
    async getRecentActivity() {
        const [recentUsers, recentListings, recentTeams, recentReports] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.listing.findMany({
                select: {
                    id: true,
                    title: true,
                    type: true,
                    createdAt: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.team.findMany({
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.report.findMany({
                select: {
                    id: true,
                    reason: true,
                    createdAt: true,
                    reporter: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        // Combine and sort all activities
        const activities: any[] = [
            ...recentUsers.map(u => ({
                type: 'NEW_USER',
                description: `${u.firstName} ${u.lastName} joined`,
                entityId: u.id,
                timestamp: u.createdAt,
            })),
            ...recentListings.map(l => ({
                type: 'NEW_LISTING',
                description: `${l.user.firstName} ${l.user.lastName} created listing: ${l.title}`,
                entityId: l.id,
                timestamp: l.createdAt,
            })),
            ...recentTeams.map(t => ({
                type: 'NEW_TEAM',
                description: `Team created: ${t.name}`,
                entityId: t.id,
                timestamp: t.createdAt,
            })),
            ...recentReports.map(r => ({
                type: 'NEW_REPORT',
                description: `${r.reporter.firstName} ${r.reporter.lastName} submitted a report`,
                entityId: r.id,
                timestamp: r.createdAt,
            })),
        ];

        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
    }

    private parseDateRange(dateRange: string) {
        const now = new Date();
        let startDate: Date;
        let endDate = now;

        switch (dateRange) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return { startDate, endDate };
    }

    private groupByDate(items: any[], startDate: Date, endDate: Date, groupBy?: string) {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const result: any[] = [];

        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayItems = items.filter(item => {
                const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
                return itemDate === dateStr;
            });

            if (groupBy) {
                const grouped = dayItems.reduce((acc: any, item) => {
                    const key = item[groupBy] || 'unknown';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                result.push({ date: dateStr, ...grouped });
            } else {
                result.push({ date: dateStr, count: dayItems.length });
            }
        }

        return result;
    }
}
