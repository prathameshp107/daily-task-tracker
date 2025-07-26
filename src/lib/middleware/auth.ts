import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../db/mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function authenticateToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  // console.log('[AUTH] Request headers:', Object.fromEntries(req.headers.entries()));
  // console.log('[AUTH] Authorization header:', authHeader);
  // console.log('[AUTH] Token:', token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    console.log('[AUTH] No token provided');
    return NextResponse.json(
      { error: 'Authentication required', reason: 'No token provided' },
      { status: 401 }
    );
  }

  // Check if token looks like a JWT (has 3 parts separated by dots)
  if (token.split('.').length !== 3) {
    console.log('[AUTH] Malformed token - not a valid JWT format');
    return NextResponse.json(
      { error: 'Invalid token format', reason: 'Token is not a valid JWT' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // console.log('[AUTH] Decoded JWT payload:', decoded);

    // Type guard for userId
    const userId = (typeof decoded === 'object' && decoded !== null && 'userId' in decoded)
      ? (decoded as JwtPayload & { userId: string }).userId
      : undefined;

    if (!userId) {
      console.log('[AUTH] userId missing in JWT payload');
      return NextResponse.json(
        { error: 'Invalid token', reason: 'userId missing in JWT payload' },
        { status: 403 }
      );
    }

    // Verify user exists in database
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );
    // console.log('[AUTH] User lookup result:', user);

    if (!user) {
      console.log('[AUTH] User not found for userId:', userId);
      return NextResponse.json(
        { error: 'User not found', reason: 'No user with this userId' },
        { status: 404 }
      );
    }

    // Attach user to request object
    return { user };
  } catch (error) {
    console.log('[AUTH] JWT verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired', reason: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Invalid token', reason: error instanceof Error ? error.message : 'Unknown error' },
      { status: 403 }
    );
  }
}
