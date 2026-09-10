const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    color: 'var(--color-status-processing)',
    bg: 'var(--color-status-processing-bg)',
  },
  Processing: {
    label: 'Processing',
    color: 'var(--color-status-active)',
    bg: 'var(--color-status-active-bg)',
  },
  Investigating: {
    label: 'Investigating',
    color: 'var(--color-status-inprogress)',
    bg: 'var(--color-status-inprogress-bg)',
  },
  'In Progress': {
    label: 'In progress',
    color: '#8a4c00',
    bg: '#fbe9d3',
  },
  Resolved: {
    label: 'Resolved',
    color: 'var(--color-status-resolved)',
    bg: 'var(--color-status-resolved-bg)',
  },
  Rejected: {
    label: 'Rejected',
    color: '#8a3b32',
    bg: '#f3e6e4',
  },
}

// Terminal states — used across the app to define "active" reports
// (anything NOT in this set) rather than relying on a nonexistent
// "active" status value.
export const TERMINAL_STATUSES = ['Resolved', 'Rejected']
export const ALL_STATUSES = ['Pending', 'Processing', 'Investigating', 'In Progress', 'Resolved', 'Rejected']

/**
 * Renders one of the 6 real report statuses from the live schema.
 * Deliberately does NOT know about acknowledgment — that's a
 * separate signal (priority5_acknowledged_at) rendered by
 * <AcknowledgmentFlag />. A report can be "Pending" AND
 * unacknowledged at the same time.
 */
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status]

  if (!config) {
    console.warn(`StatusBadge: unknown status "${status}"`)
    return (
      <span className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[12px] font-medium bg-[var(--color-page-alt)] text-[var(--color-subtle)]">
        {status ?? 'Unknown'}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}