import { useRef, useState } from 'react'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { isCloudinaryConfigured } from '@/config/env.ts'
import { uploadGalleryImage } from '@/services/cloudinary/upload.ts'
import {
  GALLERY_ASSOCIATION_LIMIT,
  GALLERY_IMAGE_SIZE_MESSAGE,
  GALLERY_TITLE_MAX,
  galleryImageExceedsSizeLimit,
  galleryLimitMessage,
  remainingGallerySlots,
} from '@/utils/galleryLimits.ts'

export type DestinationGalleryDraft = {
  imageUrl: string
  publicId: string
  title: string
}

type GalleryImagesEditorProps = {
  items: DestinationGalleryDraft[]
  associatedCount: number
  disabled: boolean
  error?: string
  onChange: (items: DestinationGalleryDraft[]) => void
  onError: (message: string | null) => void
}

export function GalleryImagesEditor({
  items,
  associatedCount,
  disabled,
  error,
  onChange,
  onError,
}: GalleryImagesEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({})
  const used = items.length + associatedCount
  const atLimit = used >= GALLERY_ASSOCIATION_LIMIT
  const remaining = remainingGallerySlots(used)

  function update(index: number, patch: Partial<DestinationGalleryDraft>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  function remove(index: number) {
    const item = items[index]
    if (item?.imageUrl && !window.confirm('Remove this gallery image? This cannot be undone after you save.')) {
      return
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
  }

  async function onImageSelected(index: number, file: File | undefined) {
    const item = items[index]
    if (!file || !item || uploadingIndex !== null) {
      return
    }
    if (galleryImageExceedsSizeLimit(file)) {
      onError(GALLERY_IMAGE_SIZE_MESSAGE)
      return
    }
    setUploadingIndex(index)
    onError(null)
    try {
      const result = await uploadGalleryImage(file)
      update(index, {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      })
    } catch (uploadError) {
      onError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div>
      <ol className="space-y-4">
        {items.map((item, index) => {
          const uploading = uploadingIndex === index
          return (
            <li key={`${item.publicId || 'new'}-${index}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Gallery image {index + 1}</p>
                <button
                  type="button"
                  className="text-sm font-medium text-red-700 underline disabled:opacity-40"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
                <div>
                  <p className={labelClassName}>
                    Image<span className="text-red-700"> *</span>
                  </p>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title || 'Destination gallery image'}
                      className="h-32 w-full rounded-md object-cover"
                    />
                  ) : (
                    <p className={hintClassName}>Upload a photograph for this gallery image.</p>
                  )}
                  <input
                    ref={(node) => {
                      fileInputs.current[index] = node
                    }}
                    type="file"
                    accept="image/*"
                    disabled={disabled || uploading || !isCloudinaryConfigured}
                    className={item.imageUrl ? 'sr-only' : 'mt-2 block w-full text-sm text-slate-600'}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      void onImageSelected(index, file)
                    }}
                  />
                  {item.imageUrl ? (
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium text-slate-900 underline"
                      disabled={disabled || uploading}
                      onClick={() => fileInputs.current[index]?.click()}
                    >
                      Replace image
                    </button>
                  ) : null}
                  {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading image…</p> : null}
                </div>
                <div>
                  <label htmlFor={`destination-gallery-title-${index}`} className={labelClassName}>
                    Image title<span className="text-red-700"> *</span>
                  </label>
                  <input
                    id={`destination-gallery-title-${index}`}
                    type="text"
                    value={item.title}
                    maxLength={GALLERY_TITLE_MAX}
                    className={controlClassName}
                    disabled={disabled}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
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
        onClick={() => onChange([...items, { imageUrl: '', publicId: '', title: '' }])}
      >
        Add gallery image
      </button>
      {associatedCount > 0 ? (
        <p className={hintClassName}>
          {associatedCount} image{associatedCount === 1 ? '' : 's'} already linked on the Gallery page
          {remaining === 0
            ? `. ${galleryLimitMessage('destination')}`
            : `. You can add ${remaining} more here.`}
        </p>
      ) : atLimit ? (
        <p className={hintClassName}>{galleryLimitMessage('destination')}</p>
      ) : !isCloudinaryConfigured ? (
        <p className={hintClassName}>Add Cloudinary settings before uploading gallery images.</p>
      ) : (
        <p className={hintClassName}>Up to {GALLERY_ASSOCIATION_LIMIT} gallery images per destination.</p>
      )}
      <FormError message={error} />
    </div>
  )
}
