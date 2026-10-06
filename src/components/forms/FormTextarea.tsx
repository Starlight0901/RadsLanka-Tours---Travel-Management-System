import type { TextareaHTMLAttributes } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { cn } from '@/utils/cn.ts'

export type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function FormTextarea({ id, label, error, className, rows = 4, ...props }: FormTextareaProps) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div>
      <label htmlFor={inputId} className={fieldLabelClass}>
        {label}
      </label>
      <textarea
        {...props}
        id={inputId}
        rows={rows}
        className={cn(fieldControlClass, 'h-auto min-h-24 py-3', className)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      <FormError id={errorId} message={error} />
    </div>
  )
}
