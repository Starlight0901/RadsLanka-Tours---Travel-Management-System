import type { InputHTMLAttributes } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { cn } from '@/utils/cn.ts'

export type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function FormInput({ id, label, error, className, ...props }: FormInputProps) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div>
      <label htmlFor={inputId} className={fieldLabelClass}>
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={cn(fieldControlClass, className)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      <FormError id={errorId} message={error} />
    </div>
  )
}
