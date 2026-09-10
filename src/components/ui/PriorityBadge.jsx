const LABELS = {
  1: 'P1 · Low',
  2: 'P2 · Low',
  3: 'P3 · Medium',
  4: 'P4 · High',
  5: 'P5 · Critical',
}

/**
 * Shows the report's priority score (1-5). Distinct from StatusBadge
 * (lifecycle state) and AcknowledgmentFlag (whether a P5 has been seen).
 * Only P5 gets the critical color — 1-4 stay neutral so the critical
 * color keeps its meaning.
 */
export default function PriorityBadge({ priority }) {
  const isCritical = priority === 5
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[12px] font-medium"
      style={
        isCritical
          ? { backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)' }
          : { backgroundColor: 'var(--color-page-alt)', color: 'var(--color-body)' }
      }
    >
      {LABELS[priority] ?? `P${priority}`}
    </span>
  )
}
