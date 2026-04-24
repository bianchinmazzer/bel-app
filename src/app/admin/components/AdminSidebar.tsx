'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'

interface Props {
  adminName: string
  adminRole: string
}

export default function AdminSidebar({ adminName, adminRole }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/productos', label: 'Productos', icon: CubeIcon },
    { href: '/admin/categorias', label: 'Categorías', icon: TagIcon },
  ]

  return (
    <>
      {/* Header mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-primary-100 flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/bel-logo.png"
            alt="Bel"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-display font-bold text-neutral-800">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-neutral-700 p-2"
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-neutral-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-primary-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Línea dorada superior */}
        <div className="h-1 bg-gold-gradient" />

        {/* Logo */}
        <div className="p-6 border-b border-primary-100">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary-300">
              <Image
                src="/bel-logo.png"
                alt="Bel"
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div>
              <div className="font-display font-bold text-neutral-800 leading-none">
                BEL
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-700 mt-0.5">
                Panel admin
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                }`}
              >
                <link.icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Link al sitio público */}
        <div className="px-3 pb-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-primary-700 hover:bg-neutral-100 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5" strokeWidth={1.5} />
            <span>Ver sitio público</span>
          </Link>
        </div>

        {/* Footer con user */}
        <div className="p-4 border-t border-primary-100 bg-primary-50/50">
          <div className="mb-3">
            <p className="text-xs text-neutral-500 mb-1">Sesión activa</p>
            <p className="text-sm font-medium text-neutral-800 truncate">
              {adminName}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary-700 mt-0.5">
              {adminRole}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
