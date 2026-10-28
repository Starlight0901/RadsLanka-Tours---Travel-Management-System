import { chipClassName } from '@/components/admin/destinations/formStyles.ts'
import { ESSENCE_THEMES } from '@/config/destinationContent.ts'
import { cn } from '@/utils/cn.ts'

type EssenceThemesFieldProps = {
  labelId: string
  selected: string[]
  onChange: (selected: string[]) => void
}

export function EssenceThemesField({ labelId, selected, onChange }: EssenceThemesFieldProps) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
      {ESSENCE_THEMES.map((theme) => {
        const active = selected.includes(theme.id)
        return (
          <button
            key={theme.id}
            type="button"
            aria-pressed={active}
            className={cn(
              chipClassName,
              active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
            )}
            onClick={() => toggle(theme.id)}
          >
            {theme.label}
          </button>
        )
      })}
    </div>
  )
}
