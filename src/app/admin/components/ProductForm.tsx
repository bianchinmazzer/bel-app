'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  PhotoIcon,
  XMarkIcon,
  StarIcon as StarOutline,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/formatters'
import type { Product, Category } from '@/types/product'
import VariantsEditor, { type VariantDraft } from './VariantsEditor'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

interface ImageState {
  id: string // temporal (uuid local) o real del DB
  url: string
  is_primary: boolean
  isNew?: boolean // true si se subió en esta sesión
  isDeleted?: boolean // marcado para eliminar
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!product

  // Estado del formulario (precio en pesos, no centavos, más fácil para el user)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    price_pesos: product ? Math.round(product.price_ars / 100) : 0,
    stock: product?.stock ?? 0,
    weight_grams: product?.weight_grams ?? 500,
    active: product?.active ?? true,
    featured: product?.featured ?? false,
  })

  const [images, setImages] = useState<ImageState[]>(
    (product?.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      is_primary: img.is_primary,
    }))
  )

  // Variantes — si el producto ya tiene, activamos el toggle automáticamente
  const initialHasVariants = (product?.variants?.length ?? 0) > 0
  const [hasVariants, setHasVariants] = useState(initialHasVariants)
  const [variants, setVariants] = useState<VariantDraft[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      label: v.label,
      position: v.position,
    }))
  )

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generar slug desde el nombre si está vacío
  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: form.slug || slugify(name),
    })
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" excede el máximo de 5MB`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error subiendo imagen')

        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: data.url,
            is_primary: prev.length === 0,
            isNew: true,
          },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imágenes')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSetPrimary = (id: string) => {
    setImages(images.map((img) => ({ ...img, is_primary: img.id === id })))
  }

  const handleRemoveImage = (id: string) => {
    const img = images.find((i) => i.id === id)
    if (!img) return

    if (img.isNew) {
      // Imagen nueva: la sacamos del array directamente
      setImages(images.filter((i) => i.id !== id))
    } else {
      // Imagen existente en DB: la marcamos para borrar
      setImages(images.map((i) => (i.id === id ? { ...i, isDeleted: true } : i)))
    }
  }

  const visibleImages = images.filter((i) => !i.isDeleted)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        slug: form.slug || slugify(form.name),
        description: form.description,
        category_id: form.category_id || null,
        price_ars: Math.round(form.price_pesos * 100),
        stock: form.stock,
        weight_grams: form.weight_grams,
        active: form.active,
        featured: form.featured,
        images: images,
        // Si no está habilitado el toggle, mandamos array vacío (el backend
        // se encarga de borrar las variantes existentes en edición).
        variants: hasVariants ? variants : [],
        has_variants: hasVariants,
      }

      const url = isEdit
        ? `/api/admin/productos/${product!.id}`
        : '/api/admin/productos'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error guardando producto')

      router.push('/admin/productos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando producto')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm(`¿Seguro que querés eliminar "${product.name}"? Esta acción no se puede deshacer.`))
      return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/productos/${product.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error eliminando producto')
      }
      router.push('/admin/productos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando producto')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Datos básicos */}
      <section className="bg-white border border-primary-100 rounded-2xl p-6 space-y-5">
        <h2 className="font-display font-bold text-lg text-neutral-800 border-b border-primary-100 pb-3">
          Información básica
        </h2>

        <FormField label="Nombre del producto" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className={inputClass}
            placeholder="Shampoo Hidratante 500ml"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="SKU" required hint="Código único del producto">
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              required
              className={inputClass}
              placeholder="SHP-001"
            />
          </FormField>

          <FormField label="URL (slug)" required hint="Se genera automático desde el nombre">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              required
              className={inputClass}
              placeholder="shampoo-hidratante-500ml"
            />
          </FormField>
        </div>

        <FormField label="Descripción">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Descripción detallada del producto..."
          />
        </FormField>

        <FormField label="Categoría">
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className={inputClass}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
      </section>

      {/* Imágenes */}
      <section className="bg-white border border-primary-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-neutral-800 border-b border-primary-100 pb-3">
          Imágenes
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/50 hover:bg-primary-50 rounded-xl p-8 text-center transition-all"
        >
          {uploading ? (
            <>
              <ArrowPathIcon className="w-10 h-10 text-primary-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-primary-700">Subiendo imágenes...</p>
            </>
          ) : (
            <>
              <PhotoIcon className="w-10 h-10 text-primary-500 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-neutral-700">
                Click para subir imágenes
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                JPG, PNG o WebP · Máximo 5MB cada una
              </p>
            </>
          )}
        </button>

        {visibleImages.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {visibleImages.map((img) => (
              <div
                key={img.id}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${
                  img.is_primary ? 'border-primary-500' : 'border-primary-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-contain p-2 bg-white"
                  sizes="150px"
                />

                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  className={`absolute top-1 left-1 p-1.5 rounded-full transition-all ${
                    img.is_primary
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/80 text-neutral-600 hover:bg-primary-100 opacity-0 group-hover:opacity-100'
                  }`}
                  title={img.is_primary ? 'Imagen principal' : 'Marcar como principal'}
                >
                  {img.is_primary ? (
                    <StarSolid className="w-3.5 h-3.5" />
                  ) : (
                    <StarOutline className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-white/80 text-red-600 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Quitar"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>

                {img.is_primary && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary-500 text-white text-[9px] uppercase tracking-wider text-center py-0.5 font-semibold">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Precio y stock */}
      <section className="bg-white border border-primary-100 rounded-2xl p-6 space-y-5">
        <h2 className="font-display font-bold text-lg text-neutral-800 border-b border-primary-100 pb-3">
          Precio y stock
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Precio (ARS)" required hint="Sin centavos">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={form.price_pesos}
                onChange={(e) => setForm({ ...form, price_pesos: Number(e.target.value) })}
                required
                min={0}
                step={1}
                className={`${inputClass} pl-8`}
              />
            </div>
          </FormField>

          <FormField
            label="Stock"
            required
            hint={
              hasVariants
                ? 'Total entre todas las variantes'
                : undefined
            }
          >
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              required
              min={0}
              step={1}
              className={inputClass}
            />
          </FormField>

          <FormField label="Peso (gramos)" hint="Para cotizar envío">
            <input
              type="number"
              value={form.weight_grams}
              onChange={(e) => setForm({ ...form, weight_grams: Number(e.target.value) })}
              min={1}
              step={1}
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Variantes */}
      <VariantsEditor
        enabled={hasVariants}
        setEnabled={setHasVariants}
        variants={variants}
        setVariants={setVariants}
      />

      {/* Visibilidad */}
      <section className="bg-white border border-primary-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-neutral-800 border-b border-primary-100 pb-3">
          Visibilidad
        </h2>

        <CheckboxField
          checked={form.active}
          onChange={(v) => setForm({ ...form, active: v })}
          label="Producto activo"
          hint="Si está desactivado, no aparece en la tienda pública"
        />

        <CheckboxField
          checked={form.featured}
          onChange={(v) => setForm({ ...form, featured: v })}
          label="Producto destacado"
          hint="Aparece en la home del sitio"
        />
      </section>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sticky bottom-0 bg-neutral-50 pt-4 pb-2 -mx-4 px-4 md:-mx-8 md:px-8 border-t border-primary-100">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 sm:flex-none bg-neutral-800 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 sm:flex-none border border-primary-300 hover:border-primary-500 text-neutral-700 font-medium py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
        >
          Cancelar
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="sm:ml-auto text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{deleting ? 'Eliminando...' : 'Eliminar producto'}</span>
          </button>
        )}
      </div>
    </form>
  )
}

const inputClass =
  'w-full px-4 py-2.5 border border-primary-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm'

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
        {label} {required && <span className="text-primary-600">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500 mt-1.5">{hint}</p>}
    </div>
  )
}

function CheckboxField({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
      />
      <div>
        <span className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
          {label}
        </span>
        {hint && <p className="text-xs text-neutral-500 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}
