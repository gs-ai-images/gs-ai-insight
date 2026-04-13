import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // 0. Block Vercel domains totally (since we are moving to intranet only)
  const hostname = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  if (hostname.includes('vercel.app')) {
    return new NextResponse(
      `
        <html>
          <head>
            <meta charset="utf-8">
            <title>서비스 이전 안내</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; background: #050505; color: white; }
              .container { max-width: 600px; margin: 0 auto; background: #111; padding: 40px; border-radius: 10px; border: 1px solid #333; }
              h1 { color: #f87171; }
              p { line-height: 1.6; color: #aaa; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ 서비스 이전 완료</h1>
              <p>사내 보안 정책에 따라 외부 클라우드 접속(Vercel)이 전면 차단되었습니다.</p>
              <p>이 웹사이트는 이제 <strong>사내 전용 네트워크</strong>에서만 접속 가능합니다. 사내 인트라넷 IP 주소를 사용해 주시기 바랍니다.</p>
            </div>
          </body>
        </html>
      `,
      { status: 403, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

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
