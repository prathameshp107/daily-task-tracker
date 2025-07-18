import { NextRequest, NextResponse } from 'next/server'
import { AuthResponse, User } from '../../../../lib/types/auth'

/**
 * Mock refresh token storage for development
 * In production, this would be stored in a database with expiration
 */
const MOCK_REFRESH_TOKENS = new Set<string>()

/**
 * Mock user data for token refresh
 */
const MOCK_USER: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  avatar: undefined,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * Generate a mock JWT token for development
 */
function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }))
  const signature = btoa('mock-signature-for-development')
  
  return `${header}.${payload}.${signature}`
}

/**
 * Generate a mock refresh token
 */
function generateMockRefreshToken(): string {
  const token = btoa(`refresh-${Date.now()}-${Math.random()}`)
  MOCK_REFRESH_TOKENS.add(token)
  return token
}

/**
 * POST /api/auth/refresh
 * Refresh the authentication token using a refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // In production, validate refresh token against database
    // For development, we'll accept any refresh token that looks valid
    if (!refreshToken.startsWith('cmVmcmVzaC0=')) { // base64 encoded "refresh-"
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Simulate realistic delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Generate new tokens
    const newToken = generateMockToken(MOCK_USER)
    const newRefreshToken = generateMockRefreshToken()

    const authResponse: AuthResponse = {
      token: newToken,
      user: MOCK_USER,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      refreshToken: newRefreshToken,
    }

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Token refresh API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}