import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { siteConfig } from '@/config/site.ts'
import {
  buildShareYourExperienceUrl,
  emailShareHref,
  facebookShareUrl,
  whatsAppShareHref,
} from '@/utils/shareJourney.ts'
import { cn } from '@/utils/cn.ts'

type CopyState = 'idle' | 'copied' | 'failed'

const EMAIL_SUBJECT = 'Share Your Experience with RadsLanka Tours'

const menuItemClass =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-surface-mist hover:text-brand focus-visible:bg-surface-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand/10'

function reviewWhatsAppMessage(url: string): string {
  return `We would love to hear about your experience with RadsLanka Tours! Share your journey and help other travellers discover Sri Lanka. Write your review here: ${url}`
}

function reviewEmailBody(url: string): string {
  return `We hope you had a wonderful journey with RadsLanka Tours. We would appreciate it if you could share your experience and help other travellers discover Sri Lanka.\n\nWrite your review here: ${url}`
}

async function copyText(value: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Fall through to the selectable-input fallback below.
    }
  }

  try {
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(input)
    return copied
  } catch {
    return false
  }
}

export function ShareReviewButton({ className }: { className?: string }) {
  const menuId = useId()
  const fallbackId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const fallbackRef = useRef<HTMLInputElement>(null)
  const resetTimer = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [canNativeShare, setCanNativeShare] = useState(false)
  const url = buildShareYourExperienceUrl()

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

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

  useEffect(() => {
    if (copyState === 'failed') {
      fallbackRef.current?.focus()
      fallbackRef.current?.select()
    }
  }, [copyState])

  function closeMenu() {
    setOpen(false)
    setCopyState('idle')
  }

  async function copyLink() {
    const copied = await copyText(url)
    setCopyState(copied ? 'copied' : 'failed')

    if (!copied) {
      return
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

  async function shareWithDevice() {
    if (typeof navigator.share !== 'function') {
      return
    }

    try {
      await navigator.share({
        title: EMAIL_SUBJECT,
        text: `We would love to hear about your experience with ${siteConfig.name}! Share your journey and help other travellers discover Sri Lanka.`,
        url,
      })
      closeMenu()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }
  }

  const copyLabel = copyState === 'copied' ? 'Review link copied!' : copyState === 'failed' ? 'Couldn’t copy automatically' : 'Copy Link'

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        variant="secondary"
        aria-label="Share review invitation"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="share" className="text-[18px]" />
        Share
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Share review invitation"
          className="share-menu-in absolute top-full left-0 z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-border bg-surface-elevated p-1.5 shadow-card"
        >
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-eyebrow uppercase">
            Invite a traveler
          </p>
          <button type="button" role="menuitem" className={menuItemClass} onClick={() => void copyLink()}>
            <Icon name="link" className="text-[18px] text-accent" />
            {copyLabel}
          </button>
          {copyState === 'failed' ? (
            <div className="px-3 pb-2">
              <label htmlFor={fallbackId} className="sr-only">
                Review submission link
              </label>
              <input
                ref={fallbackRef}
                id={fallbackId}
                readOnly
                value={url}
                className="h-10 w-full rounded-control border border-border bg-surface px-3 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          ) : null}
          <a
            href={whatsAppShareHref(reviewWhatsAppMessage(url))}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            className={menuItemClass}
            onClick={closeMenu}
          >
            <Icon name="chat" className="text-[18px] text-accent" />
            WhatsApp
          </a>
          <a
            href={facebookShareUrl(url)}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            className={menuItemClass}
            onClick={closeMenu}
          >
            <Icon name="public" className="text-[18px] text-accent" />
            Facebook
          </a>
          <a href={emailShareHref(EMAIL_SUBJECT, reviewEmailBody(url))} role="menuitem" className={menuItemClass} onClick={closeMenu}>
            <Icon name="mail" className="text-[18px] text-accent" />
            Email
          </a>
          {canNativeShare ? (
            <button type="button" role="menuitem" className={menuItemClass} onClick={() => void shareWithDevice()}>
              <Icon name="ios_share" className="text-[18px] text-accent" />
              More sharing options
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
