import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { isCloudinaryConfigured } from '@/config/env.ts'
import {
  DESTINATION_EXPERIENCES_MAX_ITEMS,
  DESTINATION_EXPERIENCE_DESCRIPTION_MAX,
  DESTINATION_EXPERIENCE_TITLE_MAX,
} from '@/config/destinationContent.ts'
import { uploadImage } from '@/services/cloudinary/upload.ts'
import type { DestinationExperienceItem } from '@/types/models.ts'

type ExperiencesEditorProps = {
  items: DestinationExperienceItem[]
  disabled: boolean
  onChange: (items: DestinationExperienceItem[]) => void
  onPatch: (id: string, patch: Partial<DestinationExperienceItem>) => void
  onError: (message: string | null) => void
}

function newExperience(): DestinationExperienceItem {
  return {
    id: `experience-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    description: '',
    image: null,
    published: true,
  }
}

export function ExperiencesEditor({ items, disabled, onChange, onPatch, onError }: ExperiencesEditorProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const atLimit = items.length >= DESTINATION_EXPERIENCES_MAX_ITEMS

  function update(id: string, patch: Partial<DestinationExperienceItem>) {
    onPatch(id, patch)
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) {
      return
    }
    const next = [...items]
    const current = next[index]
    const neighbour = next[target]
    if (!current || !neighbour) {
      return
    }
    next[index] = neighbour
    next[target] = current
    onChange(next)
  }

  function remove(index: number) {
    const item = items[index]
    if (!item) {
      return
    }
    if (item.title || item.image) {
      if (!window.confirm('Remove this experience? This cannot be undone after you save.')) {
        return
      }
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  async function onImageSelected(index: number, file: File | undefined) {
    const item = items[index]
    if (!file || !item || uploadingId) {
      return
    }
    setUploadingId(item.id)
    onError(null)
    try {
      const result = await uploadImage(file)
      onPatch(item.id, {
        image: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          altText: item.image?.altText || item.title.trim(),
        },
      })
    } catch (uploadError) {
      onError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div>
      <ol className="space-y-4">
        {items.map((item, index) => {
          const uploading = uploadingId === item.id
          return (
            <li key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Experience {index + 1}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40"
                    disabled={disabled || index === 0}
                    aria-label={`Move experience ${index + 1} up`}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                    Up
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40"
                    disabled={disabled || index === items.length - 1}
                    aria-label={`Move experience ${index + 1} down`}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                    Down
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-700 underline disabled:opacity-40"
                    disabled={disabled}
                    onClick={() => remove(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
                <div>
                  <p className={labelClassName}>
                    Image{item.published ? <span className="text-red-700"> *</span> : null}
                  </p>
                  {item.image ? (
                    <img
                      src={item.image.imageUrl}
                      alt={item.image.altText || item.title || 'Experience image'}
                      className="h-32 w-full rounded-md object-cover"
                    />
                  ) : (
                    <p className={hintClassName}>Upload a photograph of this experience.</p>
                  )}
                  <input
                    ref={(node) => {
                      fileInputs.current[item.id] = node
                    }}
                    id={`experience-image-${item.id}`}
                    type="file"
                    accept="image/*"
                    disabled={disabled || uploading || !isCloudinaryConfigured}
                    className={item.image ? 'sr-only' : 'mt-2 block w-full text-sm text-slate-600'}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      void onImageSelected(index, file)
                    }}
                  />
                  {item.image ? (
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium text-slate-900 underline"
                      disabled={disabled || uploading}
                      onClick={() => fileInputs.current[item.id]?.click()}
                    >
                      Replace image
                    </button>
                  ) : null}
                  {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading image…</p> : null}
                  {item.published && !item.image ? <FormError message="Upload an image before publishing." /> : null}
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`experience-title-${item.id}`} className={labelClassName}>
                      Title{item.published ? <span className="text-red-700"> *</span> : null}
                    </label>
                    <input
                      id={`experience-title-${item.id}`}
                      type="text"
                      value={item.title}
                      maxLength={DESTINATION_EXPERIENCE_TITLE_MAX}
                      className={controlClassName}
                      disabled={disabled}
                      onChange={(event) => update(item.id, { title: event.target.value })}
                    />
                    {item.published && !item.title.trim() ? <FormError message="Enter a title before publishing." /> : null}
                  </div>
                  <div>
                    <label htmlFor={`experience-description-${item.id}`} className={labelClassName}>
                      Short description
                    </label>
                    <textarea
                      id={`experience-description-${item.id}`}
                      rows={3}
                      value={item.description}
                      maxLength={DESTINATION_EXPERIENCE_DESCRIPTION_MAX}
                      className={controlClassName}
                      disabled={disabled}
                      onChange={(event) => update(item.id, { description: event.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-slate-900"
                      checked={item.published}
                      disabled={disabled}
                      onChange={(event) => update(item.id, { published: event.target.checked })}
                    />
                    Published
                  </label>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        className="mt-4 text-sm font-medium text-slate-900 underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        disabled={disabled || atLimit}
        onClick={() => onChange([...items, newExperience()])}
      >
        Add Experience
      </button>
      {atLimit ? (
        <p className={hintClassName}>The practical maximum is {DESTINATION_EXPERIENCES_MAX_ITEMS} experiences.</p>
      ) : !isCloudinaryConfigured ? (
        <p className={hintClassName}>Add Cloudinary settings before uploading experience images.</p>
      ) : null}
    </div>
  )
}
