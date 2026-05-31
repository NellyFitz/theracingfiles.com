import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/creator/dashboard', '/creator/submit', '/creator/submissions'];
const ADMIN_PROTECTED = ['/admin'];
const DWS_PATHS = ['/dws'];

export async function proxy(request: NextRequest) {
  // Skip auth check if Supabase isn't configured yet
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isCreatorProtected = PROTECTED.some((p) => path.startsWith(p));
  const isAdminProtected = ADMIN_PROTECTED.some((p) => path.startsWith(p));
  const isDws = path.startsWith('/dws') && !path.startsWith('/dws/login');

  // DWS cookie gate — enforced at proxy level before any page renders
  if (isDws) {
    const dwsSession = request.cookies.get('dws_session')?.value;
    if (dwsSession !== 'dws-active') {
      const url = request.nextUrl.clone();
      url.pathname = '/dws/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!user && (isCreatorProtected || isAdminProtected)) {
    const url = request.nextUrl.clone();
    url.pathname = '/creator/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (user && isAdminProtected) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!adminEmail || user.email !== adminEmail) {
      const url = request.nextUrl.clone();
      url.pathname = '/creator/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/creator/dashboard',
    '/creator/submit',
    '/creator/submissions/:path*',
    '/admin/:path*',
    '/dws',
    '/dws/:path*',
  ],
};
