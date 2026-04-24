'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { Category } from '@/types/product'
import { slugify } from '@/lib/formatters'

interface Props {
  initialCategorias: Category[]
}

export default function CategoriasManager({ initialCategorias }: Props) {
  const router = useRouter()
  const [categorias, setCategorias] = useState<Category[]>(initialCategorias)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCreate = () => {
    setError(null)
    setEditForm({ name: '', slug: '', description: '' })
    setEditingId('new')
  }

  const startEdit = (cat: Category) => {
    setError(null)
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
    })
    setEditingId(cat.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: editForm.name.trim(),
        slug: editForm.slug.trim() || slugify(editForm.name),
        description: editForm.description.trim() || null,
      }

      const isNew = editingId === 'new'
      const url = isNew
        ? '/api/admin/categorias'
        : `/api/admin/categorias/${editingId}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error guardando')

      if (isNew) {
        setCategorias([...categorias, data.category])
      } else {
        setCategorias(
          categorias.map((c) => (c.id === editingId ? data.category : c))
        )
      }
      setEditingId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    if (
      !confirm(
        `¿Eliminar la categoría "${cat.name}"?\n\nLos productos que estén en esta categoría quedarán sin categoría asignada (pero no se eliminan).`
      )
    )
      return

    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error eliminando')

      setCategorias(categorias.filter((c) => c.id !== cat.id))
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando')
    }
  }

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          active: !cat.active,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')

      setCategorias(categorias.map((c) => (c.id === cat.id ? data.category : c)))
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Botón agregar */}
      {editingId !== 'new' && (
        <button
          onClick={startCreate}
          className="w-full border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/50 hover:bg-primary-50 rounded-xl p-6 text-center transition-all group"
        >
          <PlusIcon className="w-6 h-6 text-primary-500 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm font-medium text-primary-700">
            Agregar nueva categoría
          </p>
        </button>
      )}

      {/* Form nueva categoría */}
      {editingId === 'new' && (
        <EditForm
          form={editForm}
          setForm={setEditForm}
          onSave={handleSave}
          onCancel={cancelEdit}
          saving={saving}
          title="Nueva categoría"
        />
      )}

      {/* Lista */}
      <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden">
        {categorias.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">
            Todavía no hay categorías creadas.
          </div>
        ) : (
          categorias.map((cat) =>
            editingId === cat.id ? (
              <div
                key={cat.id}
                className="border-b border-primary-100 last:border-b-0 bg-primary-50/30"
              >
                <EditForm
                  form={editForm}
                  setForm={setEditForm}
                  onSave={handleSave}
                  onCancel={cancelEdit}
                  saving={saving}
                  title="Editar categoría"
                />
              </div>
            ) : (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-4 px-5 py-4 border-b border-primary-50 last:border-b-0 hover:bg-primary-50/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-neutral-800">{cat.name}</p>
                    {!cat.active && (
                      <span className="bg-neutral-100 text-neutral-500 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                    /{cat.slug}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className="text-neutral-500 hover:text-primary-700 px-3 py-2 text-xs font-medium transition-colors"
                    title={cat.active ? 'Desactivar' : 'Activar'}
                  >
                    {cat.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-neutral-500 hover:text-primary-700 p-2 transition-colors"
                    aria-label="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-neutral-500 hover:text-red-600 p-2 transition-colors"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}

function EditForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  title,
}: {
  form: { name: string; slug: string; description: string }
  setForm: (f: { name: string; slug: string; description: string }) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  title: string
}) {
  return (
    <div className="bg-white border border-primary-300 rounded-2xl p-5 space-y-4 shadow-gold-sm">
      <h3 className="font-display font-bold text-lg text-neutral-800">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })
            }
            className="w-full px-4 py-2.5 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
            placeholder="Peluquería"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
            URL (slug)
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="w-full px-4 py-2.5 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm font-mono"
            placeholder="peluqueria"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
          Descripción
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2.5 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
          placeholder="Productos profesionales para peluquería"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 border border-primary-300 hover:border-primary-500 text-neutral-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Cancelar</span>
        </button>
      </div>
    </div>
  )
}
