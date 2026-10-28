import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/utils/cn.ts'

export type MultiSelectOption = {
  value: string
  label: string
}

type MultiSelectDropdownProps = {
  labelId: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  /** Extra controls shown under the option list, e.g. a custom option input. */
  footer?: ReactNode
}

export function MultiSelectDropdown({ labelId, options, selected, onChange, placeholder, footer }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const selectedOptions = selected.map(
    (value) => options.find((option) => option.value === value) ?? { value, label: value },
  )

  useEffect(() => {
    if (!open) {
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

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-labelledby={labelId}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn('truncate', selected.length === 0 && 'text-slate-500')}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-slate-500 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
        >
          <ul className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-slate-900"
                    checked={selected.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
          {footer ? <div className="mt-2 border-t border-slate-100 pt-2">{footer}</div> : null}
        </div>
      ) : null}

      {selectedOptions.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected options">
          {selectedOptions.map((option) => (
            <li key={option.value}>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pr-1 pl-3 text-xs font-semibold text-slate-800">
                {option.label}
                <button
                  type="button"
                  className="inline-flex size-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => toggle(option.value)}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
