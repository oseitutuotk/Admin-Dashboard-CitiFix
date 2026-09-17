import { NavLink } from 'react-router-dom'
import { LayoutGrid, FileText, Building2, Settings, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../ui/Toast'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard overview', icon: LayoutGrid, end: true },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/departments', label: 'Departments', icon: Building2 },
]

function NavLabel({ collapsed, children }) {
  return (
    <span
      className={`whitespace-nowrap overflow-hidden transition-all duration-150 ${
        collapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'
      }`}
    >
      {children}
    </span>
  )
}

export default function Sidebar({ collapsed }) {
  const { showToast } = useToast()

  return (
    <aside
      className={`shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen sticky top-0 flex flex-col transition-[width] duration-150 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <div className="h-16 border-b border-[var(--color-border)] flex items-center px-4 shrink-0 overflow-hidden">
        {collapsed ? (
          <div className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-ink)] text-white text-[12px] font-semibold mx-auto">
            CF
          </div>
        ) : (
          <p className="text-[18px] font-bold text-[var(--color-ink)] tracking-tight whitespace-nowrap">CitiFix</p>
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
              `flex items-center rounded-[var(--radius-md)] text-[14px] font-medium overflow-hidden transition-colors ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3.5 py-2'
              } ${
                isActive
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'text-[var(--color-body)] hover:bg-[var(--color-page-alt)]'
              }`
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <NavLabel collapsed={collapsed}>{label}</NavLabel>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] p-3 space-y-1">
        <button
          onClick={() => showToast({ title: 'Coming soon', description: "Settings page isn't built yet." })}
          title={collapsed ? 'Settings' : undefined}
          className={`w-full flex items-center rounded-[var(--radius-md)] text-[14px] font-medium text-[var(--color-body)] hover:bg-[var(--color-page-alt)] overflow-hidden transition-colors ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3.5 py-2'
          }`}
        >
          <Settings className="size-4 shrink-0" aria-hidden="true" />
          <NavLabel collapsed={collapsed}>Settings</NavLabel>
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center rounded-[var(--radius-md)] text-[14px] font-medium overflow-hidden transition-colors hover:bg-[var(--color-critical-bg)] ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3.5 py-2'
          }`}
          style={{ color: 'var(--color-critical)' }}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <NavLabel collapsed={collapsed}>Logout</NavLabel>
        </button>
      </div>
    </aside>
  )
}