import type { SelectHTMLAttributes } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { cn } from '@/utils/cn.ts'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({ id, label, options, placeholder, error, className, ...props }: SelectProps) {
  const selectId = id ?? props.name
  const errorId = error && selectId ? `${selectId}-error` : undefined

  return (
    <div>
      <label htmlFor={selectId} className={fieldLabelClass}>
        {label}
      </label>
      <select
        {...props}
        id={selectId}
        className={cn(fieldControlClass, className)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FormError id={errorId} message={error} />
    </div>
  )
}
