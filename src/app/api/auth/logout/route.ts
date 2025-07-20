import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // For stateless JWT, logout is handled client-side by deleting the token.
  // If using refresh tokens, you would invalidate the token here.
  return NextResponse.json({ success: true });
}