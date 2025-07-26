import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  // If authResponse is a NextResponse, it means there was an error
  if ('error' in authResponse) {
    return authResponse;
  }

  // Return user profile (password is already excluded in the auth middleware)
  // Add integrationMode to the response if present
  const user = authResponse.user;
  return NextResponse.json({
    success: true,
    data: {
      ...user,
      integrationMode: user.integrationMode || 'manual',
    }
  });
}

export async function PUT(req: NextRequest) {
  const authResponse = await authenticateToken(req);
  
  // If authResponse is a NextResponse, it means there was an error
  if ('error' in authResponse) {
    return authResponse;
  }

  const { name, email, avatar, integrationMode } = await req.json();
  
  // Validate input
  if (!name && !email && !avatar && !integrationMode) {
    return NextResponse.json(
      { error: 'At least one field (name, email, avatar, or integrationMode) is required' },
      { status: 400 }
    );
  }

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  const { db } = await connectToDatabase();
  const updateData: any = { updatedAt: new Date() };
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (avatar) updateData.avatar = avatar;
  if (integrationMode) updateData.integrationMode = integrationMode;

  try {
    // Check if email is already taken by another user
    if (email && email !== authResponse.user.email) {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update user
    const result = await db.collection('users').findOneAndUpdate(
      { _id: authResponse.user._id },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        integrationMode: updateData.integrationMode || result.integrationMode || 'manual',
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}