import { createAuthServerClient, createServiceClient } from './server'

/**
 * Verifica que el request venga de un admin autenticado.
 * Devuelve { admin, error } — si admin es null, rechazar con 401/403.
 */
export async function requireAdmin() {
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { admin: null, error: 'No autenticado', status: 401 as const }
  }

  const service = createServiceClient()
  const { data: admin, error } = await service
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !admin) {
    return { admin: null, error: 'No autorizado', status: 403 as const }
  }

  return { admin, error: null, status: 200 as const }
}
