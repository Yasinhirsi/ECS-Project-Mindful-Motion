import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    // If the cookie is updated, update the cookies for the request and response
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    // If the cookie is removed, update the cookies for the request and response
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If no session and user is trying to access protected routes, redirect to home
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/consultations') ||
        req.nextUrl.pathname.startsWith('/patients') ||
        req.nextUrl.pathname.startsWith('/fitness') ||
        req.nextUrl.pathname.startsWith('/emotion-analysis') ||
        req.nextUrl.pathname.startsWith('/daily-checkin') ||
        req.nextUrl.pathname.startsWith('/availability') ||
        req.nextUrl.pathname.startsWith('/profile') ||
        req.nextUrl.pathname.startsWith('/settings')

    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // If session exists and user is trying to access auth pages, redirect to dashboard
    const isAuthRoute = req.nextUrl.pathname === '/' && req.nextUrl.search === ''

    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
} 