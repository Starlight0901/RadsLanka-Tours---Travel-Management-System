import { useEffect, type RefObject } from 'react'

const RESUME_DELAY_MS = 2500
const MAX_FRAME_MS = 100

type AutoScrollOptions = {
  enabled: boolean
  pxPerSecond: number
}

/**
 * Continuously advances `scroller.scrollLeft` so native touch, trackpad, and keyboard scrolling
 * keep working. `loop` is the first of two identical tracks; when the position passes its width
 * it wraps back by that width, which looks identical, so the loop has no visible jump.
 * Any user interaction pauses movement, which resumes after a short idle period.
 */
export function useAutoScroll(
  scrollerRef: RefObject<HTMLElement | null>,
  loopRef: RefObject<HTMLElement | null>,
  { enabled, pxPerSecond }: AutoScrollOptions,
) {
  useEffect(() => {
    const scroller = scrollerRef.current
    const loop = loopRef.current
    if (!enabled || !scroller || !loop) {
      return
    }

    let frame = 0
    let lastTime = 0
    let position = scroller.scrollLeft
    let lastWritten = position
    let resumeAt = 0
    let touching = false
    let pointerDown = false
    let hovering = false
    let focused = false
    let visible = true

    const pauseBriefly = () => {
      resumeAt = performance.now() + RESUME_DELAY_MS
    }

    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      const elapsed = lastTime ? Math.min(now - lastTime, MAX_FRAME_MS) : 0
      lastTime = now

      if (touching || pointerDown || hovering || focused || !visible || now < resumeAt) {
        position = scroller.scrollLeft
        lastWritten = position
        return
      }

      const loopWidth = loop.offsetWidth
      if (loopWidth <= 0) {
        return
      }

      position += (pxPerSecond * elapsed) / 1000
      while (position >= loopWidth) {
        position -= loopWidth
      }
      scroller.scrollLeft = position
      lastWritten = scroller.scrollLeft
    }

    const onScroll = () => {
      if (Math.abs(scroller.scrollLeft - lastWritten) > 1.5) {
        pauseBriefly()
      }
    }
    const onTouchStart = () => {
      touching = true
    }
    const onTouchEnd = () => {
      touching = false
      pauseBriefly()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        pointerDown = true
      }
    }
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        pointerDown = false
        pauseBriefly()
      }
    }
    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        hovering = true
      }
    }
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        hovering = false
        pointerDown = false
        pauseBriefly()
      }
    }
    const onFocusIn = () => {
      focused = true
    }
    const onFocusOut = () => {
      focused = false
      pauseBriefly()
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
    })
    observer.observe(scroller)

    scroller.addEventListener('scroll', onScroll, { passive: true })
    scroller.addEventListener('wheel', pauseBriefly, { passive: true })
    scroller.addEventListener('touchstart', onTouchStart, { passive: true })
    scroller.addEventListener('touchend', onTouchEnd, { passive: true })
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true })
    scroller.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    scroller.addEventListener('pointerenter', onPointerEnter)
    scroller.addEventListener('pointerleave', onPointerLeave)
    scroller.addEventListener('focusin', onFocusIn)
    scroller.addEventListener('focusout', onFocusOut)
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scroller.removeEventListener('scroll', onScroll)
      scroller.removeEventListener('wheel', pauseBriefly)
      scroller.removeEventListener('touchstart', onTouchStart)
      scroller.removeEventListener('touchend', onTouchEnd)
      scroller.removeEventListener('touchcancel', onTouchEnd)
      scroller.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      scroller.removeEventListener('pointerenter', onPointerEnter)
      scroller.removeEventListener('pointerleave', onPointerLeave)
      scroller.removeEventListener('focusin', onFocusIn)
      scroller.removeEventListener('focusout', onFocusOut)
    }
  }, [scrollerRef, loopRef, enabled, pxPerSecond])
}
