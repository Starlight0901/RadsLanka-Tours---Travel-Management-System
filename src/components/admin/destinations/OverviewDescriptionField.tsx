import { useRef } from 'react'
import { FormattedText } from '@/components/common/FormattedText.tsx'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'

type OverviewDescriptionFieldProps = {
  id: string
  value: string
  maxLength: number
  disabled: boolean
  onChange: (value: string) => void
}

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end) || placeholder
  return {
    next: `${textarea.value.slice(0, start)}${before}${selected}${after}${textarea.value.slice(end)}`,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  }
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const block = value.slice(lineStart, end) || 'List item'
  const prefixed = block
    .split('\n')
    .map((line, index) => {
      const text = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '') || 'List item'
      return prefix === '1. ' ? `${index + 1}. ${text}` : `- ${text}`
    })
    .join('\n')
  return {
    next: `${value.slice(0, lineStart)}${prefixed}${value.slice(end)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixed.length,
  }
}

const formatButtons = [
  { label: 'Bold', title: 'Bold', apply: (el: HTMLTextAreaElement) => wrapSelection(el, '**', '**', 'bold text') },
  { label: 'Italic', title: 'Italic', apply: (el: HTMLTextAreaElement) => wrapSelection(el, '*', '*', 'italic text') },
  { label: 'Bullets', title: 'Bulleted list', apply: (el: HTMLTextAreaElement) => prefixLines(el, '- ') },
  { label: 'Numbers', title: 'Numbered list', apply: (el: HTMLTextAreaElement) => prefixLines(el, '1. ') },
  {
    label: 'Link',
    title: 'Link',
    apply: (el: HTMLTextAreaElement) => wrapSelection(el, '[', '](https://)', 'link text'),
  },
] as const

export function OverviewDescriptionField({ id, value, maxLength, disabled, onChange }: OverviewDescriptionFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyFormat(apply: (el: HTMLTextAreaElement) => { next: string; selectionStart: number; selectionEnd: number }) {
    const textarea = textareaRef.current
    if (!textarea || disabled) {
      return
    }
    const result = apply(textarea)
    onChange(result.next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        Overview description
      </label>
      <div className="mb-2 flex flex-wrap gap-1">
        {formatButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.title}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={disabled}
            onClick={() => applyFormat(button.apply)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        rows={10}
        value={value}
        maxLength={maxLength}
        className={controlClassName}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className={hintClassName}>
        Paragraphs, line breaks, **bold**, *italic*, - bullets, 1. numbers, and [links](https://) are kept. {value.length}/
        {maxLength}
      </p>
      {value.trim() ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
          <FormattedText text={value} className="mt-3 space-y-3 text-sm break-words text-slate-700" />
        </div>
      ) : null}
    </div>
  )
}
