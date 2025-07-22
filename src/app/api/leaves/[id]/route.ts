import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// PUT /api/leaves/:id - Update a leave entry
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);
    const leaveId = new ObjectId(params.id);
    const body = await req.json();

    // Validate required fields
    if (!body.date || !body.type) {
      return NextResponse.json(
        { error: 'Date and type are required' },
        { status: 400 }
      );
    }

    // Validate leave type
    const validTypes = ['vacation', 'sick', 'personal', 'other'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid leave type' },
        { status: 400 }
      );
    }

    // Verify the leave entry exists and belongs to the user
    const existingLeave = await db.collection('leaves').findOne({
      _id: leaveId,
      userId
    });

    if (!existingLeave) {
      return NextResponse.json(
        { error: 'Leave entry not found or access denied' },
        { status: 404 }
      );
    }

    // Update the leave entry
    const updateData = {
      date: body.date,
      type: body.type,
      notes: body.notes || '',
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('leaves').updateOne(
      { _id: leaveId, userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Leave entry not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch and return the updated leave entry
    const updatedLeave = await db.collection('leaves').findOne({
      _id: leaveId,
      userId
    });

    return NextResponse.json({
      _id: updatedLeave._id.toString(),
      userId: updatedLeave.userId.toString(),
      date: updatedLeave.date,
      type: updatedLeave.type,
      notes: updatedLeave.notes,
      createdAt: updatedLeave.createdAt,
      updatedAt: updatedLeave.updatedAt
    });
  } catch (error) {
    console.error('Error updating leave entry:', error);
    return NextResponse.json(
      { error: 'Failed to update leave entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/leaves/:id - Delete a leave entry
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
    const userId = new ObjectId(authResponse.user._id);
    const leaveId = new ObjectId(params.id);

    // Verify the leave entry exists and belongs to the user
    const leave = await db.collection('leaves').findOne({
      _id: leaveId,
      userId
    });

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave entry not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the leave entry
    const result = await db.collection('leaves').deleteOne({
      _id: leaveId,
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete leave entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Leave entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave entry' },
      { status: 500 }
    );
  }
}
