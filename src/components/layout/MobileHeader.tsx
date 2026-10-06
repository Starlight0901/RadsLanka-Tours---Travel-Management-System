import { NavLink } from 'react-router-dom'
import { SiteLogo } from '@/components/layout/SiteLogo.tsx'
import { Icon } from '@/components/ui/Icon.tsx'
import { paths } from '@/routes/paths.ts'

type MobileHeaderProps = {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function MobileHeader({ menuOpen, onToggleMenu }: MobileHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between px-5 lg:hidden">
      <SiteLogo imgClassName="h-8 max-w-[136px]" onClick={() => menuOpen && onToggleMenu()} />
      <div className="flex items-center gap-2">
        <NavLink
          to={paths.inquiry}
          className="inline-flex min-h-9 items-center gap-1 rounded-control bg-brand px-3.5 py-2 text-[13px] font-semibold tracking-[0.02em] text-on-brand"
        >
          <Icon name="calendar_month" className="text-[12px]" />
          Book Now
        </NavLink>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={onToggleMenu}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="text-[20px] text-brand" />
          <span className="sr-only">{menuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
        </button>
      </div>
    </div>
  )
}
