import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

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
