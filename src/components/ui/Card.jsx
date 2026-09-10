/**
 * Flat card: white surface + hairline border. Deliberately no drop
 * shadow — shadows in this system are reserved for overlays
 * (modals/dropdowns/toasts) so they still mean something.
 */
export default function Card({ children, className = '', padding = 'p-5', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] ${padding} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
