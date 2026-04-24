import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: refrescar el token antes de devolver la respuesta
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Proteger /admin/* (excepto /admin/login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    if (!user) {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Si ya está logueado y entra a /admin/login, redirigir a /admin
  if (url.pathname === '/admin/login' && user) {
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Excluir assets estáticos e imágenes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
