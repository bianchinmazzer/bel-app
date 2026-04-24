'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PlusIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'

export interface VariantDraft {
  id: string // uuid local o del DB
  label: string
  position: number
  isNew?: boolean
  isDeleted?: boolean
}

interface Props {
  enabled: boolean
  setEnabled: (v: boolean) => void
  variants: VariantDraft[]
  setVariants: (v: VariantDraft[]) => void
}

export default function VariantsEditor({
  enabled,
  setEnabled,
  variants,
  setVariants,
}: Props) {
  const [newLabel, setNewLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Cuando se activa, enfocar el input
  useEffect(() => {
    if (enabled) inputRef.current?.focus()
  }, [enabled])

  const visibleVariants = variants
    .filter((v) => !v.isDeleted)
    .sort((a, b) => a.position - b.position)

  const addVariant = () => {
    const label = newLabel.trim()
    if (!label) return

    // Validar duplicados
    if (visibleVariants.some((v) => v.label.toLowerCase() === label.toLowerCase())) {
      alert(`La variante "${label}" ya está agregada`)
      return
    }

    const nextPosition = visibleVariants.length
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        label,
        position: nextPosition,
        isNew: true,
      },
    ])
    setNewLabel('')
    inputRef.current?.focus()
  }

  const removeVariant = (id: string) => {
    const variant = variants.find((v) => v.id === id)
    if (!variant) return
    if (variant.isNew) {
      setVariants(variants.filter((v) => v.id !== id))
    } else {
      setVariants(
        variants.map((v) => (v.id === id ? { ...v, isDeleted: true } : v))
      )
    }
  }

  const moveVariant = (id: string, direction: 'up' | 'down') => {
    const list = [...visibleVariants]
    const idx = list.findIndex((v) => v.id === id)
    if (idx === -1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= list.length) return

    ;[list[idx], list[targetIdx]] = [list[targetIdx], list[idx]]

    // Recalcular positions
    const updated = list.map((v, i) => ({ ...v, position: i }))

    // Mergear con las deleted (que no están en visibleVariants)
    const deleted = variants.filter((v) => v.isDeleted)
    setVariants([...updated, ...deleted])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addVariant()
    } else if (e.key === ',' || e.key === ';') {
      // Permitir "pegar" múltiples: "1, 2, 3, 6.66"
      e.preventDefault()
      addVariant()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    if (pasted.includes(',') || pasted.includes(';') || pasted.includes('\n')) {
      e.preventDefault()
      const labels = pasted
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const startPos = visibleVariants.length
      const newOnes: VariantDraft[] = []
      const existing = visibleVariants.map((v) => v.label.toLowerCase())

      for (const label of labels) {
        if (existing.includes(label.toLowerCase())) continue
        newOnes.push({
          id: crypto.randomUUID(),
          label,
          position: startPos + newOnes.length,
          isNew: true,
        })
        existing.push(label.toLowerCase())
      }
      setVariants([...variants, ...newOnes])
      setNewLabel('')
    }
  }

  return (
    <section className="bg-white border border-primary-100 rounded-2xl p-6 space-y-4">
      <div className="border-b border-primary-100 pb-3">
        <h2 className="font-display font-bold text-lg text-neutral-800 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
          Variantes
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Usá variantes cuando el producto viene en distintos tonos, tamaños o
          colores y querés que el cliente elija cuál en la tienda.
        </p>
      </div>

      {/* Toggle */}
      <label className="flex items-start gap-3 cursor-pointer group p-3 -mx-3 rounded-lg hover:bg-primary-50/50 transition-colors">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
            Este producto tiene variantes
          </span>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ejemplo: Tintura Alfaparf con tonos 1, 2, 3, 6.66, etc. El precio y
            stock siguen siendo los del producto principal — la variante es solo
            lo que elige el cliente.
          </p>
        </div>
      </label>

      {/* Editor de variantes */}
      {enabled && (
        <div className="pt-2 space-y-4 animate-fade-in">
          {/* Input de nueva variante */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
              Agregar tono / etiqueta
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Ej: 6.66"
                className="flex-1 px-4 py-2.5 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
              />
              <button
                type="button"
                onClick={addVariant}
                disabled={!newLabel.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium px-4 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Agregar</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">
              Presioná <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[10px] font-mono">Enter</kbd> después de cada tono.
              También podés pegar varios separados por coma: <code className="text-primary-700">1, 2, 3, 6.66</code>
            </p>
          </div>

          {/* Lista de variantes como chips */}
          {visibleVariants.length > 0 ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                {visibleVariants.length} variante
                {visibleVariants.length !== 1 ? 's' : ''} agregada
                {visibleVariants.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleVariants.map((v, idx) => (
                  <div
                    key={v.id}
                    className="group inline-flex items-center gap-1 bg-primary-100 border border-primary-200 hover:border-primary-400 text-primary-900 rounded-full pl-3 pr-1 py-1 text-sm transition-all"
                  >
                    <span className="font-medium">{v.label}</span>

                    {/* Flechas para ordenar, solo visibles en hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveVariant(v.id, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-primary-700 hover:text-primary-900 disabled:text-primary-300 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ArrowUpIcon className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveVariant(v.id, 'down')}
                        disabled={idx === visibleVariants.length - 1}
                        className="p-0.5 text-primary-700 hover:text-primary-900 disabled:text-primary-300 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ArrowDownIcon className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVariant(v.id)}
                      className="ml-1 p-1 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                      aria-label={`Eliminar ${v.label}`}
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-primary-50/50 border border-dashed border-primary-200 rounded-xl p-6 text-center">
              <p className="text-sm text-neutral-600">
                Todavía no hay variantes. Empezá escribiendo un tono arriba.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
