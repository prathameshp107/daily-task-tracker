import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

type LeaveType = 'vacation' | 'sick' | 'personal' | 'other';

// GET /api/leaves - List all leave entries for the authenticated user
export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as LeaveType | null;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);

    // Build query
    const query: any = { userId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    const leaves = await db.collection('leaves')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const formattedLeaves = leaves.map(leave => ({
      ...leave,
      _id: leave._id.toString(),
      userId: leave.userId.toString(),
      date: leave.date.toISOString().split('T')[0]
    }));

    return NextResponse.json({
      success: true,
      data: formattedLeaves
    });
  } catch (error) {
    console.error('Error fetching leave entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave entries' },
      { status: 500 }
    );
  }
}

// POST /api/leaves - Create a new leave entry
export async function POST(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  if ('error' in authResponse) {
    return authResponse;
  }

  const { date, type = 'vacation', notes = '' } = await req.json();
  
  // Validate required fields
  if (!date) {
    return NextResponse.json(
      { error: 'Date is required' },
      { status: 400 }
    );
  }

  // Validate leave type
  const validLeaveTypes: LeaveType[] = ['vacation', 'sick', 'personal', 'other'];
  if (!validLeaveTypes.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid leave type' },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(authResponse.user._id);
    const leaveDate = new Date(date);
    
    // Check if leave entry already exists for this date and user
    const existingLeave = await db.collection('leaves').findOne({
      userId,
      date: {
        $gte: new Date(leaveDate.setHours(0, 0, 0, 0)),
        $lt: new Date(leaveDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingLeave) {
      return NextResponse.json(
        { error: 'A leave entry already exists for this date' },
        { status: 400 }
      );
    }

    // Create new leave entry
    const leave = {
      userId,
      date: new Date(date),
      type,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('leaves').insertOne(leave);
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          ...leave,
          _id: result.insertedId.toString(),
          userId: leave.userId.toString(),
          date: leave.date.toISOString().split('T')[0]
        },
        message: 'Leave entry created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating leave entry:', error);
    return NextResponse.json(
      { error: 'Failed to create leave entry' },
      { status: 500 }
    );
  }
}
