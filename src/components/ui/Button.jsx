import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-[var(--color-ink)] text-white hover:bg-black disabled:bg-[var(--color-border-strong)] disabled:text-[var(--color-subtle)]',
  secondary:
    'bg-white text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-page-alt)] disabled:text-[var(--color-subtle)] disabled:bg-white',
  ghost:
    'bg-transparent text-[var(--color-body)] hover:bg-[var(--color-page-alt)] disabled:text-[var(--color-subtle)]',
  danger:
    'bg-white text-[var(--color-critical)] border border-[var(--color-critical)]/30 hover:bg-[var(--color-critical-bg)] disabled:opacity-50',
  dangerSolid:
    'bg-[var(--color-critical)] text-white hover:brightness-95 disabled:opacity-50',
}

const SIZES = {
  sm: 'text-[13px] px-3 py-1.5 gap-1.5',
  md: 'text-[14px] px-4 py-2 gap-2',
}

/**
 * Primary action button. Always a solid pill per design system —
 * never a gradient, never a soft-shadow "SaaS card" button.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  as: Tag = 'button',
  ...props
}) {
  const isButton = Tag === 'button'
  return (
    <Tag
      type={isButton ? type : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      className={`inline-flex items-center justify-center rounded-full font-medium
        transition-colors duration-150 whitespace-nowrap
        disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4" aria-hidden="true" />
      )}
      {children}
    </Tag>
  )
}
