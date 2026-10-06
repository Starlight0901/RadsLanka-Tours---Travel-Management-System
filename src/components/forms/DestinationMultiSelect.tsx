import { useEffect, useRef, useState } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type DestinationOption = {
  id: string
  name: string
}

type DestinationMultiSelectProps = {
  options: DestinationOption[]
  selectedIds: string[]
  otherSelected: boolean
  otherValue: string
  error?: string
  otherError?: string
  disabled?: boolean
  onSelectedIdsChange: (ids: string[]) => void
  onOtherSelectedChange: (selected: boolean) => void
  onOtherValueChange: (value: string) => void
}

export function DestinationMultiSelect({
  options,
  selectedIds,
  otherSelected,
  otherValue,
  error,
  otherError,
  disabled,
  onSelectedIdsChange,
  onOtherSelectedChange,
  onOtherValueChange,
}: DestinationMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const selectedNames = options.filter((option) => selectedIds.includes(option.id)).map((option) => option.name)
  const summaryParts = [...selectedNames]
  if (otherSelected) {
    summaryParts.push(otherValue.trim() || 'Other')
  }

  const summary =
    summaryParts.length === 0
      ? 'Preferred Destinations'
      : summaryParts.length <= 2
        ? summaryParts.join(', ')
        : `${summaryParts.length} destinations selected`

  function toggleId(id: string) {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((item) => item !== id))
      return
    }

    onSelectedIdsChange([...selectedIds, id])
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor="preferred-destinations" className={fieldLabelClass}>
        Preferred Destinations
      </label>
      <button
        id="preferred-destinations"
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          fieldControlClass,
          'flex items-center justify-between text-left',
          summaryParts.length === 0 && 'text-outline',
        )}
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
            <p className="px-2 py-2 text-xs text-muted">No destinations available yet. Choose Other.</p>
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
                {option.name}
              </label>
            ))
          )}
          <div className="my-1 border-t border-border" />
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-ink hover:bg-surface-mist">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={otherSelected}
              onChange={(event) => onOtherSelectedChange(event.target.checked)}
            />
            Other
          </label>
        </div>
      ) : null}
      <FormError message={error} />
      {otherSelected ? (
        <div className="mt-2">
          <input
            type="text"
            value={otherValue}
            onChange={(event) => onOtherValueChange(event.target.value)}
            placeholder="Enter your preferred location"
            disabled={disabled}
            className="w-full rounded-control border border-border px-4 py-2.5 text-body outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <FormError message={otherError} />
        </div>
      ) : null}
    </div>
  )
}
