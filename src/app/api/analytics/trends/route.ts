import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

type TimeRange = 'day' | 'week' | 'month' | 'year';

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') || 'month') as TimeRange;
    const projectId = searchParams.get('projectId');

    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    let dateFormat = '%Y-%m-%d';

    switch (range) {
      case 'day':
        startDate.setDate(endDate.getDate() - 30); // Last 30 days
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 90); // Last 12-13 weeks
        dateFormat = '%Y-%U'; // Year-WeekNumber
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 12); // Last 12 months
        dateFormat = '%Y-%m';
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 5); // Last 5 years
        dateFormat = '%Y';
        break;
    }

    // Build match query
    const match: any = {
      userId,
      date: { $gte: startDate, $lte: endDate }
    };

    // Add project filter if provided
    if (projectId) {
      match.projectId = new ObjectId(projectId);
    }

    // Get tasks grouped by time period
    const tasksByPeriod = await db.collection('tasks').aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$date',
              timezone: 'UTC'
            }
          },
          totalHours: { $sum: '$totalHours' },
          approvedHours: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$approvedHours', 0]
            }
          },
          taskCount: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $in: ['$status', ['completed', 'approved']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Format the response
    const result = {
      range,
      startDate,
      endDate,
      data: tasksByPeriod.map(period => ({
        period: period._id,
        totalHours: period.totalHours,
        approvedHours: period.approvedHours,
        taskCount: period.taskCount,
        completionRate: period.taskCount > 0 
          ? (period.completedTasks / period.taskCount) * 100 
          : 0
      }))
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
