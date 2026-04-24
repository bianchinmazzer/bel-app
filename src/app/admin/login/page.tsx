'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Error al iniciar sesión')
      setLoading(false)
      return
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!admin) {
      await supabase.auth.signOut()
      setError('Tu usuario no está autorizado como administrador')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <Image
              src="/bel-logo.png"
              alt="Bel Distribuciones"
              width={80}
              height={80}
              className="rounded-full ring-4 ring-primary-200"
              priority
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Panel administrativo
            </span>
            <span className="h-px w-8 bg-primary-500" />
          </div>
          <h1 className="font-display font-bold text-3xl text-neutral-800">
            Bel Distribuciones
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            Iniciá sesión para acceder al panel
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-primary-100 shadow-gold-sm p-8 space-y-5"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
            {!loading && <ArrowRightIcon className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 mt-6">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </main>
  )
}
