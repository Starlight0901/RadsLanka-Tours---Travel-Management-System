import { useRef } from 'react'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { isCloudinaryConfigured } from '@/config/env.ts'
import type { MediaAsset } from '@/types/models.ts'

type HeroImageFieldProps = {
  image: MediaAsset | null
  required: boolean
  uploading: boolean
  disabled: boolean
  error?: string
  onUpload: (file: File) => void
  onReplace: () => void
  onAltChange: (altText: string) => void
}

export function HeroImageField({
  image,
  required,
  uploading,
  disabled,
  error,
  onUpload,
  onReplace,
  onAltChange,
}: HeroImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <p className={labelClassName}>
        Hero image{required ? <span className="text-red-700"> *</span> : null}
      </p>
      {image ? (
        <div className="rounded-lg border border-slate-200 p-3">
          <img
            src={image.imageUrl}
            alt={image.altText || 'Destination hero'}
            className="h-40 w-full rounded-md object-cover sm:h-52"
          />
          <div className="mt-3">
            <label htmlFor="destination-hero-alt" className={labelClassName}>
              Image description
            </label>
            <input
              id="destination-hero-alt"
              type="text"
              value={image.altText}
              className={controlClassName}
              disabled={disabled}
              onChange={(event) => onAltChange(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-slate-900 underline"
            disabled={disabled || uploading}
            onClick={() => {
              onReplace()
              inputRef.current?.click()
            }}
          >
            Replace image
          </button>
        </div>
      ) : (
        <p className={hintClassName}>Upload a landscape photograph. This is the destination page hero.</p>
      )}
      <input
        ref={inputRef}
        id="destination-hero-upload"
        type="file"
        accept="image/*"
        disabled={disabled || uploading || !isCloudinaryConfigured}
        className={image ? 'sr-only' : 'mt-2 block w-full text-sm text-slate-600'}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) {
            onUpload(file)
          }
        }}
      />
      {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading image…</p> : null}
      {!isCloudinaryConfigured ? (
        <p className="mt-2 text-sm text-slate-500">Add Cloudinary settings before uploading images.</p>
      ) : null}
      <FormError message={error} />
    </div>
  )
}
