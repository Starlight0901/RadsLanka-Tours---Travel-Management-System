import { NavLink } from 'react-router-dom'
import { publicNavItems } from '@/components/layout/navigation.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

type MobileNavMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileNavMenu({ open, onClose }: MobileNavMenuProps) {
  if (!open) {
    return null
  }

  return (
    <nav
      id="mobile-nav-menu"
      className="border-t border-border bg-surface-mist px-5 py-4 lg:hidden"
      aria-label="Mobile"
    >
      <ul className="flex flex-col">
        {publicNavItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center text-[15px] font-semibold text-muted',
                  isActive && 'font-bold text-brand',
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink
        to={paths.inquiry}
        onClick={onClose}
        className="mt-3 flex min-h-12 items-center justify-center rounded-control bg-brand text-sm font-bold text-on-brand"
      >
        Book Now
      </NavLink>
    </nav>
  )
}
