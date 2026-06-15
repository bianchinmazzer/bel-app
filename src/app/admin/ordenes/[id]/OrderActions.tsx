'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/types/order'

interface Props {
  orderId: string
  initialStatus: OrderStatus
  initialTracking: string | null
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export default function OrderActions({
  orderId,
  initialStatus,
  initialTracking,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [tracking, setTracking] = useState(initialTracking ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty =
    status !== initialStatus || tracking !== (initialTracking ?? '')

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/ordenes/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          andreani_tracking_number: tracking,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error guardando')
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-primary-100 rounded-2xl p-6">
      <h2 className="font-display font-bold text-lg text-neutral-800 mb-5">
        Gestión del pedido
      </h2>

      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
        Estado
      </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm mb-5"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
        Nº de seguimiento (Andreani)
      </label>
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Ej: 360000123456789"
        className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm mb-5"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      {saved && !dirty && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          Cambios guardados ✓
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !dirty}
        className="w-full bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white py-3 rounded-lg font-medium transition-colors"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}
