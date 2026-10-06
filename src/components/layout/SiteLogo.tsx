import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site.ts'
import { paths } from '@/routes/paths.ts'
import { cn } from '@/utils/cn.ts'

type SiteLogoProps = {
  className?: string
  imgClassName?: string
  onClick?: () => void
}

export function SiteLogo({ className, imgClassName, onClick }: SiteLogoProps) {
  return (
    <Link
      to={paths.home}
      className={cn('inline-flex shrink-0 items-center', className)}
      onClick={onClick}
      aria-label={siteConfig.logo.alt}
    >
      <img
        src={siteConfig.logo.src}
        alt=""
        className={cn('h-10 w-auto max-w-[171px] object-contain object-left', imgClassName)}
      />
    </Link>
  )
}
