import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Next.js genera /robots.txt automáticamente a partir de este archivo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/carrito', '/checkout', '/pago', '/api/', '/_next/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
