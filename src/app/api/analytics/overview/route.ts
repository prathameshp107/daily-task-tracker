import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('projectId');

    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);

    // Build match query
    const match: any = { userId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    // Add project filter if provided
    if (projectId) {
      match.projectId = new ObjectId(projectId);
    }

    // Get total hours logged
    const totalHours = await db.collection('tasks').aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalHours' } } }
    ]).toArray();

    // Get approved hours
    const approvedHours = await db.collection('tasks').aggregate([
      { $match: { ...match, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$approvedHours' } } }
    ]).toArray();

    // Get tasks by status
    const tasksByStatus = await db.collection('tasks').aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    // Get tasks by project
    const tasksByProject = await db.collection('tasks').aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $group: {
          _id: { projectId: '$projectId', projectName: '$project.name' },
          totalHours: { $sum: '$totalHours' },
          taskCount: { $sum: 1 }
        }
      },
      { $sort: { totalHours: -1 } }
    ]).toArray();

    // Format the response
    const result = {
      totalHoursLogged: totalHours[0]?.total || 0,
      totalApprovedHours: approvedHours[0]?.total || 0,
      taskCountByStatus: tasksByStatus.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      projects: tasksByProject.map(project => ({
        projectId: project._id.projectId,
        projectName: project._id.projectName,
        totalHours: project.totalHours,
        taskCount: project.taskCount
      }))
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
