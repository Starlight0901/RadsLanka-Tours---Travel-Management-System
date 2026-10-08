import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon.tsx'
import {
  buildWhatsAppShareText,
  facebookShareHref,
  whatsAppShareHref,
  xShareHref,
} from '@/utils/shareJourney.ts'

type ShareJourneyButtonProps = {
  title: string
  description: string
  url: string
}

type CopyState = 'idle' | 'copied' | 'failed'

export function ShareJourneyButton({ title, description, url }: ShareJourneyButtonProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const resetTimer = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
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

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current)
      }
    }
  }, [])

  function onShare() {
    setOpen((current) => !current)
  }

  async function shareWithOtherApps() {
    setOpen(false)
    if (typeof navigator.share !== 'function') {
      return
    }

    try {
      await navigator.share({
        title,
        text: description.trim(),
        url,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }
  }

  function closeAfterShare() {
    setOpen(false)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current)
    }
    resetTimer.current = window.setTimeout(() => {
      setCopyState('idle')
      setOpen(false)
      resetTimer.current = null
    }, 1600)
  }

  const copyLabel = copyState === 'copied' ? 'Link copied' : copyState === 'failed' ? 'Couldn’t copy link' : 'Copy link'
  const whatsappMessage = buildWhatsAppShareText(title, description, url)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-[13px] font-semibold backdrop-blur-md lg:w-auto lg:gap-2 lg:px-4"
        aria-label="Share journey"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={onShare}
      >
        <Icon name="share" className="text-[16px]" />
        <span className="hidden lg:inline">Share journey</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="share-menu-in absolute top-full right-0 z-30 mt-2 w-60 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-brand-deep/90 p-1.5 text-on-brand shadow-[0_16px_36px_-20px_rgba(1,34,26,0.8),0_0_24px_-16px_rgba(254,199,63,0.35)] backdrop-blur-md"
        >
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-gold-soft uppercase">
            Share this journey
          </p>
          <ShareLink
            href={whatsAppShareHref(whatsappMessage)}
            label="WhatsApp"
            icon="chat"
            onSelect={closeAfterShare}
          />
          <ShareLink
            href={facebookShareHref(title, description, url)}
            label="Facebook"
            icon="public"
            onSelect={closeAfterShare}
          />
          <ShareLink href={xShareHref(title, description, url)} label="X" icon="tag" onSelect={closeAfterShare} />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-on-brand-soft transition hover:bg-white/10 hover:text-gold-soft"
            onClick={() => void copyLink()}
          >
            <Icon name="link" className="text-[16px] text-gold-soft" />
            {copyLabel}
          </button>
          {typeof navigator.share === 'function' ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-on-brand-soft transition hover:bg-white/10 hover:text-gold-soft"
              onClick={() => void shareWithOtherApps()}
            >
              <Icon name="ios_share" className="text-[16px] text-gold-soft" />
              More sharing options
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ShareLink({
  href,
  label,
  icon,
  onSelect,
}: {
  href: string
  label: string
  icon: string
  onSelect: () => void
}) {
  return (
    <a
      href={href}
      role="menuitem"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-on-brand-soft transition hover:bg-white/10 hover:text-gold-soft"
      onClick={onSelect}
    >
      <Icon name={icon} className="text-[16px] text-gold-soft" />
      {label}
    </a>
  )
}
