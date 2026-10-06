import { useEffect, useState } from 'react'
import { DesktopHeader } from '@/components/layout/DesktopHeader.tsx'
import { HeaderUtilityBar } from '@/components/layout/HeaderUtilityBar.tsx'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav.tsx'
import { MobileHeader } from '@/components/layout/MobileHeader.tsx'
import { MobileNavMenu } from '@/components/layout/MobileNavMenu.tsx'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50">
        <HeaderUtilityBar />
        <div className="border-b border-black/5 bg-surface-mist/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:bg-white lg:shadow-[0_4px_20px_-2px_rgba(27,67,50,0.06)] lg:backdrop-blur-[6px]">
          <div className="mx-auto max-w-content">
            <DesktopHeader />
            <MobileHeader menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
          </div>
          <MobileNavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </header>
      <MobileBottomNav />
    </>
  )
}
