import { ABOUT_DISTINCTION_ICON_OPTIONS, isAboutDistinctionIconId } from '@/config/aboutContent.ts'
import { Icon } from '@/components/ui/Icon.tsx'
import { cn } from '@/utils/cn.ts'

type AboutIconPickerProps = {
  value: string
  disabled?: boolean
  onChange: (icon: string) => void
}

export function AboutIconPicker({ value, disabled = false, onChange }: AboutIconPickerProps) {
  const options: { id: string; label: string }[] = isAboutDistinctionIconId(value)
    ? [...ABOUT_DISTINCTION_ICON_OPTIONS]
    : [...ABOUT_DISTINCTION_ICON_OPTIONS, { id: value, label: value || 'Custom' }]

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-slate-700">Icon</legend>
      {!isAboutDistinctionIconId(value) ? (
        <p className="mb-2 text-sm text-amber-800">
          The saved icon “{value || 'none'}” is not in the list. Choose a supported icon before saving.
        </p>
      ) : null}
      <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-5">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900',
                selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <Icon name={option.id} className="text-[20px]" />
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
