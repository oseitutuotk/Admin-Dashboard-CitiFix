import { Loader2, Clock, Eye, Search, Wrench, CheckCircle2, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  Processing: { label: 'Processing', color: 'var(--color-status-active)', bg: 'var(--color-status-active-bg)', icon: Loader2 },
  Pending: { label: 'Pending', color: 'var(--color-status-processing)', bg: 'var(--color-status-processing-bg)', icon: Clock },
  Acknowledged: { label: 'Acknowledged', color: '#0f6d6a', bg: '#e1f2f0', icon: Eye },
  Investigating: { label: 'Investigating', color: 'var(--color-status-inprogress)', bg: 'var(--color-status-inprogress-bg)', icon: Search },
  'In Progress': { label: 'In progress', color: '#8a4c00', bg: '#fbe9d3', icon: Wrench },
  Resolved: { label: 'Resolved', color: 'var(--color-status-resolved)', bg: 'var(--color-status-resolved-bg)', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: '#8a3b32', bg: '#f3e6e4', icon: XCircle },
}

export const TERMINAL_STATUSES = ['Resolved', 'Rejected']
export const ALL_STATUSES = ['Processing', 'Pending', 'Acknowledged', 'Investigating', 'In Progress', 'Resolved', 'Rejected']
export const ADMIN_SETTABLE_STATUSES = ['Acknowledged', 'Investigating', 'In Progress', 'Resolved', 'Rejected']
export { STATUS_CONFIG }

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status]

  if (!config) {
    return (
      <span className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[13px] font-medium bg-[var(--color-page-alt)] text-[var(--color-subtle)]">
        {status ?? 'Unknown'}
      </span>
    )
  }

  const Icon = config.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-0.5 text-[13px] font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  )
}