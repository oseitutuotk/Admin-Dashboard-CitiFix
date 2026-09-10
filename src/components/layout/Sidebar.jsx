// src/components/layout/Sidebar.jsx — replace entirely
import { NavLink } from 'react-router-dom'
import { LayoutGrid, FileText, CalendarDays, Building2, ChevronLeft, ChevronRight } from 'lucide-react'

// Locked order — do not reorder or drop items per screen.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard overview', icon: LayoutGrid, end: true },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/weekly-reports', label: 'Weekly reports', icon: CalendarDays },
  { to: '/departments', label: 'Departments', icon: Building2 },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen sticky top-0 flex flex-col transition-[width] duration-150 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <div className={`border-b border-[var(--color-border)] ${collapsed ? 'px-2.5 py-5' : 'px-5 py-5'}`}>
        {collapsed ? (
          <div
            className="flex size-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-white text-[12px] font-semibold mx-auto"
            title="CitiFix Admin"
          >
            CF
          </div>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-[var(--color-ink)] leading-tight">CitiFix Admin</p>
            <p className="text-[12px] text-[var(--color-muted)] mt-0.5">Okaikwei North Municipal</p>
          </>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-full text-[14px] font-medium transition-colors ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3.5 py-2'
              } ${
                isActive
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'text-[var(--color-body)] hover:bg-[var(--color-page-alt)]'
              }`
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <div className={`border-t border-[var(--color-border)] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[13px] text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-ink)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}