import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SearchableSelect } from '@/components/admin/SearchableSelect.tsx'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isCloudinaryConfigured, isFirebaseConfigured } from '@/config/env.ts'
import { uploadGalleryImage } from '@/services/cloudinary/upload.ts'
import { listAllDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import {
  createGalleryItem,
  deleteGalleryItem,
  listAllGalleryItems,
  updateGalleryItem,
  type GalleryInput,
  type GalleryRecord,
} from '@/services/firebase/gallery.ts'
import { listAllTours, type TourRecord } from '@/services/firebase/tours.ts'
import {
  GALLERY_IMAGE_SIZE_MESSAGE,
  GALLERY_TITLE_MAX,
  galleryImageExceedsSizeLimit,
} from '@/utils/galleryLimits.ts'

type FormState = {
  title: string
  imageUrl: string
  publicId: string
  tourId: string
  destinationId: string
}

type FieldErrors = Partial<Record<'title' | 'image', string>>

const emptyForm = (): FormState => ({
  title: '',
  imageUrl: '',
  publicId: '',
  tourId: '',
  destinationId: '',
})

const controlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function toForm(item: GalleryRecord): FormState {
  return {
    title: item.title,
    imageUrl: item.imageUrl,
    publicId: item.publicId,
    tourId: item.tourId,
    destinationId: item.destinationId,
  }
}

function toInput(form: FormState): GalleryInput {
  return {
    title: form.title,
    imageUrl: form.imageUrl,
    publicId: form.publicId,
    tourId: form.tourId,
    destinationId: form.destinationId,
  }
}

function associationLabel(
  item: GalleryRecord,
  tours: TourRecord[],
  destinations: DestinationRecord[],
): string {
  const tourName = item.tourId ? tours.find((tour) => tour.id === item.tourId)?.title.trim() : ''
  const destinationName = item.destinationId
    ? destinations.find((destination) => destination.id === item.destinationId)?.name.trim()
    : ''
  if (tourName && destinationName) {
    return `${tourName} · ${destinationName}`
  }
  if (tourName) {
    return tourName
  }
  if (destinationName) {
    return destinationName
  }
  return 'Unassociated'
}

export function AdminGalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [records, setRecords] = useState<GalleryRecord[]>([])
  const [tours, setTours] = useState<TourRecord[]>([])
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<string | null>(null)

  async function refresh() {
    const [gallery, nextTours, nextDestinations] = await Promise.all([
      listAllGalleryItems(),
      listAllTours(),
      listAllDestinations(),
    ])
    setRecords(gallery)
    setTours(nextTours)
    setDestinations(nextDestinations)
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    Promise.all([listAllGalleryItems(), listAllTours(), listAllDestinations()])
      .then(([gallery, nextTours, nextDestinations]) => {
        if (!active) {
          return
        }
        setRecords(gallery)
        setTours(nextTours)
        setDestinations(nextDestinations)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load gallery images.'))
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

  function beginEdit(item: GalleryRecord) {
    setEditingId(item.id)
    setForm(toForm(item))
    setFieldErrors({})
    setStatus(null)
    setError(null)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setFieldErrors({})
    setStatus(null)
  }

  async function onImageSelected(file: File | undefined) {
    if (!file || uploading) {
      return
    }
    if (galleryImageExceedsSizeLimit(file)) {
      setFieldErrors((current) => ({ ...current, image: GALLERY_IMAGE_SIZE_MESSAGE }))
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }
    setUploading(true)
    setError(null)
    setFieldErrors((current) => ({ ...current, image: undefined }))
    try {
      const result = await uploadGalleryImage(file)
      setForm((current) => ({
        ...current,
        imageUrl: result.secure_url,
        publicId: result.public_id,
      }))
    } catch (uploadError) {
      setError(errorMessage(uploadError, 'Image upload failed.'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const errors: FieldErrors = {}
    if (!form.title.trim()) {
      errors.title = 'Enter an image title.'
    }
    if (!form.imageUrl || !form.publicId) {
      errors.image = 'Upload an image.'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      const input = toInput(form)
      if (editingId) {
        await updateGalleryItem(editingId, input)
        setStatus('Gallery image saved.')
      } else {
        await createGalleryItem(input)
        setStatus('Gallery image added.')
      }
      await refresh()
      resetForm()
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save this gallery image.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(item: GalleryRecord) {
    if (!window.confirm(`Delete “${item.title || 'this gallery image'}”? This cannot be undone.`)) {
      return
    }

    try {
      await deleteGalleryItem(item.id)
      if (editingId === item.id) {
        resetForm()
      }
      await refresh()
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this gallery image.'))
    }
  }

  const busy = saving || uploading
  const tourOptions = tours.map((tour) => ({
    value: tour.id,
    label: tour.title.trim() || tour.slug || 'Untitled tour',
  }))
  const destinationOptions = destinations.map((destination) => ({
    value: destination.id,
    label: destination.name.trim() || destination.slug || 'Untitled destination',
  }))

  return (
    <>
      <PageMeta title="Admin · Gallery" description="Manage gallery images and optional tour or destination links." />
      <AdminHeader title="Gallery" />
      <div className="space-y-6 p-6">
        {!isFirebaseConfigured ? (
          <ErrorState
            title="Firebase is not configured"
            message="Add the Firebase web config before managing gallery images."
          />
        ) : null}
        {error ? <ErrorState title="Something went wrong" message={error} /> : null}
        {status ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
            {status}
          </p>
        ) : null}

        <form className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5" onSubmit={onSubmit} noValidate>
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? 'Edit gallery image' : 'Add gallery image'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tour and destination links are optional. Images with no association still appear on the public Gallery page.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              label="Associated Tour"
              options={tourOptions}
              value={form.tourId}
              placeholder="None"
              disabled={busy}
              onChange={(tourId) => setForm((current) => ({ ...current, tourId }))}
            />
            <SearchableSelect
              label="Associated Destination"
              options={destinationOptions}
              value={form.destinationId}
              placeholder="None"
              disabled={busy}
              onChange={(destinationId) => setForm((current) => ({ ...current, destinationId }))}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="gallery-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Image Title<span className="text-red-700"> *</span>
            </label>
            <input
              id="gallery-title"
              type="text"
              value={form.title}
              maxLength={GALLERY_TITLE_MAX}
              className={controlClassName}
              disabled={busy}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <FormError message={fieldErrors.title} />
          </div>

          <div className="mt-4">
            <p className="mb-1.5 block text-sm font-medium text-slate-700">
              Upload Image<span className="text-red-700"> *</span>
            </p>
            {form.imageUrl ? (
              <div className="rounded-lg border border-slate-200 p-3">
                <img src={form.imageUrl} alt={form.title || 'Gallery image'} className="h-40 w-full rounded-md object-cover sm:h-52" />
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-slate-900 underline"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace image
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Upload a photograph. It is stored in Cloudinary when you choose the file.</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={busy || !isCloudinaryConfigured}
              className={form.imageUrl ? 'sr-only' : 'mt-2 block w-full text-sm text-slate-600'}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                void onImageSelected(file)
              }}
            />
            {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading image…</p> : null}
            {!isCloudinaryConfigured ? (
              <p className="mt-2 text-sm text-slate-500">Add Cloudinary settings before uploading images.</p>
            ) : null}
            <FormError message={fieldErrors.image} />
          </div>

          <div className="mt-5 flex gap-3">
            <Button type="submit" className="rounded-lg" disabled={busy || !isFirebaseConfigured}>
              {saving ? 'Saving…' : editingId ? 'Save' : 'Add image'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" className="rounded-lg" disabled={busy} onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        {loading ? <LoadingState label="Loading gallery" /> : null}

        {!loading && records.length === 0 ? (
          <EmptyState title="No gallery images yet" message="Add an image to show it on the public Gallery page." />
        ) : null}

        {!loading && records.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {records.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title || 'Gallery image'} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-500">No image</div>
                )}
                <div className="space-y-2 p-4">
                  <p className="font-medium text-slate-900">{item.title || 'Untitled image'}</p>
                  <p className="text-sm text-slate-500">{associationLabel(item, tours, destinations)}</p>
                  <div className="flex gap-3">
                    <button type="button" className="text-sm font-medium text-slate-900 underline" onClick={() => beginEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm font-medium text-red-700 underline"
                      onClick={() => void onDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  )
}
