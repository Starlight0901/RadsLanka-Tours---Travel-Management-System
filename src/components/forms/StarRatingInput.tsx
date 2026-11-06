import { FormError } from '@/components/forms/FormError.tsx'
import { fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

type StarRatingInputProps = {
  value: number
  onChange: (value: number) => void
  label?: string
  error?: string
  disabled?: boolean
}

function starIcon(star: number, value: number) {
  if (value >= star) {
    return { name: 'star', filled: true }
  }
  if (value >= star - 0.5) {
    return { name: 'star_half', filled: true }
  }
  return { name: 'star', filled: false }
}

export function StarRatingInput({
  value,
  onChange,
  label = 'How would you rate your experience?',
  error,
  disabled,
}: StarRatingInputProps) {
  const display = value > 0 ? `${value}/5` : 'Select a rating'

  return (
    <fieldset>
      <legend className={fieldLabelClass}>{label}</legend>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <div className="flex items-center" role="radiogroup" aria-label={label}>
          {[1, 2, 3, 4, 5].map((star) => {
            const icon = starIcon(star, value)
            const halfValue = star === 1 ? 1 : star - 0.5
            return (
              <span key={star} className="relative inline-flex size-11">
                <Icon
                  name={icon.name}
                  filled={icon.filled}
                  className={cn('text-[26px]', icon.filled ? 'text-accent' : 'text-border')}
                />
                <button
                  type="button"
                  role="radio"
                  aria-checked={value === halfValue}
                  disabled={disabled}
                  className="absolute inset-y-0 left-0 w-1/2 rounded-l-control hover:bg-surface-mist/60 disabled:cursor-not-allowed"
                  onClick={() => onChange(halfValue)}
                >
                  <span className="sr-only">{halfValue} out of 5 stars</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={value === star}
                  disabled={disabled}
                  className="absolute inset-y-0 right-0 w-1/2 rounded-r-control hover:bg-surface-mist/60 disabled:cursor-not-allowed"
                  onClick={() => onChange(star)}
                >
                  <span className="sr-only">{star} out of 5 stars</span>
                </button>
              </span>
            )
          })}
        </div>
        <p className="text-sm font-semibold text-brand" aria-live="polite">
          {display}
        </p>
      </div>
      <FormError message={error} />
    </fieldset>
  )
}
