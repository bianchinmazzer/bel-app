'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsappIcon from './WhatsappIcon'
import CartDrawer from './CartDrawer'

/**
 * Renderiza el chrome del sitio público (Navbar, Footer, etc.)
 * solo cuando NO estamos en rutas /admin. Para el panel admin
 * se muestra el AdminSidebar en su propio layout.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') ?? false

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsappIcon />
      <CartDrawer />
    </>
  )
}
