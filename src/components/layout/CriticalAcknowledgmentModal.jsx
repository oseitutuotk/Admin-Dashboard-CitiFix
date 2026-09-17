import { AlertTriangle, MapPin, ArrowRight, X, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { formatRelativeTime } from '../../lib/format'

export default function CriticalAcknowledgmentModal({ reports = [], onDismiss }) {
  if (reports.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="critical-modal-title"
    >
      <div
        className="w-full max-w-3xl rounded-[var(--radius-md)] bg-[var(--color-surface)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-overlay)' }}
      >
        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] flex gap-3" style={{ backgroundColor: 'var(--color-critical-bg)' }}>
          <div className="flex size-10 items-center justify-center rounded-full shrink-0 bg-white">
            <AlertTriangle className="size-5" style={{ color: 'var(--color-critical)' }} aria-hidden="true" />
          </div>
          <div>
            <h2 id="critical-modal-title" className="text-[19px] font-semibold text-[var(--color-ink)]">
              {reports.length === 1
                ? '1 new critical report needs acknowledgment'
                : `${reports.length} new critical reports need acknowledgment`}
            </h2>
            <p className="text-[16px] text-[var(--color-body)] mt-1">
              Open a report to review and acknowledge it, or close its alert for now.
            </p>
          </div>
        </div>

        <ul className="max-h-[36rem] overflow-y-auto divide-y divide-[var(--color-border)]">
          {reports.map((r) => (
            <li key={r.id} className="p-5 flex gap-4">
              <Link to={`/reports/${r.id}`} onClick={() => onDismiss(r.id)} className="shrink-0">
                {r.photoUrl ? (
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="w-60 aspect-[4/3] object-cover rounded-[var(--radius-sm)] border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-60 aspect-[4/3] flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] text-[var(--color-subtle)]">
                    <ImageOff className="size-7" />
                    <p className="text-[15px] italic">No photo</p>
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1 flex flex-col">
                <Link to={`/reports/${r.id}`} onClick={() => onDismiss(r.id)} className="group">
                  <p className="text-[18px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                    {r.title}
                  </p>
                  <p className="text-[15px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1 flex-wrap">
                    <span>{r.reference_code}</span>
                    <span>·</span>
                    <MapPin className="size-4" />
                    <span>{r.location_name}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(r.created_at)}</span>
                  </p>
                  {r.ai_summary && (
                    <p className="text-[16px] text-[var(--color-body)] mt-2 leading-relaxed line-clamp-3">
                      {r.ai_summary}
                    </p>
                  )}
                </Link>

                <div className="flex gap-2 mt-3">
                  <Button
                    as={Link}
                    to={`/reports/${r.id}`}
                    icon={ArrowRight}
                    onClick={() => onDismiss(r.id)}
                    className="text-[16px] px-5 py-2.5"
                  >
                    View report
                  </Button>
                  <Button
                    variant="danger"
                    icon={X}
                    onClick={() => onDismiss(r.id)}
                    className="text-[16px] px-5 py-2.5"
                  >
                    Close alert
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}