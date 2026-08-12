'use client'

import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import type { StoreSettings } from '@/lib/settings'

interface Props {
  initialSettings: StoreSettings
}

export default function SettingsManager({ initialSettings }: Props) {
  const [percent, setPercent] = useState<string>(
    String(initialSettings.mp_discount_percent)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Diagnóstico de conexión con Getnet
  const [testing, setTesting] = useState(false)
  const [getnetResult, setGetnetResult] = useState<{ ok: boolean; message: string } | null>(
    null
  )

  const handleTestGetnet = async () => {
    setTesting(true)
    setGetnetResult(null)
    try {
      const res = await fetch('/api/admin/getnet/health')
      const data = await res.json()
      setGetnetResult({ ok: Boolean(data.ok), message: data.message ?? 'Sin respuesta' })
    } catch {
      setGetnetResult({ ok: false, message: 'No se pudo probar la conexión.' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    const value = Number(percent)
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setError('Ingresá un número entre 0 y 100')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mp_discount_percent: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      setPercent(String(data.settings.mp_discount_percent))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <section className="bg-white rounded-2xl border border-primary-100 p-6 md:p-8">
        <h2 className="font-display font-bold text-xl text-neutral-800 mb-1">
          Bonificación por Mercado Pago
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          Descuento que se aplica automáticamente cuando el cliente elige pagar
          con Mercado Pago. Poné <strong>0</strong> para desactivarlo.
        </p>

        <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
          Porcentaje de descuento
        </label>
        <div className="relative w-40">
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={percent}
            onChange={(e) => {
              setPercent(e.target.value)
              setSaved(false)
            }}
            className="w-full pl-4 pr-10 py-3 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-lg font-semibold"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
            %
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mt-4">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircleIcon className="w-5 h-5" />
              Guardado
            </span>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-primary-100 p-6 md:p-8 mt-6">
        <h2 className="font-display font-bold text-xl text-neutral-800 mb-1">
          Conexión con Getnet
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          Probá si las credenciales de Getnet ya están activas. Las credenciales
          recién generadas pueden tardar <strong>hasta 48 horas</strong> en
          activarse del lado de Getnet.
        </p>

        <button
          onClick={handleTestGetnet}
          disabled={testing}
          className="bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          {testing ? 'Probando...' : 'Probar conexión con Getnet'}
        </button>

        {getnetResult && (
          <div
            className={`text-sm rounded-lg p-3 mt-4 border ${
              getnetResult.ok
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {getnetResult.message}
          </div>
        )}
      </section>
    </div>
  )
}
