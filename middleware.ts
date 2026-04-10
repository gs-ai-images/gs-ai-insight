import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // 1. IP Whitelisting
  const allowedIpsString = process.env.ALLOWED_IPS;
  
  if (allowedIpsString) {
    const allowedIps = allowedIpsString.split(',').map(ip => ip.trim());
    
    // Get the IP address from headers (Vercel uses x-real-ip or x-forwarded-for)
    let ip = (request as any).ip || 
             request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for') || 
             '127.0.0.1';
             
    // Handle Vercel multiple IPs in forwarded-for
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Check if the current IP is in the allowed list
    if (!allowedIps.includes(ip) && ip !== '::1' && ip !== '127.0.0.1') {
      console.log(`Access denied for IP: ${ip}`);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Access Denied', 
          message: '이 사이트는 사내 네트워크에서만 접근 가능합니다.' 
        }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 2. Global Authentication check
  const pathname = request.nextUrl.pathname;
  
  // Publicly accessible paths (don't block login, auth endpoints, static assets, or scheduled tasks)
  const isPublicPath = pathname.startsWith('/login') || 
                       pathname.startsWith('/api/auth') ||
                       pathname.startsWith('/api/cron');
                       
  if (!isPublicPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_development" 
    });
    
    if (!token) {
      // User is not logged in, redirect to login page
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // Also avoid intercepting image files manually if extended
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
