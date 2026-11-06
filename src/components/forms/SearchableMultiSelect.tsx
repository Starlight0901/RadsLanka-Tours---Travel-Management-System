import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type SearchableMultiSelectOption = {
  id: string
  label: string
}

type SearchableMultiSelectProps = {
  label: string
  options: SearchableMultiSelectOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
  maxSelected?: number
}

export function SearchableMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Search and select destinations',
  error,
  disabled,
  loading,
  emptyMessage = 'No options available yet.',
  maxSelected,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const buttonId = useId()
  const listId = `${buttonId}-list`
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id))
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options
    }
    return options.filter((option) => option.label.toLowerCase().includes(needle))
  }, [options, query])
  const atLimit = typeof maxSelected === 'number' && selectedIds.length >= maxSelected

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    searchRef.current?.focus()
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function toggleId(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
      return
    }
    if (atLimit) {
      return
    }
    onChange([...selectedIds, id])
  }

  function removeId(id: string) {
    onChange(selectedIds.filter((item) => item !== id))
  }

  const summary =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? selectedOptions[0]?.label
        : `${selectedOptions.length} destinations selected`

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={buttonId} className={fieldLabelClass}>
        {label}
      </label>
      {selectedOptions.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <li key={option.id}>
              <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-chip px-3 text-[13px] font-semibold text-chip-text">
                {option.label}
                <button
                  type="button"
                  className="inline-flex size-6 items-center justify-center rounded-full text-brand hover:bg-white/70"
                  aria-label={`Remove ${option.label}`}
                  disabled={disabled}
                  onClick={() => removeId(option.id)}
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        id={buttonId}
        type="button"
        disabled={disabled || loading}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          fieldControlClass,
          'flex items-center justify-between text-left',
          selectedOptions.length === 0 && 'text-outline',
        )}
      >
        <span className="truncate">{loading ? 'Loading…' : summary}</span>
        <Icon name="expand_more" className={cn('text-[20px] text-muted transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-control border border-border bg-surface-elevated p-2 shadow-lg">
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search destinations"
            className="mb-2 h-11 w-full rounded-control border border-border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                const option = filtered[activeIndex]
                if (option) {
                  toggleId(option.id)
                }
              } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((index) => Math.min(filtered.length - 1, index + 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((index) => Math.max(0, index - 1))
              }
            }}
          />
          <ul id={listId} role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto">
            {loading ? (
              <li className="px-2 py-2 text-sm text-muted">Loading destinations…</li>
            ) : options.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted">{emptyMessage}</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted">No matching destinations.</li>
            ) : (
              filtered.map((option, index) => {
                const selected = selectedIds.includes(option.id)
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={!selected && atLimit}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-ink hover:bg-surface-mist disabled:cursor-not-allowed disabled:opacity-50',
                        index === activeIndex && 'bg-surface-mist',
                      )}
                      onClick={() => toggleId(option.id)}
                    >
                      <span
                        className={cn(
                          'inline-flex size-4 shrink-0 items-center justify-center rounded border',
                          selected ? 'border-brand bg-brand text-on-brand' : 'border-border bg-surface-elevated',
                        )}
                        aria-hidden="true"
                      >
                        {selected ? <Icon name="check" className="text-[12px]" /> : null}
                      </span>
                      {option.label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
      <FormError message={error} />
    </div>
  )
}
