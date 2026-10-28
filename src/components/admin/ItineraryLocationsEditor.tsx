import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { DestinationRecord } from '@/services/firebase/destinations.ts'

export type ItineraryLocationDraft = {
  name: string
  destinationId: string
}

type ItineraryLocationsEditorProps = {
  id: string
  locations: ItineraryLocationDraft[]
  destinations: DestinationRecord[]
  onChange: (locations: ItineraryLocationDraft[]) => void
}

const controlClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2'

function destinationLabel(destination: DestinationRecord): string {
  return destination.name.trim() || destination.slug || 'Untitled destination'
}

function DestinationLinkSelect({
  id,
  value,
  destinations,
  onChange,
}: {
  id: string
  value: string
  destinations: DestinationRecord[]
  onChange: (destinationId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const selected = destinations.find((destination) => destination.id === value)
  const selectedLabel = selected
    ? destinationLabel(selected)
    : value
      ? `Saved destination (${value})`
      : 'None / Not linked'

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return destinations
    }
    return destinations.filter((destination) => destinationLabel(destination).toLowerCase().includes(needle))
  }, [destinations, query])

  useEffect(() => {
    if (!open) {
      return
    }
    searchRef.current?.focus()
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

  function choose(next: string) {
    onChange(next)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${controlClassName} mt-1.5 flex items-center justify-between gap-2 text-left`}
        onClick={() => {
          setQuery('')
          setOpen((current) => !current)
        }}
      >
        <span className={value ? 'truncate text-slate-900' : 'truncate text-slate-500'}>{selectedLabel}</span>
        <span className="shrink-0 text-slate-500" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search destinations"
            aria-label="Search destinations"
            className={controlClassName}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ul id={listId} role="listbox" className="mt-2 max-h-56 overflow-y-auto">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => choose('')}
              >
                None / Not linked
              </button>
            </li>
            {value && !selected ? (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected
                  className="w-full rounded-md bg-slate-50 px-2 py-1.5 text-left text-sm text-slate-700"
                  onClick={() => choose(value)}
                >
                  Saved destination ({value})
                </button>
              </li>
            ) : null}
            {filtered.map((destination) => (
              <li key={destination.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={destination.id === value}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${
                    destination.id === value ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-700'
                  }`}
                  onClick={() => choose(destination.id)}
                >
                  {destinationLabel(destination)}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-2 py-1.5 text-sm text-slate-500">No matching destinations</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function ItineraryLocationsEditor({
  id,
  locations,
  destinations,
  onChange,
}: ItineraryLocationsEditorProps) {
  const sortedDestinations = useMemo(
    () =>
      [...destinations].sort((a, b) =>
        destinationLabel(a).localeCompare(destinationLabel(b), undefined, { sensitivity: 'base' }),
      ),
    [destinations],
  )

  function update(index: number, patch: Partial<ItineraryLocationDraft>) {
    onChange(locations.map((location, locationIndex) => (locationIndex === index ? { ...location, ...patch } : location)))
  }

  return (
    <div>
      <h3 id={id} className="text-sm font-semibold text-slate-900">
        Locations
      </h3>
      <ul className="mt-3 space-y-3" aria-labelledby={id}>
        {locations.map((location, index) => (
          <li key={`${id}-${index}`} className="rounded-lg border border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={location.name}
                placeholder="Colombo"
                aria-label={`Location ${index + 1} name`}
                className={controlClassName}
                onChange={(event) => update(index, { name: event.target.value })}
              />
              <button
                type="button"
                className="shrink-0 text-sm font-medium text-red-700 underline"
                onClick={() => onChange(locations.filter((_, locationIndex) => locationIndex !== index))}
              >
                Remove
              </button>
            </div>
            <label className="mt-2 block text-sm font-medium text-slate-700" htmlFor={`${id}-destination-${index}`}>
              Link to Destination
            </label>
            <DestinationLinkSelect
              id={`${id}-destination-${index}`}
              value={location.destinationId}
              destinations={sortedDestinations}
              onChange={(destinationId) => update(index, { destinationId })}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-medium text-slate-900 underline"
        onClick={() => onChange([...locations, { name: '', destinationId: '' }])}
      >
        Add location
      </button>
    </div>
  )
}
