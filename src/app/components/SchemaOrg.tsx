import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, BRANDS } from '@/lib/site'

/**
 * Datos estructurados (JSON-LD) globales del sitio.
 * Se monta una vez en el layout, dentro del <body>.
 *
 * Inyecta tres esquemas: Organization, WebSite y BreadcrumbList.
 * El schema de producto individual vive en /tienda/[slug].
 */
export default function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/bel-logo.png`,
    description: SITE_DESCRIPTION,
    foundingDate: '1993',
    email: 'ventas@beldistribuciones.com.ar',
    brand: BRANDS.map((name) => ({ '@type': 'Brand', name })),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      addressRegion: 'Buenos Aires',
      addressLocality: 'Bahía Blanca',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: 'Spanish',
      areaServed: 'AR',
    },
    sameAs: [
      // Agregar URLs de redes sociales cuando estén disponibles:
      // 'https://www.instagram.com/beldistribuciones',
      // 'https://www.facebook.com/beldistribuciones',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'es-AR',
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
      { '@type': 'ListItem', position: 3, name: 'Mayoristas', item: `${SITE_URL}/mayoristas` },
      { '@type': 'ListItem', position: 4, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
