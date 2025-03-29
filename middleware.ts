import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client
    const { supabase, supabaseResponse } = createClient(request);
    
    // This will refresh session if expired - necessary for auth
    await supabase.auth.getSession();
    
    return supabaseResponse;
  } catch (e) {
    // If there's an error, just continue
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

// Only run the middleware on auth-related routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 