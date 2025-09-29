import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status'); // 'active', 'inactive', or 'all'

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.email = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (leagueId && leagueId !== 'all') {
      whereClause.leagueId = parseInt(leagueId);
    }

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.newsletterSubscription.count({
      where: whereClause
    });

    // Get subscriptions with pagination
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        leagueId: true,
        isActive: true,
        createdAt: true,
        lastSentAt: true
      }
    });

    // Get league statistics
    const leagueStats = await prisma.newsletterSubscription.groupBy({
      by: ['leagueId'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get overall statistics
    const stats = await prisma.newsletterSubscription.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: {
          totalActive: stats._count.id,
          totalAll: totalCount,
          leagueBreakdown: leagueStats
        }
      }
    });

  } catch (error) {
    console.error('Admin emails fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email subscriptions' },
      { status: 500 }
    );
  }
}

// Export email list as CSV
export async function POST(request: NextRequest) {
  try {
    const { format = 'json', filters = {} } = await request.json();

    // Build where clause based on filters
    const whereClause: any = {};

    if (filters.search) {
      whereClause.email = {
        contains: filters.search,
        mode: 'insensitive'
      };
    }

    if (filters.leagueId && filters.leagueId !== 'all') {
      whereClause.leagueId = parseInt(filters.leagueId);
    }

    if (filters.status === 'active') {
      whereClause.isActive = true;
    } else if (filters.status === 'inactive') {
      whereClause.isActive = false;
    }

    // Get all matching subscriptions
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        leagueId: true,
        isActive: true,
        createdAt: true,
        lastSentAt: true
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Email', 'League ID', 'Status', 'Created At', 'Last Sent At'];
      const csvData = subscriptions.map(sub => [
        sub.id,
        sub.email,
        sub.leagueId,
        sub.isActive ? 'Active' : 'Inactive',
        sub.createdAt.toISOString(),
        sub.lastSentAt ? sub.lastSentAt.toISOString() : 'Never'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fpl-emails-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
      exportedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin emails export error:', error);
    return NextResponse.json(
      { error: 'Failed to export email subscriptions' },
      { status: 500 }
    );
  }
}