import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CriticalAcknowledgmentModal from './CriticalAcknowledgmentModal'
import { useCriticalAlerts } from '../../hooks/useCriticalAlerts'
import { useReportsRealtime } from '../../hooks/useReportsRealtime'

const SIDEBAR_KEY = 'citifix-admin-sidebar-collapsed'

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard Overview'
  if (pathname.startsWith('/reports/')) return 'Report Detail'
  if (pathname === '/reports') return 'Reports'
  if (pathname === '/departments') return 'Departments'
  return 'Admin Portal'
}

export default function AdminLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [dismissedIds, setDismissedIds] = useState(() => new Set())

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {
        // localStorage unavailable — not critical
      }
      return next
    })
  }

  function dismissAlert(id) {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  useReportsRealtime()
  const { data: criticalAlerts = [] } = useCriticalAlerts()
  const visibleAlerts = criticalAlerts.filter((r) => !dismissedIds.has(r.id))

  return (
    <div className="flex min-h-screen bg-[var(--color-page)]">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          pageTitle={getPageTitle(location.pathname)}
          collapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
          notifications={criticalAlerts}
        />
        <main className="flex-1 p-6 w-full">
          <Outlet />
        </main>
      </div>

      <CriticalAcknowledgmentModal reports={visibleAlerts} onDismiss={dismissAlert} />
    </div>
  )
}