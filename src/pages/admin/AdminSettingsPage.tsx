import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormError } from '@/components/forms/FormError.tsx'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { AdminHeader } from '@/components/layout/AdminHeader.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import {
  HERO_DESCRIPTION_MAX_LENGTH,
  HERO_TEXT_MAX_LENGTH,
  HERO_TEXT_STYLE_OPTIONS,
  createDefaultHomepageHero,
  getSiteSettings,
  homepageHeroFromSettings,
  updateSiteSettings,
} from '@/services/firebase/siteSettings.ts'
import type { HeroTextBlock, HomepageHeroContent } from '@/types/models.ts'

const heroTextBlockSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Enter text for this block.')
    .max(HERO_TEXT_MAX_LENGTH, `Keep this line under ${HERO_TEXT_MAX_LENGTH} characters.`),
  style: z.enum(['eyebrow', 'title', 'subtitle']),
})

const heroFormSchema = z.object({
  blocks: z.tuple([heroTextBlockSchema, heroTextBlockSchema, heroTextBlockSchema]),
  heroDescription: z
    .string()
    .trim()
    .min(1, 'Enter a hero description.')
    .max(
      HERO_DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${HERO_DESCRIPTION_MAX_LENGTH} characters.`,
    ),
})

type HeroFormValues = z.infer<typeof heroFormSchema>

const heroBlockFields = [0, 1, 2] as const

const controlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2'

function toHeroFormValues(content: HomepageHeroContent): HeroFormValues {
  const defaults = createDefaultHomepageHero().heroTextBlocks
  const blocks = heroBlockFields.map((index) => {
    const block = content.heroTextBlocks[index] ?? defaults[index]
    return {
      text: block?.text ?? '',
      style: block?.style ?? 'subtitle',
    }
  })

  return {
    blocks: [blocks[0] as HeroTextBlock, blocks[1] as HeroTextBlock, blocks[2] as HeroTextBlock],
    heroDescription: content.heroDescription,
  }
}

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: toHeroFormValues(createDefaultHomepageHero()),
  })

  async function loadSettings() {
    if (!isFirebaseConfigured) {
      setReady(false)
      setError('Add your Firebase web config to manage site settings.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const settings = await getSiteSettings()
      reset(toHeroFormValues(homepageHeroFromSettings(settings)))
      setReady(true)
    } catch (loadError) {
      setReady(false)
      setError(loadError instanceof Error ? loadError.message : 'Unable to load site settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function load() {
      if (!isFirebaseConfigured) {
        if (!active) {
          return
        }
        setReady(false)
        setError('Add your Firebase web config to manage site settings.')
        setLoading(false)
        return
      }

      try {
        const settings = await getSiteSettings()
        if (!active) {
          return
        }
        reset(toHeroFormValues(homepageHeroFromSettings(settings)))
        setReady(true)
        setError(null)
      } catch (loadError) {
        if (!active) {
          return
        }
        setReady(false)
        setError(loadError instanceof Error ? loadError.message : 'Unable to load site settings.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [reset])

  async function onSubmit(values: HeroFormValues) {
    setError(null)
    setSaveMessage(null)

    try {
      await updateSiteSettings({
        heroTextBlocks: values.blocks.map((block) => ({
          text: block.text.trim(),
          style: block.style,
        })),
        heroDescription: values.heroDescription.trim(),
      })
      const settings = await getSiteSettings()
      if (!settings) {
        throw new Error('Homepage hero was saved, but it could not be reloaded.')
      }
      reset(toHeroFormValues(homepageHeroFromSettings(settings)))
      setSaveMessage('Homepage hero saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the homepage hero.')
    }
  }

  return (
    <>
      <PageMeta
        title="Admin · Site settings"
        description="Edit the homepage hero text, formatting, and description."
      />
      <AdminHeader title="Site settings" />
      <div className="space-y-6 p-6">
        {error ? <ErrorState title="Site settings error" message={error} /> : null}

        {loading ? <LoadingState label="Loading site settings" /> : null}

        {!loading && !ready && isFirebaseConfigured ? (
          <Button type="button" variant="secondary" className="rounded-lg" onClick={() => void loadSettings()}>
            Try again
          </Button>
        ) : null}

        {ready ? (
          <form
            className="max-w-xl rounded-xl border border-slate-200 bg-white p-5"
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => {
              setSaveMessage(null)
              setError(null)
            }}
            noValidate
          >
            <h2 className="text-sm font-semibold text-slate-900">Homepage Hero</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Edit the three hero lines and the short description. Each line keeps its own approved formatting.
            </p>

            {saveMessage ? (
              <p
                className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                role="status"
              >
                {saveMessage}
              </p>
            ) : null}

            {heroBlockFields.map((index) => {
              const textError = errors.blocks?.[index]?.text?.message
              const styleError = errors.blocks?.[index]?.style?.message

              return (
                <div
                  key={index}
                  className={index === 0 ? 'mt-5' : 'mt-5 border-t border-slate-200 pt-5'}
                >
                  <h3 className="text-sm font-semibold text-slate-900">Text block {index + 1}</h3>
                  <div className="mt-4">
                    <label
                      htmlFor={`hero-block-${index + 1}-text`}
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Text
                    </label>
                    <input
                      id={`hero-block-${index + 1}-text`}
                      type="text"
                      className={controlClassName}
                      disabled={isSubmitting}
                      {...register(`blocks.${index}.text`)}
                    />
                    <FormError message={textError} />
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor={`hero-block-${index + 1}-style`}
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Formatting
                    </label>
                    <select
                      id={`hero-block-${index + 1}-style`}
                      className={controlClassName}
                      disabled={isSubmitting}
                      {...register(`blocks.${index}.style`)}
                    >
                      {HERO_TEXT_STYLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FormError message={styleError} />
                  </div>
                </div>
              )
            })}

            <div className="mt-5 border-t border-slate-200 pt-5">
              <label htmlFor="hero-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="hero-description"
                rows={4}
                className={controlClassName}
                disabled={isSubmitting}
                {...register('heroDescription')}
              />
              <FormError message={errors.heroDescription?.message} />
            </div>

            <div className="mt-5">
              <Button type="submit" className="rounded-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </>
  )
}
