import { ArrowDown, ArrowUp } from 'lucide-react'
import { DestinationHighlightIcon } from '@/components/destinations/DestinationHighlightIcon.tsx'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import {
  DESTINATION_HIGHLIGHTS_MAX_ITEMS,
  DESTINATION_HIGHLIGHT_DETAIL_MAX,
  DESTINATION_HIGHLIGHT_ICON_OPTIONS,
  DESTINATION_HIGHLIGHT_TITLE_MAX,
  HIGHLIGHT_TITLE_SUGGESTIONS,
} from '@/config/destinationContent.ts'
import type { DestinationHighlightItem } from '@/types/models.ts'

type HighlightsEditorProps = {
  items: DestinationHighlightItem[]
  onChange: (items: DestinationHighlightItem[]) => void
}

function newHighlight(): DestinationHighlightItem {
  return {
    id: `highlight-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    detail: '',
    icon: '',
    published: true,
  }
}

export function HighlightsEditor({ items, onChange }: HighlightsEditorProps) {
  const atLimit = items.length >= DESTINATION_HIGHLIGHTS_MAX_ITEMS

  function update(index: number, patch: Partial<DestinationHighlightItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) {
      return
    }
    const next = [...items]
    const current = next[index]
    const neighbour = next[target]
    if (!current || !neighbour) {
      return
    }
    next[index] = neighbour
    next[target] = current
    onChange(next)
  }

  return (
    <div>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Highlight {index + 1}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40"
                  disabled={index === 0}
                  aria-label={`Move highlight ${index + 1} up`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                  Up
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40"
                  disabled={index === items.length - 1}
                  aria-label={`Move highlight ${index + 1} down`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                  Down
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-red-700 underline"
                  onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem]">
              <div className="space-y-3">
                <div>
                  <label htmlFor={`highlight-title-${item.id}`} className={labelClassName}>
                    Title{item.published ? <span className="text-red-700"> *</span> : null}
                  </label>
                  <input
                    id={`highlight-title-${item.id}`}
                    type="text"
                    list="destination-highlight-titles"
                    value={item.title}
                    maxLength={DESTINATION_HIGHLIGHT_TITLE_MAX}
                    className={controlClassName}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor={`highlight-detail-${item.id}`} className={labelClassName}>
                    Detail
                  </label>
                  <input
                    id={`highlight-detail-${item.id}`}
                    type="text"
                    value={item.detail}
                    maxLength={DESTINATION_HIGHLIGHT_DETAIL_MAX}
                    placeholder="e.g. 8 notable sites"
                    className={controlClassName}
                    onChange={(event) => update(index, { detail: event.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-slate-900"
                    checked={item.published}
                    onChange={(event) => update(index, { published: event.target.checked })}
                  />
                  Published
                </label>
              </div>
              <div>
                <label htmlFor={`highlight-icon-${item.id}`} className={labelClassName}>
                  Icon
                </label>
                <div className="mb-2 flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <DestinationHighlightIcon icon={item.icon} className="size-6 text-slate-800" />
                </div>
                <select
                  id={`highlight-icon-${item.id}`}
                  className={controlClassName}
                  value={item.icon}
                  onChange={(event) => update(index, { icon: event.target.value })}
                >
                  <option value="">Default</option>
                  {DESTINATION_HIGHLIGHT_ICON_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <datalist id="destination-highlight-titles">
        {HIGHLIGHT_TITLE_SUGGESTIONS.map((title) => (
          <option key={title} value={title} />
        ))}
      </datalist>

      <button
        type="button"
        className="mt-4 text-sm font-medium text-slate-900 underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        disabled={atLimit}
        onClick={() => onChange([...items, newHighlight()])}
      >
        Add highlight
      </button>
      {atLimit ? (
        <p className={hintClassName}>The maximum is {DESTINATION_HIGHLIGHTS_MAX_ITEMS} highlights.</p>
      ) : (
        <p className={hintClassName}>Suggested titles appear as you type. They are optional starting points, not required items.</p>
      )}
    </div>
  )
}
