import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '../../../../lib/validations/auth'
import { AuthResponse, User } from '../../../../lib/types/auth'

/**
 * Mock user database for development
 * In production, this would be replaced with actual database queries
 */
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123', // In production, this would be hashed
    name: 'Demo User',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

/**
 * Generate a mock JWT token for development
 * In production, use a proper JWT library with secret signing
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
  return btoa(`refresh-${Date.now()}-${Math.random()}`)
}

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationResult.error.issues 
        },
        { status: 422 }
      )
    }

    const { email, password } = validationResult.data

    // Find user in mock database
    const user = MOCK_USERS.find(u => u.email === email)
    
    if (!user || user.password !== password) {
      // Simulate realistic delay for failed authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Simulate realistic delay for successful authentication
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create user object without password
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    // Generate tokens
    const token = generateMockToken(userResponse)
    const refreshToken = generateMockRefreshToken()

    const authResponse: AuthResponse = {
      token,
      user: userResponse,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      refreshToken,
    }

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}