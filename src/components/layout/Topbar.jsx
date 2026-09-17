import { PanelLeftClose, PanelLeft } from 'lucide-react'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'

export default function Topbar({ pageTitle, collapsed, onToggleSidebar, notifications = [], adminEmail = 'admin@onma.gov.gh' }) {
  return (
    <header className="h-16 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-ink)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
        </button>
        <h1 className="text-[15px] font-semibold text-[var(--color-ink)]">
          <span className="text-[var(--color-muted)] font-normal">Admin Portal / </span>
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <GlobalSearch />

        <NotificationBell notifications={notifications} />

        <div className="flex items-center gap-2 pl-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-white text-[12px] font-medium" aria-hidden="true">
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