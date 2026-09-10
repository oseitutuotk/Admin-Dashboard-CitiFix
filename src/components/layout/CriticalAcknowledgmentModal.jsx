import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

/**
 * App-wide, interrupts any screen. Per the locked spec, multiple
 * priority-5 arrivals batch into a single modal ("3 new critical
 * reports") rather than stacking one modal per report.
 *
 * reports: [{ id, referenceCode, title, location }]
 * onAcknowledge(id) marks a single report acknowledged and removes
 * it from the batch; the modal closes itself once the batch is empty.
 */
export default function CriticalAcknowledgmentModal({ reports = [], onAcknowledge }) {
  if (reports.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="critical-modal-title"
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-md)] bg-[var(--color-surface)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-overlay)' }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: 'var(--color-critical-bg)' }}
          >
            <AlertTriangle className="size-[18px]" style={{ color: 'var(--color-critical)' }} aria-hidden="true" />
          </div>
          <div>
            <h2 id="critical-modal-title" className="text-[15px] font-semibold text-[var(--color-ink)]">
              {reports.length === 1
                ? '1 new critical report needs acknowledgment'
                : `${reports.length} new critical reports need acknowledgment`}
            </h2>
            <p className="text-[13px] text-[var(--color-muted)] mt-1">
              Review each report and confirm you've seen it before continuing.
            </p>
          </div>
        </div>

        <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--color-border)]">
          {reports.map((r) => (
            <li key={r.id} className="px-5 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/reports/${r.id}`}
                  className="text-[13px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] truncate block"
                >
                  {r.title}
                </Link>
                <p className="text-[12px] text-[var(--color-muted)] mt-0.5">
                  {r.referenceCode} · {r.location}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onAcknowledge(r.id)}>
                Acknowledge
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
