import { useRef } from 'react'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/about/aboutFormStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { isCloudinaryConfigured } from '@/config/env.ts'
import type { MediaAsset } from '@/types/models.ts'
import { cn } from '@/utils/cn.ts'

type AboutImageFieldProps = {
  id: string
  label: string
  image: MediaAsset | null
  fallbackUrl?: string
  fallbackCaption?: string
  objectFit?: 'cover' | 'contain'
  uploading: boolean
  disabled: boolean
  required?: boolean
  error?: string
  hint?: string
  onUpload: (file: File) => void
  onAltChange?: (altText: string) => void
}

export function AboutImageField({
  id,
  label,
  image,
  fallbackUrl,
  fallbackCaption,
  objectFit = 'cover',
  uploading,
  disabled,
  required = false,
  error,
  hint,
  onUpload,
  onAltChange,
}: AboutImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = image?.imageUrl || fallbackUrl
  const usingFallback = !image?.imageUrl && Boolean(fallbackUrl)

  return (
    <div>
      <p className={labelClassName}>
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </p>
      {previewUrl ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <img
            src={previewUrl}
            alt={image?.altText || label}
            className={cn(
              'h-40 w-full rounded-md sm:h-52',
              objectFit === 'contain' ? 'object-contain bg-white' : 'object-cover',
            )}
          />
          {usingFallback && fallbackCaption ? <p className={hintClassName}>{fallbackCaption}</p> : null}
          {image && onAltChange ? (
            <div className="mt-3">
              <label htmlFor={`${id}-alt`} className={labelClassName}>
                Image description
              </label>
              <input
                id={`${id}-alt`}
                type="text"
                value={image.altText}
                className={controlClassName}
                disabled={disabled}
                onChange={(event) => onAltChange(event.target.value)}
              />
            </div>
          ) : null}
          <button
            type="button"
            className="mt-3 text-sm font-medium text-slate-900 underline"
            disabled={disabled || uploading || !isCloudinaryConfigured}
            onClick={() => inputRef.current?.click()}
          >
            {image ? 'Replace image' : 'Upload image'}
          </button>
        </div>
      ) : (
        <p className={hintClassName}>{hint || 'Upload an image. This is optional until you save a replacement.'}</p>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        disabled={disabled || uploading || !isCloudinaryConfigured}
        className={previewUrl ? 'sr-only' : 'mt-2 block w-full text-sm text-slate-600'}
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
      {hint && previewUrl ? <p className={hintClassName}>{hint}</p> : null}
      <FormError message={error} />
    </div>
  )
}
