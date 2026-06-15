/**
 * Número de WhatsApp del negocio, centralizado.
 * Configurar en .env con NEXT_PUBLIC_WHATSAPP (con código de país, sin espacios).
 * Ej: NEXT_PUBLIC_WHATSAPP=5492914000000
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, '') || '5492910000000'

/** Número formateado para mostrar en pantalla (ej: "+54 9 291 000 0000"). */
export const WHATSAPP_DISPLAY = formatPhone(WHATSAPP_NUMBER)

/** Arma un link wa.me con un mensaje pre-escrito. */
export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

/**
 * Formatea un número argentino (54 9 AREA NUMERO) con espacios.
 * Si no matchea ese patrón, devuelve el número con un "+" adelante.
 */
function formatPhone(digits: string): string {
  const ar = digits.match(/^54(9)?(\d{2,4})(\d{6,8})$/)
  if (ar) {
    const [, nueve, area, resto] = ar
    return `+54${nueve ? ' 9' : ''} ${area} ${resto}`
  }
  return `+${digits}`
}
