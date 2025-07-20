import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    
    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' }, 
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find user with valid reset token
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    // Update user password and clear reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          // Clear the reset token fields
          resetToken: undefined,
          resetTokenExpires: undefined
        } 
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
