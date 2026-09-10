import Button from './Button'

/**
 * Generic empty-state shell. Deliberately requires the caller to pass
 * real title/description/action copy each time rather than falling
 * back to a generic "Nothing here" — each of the three empty states
 * we need (no data yet, no filter results, no departments) says
 * something different and points at a different next action.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-[var(--color-page-alt)]">
          <Icon className="size-5 text-[var(--color-muted)]" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-[15px] font-medium text-[var(--color-ink)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] text-[var(--color-muted)]">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Button as="a" href={action.href} icon={action.icon} onClick={action.onClick}>
              {action.label}
            </Button>
          ) : (
            <Button icon={action.icon} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
