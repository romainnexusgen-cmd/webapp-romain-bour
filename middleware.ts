import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  const header = req.headers.get('authorization') ?? ''
  if (password && header.startsWith('Basic ')) {
    const [, pass] = atob(header.slice(6)).split(':')
    if (pass === password) return NextResponse.next()
  }
  return new NextResponse('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Optin.ia admin"' },
  })
}

export const config = { matcher: ['/admin/:path*'] }
