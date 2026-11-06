import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FormError } from '@/components/forms/FormError.tsx'
import { fieldControlClass, fieldLabelClass } from '@/components/forms/fieldStyles.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

export type SearchableSelectFieldOption = {
  value: string
  label: string
}

type SearchableSelectFieldProps = {
  id?: string
  label: string
  options: SearchableSelectFieldOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
}

export function SearchableSelectField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select',
  error,
  disabled,
  loading,
  emptyMessage = 'No options available yet.',
}: SearchableSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const listId = `${fieldId}-list`
  const errorId = error ? `${fieldId}-error` : undefined
  const selected = options.find((option) => option.value === value)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options
    }
    return options.filter((option) => option.label.toLowerCase().includes(needle))
  }, [options, query])

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

  function choose(next: string) {
    onChange(next)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <label id={`${fieldId}-label`} className={fieldLabelClass} htmlFor={fieldId}>
        {label}
      </label>
      <button
        id={fieldId}
        type="button"
        disabled={disabled || loading}
        aria-labelledby={`${fieldId}-label`}
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldControlClass, 'flex items-center justify-between gap-3 text-left', !selected && 'text-outline')}
      >
        <span className="truncate">
          {loading ? 'Loading…' : selected?.label ?? placeholder}
        </span>
        <Icon name="expand_more" className={cn('text-[20px] text-muted transition', open && 'rotate-180')} />
      </button>
      {selected ? <p className="mt-1.5 text-sm text-muted">Selected: {selected.label}</p> : null}
      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-control border border-border bg-surface-elevated p-2 shadow-lg">
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search by tour name"
            className="mb-2 h-11 w-full rounded-control border border-border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                const option = filtered[activeIndex]
                if (option) {
                  choose(option.value)
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
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto" aria-labelledby={`${fieldId}-label`}>
            {loading ? (
              <li className="px-2 py-2 text-sm text-muted">Loading tours…</li>
            ) : options.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted">{emptyMessage}</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted">No matching tours.</li>
            ) : (
              filtered.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      'flex min-h-11 w-full rounded-md px-2 text-left text-sm text-ink hover:bg-surface-mist',
                      option.value === value && 'font-semibold text-brand',
                      index === activeIndex && 'bg-surface-mist',
                    )}
                    onClick={() => choose(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
      <FormError id={errorId} message={error} />
    </div>
  )
}
