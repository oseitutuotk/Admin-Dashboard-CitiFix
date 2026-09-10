// src/components/layout/AdminLayout.jsx — replace entirely
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CriticalAcknowledgmentModal from './CriticalAcknowledgmentModal'
import { useCriticalAlerts } from '../../hooks/useCriticalAlerts'
import { useAcknowledgeReport } from '../../hooks/useAcknowledgeReport'
import { useReportsRealtime } from '../../hooks/useReportsRealtime'

const SIDEBAR_KEY = 'citifix-admin-sidebar-collapsed'

/**
 * Shared shell for every authenticated screen. Owns sidebar collapse
 * state — persisted so it survives reloads. Pages don't need any
 * special-casing since the layout is flex-based (main content
 * naturally gets the extra width when the sidebar shrinks). Note: the
 * old max-w-[1400px] cap on <main> was dropped here — wide tables like
 * Reports should use whatever width the sidebar state leaves them.
 */
export default function AdminLayout({ crumb }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true'
    } catch {
      return false
    }
  })

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {
        // localStorage unavailable (private browsing etc.) — not critical
      }
      return next
    })
  }

  useReportsRealtime()
  const { data: criticalAlerts = [] } = useCriticalAlerts()
  const acknowledge = useAcknowledgeReport()

  return (
    <div className="flex min-h-screen bg-[var(--color-page)]">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar crumb={crumb} notifications={criticalAlerts} />
        <main className="flex-1 p-6 w-full">
          <Outlet />
        </main>
      </div>

      <CriticalAcknowledgmentModal
        reports={criticalAlerts}
        onAcknowledge={(id) => acknowledge.mutate(id)}
      />
    </div>
  )
}