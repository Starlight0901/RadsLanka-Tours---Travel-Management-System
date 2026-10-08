import { useEffect, useState, type FormEvent } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isCloudinaryConfigured, isFirebaseConfigured } from '@/config/env.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import {
  createAccommodation,
  deleteAccommodation,
  listAllAccommodations,
  updateAccommodation,
  type AccommodationInput,
  type AccommodationRecord,
} from '@/services/firebase/accommodations.ts'
import type { MediaAsset } from '@/types/models.ts'

type ImageDraft = {
  imageUrl: string
  publicId: string
  altText: string
  caption: string
}

type AccommodationFormState = {
  name: string
  description: string
  type: string
  location: string
  images: ImageDraft[]
  published: boolean
}

type FieldErrors = Partial<Record<'name' | 'type' | 'location' | 'images', string>>

const controlClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2'

function emptyForm(): AccommodationFormState {
  return {
    name: '',
    description: '',
    type: '',
    location: '',
    images: [],
    published: false,
  }
}

function recordToForm(record: AccommodationRecord): AccommodationFormState {
  return {
    name: record.name,
    description: record.description,
    type: record.type,
    location: record.location,
    images: record.images.map((image) => ({
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      altText: image.altText,
      caption: image.caption ?? '',
    })),
    published: record.published,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function parseForm(form: AccommodationFormState): { value: AccommodationInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {}
  if (!form.name.trim()) {
    errors.name = 'Enter an accommodation name.'
  }
  if (!form.type.trim()) {
    errors.type = 'Enter an accommodation type.'
  }
  if (!form.location.trim()) {
    errors.location = 'Enter a location.'
  }

  const images: MediaAsset[] = form.images.map((image) => {
    const altText = image.altText.trim()
    if (!altText) {
      errors.images = 'Enter alt text for each image.'
    }
    const asset: MediaAsset = {
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      altText,
    }
    const caption = image.caption.trim()
    if (caption) {
      asset.caption = caption
    }
    return asset
  })

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return {
    value: {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      location: form.location.trim(),
      images,
      published: form.published,
    },
  }
}

export function AdminAccommodationsPage() {
  const [records, setRecords] = useState<AccommodationRecord[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<AccommodationFormState>(emptyForm)

  async function refresh() {
    if (!isFirebaseConfigured) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      setRecords(await listAllAccommodations())
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load accommodations.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true
    listAllAccommodations()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load accommodations.'))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  function openCreate() {
    setEditingId(null)
    setFieldErrors({})
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(record: AccommodationRecord) {
    setEditingId(record.id)
    setFieldErrors({})
    setForm(recordToForm(record))
    setFormOpen(true)
  }

  async function onImagesSelected(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : []
    if (files.length === 0 || uploading) {
      return
    }

    setUploading(true)
    setError(null)
    const uploaded: ImageDraft[] = []
    const failures: string[] = []

    for (const file of files) {
      try {
        const result = await uploadImage(file)
        uploaded.push({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          altText: '',
          caption: '',
        })
      } catch (uploadError) {
        failures.push(errorMessage(uploadError, 'Image upload failed.'))
      }
    }

    if (uploaded.length > 0) {
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded] }))
    }
    if (failures.length > 0) {
      setError(failures[0] ?? 'Image upload failed.')
    }
    setUploading(false)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseForm(form)
    if ('errors' in parsed) {
      setFieldErrors(parsed.errors)
      return
    }

    setFieldErrors({})
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await updateAccommodation(editingId, parsed.value)
      } else {
        await createAccommodation(parsed.value)
      }
      setFormOpen(false)
      await refresh()
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save accommodation.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this accommodation? This cannot be undone.')) {
      return
    }

    try {
      await deleteAccommodation(id)
      if (editingId === id) {
        setFormOpen(false)
        setEditingId(null)
      }
      await refresh()
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this accommodation.'))
    }
  }

  return (
    <>
      <PageMeta title="Admin · Accommodations" description="Create, edit, and publish accommodations." />
      <AdminHeader title="Accommodations" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate-600">
            Accommodations can be assigned to tours. Published accommodations appear on public tour pages.
          </p>
          <Button type="button" className="rounded-lg" disabled={!isFirebaseConfigured} onClick={openCreate}>
            Add accommodation
          </Button>
        </div>

        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add your Firebase web config to manage accommodations."
          />
        ) : null}

        {error ? <ErrorState title="Accommodations error" message={error} /> : null}

        {formOpen ? (
          <form className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5" onSubmit={(event) => void onSubmit(event)} noValidate>
            <h2 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Edit accommodation' : 'Add accommodation'}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="accommodation-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="accommodation-name"
                  type="text"
                  value={form.name}
                  className={controlClassName}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
                <FormError message={fieldErrors.name} />
              </div>
              <div>
                <label htmlFor="accommodation-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <input
                  id="accommodation-type"
                  type="text"
                  value={form.type}
                  placeholder="Hotel"
                  className={controlClassName}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                />
                <FormError message={fieldErrors.type} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="accommodation-location" className="mb-1.5 block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                id="accommodation-location"
                type="text"
                value={form.location}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              />
              <FormError message={fieldErrors.location} />
            </div>
            <div className="mt-4">
              <label htmlFor="accommodation-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="accommodation-description"
                rows={4}
                value={form.description}
                className={controlClassName}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Images</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading || saving}
                className="mt-3 block w-full text-sm text-slate-600"
                onChange={(event) => {
                  void onImagesSelected(event.target.files)
                  event.target.value = ''
                }}
              />
              {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading images…</p> : null}
              {!isCloudinaryConfigured ? (
                <p className="mt-2 text-sm text-slate-500">Add Cloudinary settings before uploading images.</p>
              ) : null}
              <ul className="mt-4 space-y-4">
                {form.images.map((image, index) => (
                  <li key={`${image.publicId}-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex gap-4">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || 'Uploaded accommodation image'}
                        className="h-24 w-24 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <label htmlFor={`accommodation-image-alt-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">
                            Alt text
                          </label>
                          <input
                            id={`accommodation-image-alt-${index}`}
                            type="text"
                            value={image.altText}
                            className={controlClassName}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                images: current.images.map((item, imageIndex) =>
                                  imageIndex === index ? { ...item, altText: event.target.value } : item,
                                ),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor={`accommodation-image-caption-${index}`} className="mb-1.5 block text-sm font-medium text-slate-700">
                            Caption
                          </label>
                          <input
                            id={`accommodation-image-caption-${index}`}
                            type="text"
                            value={image.caption}
                            className={controlClassName}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                images: current.images.map((item, imageIndex) =>
                                  imageIndex === index ? { ...item, caption: event.target.value } : item,
                                ),
                              }))
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="text-sm font-medium text-red-700 underline"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              images: current.images.filter((_, imageIndex) => imageIndex !== index),
                            }))
                          }
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <FormError message={fieldErrors.images} />
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-slate-900"
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
              />
              Published
            </label>

            <div className="mt-5 flex gap-3">
              <Button type="submit" className="rounded-lg" disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? <LoadingState label="Loading accommodations" /> : null}

        {!loading && records.length === 0 ? (
          <EmptyState title="No accommodations yet" message="Add the stays that can be assigned to a tour." />
        ) : null}

        {!loading && records.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{record.name || 'Untitled'}</td>
                    <td className="px-4 py-3 text-slate-600">{record.type || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{record.location || '—'}</td>
                    <td className="px-4 py-3">{record.published ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button type="button" className="text-sm font-medium text-slate-900 underline" onClick={() => openEdit(record)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-sm font-medium text-red-700 underline"
                          onClick={() => void onDelete(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  )
}
