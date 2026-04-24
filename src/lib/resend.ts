import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!)
  }
  return _resend
}

export const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Bel Distribuciones <no-reply@beldistribuciones.com.ar>'
export const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'ventas@beldistribuciones.com.ar'
