/**
 * Configuración central del sitio, reutilizada por metadata, sitemap,
 * robots y los datos estructurados (Schema.org).
 */
export const SITE_URL = 'https://www.beldistribuciones.com.ar'

export const SITE_NAME = 'Bel Distribuciones'

export const SITE_DESCRIPTION =
  'Distribución mayorista y minorista de productos de peluquería, estética y hogar en Argentina. Más de 30 años de trayectoria como distribuidores oficiales de Alfaparf, Exel, Schwarzkopf, Yellow y Sir Fausto.'

/** Marcas de las que Bel es distribuidor oficial. */
export const BRANDS = [
  'Alfaparf',
  'Exel',
  'Schwarzkopf',
  'Yellow',
  'Sir Fausto',
] as const

/** Devuelve una URL absoluta a partir de un path relativo. */
export function absoluteUrl(path = ''): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
