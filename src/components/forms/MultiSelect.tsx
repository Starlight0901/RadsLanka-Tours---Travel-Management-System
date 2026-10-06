import { useEffect, useId, useRef, useState } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type MultiSelectOption = {
  id: string
  label: string
}

export type MultiSelectProps = {
  label: string
  options: MultiSelectOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  emptyMessage?: string
}

export function MultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Select',
  error,
  disabled,
  emptyMessage = 'No options available yet.',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const selectedLabels = options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label)
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} selected`

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function toggleId(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
      return
    }

    onChange([...selectedIds, id])
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={buttonId} className={fieldLabelClass}>
        {label}
      </label>
      <button
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldControlClass, 'flex items-center justify-between text-left', selectedLabels.length === 0 && 'text-outline')}
      >
        <span className="truncate">{summary}</span>
        <Icon name="expand_more" className={cn('text-[20px] text-muted transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-control border border-border bg-surface-elevated p-2 shadow-lg"
          role="listbox"
          aria-multiselectable="true"
        >
          {options.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted">{emptyMessage}</p>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-ink hover:bg-surface-mist"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggleId(option.id)}
                />
                {option.label}
              </label>
            ))
          )}
        </div>
      ) : null}
      <FormError message={error} />
    </div>
  )
}
