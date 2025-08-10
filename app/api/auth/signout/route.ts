import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear authentication cookies
  const cookieStore = await cookies()
  
  // Clear Convex auth cookies
  cookieStore.delete('__convexAuthJWT')
  cookieStore.delete('__convexAuthRefreshToken')
  
  // Return success response
  return NextResponse.json({ success: true })
}