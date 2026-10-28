import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/utils/cn.ts'

export type SearchableSelectOption = {
  value: string
  label: string
}

type SearchableSelectProps = {
  id?: string
  label: string
  options: SearchableSelectOption[]
  value: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function SearchableSelect({
  id,
  label,
  options,
  value,
  placeholder,
  disabled,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const labelId = id ?? generatedId
  const panelId = `${labelId}-panel`
  const selected = options.find((option) => option.value === value)
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <p id={labelId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </p>
      <button
        type="button"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={cn('truncate', !selected && 'text-slate-500')}>{selected?.label ?? placeholder}</span>
        <span className="flex shrink-0 items-center gap-1">
          {selected ? (
            <span
              role="button"
              tabIndex={-1}
              className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={(event) => {
                event.stopPropagation()
                onChange('')
                setOpen(false)
              }}
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Clear {label}</span>
            </span>
          ) : null}
          <ChevronDown className={cn('size-4 text-slate-500 transition', open && 'rotate-180')} aria-hidden="true" />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
        >
          <input
            type="search"
            value={query}
            placeholder={`Search ${label.toLowerCase()}`}
            className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2"
            onChange={(event) => setQuery(event.target.value)}
          />
          <ul className="max-h-64 overflow-y-auto">
            <li>
              <button
                type="button"
                className={cn(
                  'flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50',
                  !value ? 'font-medium text-slate-900' : 'text-slate-600',
                )}
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                None
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-2 py-1.5 text-sm text-slate-500">No matches.</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50',
                      option.value === value ? 'font-medium text-slate-900' : 'text-slate-700',
                    )}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
