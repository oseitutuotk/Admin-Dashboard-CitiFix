import { AlertTriangle } from 'lucide-react'

/**
 * Independent of StatusBadge. Only ever shown when priority === 5 AND
 * priority5_acknowledged_at is null. A report can be "Pending" (status)
 * and unacknowledged (this flag) simultaneously.
 */
export default function AcknowledgmentFlag({ priority, acknowledgedAt }) {
  if (priority !== 5 || acknowledgedAt) return null

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
      title="Priority 5 report awaiting acknowledgment"
    >
      <AlertTriangle className="size-3" aria-hidden="true" />
      Needs acknowledgment
    </span>
  )
}