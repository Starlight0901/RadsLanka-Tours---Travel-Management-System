import { useEffect, useState, type FormEvent } from 'react'
import { AboutImageField } from '@/components/admin/about/AboutImageField.tsx'
import { controlClassName, errorMessage, labelClassName } from '@/components/admin/about/aboutFormStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  ABOUT_DEFAULT_HERO_IMAGE_URL,
  ABOUT_HERO_DESCRIPTION_MAX,
  ABOUT_HERO_TITLE_DEFAULT,
  ABOUT_HERO_TITLE_MAX,
} from '@/config/aboutContent.ts'
import { isCloudinaryConfigured, isFirebaseConfigured } from '@/config/env.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import { getAboutSettings, updateAboutHero } from '@/services/firebase/about.ts'
import type { MediaAsset } from '@/types/models.ts'

type HeroForm = {
  title: string
  description: string
  image: MediaAsset | null
}

export function AboutHeroEditor() {
  const [form, setForm] = useState<HeroForm | null>(null)
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
    getAboutSettings()
      .then((settings) => {
        if (!active) {
          return
        }
        setForm({
          title: settings.heroTitle || ABOUT_HERO_TITLE_DEFAULT,
          description: settings.heroDescription,
          image: settings.heroImage,
        })
      })
      .catch((loadError) => {
        if (active) {
          setError(errorMessage(loadError, 'Hero settings could not be loaded.'))
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
                altText: current.image?.altText || 'About RadsLanka Tours',
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

    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      await updateAboutHero({
        title: form.title,
        description: form.description,
        image: form.image,
      })
      setStatus('Hero section saved.')
    } catch (saveError) {
      setError(errorMessage(saveError, 'Unable to save the hero section.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading hero" />
  }

  if (!form) {
    return <ErrorState title="Hero settings" message={error ?? 'Hero settings could not be loaded.'} />
  }

  const busy = saving || uploading

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AboutImageField
        id="about-hero-image"
        label="Hero image"
        image={form.image}
        fallbackUrl={ABOUT_DEFAULT_HERO_IMAGE_URL}
        fallbackCaption="Current public hero image. Upload a replacement to change it. Saving other fields keeps this image."
        uploading={uploading}
        disabled={busy}
        hint={isCloudinaryConfigured ? 'Image upload is optional.' : undefined}
        onUpload={(file) => void onUpload(file)}
        onAltChange={(altText) =>
          setForm((current) => (current?.image ? { ...current, image: { ...current.image, altText } } : current))
        }
      />
      <div>
        <label htmlFor="about-hero-title" className={labelClassName}>
          Hero title
        </label>
        <input
          id="about-hero-title"
          value={form.title}
          maxLength={ABOUT_HERO_TITLE_MAX}
          className={controlClassName}
          disabled={busy}
          onChange={(event) => setForm((current) => (current ? { ...current, title: event.target.value } : current))}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {form.title.trim().length} / {ABOUT_HERO_TITLE_MAX}. Empty values use “{ABOUT_HERO_TITLE_DEFAULT}” on the public page.
        </p>
      </div>
      <div>
        <label htmlFor="about-hero-description" className={labelClassName}>
          Hero description
        </label>
        <textarea
          id="about-hero-description"
          rows={4}
          value={form.description}
          maxLength={ABOUT_HERO_DESCRIPTION_MAX}
          className={controlClassName}
          disabled={busy}
          onChange={(event) =>
            setForm((current) => (current ? { ...current, description: event.target.value } : current))
          }
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Optional. {form.description.length} / {ABOUT_HERO_DESCRIPTION_MAX}. An empty description stays empty on the public page.
        </p>
      </div>
      {status ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {status}
        </p>
      ) : null}
      <FormError message={error ?? undefined} />
      <Button type="submit" className="rounded-lg" disabled={busy}>
        {saving ? 'Saving…' : 'Save hero'}
      </Button>
    </form>
  )
}
