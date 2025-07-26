import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

interface AuthUser {
  user: { _id: string | ObjectId }
}

// Type guard for authResponse
function isAuthSuccess(response: unknown): response is AuthUser {
  return (
    typeof response === 'object' &&
    response !== null &&
    'user' in response &&
    typeof (response as { user?: unknown }).user === 'object' &&
    (response as { user?: unknown }).user !== null &&
    (
      typeof ((response as { user: { _id?: unknown } }).user._id) === 'string' ||
      ((response as { user: { _id?: unknown } }).user._id instanceof ObjectId)
    )
  );
}

// GET /api/tasks/redmine - List all Redmine tasks for the authenticated user with filters
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }
  if (!('user' in authResponse) || !authResponse.user || !authResponse.user._id) {
    return NextResponse.json({ error: 'Unauthorized', reason: 'No user in authResponse' }, { status: 401 });
  }
  const userId = authResponse.user._id;

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const type = searchParams.get('type');

    const { db } = await connectToDatabase();
    const query: Record<string, unknown> = { userId: new ObjectId(userId) };

    // Apply filters if provided
    if (projectId) {
      query.projectId = new ObjectId(projectId);
    }
    if (status) {
      query.status = status;
    }
    if (month) {
      query.month = month; // Format: 'YYYY-MM'
    }
    if (type) {
      query.type = type;
    }

    const tasks = await db.collection('redmine_tasks')
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    // Fetch all projects for the user to map projectId to project name
    const projects = await db.collection('projects')
      .find({ userId: new ObjectId(userId) })
      .toArray();
    const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));

    // Add projectName to each task and format for UI compatibility
    const tasksWithProjectName = tasks.map(task => ({
      ...task,
      id: task._id.toString(),
      title: task.description || task.redmineData?.subject || 'Untitled Task',
      project: projectMap.get(task.projectId?.toString?.()) || null,
      projectName: projectMap.get(task.projectId?.toString?.()) || null,
      reporterId: task.redmineData?.author?.id?.toString() || '',
    }));

    return NextResponse.json({
      success: true,
      data: tasksWithProjectName
    });
  } catch (error) {
    console.error('Error fetching Redmine tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Redmine tasks' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/redmine - Delete all Redmine tasks for the authenticated user
export async function DELETE(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  if (!isAuthSuccess(authResponse)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = authResponse.user._id;

  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('redmine_tasks').deleteMany({
      userId: new ObjectId(userId)
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} Redmine tasks`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting Redmine tasks:', error);
    return NextResponse.json(
      { error: 'Failed to delete Redmine tasks' },
      { status: 500 }
    );
  }
}