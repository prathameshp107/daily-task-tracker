import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

interface AuthUser {
  user: { _id: string }
}

// Type guard for authResponse
function isAuthSuccess(response: unknown): response is AuthUser {
  return (
    typeof response === 'object' &&
    response !== null &&
    'user' in response &&
    typeof (response as { user?: unknown }).user === 'object' &&
    (response as { user?: unknown }).user !== null &&
    typeof ((response as { user: { _id?: unknown } }).user._id) === 'string'
  );
}

// GET /api/tasks - List all tasks for the authenticated user with filters
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  console.log('[TASKS] authResponse:', authResponse);
  
  if ('error' in authResponse) {
    return authResponse;
  }
  if (!('user' in authResponse) || !authResponse.user || !authResponse.user._id) {
    console.log('[TASKS] No user in authResponse:', authResponse);
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

    const tasks = await db.collection('tasks')
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  if (!isAuthSuccess(authResponse)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = authResponse.user._id;

  const { 
    projectId, 
    type, 
    description, 
    totalHours, 
    approvedHours, 
    status = 'pending', 
    note = '',
    date = new Date().toISOString().split('T')[0],
    month = new Date().toISOString().slice(0, 7) // YYYY-MM format
  } = await req.json();
  
  // Validate required fields
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    );
  }

  if (!type) {
    return NextResponse.json(
      { error: 'Task type is required' },
      { status: 400 }
    );
  }

  // Validate status
  const validStatuses = ['pending', 'in-progress', 'completed', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid task status' },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    // Verify project exists and belongs to user
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      userId: new ObjectId(userId)
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create new task
    const task = {
      projectId: new ObjectId(projectId),
      userId: new ObjectId(userId),
      type,
      description: description || '',
      totalHours: totalHours || 0,
      approvedHours: approvedHours || 0,
      status,
      note,
      date: new Date(date),
      month,
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('tasks').insertOne(task);
    
    return NextResponse.json(
      { 
        success: true, 
        data: { ...task, _id: result.insertedId },
        message: 'Task created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
