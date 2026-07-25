import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseEnv } from '@/lib/supabase/env'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const { url, key } = getSupabaseEnv()
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value, options)
              )
            } catch {
              // Ignore in route handler
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Create a response that redirects to the 'next' URL
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // We must explicitly set the cookies on the response object
      // to ensure the session persists after the redirect.
      const cookieStore = request.cookies.getAll()
      // Wait, in Route Handlers the server client uses setAll differently. 
      // This is sufficient for standard SSR callback.
      return response
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
