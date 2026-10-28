import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CharacteristicsField, LocationFields, RecommendedStayField } from '@/components/admin/destinations/GlanceFields.tsx'
import { EssenceThemesField } from '@/components/admin/destinations/EssenceThemesField.tsx'
import { ExperiencesEditor } from '@/components/admin/destinations/ExperiencesEditor.tsx'
import { HeroImageField } from '@/components/admin/destinations/HeroImageField.tsx'
import { HighlightsEditor } from '@/components/admin/destinations/HighlightsEditor.tsx'
import { IdealForField } from '@/components/admin/destinations/IdealForField.tsx'
import { MonthRangePicker } from '@/components/admin/destinations/MonthRangePicker.tsx'
import { OverviewDescriptionField } from '@/components/admin/destinations/OverviewDescriptionField.tsx'
import {
  GalleryImagesEditor,
  type DestinationGalleryDraft,
} from '@/components/admin/destinations/GalleryImagesEditor.tsx'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import {
  DESTINATION_OVERVIEW_DESCRIPTION_MAX,
  DESTINATION_OVERVIEW_TITLE_MAX,
  DESTINATION_SHORT_DESCRIPTION_MAX,
  DESTINATION_SUBTITLE_MAX,
  formatMonthRange,
} from '@/config/destinationContent.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import { listIdealForOptions, saveIdealForOption } from '@/services/firebase/audienceCategories.ts'
import {
  EMPTY_DESTINATION_GLANCE,
  createDestination,
  updateDestination,
  type DestinationInput,
  type DestinationRecord,
} from '@/services/firebase/destinations.ts'
import { listAllGalleryItems, type GalleryRecord } from '@/services/firebase/gallery.ts'
import type {
  DestinationExperienceItem,
  DestinationGlanceDetails,
  DestinationHighlightItem,
  MediaAsset,
} from '@/types/models.ts'
import { galleryImageKey } from '@/utils/galleryLimits.ts'
import { slugify } from '@/utils/slugify.ts'

type DestinationFormState = {
  name: string
  subtitle: string
  description: string
  coverImage: MediaAsset | null
  glance: DestinationGlanceDetails
  essenceThemes: string[]
  overviewTitle: string
  overviewDescription: string
  keyHighlights: DestinationHighlightItem[]
  experiences: DestinationExperienceItem[]
  gallery: DestinationGalleryDraft[]
  featured: boolean
  popular: boolean
  published: boolean
  availableForInquiry: boolean
}

type FieldErrors = Partial<Record<'name' | 'coverImage' | 'gallery', string>>

type DestinationFormProps = {
  record: DestinationRecord | null
  onCancel: () => void
  onSaved: () => Promise<void>
}

function emptyForm(): DestinationFormState {
  return {
    name: '',
    subtitle: '',
    description: '',
    coverImage: null,
    glance: { ...EMPTY_DESTINATION_GLANCE, characteristics: [], idealFor: [] },
    essenceThemes: [],
    overviewTitle: '',
    overviewDescription: '',
    keyHighlights: [],
    experiences: [],
    gallery: [],
    featured: false,
    popular: false,
    published: false,
    availableForInquiry: true,
  }
}

function recordToForm(record: DestinationRecord): DestinationFormState {
  return {
    name: record.name,
    subtitle: record.subtitle,
    description: record.description,
    coverImage: record.coverImage,
    glance: {
      ...record.glance,
      characteristics: [...record.glance.characteristics],
      idealFor: [...record.glance.idealFor],
    },
    essenceThemes: [...record.essenceThemes],
    overviewTitle: record.overviewTitle,
    overviewDescription: record.overviewDescription,
    keyHighlights: record.keyHighlights.map((item) => ({ ...item })),
    experiences: record.experiences.map((item) => ({ ...item, image: item.image ? { ...item.image } : null })),
    gallery: record.gallery.map((image) => ({
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      title: image.caption?.trim() || image.altText.trim(),
    })),
    featured: record.featured,
    popular: record.popular,
    published: record.published,
    availableForInquiry: record.availableForInquiry,
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function toInput(form: DestinationFormState): DestinationInput {
  return {
    name: form.name,
    subtitle: form.subtitle,
    description: form.description,
    coverImage: form.coverImage,
    glance: form.glance,
    essenceThemes: form.essenceThemes,
    overviewTitle: form.overviewTitle,
    overviewDescription: form.overviewDescription,
    keyHighlights: form.keyHighlights,
    experiences: form.experiences,
    gallery: form.gallery.flatMap((item) => {
      const title = item.title.trim()
      if (!item.imageUrl || !item.publicId) {
        return []
      }
      return [
        {
          imageUrl: item.imageUrl,
          publicId: item.publicId,
          altText: title,
          ...(title ? { caption: title } : {}),
        },
      ]
    }),
    featured: form.featured,
    popular: form.popular,
    published: form.published,
    availableForInquiry: form.availableForInquiry,
  }
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-slate-200 pt-6">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function DestinationForm({ record, onCancel, onSaved }: DestinationFormProps) {
  const editing = Boolean(record)
  const [form, setForm] = useState<DestinationFormState>(record ? recordToForm(record) : emptyForm)
  const [idealForOptions, setIdealForOptions] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [galleryRecords, setGalleryRecords] = useState<GalleryRecord[]>([])

  useEffect(() => {
    let active = true
    listIdealForOptions()
      .then((options) => {
        if (active) {
          setIdealForOptions(options)
        }
      })
      .catch(() => {
        if (active) {
          setIdealForOptions([])
        }
      })
    listAllGalleryItems()
      .then((items) => {
        if (active) {
          setGalleryRecords(items)
        }
      })
      .catch(() => {
        if (active) {
          setGalleryRecords([])
        }
      })
    return () => {
      active = false
    }
  }, [])

  function patchGlance(patch: Partial<DestinationGlanceDetails>) {
    setForm((current) => ({ ...current, glance: { ...current.glance, ...patch } }))
  }

  async function onHeroSelected(file: File) {
    setUploading(true)
    setError(null)
    setFieldErrors((current) => ({ ...current, coverImage: undefined }))
    try {
      const result = await uploadImage(file)
      setForm((current) => ({
        ...current,
        coverImage: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          altText: current.coverImage?.altText || current.name.trim(),
        },
      }))
    } catch (uploadError) {
      setError(errorMessage(uploadError, 'Image upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const errors: FieldErrors = {}
    if (!form.name.trim()) {
      errors.name = 'Enter a destination title.'
    }
    if (!editing && !form.coverImage) {
      errors.coverImage = 'Upload a hero image before saving a new destination.'
    }
    const incompleteGallery = form.gallery.findIndex((item) => !item.title.trim() || !item.imageUrl || !item.publicId)
    if (incompleteGallery >= 0) {
      errors.gallery = `Gallery image ${incompleteGallery + 1} needs a title and an uploaded image.`
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    const invalidExperience = form.experiences.findIndex(
      (item) => item.published && (!item.title.trim() || !item.image),
    )
    if (invalidExperience >= 0) {
      setError(`Experience ${invalidExperience + 1} needs a title and image before it can be published.`)
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      const input = toInput(form)
      if (record) {
        await updateDestination(record.id, input)
      } else {
        await createDestination(input)
      }
      setStatus(record ? 'Destination saved.' : 'Destination added.')
      await onSaved()
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save this destination.'))
    } finally {
      setSaving(false)
    }
  }

  const generatedSlug = slugify(form.name)
  const busy = saving || uploading
  const formGalleryKeys = new Set(form.gallery.map((item) => galleryImageKey(item)).filter(Boolean))
  const associatedGalleryCount = record
    ? new Set(
        galleryRecords.flatMap((item) => {
          if (item.destinationId !== record.id) {
            return []
          }
          const key = galleryImageKey(item)
          return key && !formGalleryKeys.has(key) ? [key] : []
        }),
      ).size
    : 0

  return (
    <form className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5" onSubmit={onSubmit} noValidate>
      <h2 className="text-sm font-semibold text-slate-900">{editing ? 'Edit destination' : 'Add destination'}</h2>
      <p className="mt-1 text-sm text-slate-600">
        Required fields are marked. Existing places, travel notes, and related tours are left unchanged.
      </p>

      {status ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Basic information</h3>
        <HeroImageField
          image={form.coverImage}
          required={!editing}
          uploading={uploading}
          disabled={busy}
          error={fieldErrors.coverImage}
          onUpload={(file) => void onHeroSelected(file)}
          onReplace={() => undefined}
          onAltChange={(altText) =>
            setForm((current) =>
              current.coverImage ? { ...current, coverImage: { ...current.coverImage, altText } } : current,
            )
          }
        />
        <div>
          <label htmlFor="destination-title" className={labelClassName}>
            Title<span className="text-red-700"> *</span>
          </label>
          <input
            id="destination-title"
            type="text"
            value={form.name}
            maxLength={80}
            className={controlClassName}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <FormError message={fieldErrors.name} />
          <p className={hintClassName}>Slug: {generatedSlug || 'generated from the title'}</p>
        </div>
        <div>
          <label htmlFor="destination-subtitle" className={labelClassName}>
            Subtitle
          </label>
          <input
            id="destination-subtitle"
            type="text"
            value={form.subtitle}
            maxLength={DESTINATION_SUBTITLE_MAX}
            className={controlClassName}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="destination-short-description" className={labelClassName}>
            Short description
          </label>
          <textarea
            id="destination-short-description"
            rows={4}
            value={form.description}
            maxLength={DESTINATION_SHORT_DESCRIPTION_MAX}
            className={controlClassName}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <p className={hintClassName}>Shown under the hero. Line breaks are kept.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.availableForInquiry}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, availableForInquiry: event.target.checked }))}
          />
          Available as an inquiry-form option
        </label>
      </section>

      <FormSection
        title="Destination at a Glance"
        description="Optional facts for the public sidebar. Leave a field empty if it is not confirmed."
      >
        <div>
          <p id="destination-best-time" className={labelClassName}>
            Best time to visit
          </p>
          <MonthRangePicker
            labelId="destination-best-time"
            value={form.glance.bestTimeMonths}
            onChange={(bestTimeMonths) => patchGlance({ bestTimeMonths })}
          />
          {form.glance.bestTimeMonths ? (
            <p className={hintClassName}>Saved as {formatMonthRange(form.glance.bestTimeMonths)} every year.</p>
          ) : null}
        </div>
        <LocationFields
          province={form.glance.province}
          district={form.glance.district}
          onChange={(value) => patchGlance(value)}
        />
        <RecommendedStayField
          value={form.glance.recommendedStay}
          onChange={(recommendedStay) => patchGlance({ recommendedStay })}
        />
        <div>
          <p id="destination-characteristics" className={labelClassName}>
            Destination type
          </p>
          <CharacteristicsField
            labelId="destination-characteristics"
            selected={form.glance.characteristics}
            other={form.glance.characteristicOther}
            onChange={(value) => patchGlance(value)}
          />
        </div>
        <div>
          <p id="destination-ideal-for" className={labelClassName}>
            Ideal for
          </p>
          <IdealForField
            labelId="destination-ideal-for"
            options={idealForOptions}
            selected={form.glance.idealFor}
            onChange={(idealFor) => patchGlance({ idealFor })}
            onCreateOption={async (label) => {
              const stored = await saveIdealForOption(label)
              setIdealForOptions(await listIdealForOptions())
              return stored
            }}
          />
        </div>
      </FormSection>

      <FormSection
        title="The Essence of This Destination"
        description="Choose the themes that describe this destination. No descriptions are generated."
      >
        <EssenceThemesField
          labelId="destination-essence"
          selected={form.essenceThemes}
          onChange={(essenceThemes) => setForm((current) => ({ ...current, essenceThemes }))}
        />
        <p id="destination-essence" className="sr-only">
          Essence themes
        </p>
      </FormSection>

      <FormSection
        title="Destination Overview"
        description="Optional longer copy for the public overview column. Formatting is stored as Markdown."
      >
        <div>
          <label htmlFor="destination-overview-title" className={labelClassName}>
            Overview title
          </label>
          <input
            id="destination-overview-title"
            type="text"
            value={form.overviewTitle}
            maxLength={DESTINATION_OVERVIEW_TITLE_MAX}
            className={controlClassName}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, overviewTitle: event.target.value }))}
          />
        </div>
        <OverviewDescriptionField
          id="destination-overview-description"
          value={form.overviewDescription}
          maxLength={DESTINATION_OVERVIEW_DESCRIPTION_MAX}
          disabled={busy}
          onChange={(overviewDescription) => setForm((current) => ({ ...current, overviewDescription }))}
        />
      </FormSection>

      <FormSection
        title="Highlights of This Destination"
        description="Short visitor-friendly facts. Published items appear in the public sidebar. Do not invent hours, safety claims, or guaranteed wildlife sightings."
      >
        <HighlightsEditor
          items={form.keyHighlights}
          onChange={(keyHighlights) => setForm((current) => ({ ...current, keyHighlights }))}
        />
      </FormSection>

      <FormSection
        title="Gallery Images"
        description="Optional photographs for the destination gallery and the public Gallery page. The hero image is not added automatically."
      >
        <GalleryImagesEditor
          items={form.gallery}
          associatedCount={associatedGalleryCount}
          disabled={busy}
          error={fieldErrors.gallery}
          onChange={(gallery) => {
            setFieldErrors((current) => ({ ...current, gallery: undefined }))
            setForm((current) => ({ ...current, gallery }))
          }}
          onError={(message) => setError(message)}
        />
      </FormSection>

      <FormSection
        title={`Experiences in ${form.name.trim() || 'this destination'}`}
        description="Published experiences need a title and image. Unpublished drafts can stay incomplete."
      >
        <ExperiencesEditor
          items={form.experiences}
          disabled={busy}
          onChange={(experiences) => setForm((current) => ({ ...current, experiences }))}
          onPatch={(id, patch) =>
            setForm((current) => ({
              ...current,
              experiences: current.experiences.map((item) => (item.id === id ? { ...item, ...patch } : item)),
            }))
          }
          onError={(message) => setError(message)}
        />
      </FormSection>

      <FormSection
        title="Destination Status"
        description="Featured destinations appear on the homepage. Popular destinations appear in the Popular listing filter. Unpublished destinations stay hidden from the public website."
      >
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.featured}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.popular}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, popular: event.target.checked }))}
          />
          Popular
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.published}
            disabled={busy}
            onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
          />
          Published
        </label>
      </FormSection>

      <div className="mt-6 flex gap-3">
        <Button type="submit" className="rounded-lg" disabled={busy}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="secondary" className="rounded-lg" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
