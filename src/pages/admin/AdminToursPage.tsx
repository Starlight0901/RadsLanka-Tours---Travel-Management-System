import { useEffect, useRef, useState, type FormEvent } from 'react'
import { TourTagsManager } from '@/components/admin/TourTagsManager.tsx'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isCloudinaryConfigured, isFirebaseConfigured } from '@/config/env.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import { listAllAccommodations, type AccommodationRecord } from '@/services/firebase/accommodations.ts'
import { listAllTags, type TagRecord } from '@/services/firebase/tags.ts'
import {
  createTravelStyle,
  listAllTravelStyles,
  normalizeTravelStyleName,
  type TravelStyleRecord,
} from '@/services/firebase/travelStyles.ts'
import { listAllDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import {
  createTour,
  deleteTour,
  getTour,
  listAllTours,
  updateTour,
  type TourInput,
  type TourRecord,
} from '@/services/firebase/tours.ts'
import type { MediaAsset, TourPricingBasis } from '@/types/models.ts'
import { pricingBasisOptions, pricingPreview } from '@/utils/tourPricing.ts'
import { slugify } from '@/utils/slugify.ts'

type ItineraryDraft = {
  day: string
  title: string
  description: string
  locations: string[]
}

type ImageDraft = {
  imageUrl: string
  publicId: string
  altText: string
  caption: string
}

type TourFormState = {
  title: string
  slug: string
  description: string
  duration: string
  price: string
  pricingBasis: TourPricingBasis
  pricingCustomLabel: string
  travelStyleId: string
  legacyTravelStyle: string
  destinationIds: string[]
  accommodationIds: string[]
  tagIds: string[]
  itinerary: ItineraryDraft[]
  included: string[]
  excluded: string[]
  images: ImageDraft[]
  featured: boolean
  popular: boolean
  published: boolean
}

type FieldErrors = Partial<
  Record<'title' | 'slug' | 'duration' | 'price' | 'pricingCustom' | 'description' | 'itinerary' | 'images', string>
>

const controlClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function emptyForm(): TourFormState {
  return {
    title: '',
    slug: '',
    description: '',
    duration: '',
    price: '',
    pricingBasis: 'per_person',
    pricingCustomLabel: '',
    travelStyleId: '',
    legacyTravelStyle: '',
    destinationIds: [],
    accommodationIds: [],
    tagIds: [],
    itinerary: [],
    included: [],
    excluded: [],
    images: [],
    featured: false,
    popular: false,
    published: false,
  }
}

function renumberDays(days: ItineraryDraft[]): ItineraryDraft[] {
  return days.map((day, index) => ({ ...day, day: String(index + 1) }))
}

function tourToForm(tour: TourRecord): TourFormState {
  return {
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    duration: tour.duration,
    price: String(tour.price),
    pricingBasis: tour.pricingBasis ?? 'per_person',
    pricingCustomLabel: tour.pricingCustomLabel ?? '',
    travelStyleId: tour.travelStyleId ?? '',
    legacyTravelStyle: tour.legacyTravelStyle ?? '',
    destinationIds: [...tour.destinations],
    accommodationIds: [...(tour.accommodationIds ?? [])],
    tagIds: [...(tour.tagIds ?? [])],
    itinerary: tour.itinerary.map((day) => ({
      day: String(day.day),
      title: day.title,
      description: day.description,
      locations: [...day.locations],
    })),
    included: [...tour.included],
    excluded: [...tour.excluded],
    images: tour.images.map((image) => ({
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      altText: image.altText,
      caption: image.caption ?? '',
    })),
    featured: tour.featured,
    popular: tour.popular,
    published: tour.published,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function destinationLabel(destination: DestinationRecord): string {
  return destination.name.trim() || destination.slug || 'Untitled destination'
}

function parseForm(form: TourFormState): { value: TourInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {}
  const title = form.title.trim()
  const slug = form.slug.trim()
  const duration = form.duration.trim()
  const description = form.description.trim()
  const price = Number(form.price)

  if (!title) {
    errors.title = 'Enter a tour title.'
  }
  if (!slug) {
    errors.slug = 'Enter a tour slug.'
  } else if (!slugPattern.test(slug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens.'
  }
  if (!duration) {
    errors.duration = 'Enter a duration.'
  }
  if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) {
    errors.price = 'Enter a valid price.'
  }
  if (form.pricingBasis === 'custom' && !form.pricingCustomLabel.trim()) {
    errors.pricingCustom = 'Enter a custom pricing label.'
  }

  const itinerary = form.itinerary.flatMap((day) => {
    const dayTitle = day.title.trim()
    const dayDescription = day.description.trim()
    const locations = day.locations.map((location) => location.trim()).filter(Boolean)
    if (!dayTitle && !dayDescription && locations.length === 0) {
      return []
    }
    if (!dayTitle) {
      errors.itinerary = 'Enter a title for each itinerary day.'
    }
    const dayNumber = Number(day.day)
    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      errors.itinerary = 'Enter a day number of 1 or greater for each itinerary day.'
    }

    return [
      {
        day: dayNumber,
        title: dayTitle,
        description: dayDescription,
        locations,
      },
    ]
  })

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
      title,
      slug,
      description,
      duration,
      price,
      pricingBasis: form.pricingBasis,
      pricingCustomLabel: form.pricingCustomLabel,
      travelStyleId: form.travelStyleId.trim(),
      destinations: form.destinationIds.map((id) => id.trim()).filter(Boolean),
      accommodationIds: form.accommodationIds.map((id) => id.trim()).filter(Boolean),
      tagIds: form.tagIds.map((id) => id.trim()).filter(Boolean),
      itinerary,
      included: form.included.map((item) => item.trim()).filter(Boolean),
      excluded: form.excluded.map((item) => item.trim()).filter(Boolean),
      images,
      featured: form.featured,
      popular: form.popular,
      published: form.published,
    },
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(price)
}

type StringListEditorProps = {
  id: string
  label: string
  items: string[]
  addLabel: string
  placeholder: string
  onChange: (items: string[]) => void
}

function StringListEditor({ id, label, items, addLabel, placeholder, onChange }: StringListEditorProps) {
  return (
    <div>
      <h3 id={id} className="text-sm font-semibold text-slate-900">
        {label}
      </h3>
      <ul className="mt-3 space-y-2" aria-labelledby={id}>
        {items.map((item, index) => (
          <li key={`${id}-${index}`} className="flex gap-2">
            <input
              type="text"
              value={item}
              placeholder={placeholder}
              aria-label={`${label} ${index + 1}`}
              className={controlClassName}
              onChange={(event) => {
                const next = [...items]
                next[index] = event.target.value
                onChange(next)
              }}
            />
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-red-700 underline"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-medium text-slate-900 underline"
        onClick={() => onChange([...items, ''])}
      >
        {addLabel}
      </button>
    </div>
  )
}

export function AdminToursPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [records, setRecords] = useState<TourRecord[]>([])
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [accommodations, setAccommodations] = useState<AccommodationRecord[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [tagsOpen, setTagsOpen] = useState(false)
  const [travelStyles, setTravelStyles] = useState<TravelStyleRecord[]>([])
  const [addingTravelStyle, setAddingTravelStyle] = useState(false)
  const [newTravelStyleName, setNewTravelStyleName] = useState('')
  const [travelStyleError, setTravelStyleError] = useState<string | null>(null)
  const [savingTravelStyle, setSavingTravelStyle] = useState(false)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [form, setForm] = useState<TourFormState>(emptyForm)

  async function refresh() {
    if (!isFirebaseConfigured) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      setRecords(await listAllTours())
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load tours.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return
    }

    let active = true

    listAllTours()
      .then((next) => {
        if (active) {
          setRecords(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load tours.'))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    listAllDestinations()
      .then((next) => {
        if (active) {
          setDestinations(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load destinations.'))
        }
      })

    listAllAccommodations()
      .then((next) => {
        if (active) {
          setAccommodations(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load accommodations.'))
        }
      })

    listAllTags()
      .then((next) => {
        if (active) {
          setTags(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load tags.'))
        }
      })

    listAllTravelStyles()
      .then((next) => {
        if (active) {
          setTravelStyles(next)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError, 'Unable to load travel styles.'))
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setForm((current) => {
      if (!current.legacyTravelStyle || current.travelStyleId) {
        return current
      }
      const legacy = normalizeTravelStyleName(current.legacyTravelStyle)
      const match = travelStyles.find((style) => normalizeTravelStyleName(style.name) === legacy)
      if (!match) {
        return current
      }
      return { ...current, travelStyleId: match.id }
    })
  }, [travelStyles])

  function resetTravelStyleDraft() {
    setAddingTravelStyle(false)
    setNewTravelStyleName('')
    setTravelStyleError(null)
  }

  async function saveNewTravelStyle() {
    const name = newTravelStyleName.trim().replace(/\s+/g, ' ')
    if (!name) {
      setTravelStyleError('Enter a travel style name.')
      return
    }

    setSavingTravelStyle(true)
    setTravelStyleError(null)
    try {
      const id = await createTravelStyle({ name, slug: '' })
      const next = await listAllTravelStyles()
      setTravelStyles(next)
      setForm((current) => ({ ...current, travelStyleId: id }))
      resetTravelStyleDraft()
    } catch (saveError) {
      setTravelStyleError(errorMessage(saveError, 'Unable to save this travel style.'))
    } finally {
      setSavingTravelStyle(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setSlugManual(false)
    setFieldErrors({})
    resetTravelStyleDraft()
    setForm(emptyForm())
    setFormOpen(true)
  }

  async function openEdit(id: string) {
    setEditingId(id)
    setSlugManual(true)
    setFieldErrors({})
    setFormOpen(true)
    setFormLoading(true)
    setError(null)
    resetTravelStyleDraft()

    try {
      const tour = await getTour(id)
      if (!tour) {
        setFormOpen(false)
        setEditingId(null)
        setRecords((current) => current.filter((record) => record.id !== id))
        setError('This tour could not be found.')
        return
      }
      setForm(tourToForm(tour))
    } catch (loadError) {
      setFormOpen(false)
      setEditingId(null)
      setError(errorMessage(loadError, 'Unable to load this tour.'))
    } finally {
      setFormLoading(false)
    }
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugManual ? current.slug : slugify(title),
    }))
  }

  async function reloadTags() {
    try {
      setTags(await listAllTags())
    } catch (loadError) {
      setError(errorMessage(loadError, 'Unable to load tags.'))
    }
  }

  function setTagSelected(id: string, selected: boolean) {
    setForm((current) => {
      const alreadySelected = current.tagIds.includes(id)
      if (selected === alreadySelected) {
        return current
      }

      return {
        ...current,
        tagIds: selected ? [...current.tagIds, id] : current.tagIds.filter((item) => item !== id),
      }
    })
  }

  function setAccommodationSelected(id: string, selected: boolean) {
    setForm((current) => {
      const alreadySelected = current.accommodationIds.includes(id)
      if (selected === alreadySelected) {
        return current
      }

      return {
        ...current,
        accommodationIds: selected
          ? [...current.accommodationIds, id]
          : current.accommodationIds.filter((item) => item !== id),
      }
    })
  }

  function setDestinationSelected(id: string, selected: boolean) {
    setForm((current) => {
      const alreadySelected = current.destinationIds.includes(id)
      if (selected === alreadySelected) {
        return current
      }

      return {
        ...current,
        destinationIds: selected
          ? [...current.destinationIds, id]
          : current.destinationIds.filter((item) => item !== id),
      }
    })
  }

  function addDay() {
    setForm((current) => ({
      ...current,
      itinerary: renumberDays([
        ...current.itinerary,
        { day: '', title: '', description: '', locations: [] },
      ]),
    }))
  }

  function removeDay(index: number) {
    setForm((current) => ({
      ...current,
      itinerary: renumberDays(current.itinerary.filter((_, dayIndex) => dayIndex !== index)),
    }))
  }

  function moveDay(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction
      if (target < 0 || target >= current.itinerary.length) {
        return current
      }

      const next = [...current.itinerary]
      const [day] = next.splice(index, 1)
      if (!day) {
        return current
      }
      next.splice(target, 0, day)
      return { ...current, itinerary: renumberDays(next) }
    })
  }

  function updateDay(index: number, patch: Partial<ItineraryDraft>) {
    setForm((current) => ({
      ...current,
      itinerary: current.itinerary.map((day, dayIndex) => (dayIndex === index ? { ...day, ...patch } : day)),
    }))
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function updateImage(index: number, patch: Partial<ImageDraft>) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || uploading) {
      return
    }

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
        await updateTour(editingId, parsed.value)
      } else {
        await createTour(parsed.value)
      }
      setFormOpen(false)
      setEditingId(null)
      await refresh()
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save this tour. The tour was not saved.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Delete this tour? This cannot be undone.')) {
      return
    }

    try {
      await deleteTour(id)
      if (editingId === id) {
        setFormOpen(false)
        setEditingId(null)
      }
      await refresh()
    } catch (deleteError) {
      setError(errorMessage(deleteError, 'Unable to delete this tour.'))
    }
  }

  const missingDestinationIds = form.destinationIds.filter(
    (id) => !destinations.some((destination) => destination.id === id),
  )
  const missingAccommodationIds = form.accommodationIds.filter(
    (id) => !accommodations.some((accommodation) => accommodation.id === id),
  )
  const missingTagIds = form.tagIds.filter((id) => !tags.some((tag) => tag.id === id))

  return (
    <>
      <PageMeta title="Admin · Tours" description="Create, edit, and delete package tours." />
      <AdminHeader title="Tours" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-sm text-slate-600">
            Package tours are stored in Firestore. Published, popular, and featured are saved separately.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg"
              disabled={!isFirebaseConfigured}
              onClick={() => setTagsOpen((open) => !open)}
            >
              Manage tags
            </Button>
            <Button type="button" className="rounded-lg" disabled={!isFirebaseConfigured} onClick={openCreate}>
              Add tour
            </Button>
          </div>
        </div>

        {tagsOpen ? <TourTagsManager onChanged={() => void reloadTags()} /> : null}

        {!isFirebaseConfigured ? (
          <ErrorState title="Firebase is not configured" message="Add your Firebase web config to manage tours." />
        ) : null}

        {error ? <ErrorState title="Tours error" message={error} /> : null}

        {formOpen ? (
          formLoading ? (
            <LoadingState label="Loading tour" />
          ) : (
            <form
              className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5"
              onSubmit={onSubmit}
              noValidate
            >
              <h2 className="text-sm font-semibold text-slate-900">{editingId ? 'Edit tour' : 'Add tour'}</h2>

              <div className="mt-4">
                <label htmlFor="tour-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="tour-title"
                  type="text"
                  value={form.title}
                  className={controlClassName}
                  onChange={(event) => updateTitle(event.target.value)}
                />
                <FormError message={fieldErrors.title} />
              </div>

              <div className="mt-4">
                <label htmlFor="tour-slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  id="tour-slug"
                  type="text"
                  value={form.slug}
                  className={controlClassName}
                  onChange={(event) => {
                    setSlugManual(true)
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }}
                />
                <FormError message={fieldErrors.slug} />
              </div>

              <div className="mt-4">
                <label htmlFor="tour-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="tour-description"
                  rows={4}
                  value={form.description}
                  className={controlClassName}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
                <FormError message={fieldErrors.description} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tour-duration" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Duration
                  </label>
                  <input
                    id="tour-duration"
                    type="text"
                    value={form.duration}
                    placeholder="8 Days / 7 Nights"
                    className={controlClassName}
                    onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                  />
                  <FormError message={fieldErrors.duration} />
                </div>
                <div>
                  <label htmlFor="tour-price" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Price
                  </label>
                  <input
                    id="tour-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    className={controlClassName}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  />
                  <FormError message={fieldErrors.price} />
                </div>
                <div>
                  <label htmlFor="tour-pricing-basis" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Pricing basis
                  </label>
                  <select
                    id="tour-pricing-basis"
                    value={form.pricingBasis}
                    className={controlClassName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pricingBasis: event.target.value as TourPricingBasis,
                      }))
                    }
                  >
                    {pricingBasisOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {form.pricingBasis === 'custom' ? (
                <div className="mt-4">
                  <label htmlFor="tour-pricing-custom" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Custom pricing label
                  </label>
                  <input
                    id="tour-pricing-custom"
                    type="text"
                    value={form.pricingCustomLabel}
                    placeholder="For a private couple, including breakfast"
                    className={controlClassName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, pricingCustomLabel: event.target.value }))
                    }
                  />
                  <FormError message={fieldErrors.pricingCustom} />
                </div>
              ) : null}
              {Number.isFinite(Number(form.price)) && form.price.trim() !== '' ? (
                <p className="mt-3 text-sm text-slate-500">
                  {pricingPreview(Number(form.price), form.pricingBasis, form.pricingCustomLabel)}
                </p>
              ) : null}

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="tour-travel-style" className="block text-sm font-medium text-slate-700">
                    Travel Style
                  </label>
                  {addingTravelStyle ? null : (
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-900 underline"
                      onClick={() => {
                        setAddingTravelStyle(true)
                        setTravelStyleError(null)
                      }}
                    >
                      + Add new travel style
                    </button>
                  )}
                </div>
                <select
                  id="tour-travel-style"
                  value={form.travelStyleId}
                  className={controlClassName}
                  onChange={(event) => setForm((current) => ({ ...current, travelStyleId: event.target.value }))}
                >
                  <option value="">Select travel style</option>
                  {travelStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                  {form.travelStyleId && !travelStyles.some((style) => style.id === form.travelStyleId) ? (
                    <option value={form.travelStyleId}>Saved travel style ({form.travelStyleId})</option>
                  ) : null}
                </select>
                {!form.travelStyleId && form.legacyTravelStyle ? (
                  <p className="mt-2 text-sm text-slate-600">
                    This tour was saved as “{form.legacyTravelStyle}”. Select that style, or add it if it is not in the
                    list.
                  </p>
                ) : null}
                {addingTravelStyle ? (
                  <div className="mt-3 rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-900">New travel style</p>
                    <label htmlFor="new-travel-style" className="mt-3 mb-1.5 block text-sm font-medium text-slate-700">
                      Travel style name
                    </label>
                    <input
                      id="new-travel-style"
                      type="text"
                      value={newTravelStyleName}
                      className={controlClassName}
                      onChange={(event) => setNewTravelStyleName(event.target.value)}
                    />
                    <FormError message={travelStyleError ?? undefined} />
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        className="rounded-lg"
                        disabled={savingTravelStyle}
                        onClick={() => void saveNewTravelStyle()}
                      >
                        {savingTravelStyle ? 'Saving…' : 'Save'}
                      </Button>
                      <Button type="button" variant="secondary" className="rounded-lg" onClick={resetTravelStyleDraft}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Destinations</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Select destinations to store their IDs on this tour.
                  {form.destinationIds.length > 0
                    ? ` ${form.destinationIds.length} selected.`
                    : ' None selected.'}
                </p>
                <div className="mt-3 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
                  {destinations.length === 0 && missingDestinationIds.length === 0 ? (
                    <p className="text-sm text-slate-500">No destinations yet. Add them on the Destinations page.</p>
                  ) : null}
                  {destinations.map((destination) => (
                    <label key={destination.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked={form.destinationIds.includes(destination.id)}
                        onChange={(event) => setDestinationSelected(destination.id, event.target.checked)}
                      />
                      {destinationLabel(destination)}
                    </label>
                  ))}
                  {missingDestinationIds.map((id) => (
                    <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked
                        onChange={(event) => setDestinationSelected(id, event.target.checked)}
                      />
                      Saved destination ({id})
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Accommodation</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Select the accommodations that apply to this tour. They are saved as IDs.
                  {form.accommodationIds.length > 0
                    ? ` ${form.accommodationIds.length} selected.`
                    : ' None selected.'}
                </p>
                <div className="mt-3 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
                  {accommodations.length === 0 && missingAccommodationIds.length === 0 ? (
                    <p className="text-sm text-slate-500">No accommodations yet. Add them on the Accommodations page.</p>
                  ) : null}
                  {accommodations.map((accommodation) => (
                    <label key={accommodation.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked={form.accommodationIds.includes(accommodation.id)}
                        onChange={(event) => setAccommodationSelected(accommodation.id, event.target.checked)}
                      />
                      {accommodation.name.trim() || 'Untitled accommodation'}
                      {accommodation.published ? '' : ' (unpublished)'}
                    </label>
                  ))}
                  {missingAccommodationIds.map((id) => (
                    <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked
                        onChange={(event) => setAccommodationSelected(id, event.target.checked)}
                      />
                      Saved accommodation ({id})
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Tags</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Select tags created in Manage tags. They are saved as IDs.
                  {form.tagIds.length > 0 ? ` ${form.tagIds.length} selected.` : ' None selected.'}
                </p>
                <div className="mt-3 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
                  {tags.length === 0 && missingTagIds.length === 0 ? (
                    <p className="text-sm text-slate-500">No tags yet. Add them with Manage tags.</p>
                  ) : null}
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked={form.tagIds.includes(tag.id)}
                        onChange={(event) => setTagSelected(tag.id, event.target.checked)}
                      />
                      {tag.name.trim() || 'Untitled tag'}
                    </label>
                  ))}
                  {missingTagIds.map((id) => (
                    <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-slate-900"
                        checked
                        onChange={(event) => setTagSelected(id, event.target.checked)}
                      />
                      Saved tag ({id})
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Itinerary</h3>
                <div className="mt-3 space-y-4">
                  {form.itinerary.map((day, index) => (
                    <div key={`day-${index}`} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-slate-900">Day {day.day || index + 1}</h4>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="text-sm font-medium text-slate-900 underline disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={index === 0}
                            onClick={() => moveDay(index, -1)}
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            className="text-sm font-medium text-slate-900 underline disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={index === form.itinerary.length - 1}
                            onClick={() => moveDay(index, 1)}
                          >
                            Move down
                          </button>
                          <button
                            type="button"
                            className="text-sm font-medium text-red-700 underline"
                            onClick={() => removeDay(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
                        <div>
                          <label
                            htmlFor={`itinerary-day-${index}`}
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                          >
                            Day number
                          </label>
                          <input
                            id={`itinerary-day-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            value={day.day}
                            className={controlClassName}
                            onChange={(event) => updateDay(index, { day: event.target.value })}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`itinerary-title-${index}`}
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                          >
                            Title
                          </label>
                          <input
                            id={`itinerary-title-${index}`}
                            type="text"
                            value={day.title}
                            className={controlClassName}
                            onChange={(event) => updateDay(index, { title: event.target.value })}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label
                          htmlFor={`itinerary-description-${index}`}
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Description
                        </label>
                        <textarea
                          id={`itinerary-description-${index}`}
                          rows={3}
                          value={day.description}
                          className={controlClassName}
                          onChange={(event) => updateDay(index, { description: event.target.value })}
                        />
                      </div>
                      <div className="mt-4">
                        <StringListEditor
                          id={`itinerary-locations-${index}`}
                          label="Locations"
                          items={day.locations}
                          addLabel="Add location"
                          placeholder="Colombo"
                          onChange={(locations) => updateDay(index, { locations })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-3 text-sm font-medium text-slate-900 underline" onClick={addDay}>
                  Add day
                </button>
                <FormError message={fieldErrors.itinerary} />
              </div>

              <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
                <StringListEditor
                  id="tour-included"
                  label="Included"
                  items={form.included}
                  addLabel="Add included item"
                  placeholder="Airport pickup"
                  onChange={(included) => setForm((current) => ({ ...current, included }))}
                />
                <StringListEditor
                  id="tour-excluded"
                  label="Excluded"
                  items={form.excluded}
                  addLabel="Add excluded item"
                  placeholder="International flights"
                  onChange={(excluded) => setForm((current) => ({ ...current, excluded }))}
                />
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Images</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Images upload to Cloudinary. They are stored on the tour when you save.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading || saving}
                  className="mt-3 block w-full text-sm text-slate-600"
                  onChange={(event) => void onImagesSelected(event.target.files)}
                />
                {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading images…</p> : null}
                {!isCloudinaryConfigured ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Add Cloudinary settings before uploading images.
                  </p>
                ) : null}
                <ul className="mt-4 space-y-4">
                  {form.images.map((image, index) => (
                    <li key={`${image.publicId}-${index}`} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex gap-4">
                        <img
                          src={image.imageUrl}
                          alt={image.altText || 'Uploaded tour image'}
                          className="h-24 w-24 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1 space-y-3">
                          <div>
                            <label
                              htmlFor={`tour-image-alt-${index}`}
                              className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                              Alt text
                            </label>
                            <input
                              id={`tour-image-alt-${index}`}
                              type="text"
                              value={image.altText}
                              className={controlClassName}
                              onChange={(event) => updateImage(index, { altText: event.target.value })}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`tour-image-caption-${index}`}
                              className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                              Caption
                            </label>
                            <input
                              id={`tour-image-caption-${index}`}
                              type="text"
                              value={image.caption}
                              className={controlClassName}
                              onChange={(event) => updateImage(index, { caption: event.target.value })}
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

              <div className="mt-5 space-y-2 border-t border-slate-200 pt-5">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-slate-900"
                    checked={form.featured}
                    onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-slate-900"
                    checked={form.popular}
                    onChange={(event) => setForm((current) => ({ ...current, popular: event.target.checked }))}
                  />
                  Popular
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-slate-900"
                    checked={form.published}
                    onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                  />
                  Published
                </label>
              </div>

              <div className="mt-5 flex gap-3">
                <Button type="submit" className="rounded-lg" disabled={saving || uploading}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-lg"
                  onClick={() => {
                    setFormOpen(false)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )
        ) : null}

        {loading ? <LoadingState label="Loading tours" /> : null}

        {!loading && isFirebaseConfigured && records.length === 0 ? (
          <EmptyState title="No tours yet" message="Add a package tour to store it in Firestore." />
        ) : null}

        {!loading && records.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Popular</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{record.title}</td>
                    <td className="px-4 py-3 text-slate-500">{record.duration}</td>
                    <td className="px-4 py-3">{formatPrice(record.price)}</td>
                    <td className="px-4 py-3">{record.published ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.popular ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{record.featured ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="text-sm font-medium text-slate-900 underline"
                          onClick={() => void openEdit(record.id)}
                        >
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
