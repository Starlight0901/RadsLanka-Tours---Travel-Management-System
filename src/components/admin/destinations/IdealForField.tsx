import { useState, type KeyboardEvent } from 'react'
import { Plus } from 'lucide-react'
import { MultiSelectDropdown } from '@/components/admin/destinations/MultiSelectDropdown.tsx'
import { controlClassName, hintClassName } from '@/components/admin/destinations/formStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import {
  DESTINATION_IDEAL_FOR_LABEL_MAX,
  DESTINATION_IDEAL_FOR_MAX_ITEMS,
  cleanOptionLabel,
  optionKey,
  uniqueOptionLabels,
} from '@/config/destinationContent.ts'

type IdealForFieldProps = {
  labelId: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** Persists a custom option and resolves to the stored label. */
  onCreateOption: (label: string) => Promise<string>
}

export function IdealForField({ labelId, options, selected, onChange, onCreateOption }: IdealForFieldProps) {
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const allOptions = uniqueOptionLabels([...options, ...selected])

  async function addCustom() {
    const label = cleanOptionLabel(draft)
    setError(null)
    if (!label) {
      setError('Enter an audience category.')
      return
    }
    if (label.length > DESTINATION_IDEAL_FOR_LABEL_MAX) {
      setError(`Keep it under ${DESTINATION_IDEAL_FOR_LABEL_MAX} characters.`)
      return
    }

    const existing = allOptions.find((option) => optionKey(option) === optionKey(label))
    let stored = existing
    if (!stored) {
      setAdding(true)
      try {
        stored = await onCreateOption(label)
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'Unable to save this option.')
        return
      } finally {
        setAdding(false)
      }
    }

    if (!selected.some((item) => optionKey(item) === optionKey(stored))) {
      if (selected.length >= DESTINATION_IDEAL_FOR_MAX_ITEMS) {
        setError(`Choose up to ${DESTINATION_IDEAL_FOR_MAX_ITEMS} options.`)
        return
      }
      onChange([...selected, stored])
    }
    setDraft('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void addCustom()
    }
  }

  return (
    <div>
      <MultiSelectDropdown
        labelId={labelId}
        options={allOptions.map((option) => ({ value: option, label: option }))}
        selected={selected}
        onChange={onChange}
        placeholder="Choose audiences"
      />
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          aria-label="Custom audience category"
          placeholder="Add a custom audience, e.g. Birdwatchers"
          className={controlClassName}
          value={draft}
          maxLength={DESTINATION_IDEAL_FOR_LABEL_MAX}
          disabled={adding}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          disabled={adding}
          onClick={() => void addCustom()}
        >
          <Plus className="size-4" aria-hidden="true" />
          {adding ? 'Saving…' : 'Add'}
        </button>
      </div>
      <FormError message={error ?? undefined} />
      <p className={hintClassName}>Custom audiences are saved and offered for other destinations too.</p>
    </div>
  )
}
