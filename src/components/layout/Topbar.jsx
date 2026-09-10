import { Search } from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Topbar({ crumb, notifications = [], adminEmail = 'admin@onma.gov.gh' }) {
  return (
    <header className="h-16 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 gap-4">
      <p className="text-[13px] text-[var(--color-muted)] truncate">{crumb}</p>

      <div className="flex items-center gap-3 ml-auto">
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search reports, departments…"
            className="w-64 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-page)] pl-9 pr-3 py-1.5 text-[13px] placeholder:text-[var(--color-subtle)] focus:bg-white"
          />
        </div>

        <NotificationBell notifications={notifications} />

        <div className="flex items-center gap-2 pl-1">
          <div
            className="flex size-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-white text-[12px] font-medium"
            aria-hidden="true"
          >
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-[13px] font-medium text-[var(--color-ink)]">Admin</p>
            <p className="text-[11px] text-[var(--color-muted)]">{adminEmail}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
