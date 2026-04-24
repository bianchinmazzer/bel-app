import { redirect } from 'next/navigation'
import {
  createAuthServerClient,
  createServiceClient,
} from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

/**
 * Wrapper que protege una página del admin y le agrega el sidebar.
 * Cada página del panel (excepto /admin/login) debe envolverse en este componente.
 * El middleware ya protege /admin/* a nivel de request; esto es defensa en profundidad.
 */
export default async function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createAuthServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const service = createServiceClient()
  const { data: admin } = await service
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!admin) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar
        adminName={admin.name ?? admin.email}
        adminRole={admin.role}
      />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
