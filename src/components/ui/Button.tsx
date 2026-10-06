import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn.ts'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground shadow-control hover:bg-accent/90 focus-visible:outline-accent',
  secondary:
    'bg-brand text-on-brand shadow-control hover:bg-brand-muted focus-visible:outline-brand',
  ghost:
    'border border-border bg-transparent text-ink hover:bg-surface-container focus-visible:outline-brand',
  glass:
    'border border-white/20 bg-white/10 text-on-brand hover:bg-white/15 focus-visible:outline-white',
}

const baseClasses =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  )
}

export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export type ButtonLinkProps = {
  to: string
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, variant = 'primary', className, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Link>
  )
}
