import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

type GlassFilterOption = {
  value: string
  label: string
}

type GlassFilterSelectProps = {
  label: string
  value: string
  options: GlassFilterOption[]
  onChange: (value: string) => void
  className?: string
}

export function GlassFilterSelect({ label, value, options, onChange, className }: GlassFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const current = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    listRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function choose(next: string) {
    onChange(next)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onButtonKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveIndex(selectedIndex)
      setOpen(true)
    }
  }

  function onListKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(options.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[activeIndex]
      if (option) {
        choose(option.value)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/55 px-3 text-left text-[13px] text-ink shadow-[0_4px_14px_rgba(15,40,30,0.05)] backdrop-blur-sm transition hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-brand/35"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => {
          setActiveIndex(selectedIndex)
          setOpen((currentOpen) => !currentOpen)
        }}
        onKeyDown={onButtonKeyDown}
      >
        <span className="truncate">{current?.label ?? label}</span>
        <Icon name="expand_more" className="shrink-0 text-[16px] text-muted" />
      </button>
      {open ? (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className="absolute z-40 mt-1 max-h-60 w-full min-w-44 overflow-auto rounded-xl border border-white/70 bg-white/78 p-1 shadow-[0_12px_30px_rgba(15,40,30,0.12)] backdrop-blur-[16px]"
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => {
            const selected = option.value === value
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'w-full origin-left rounded-lg px-3 py-1.5 text-left text-[13px] text-ink transition duration-150 hover:scale-[1.015] hover:bg-[rgba(27,67,50,0.08)] focus-visible:scale-[1.015] focus-visible:bg-[rgba(27,67,50,0.08)] focus-visible:outline-none',
                    selected && 'bg-[rgba(27,67,50,0.06)] font-semibold text-brand',
                    index === activeIndex && 'bg-[rgba(27,67,50,0.08)]',
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option.value)}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
