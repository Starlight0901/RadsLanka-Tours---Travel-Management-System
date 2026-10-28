import { Fragment, type ReactNode } from 'react'
import { cn } from '@/utils/cn.ts'

type FormattedTextProps = {
  text: string
  className?: string
  paragraphClassName?: string
  listClassName?: string
}

const BULLET_PATTERN = /^\s*[-*•]\s+/
const NUMBERED_PATTERN = /^\s*(\d{1,3})[.)]\s+/
const LINK_PATTERN = /(\[[^\]\n]+\]\([^)\s]+\))/g
const LINK_PARTS = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/
const EMPHASIS_PATTERN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g

/** Only web, email, phone and site-relative links are rendered; anything else stays as text. */
export function safeLinkHref(value: string): string | null {
  const href = value.trim()
  if (/^\/(?!\/)/.test(href)) {
    return href
  }
  try {
    const url = new URL(href)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function renderEmphasis(text: string, keyPrefix: string): ReactNode[] {
  return text.split(EMPHASIS_PATTERN).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-brand">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      if (part.length > 2) {
        return <em key={key}>{part.slice(1, -1)}</em>
      }
    }
    return <Fragment key={key}>{part}</Fragment>
  })
}

/** Supports **bold**, *italic*, _italic_ and [label](url). Output is React text, never HTML. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  text.split(LINK_PATTERN).forEach((part, index) => {
    const match = LINK_PARTS.exec(part)
    const href = match ? safeLinkHref(match[2]) : null
    if (match && href) {
      const external = /^https?:/.test(href)
      nodes.push(
        <a
          key={`a-${index}`}
          href={href}
          className="font-semibold text-brand underline underline-offset-2 hover:text-brand-muted"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {renderEmphasis(match[1], `a-${index}`)}
        </a>,
      )
      return
    }
    nodes.push(...renderEmphasis(part, `t-${index}`))
  })
  return nodes
}

function renderLines(lines: string[]): ReactNode[] {
  return lines.flatMap((line, index) => (index === 0 ? renderInline(line) : [<br key={`br-${index}`} />, ...renderInline(line)]))
}

type ListKind = 'bullet' | 'number'

/**
 * Blank lines separate paragraphs and single line breaks are kept. Lines starting with
 * "-", "*" or "•" become bullet points, and lines starting with "1." or "1)" become numbered items.
 */
export function FormattedText({ text, className, paragraphClassName, listClassName }: FormattedTextProps) {
  const blocks = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').filter((line) => line.trim() !== ''))
    .filter((lines) => lines.length > 0)

  return (
    <div className={className}>
      {blocks.map((lines, blockIndex) => {
        const nodes: ReactNode[] = []
        let paragraph: string[] = []
        let list: { kind: ListKind; start: number; items: string[] } | null = null

        const flushParagraph = () => {
          if (paragraph.length > 0) {
            nodes.push(
              <p key={`p-${nodes.length}`} className={paragraphClassName}>
                {renderLines(paragraph)}
              </p>,
            )
            paragraph = []
          }
        }
        const flushList = () => {
          if (!list) {
            return
          }
          const items = list.items.map((item, index) => <li key={index}>{renderInline(item)}</li>)
          nodes.push(
            list.kind === 'bullet' ? (
              <ul key={`ul-${nodes.length}`} className={cn('list-disc space-y-1.5 pl-5 marker:text-eyebrow', listClassName)}>
                {items}
              </ul>
            ) : (
              <ol
                key={`ol-${nodes.length}`}
                start={list.start}
                className={cn('list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-eyebrow', listClassName)}
              >
                {items}
              </ol>
            ),
          )
          list = null
        }
        const addListItem = (kind: ListKind, item: string, start: number) => {
          flushParagraph()
          if (list?.kind !== kind) {
            flushList()
            list = { kind, start, items: [] }
          }
          list.items.push(item)
        }

        for (const line of lines) {
          const numbered = NUMBERED_PATTERN.exec(line)
          if (numbered) {
            addListItem('number', line.replace(NUMBERED_PATTERN, ''), Number(numbered[1]))
          } else if (BULLET_PATTERN.test(line)) {
            addListItem('bullet', line.replace(BULLET_PATTERN, ''), 1)
          } else {
            flushList()
            paragraph.push(line.trim())
          }
        }
        flushParagraph()
        flushList()

        return <Fragment key={blockIndex}>{nodes}</Fragment>
      })}
    </div>
  )
}
