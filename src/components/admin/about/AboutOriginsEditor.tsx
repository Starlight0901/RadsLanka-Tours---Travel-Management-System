import { useEffect, useState, type FormEvent } from 'react'
import { AboutImageField } from '@/components/admin/about/AboutImageField.tsx'
import { controlClassName, errorMessage, hintClassName, labelClassName } from '@/components/admin/about/aboutFormStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  ABOUT_DEFAULT_ORIGINS_IMAGE_URL,
  ABOUT_JOURNEY_BASELINE_MAX,
  ABOUT_JOURNEY_TRACKING,
  ABOUT_ORIGINS_DESCRIPTION_DEFAULT,
  ABOUT_ORIGINS_DESCRIPTION_MAX,
  ABOUT_ORIGINS_TITLE_DEFAULT,
  ABOUT_ORIGINS_TITLE_MAX,
  ABOUT_OWNERSHIP_LABEL,
  ABOUT_OWNERSHIP_VALUE,
  displayedJourneyTotal,
} from '@/config/aboutContent.ts'
import { isFirebaseConfigured } from '@/config/env.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import { countTrackedCompletedJourneys, getAboutSettings, updateAboutOrigins } from '@/services/firebase/about.ts'
import type { MediaAsset } from '@/types/models.ts'

type OriginsForm = {
  published: boolean
  image: MediaAsset | null
  title: string
  description: string
  journeyBaseline: string
}

export function AboutOriginsEditor() {
  const [form, setForm] = useState<OriginsForm | null>(null)
  const [trackedCompleted, setTrackedCompleted] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    let active = true
    Promise.all([getAboutSettings(), countTrackedCompletedJourneys()])
      .then(([settings, tracked]) => {
        if (!active) {
          return
        }
        setTrackedCompleted(tracked)
        setForm({
          published: settings.originsPublished,
          image: settings.originsImage,
          title: settings.originsTitle || ABOUT_ORIGINS_TITLE_DEFAULT,
          description: settings.originsDescription || ABOUT_ORIGINS_DESCRIPTION_DEFAULT,
          journeyBaseline: String(settings.journeyBaseline),
        })
      })
      .catch((loadError) => {
        if (active) {
          setError(errorMessage(loadError, 'Origins settings could not be loaded.'))
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

  async function onUpload(file: File) {
    setUploading(true)
    setError(null)
    setStatus(null)
    try {
      const result = await uploadImage(file)
      setForm((current) =>
        current
          ? {
              ...current,
              image: {
                imageUrl: result.secure_url,
                publicId: result.public_id,
                altText: current.image?.altText || 'RadsLanka Tours',
              },
            }
          : current,
      )
    } catch (uploadError) {
      setError(errorMessage(uploadError, 'Image upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form) {
      return
    }

    const journeyBaseline = Number(form.journeyBaseline)
    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      await updateAboutOrigins({
        published: form.published,
        image: form.image,
        title: form.title,
        description: form.description,
        journeyBaseline,
      })
      setStatus('Origins section saved.')
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save the origins section.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading origins" />
  }

  if (!form) {
    return <ErrorState title="Origins settings" message={error ?? 'Origins settings could not be loaded.'} />
  }

  const baselineNumber = Number(form.journeyBaseline)
  const displayedTotal = displayedJourneyTotal(
    Number.isFinite(baselineNumber) ? baselineNumber : 0,
    trackedCompleted,
  )
  const busy = saving || uploading

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={form.published}
          disabled={busy}
          onChange={(event) =>
            setForm((current) => (current ? { ...current, published: event.target.checked } : current))
          }
        />
        <span>
          <span className="font-medium text-slate-900">Publish Our Origins section</span>
          <span className="mt-1 block text-slate-600">
            When this is off, the entire Our Origins section is hidden on the public About Us page.
          </span>
        </span>
      </label>

      <AboutImageField
        id="about-origins-image"
        label="Origins image"
        image={form.image}
        fallbackUrl={ABOUT_DEFAULT_ORIGINS_IMAGE_URL}
        fallbackCaption="The RadsLanka logo is used until you upload a replacement."
        objectFit="contain"
        uploading={uploading}
        disabled={busy}
        onUpload={(file) => void onUpload(file)}
        onAltChange={(altText) =>
          setForm((current) => (current?.image ? { ...current, image: { ...current.image, altText } } : current))
        }
      />

      <div>
        <label htmlFor="about-origins-title" className={labelClassName}>
          Origins title
        </label>
        <input
          id="about-origins-title"
          value={form.title}
          maxLength={ABOUT_ORIGINS_TITLE_MAX}
          className={controlClassName}
          disabled={busy}
          onChange={(event) => setForm((current) => (current ? { ...current, title: event.target.value } : current))}
        />
        <p className={hintClassName}>
          {form.title.trim().length} / {ABOUT_ORIGINS_TITLE_MAX}. An empty saved title uses the original copy on the public
          page.
        </p>
      </div>

      <div>
        <label htmlFor="about-origins-description" className={labelClassName}>
          Origins description
        </label>
        <textarea
          id="about-origins-description"
          rows={4}
          value={form.description}
          maxLength={ABOUT_ORIGINS_DESCRIPTION_MAX}
          className={controlClassName}
          disabled={busy}
          onChange={(event) =>
            setForm((current) => (current ? { ...current, description: event.target.value } : current))
          }
        />
        <p className={hintClassName}>
          {form.description.length} / {ABOUT_ORIGINS_DESCRIPTION_MAX}. Keep quotation marks in the saved text if you want
          them. The public page will not add a second pair.
        </p>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Journey statistics</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{ABOUT_JOURNEY_TRACKING.missing}</p>

        <div className="mt-4">
          <label htmlFor="about-journey-baseline" className={labelClassName}>
            Historical journey baseline
          </label>
          <input
            id="about-journey-baseline"
            type="number"
            min={0}
            max={ABOUT_JOURNEY_BASELINE_MAX}
            step={1}
            value={form.journeyBaseline}
            className={controlClassName}
            disabled={busy}
            onChange={(event) =>
              setForm((current) => (current ? { ...current, journeyBaseline: event.target.value } : current))
            }
          />
          <p className={hintClassName}>
            Journeys completed before this website’s tracking. This number is never incremented automatically.
          </p>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Baseline</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {Number.isFinite(baselineNumber) ? Math.max(0, Math.floor(baselineNumber)) : 0}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tracked completions</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{trackedCompleted}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Public total</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{displayedTotal}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Ownership statistic</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{ABOUT_OWNERSHIP_VALUE}</p>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{ABOUT_OWNERSHIP_LABEL}</p>
        </div>
      </div>

      {status ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}
      <FormError message={error ?? undefined} />
      <Button type="submit" className="rounded-lg" disabled={busy}>
        {saving ? 'Saving…' : 'Save origins'}
      </Button>
    </form>
  )
}
