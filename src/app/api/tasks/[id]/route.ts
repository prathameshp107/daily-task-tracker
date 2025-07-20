import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/tasks/:id - Get task details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/:id - Update task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { 
    projectId, 
    type, 
    description, 
    totalHours, 
    approvedHours, 
    status, 
    note,
    date,
    month
  } = await req.json();

  try {
    const { db } = await connectToDatabase();
    
    // First, get the existing task to verify ownership
    const existingTask = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // If projectId is being updated, verify the new project belongs to the user
    if (projectId && !existingTask.projectId.equals(new ObjectId(projectId))) {
      const project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        userId: new ObjectId(authResponse.user._id)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = { updatedAt: new Date() };
    
    if (projectId) updateData.projectId = new ObjectId(projectId);
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (totalHours !== undefined) updateData.totalHours = totalHours;
    if (approvedHours !== undefined) updateData.approvedHours = approvedHours;
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    if (date) updateData.date = new Date(date);
    if (month) updateData.month = month;

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'in-progress', 'completed', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid task status' },
          { status: 400 }
        );
      }
    }

    // Update task
    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    
    // Verify task exists and belongs to user
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(authResponse.user._id)
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    await db.collection('tasks').deleteOne({
      _id: new ObjectId(params.id)
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
