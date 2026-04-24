export interface Admin {
  id: string
  user_id: string
  email: string
  name: string | null
  role: 'admin' | 'superadmin'
  created_at: string
}
