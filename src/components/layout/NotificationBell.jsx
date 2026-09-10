import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../ui/EmptyState'

/**
 * notifications: [{ id, referenceCode, title, createdAt }]
 * Only ever populated with priority-5 alerts per the locked spec.
 * Data wiring (Supabase Realtime subscription) happens where this
 * is used — this component is presentation-only.
 */
export default function NotificationBell({ notifications = [], loading = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const count = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-full hover:bg-[var(--color-page-alt)] transition-colors"
        aria-label={`Notifications${count ? `, ${count} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell className="size-[18px] text-[var(--color-body)]" aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute top-1 right-1.5 flex size-2 rounded-full"
            style={{ backgroundColor: 'var(--color-critical)' }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden z-30"
          style={{ boxShadow: 'var(--shadow-overlay)' }}
        >
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-[13px] font-medium text-[var(--color-ink)]">Priority 5 alerts</p>
          </div>

          {loading ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">Loading…</div>
          ) : count === 0 ? (
            <EmptyState
              icon={Bell}
              title="No critical alerts"
              description="You'll see priority 5 reports here as they come in."
            />
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/reports/${n.id}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-2.5 px-4 py-3 hover:bg-[var(--color-page-alt)] transition-colors"
                  >
                    <AlertTriangle
                      className="size-4 mt-0.5 shrink-0"
                      style={{ color: 'var(--color-critical)' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--color-ink)] truncate">{n.title}</p>
                      <p className="text-[12px] text-[var(--color-muted)] mt-0.5">
                        {n.referenceCode} · {n.createdAt}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
