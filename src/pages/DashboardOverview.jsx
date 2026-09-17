import { Link } from 'react-router-dom'
import { AlertTriangle, Inbox } from 'lucide-react'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import { useCriticalAlerts } from '../hooks/useCriticalAlerts'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import AcknowledgmentFlag from '../components/ui/AcknowledgmentFlag'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonStatCard, SkeletonRow } from '../components/ui/Skeleton'
import { formatDateTime, formatDuration } from '../lib/format'

export default function DashboardOverview() {
  const {
    loading,
    error,
    totalCount,
    activeCount,
    resolvedCount,
    avgResolutionHours,
    recentReports,
  } = useDashboardOverview()

  const { data: criticalUnacknowledged = [], isLoading: criticalLoading } = useCriticalAlerts()

  if (error) {
    return (
      <Card>
        <p className="text-[15px]" style={{ color: 'var(--color-critical)' }}>
          Couldn't load dashboard data: {error.message}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[23px] font-semibold text-[var(--color-ink)]">Municipal overview</h1>
        <p className="text-[14px] text-[var(--color-muted)] mt-1">
          Real-time infrastructure reporting for Okaikwei North.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label="Total reports" value={totalCount} sublabel="All-time" />
            <StatCard label="Active reports" value={activeCount} sublabel="Not yet resolved or rejected" />
            <StatCard label="Resolved" value={resolvedCount} sublabel="All-time" />
            <StatCard
              label="Avg. resolution time"
              value={formatDuration(avgResolutionHours)}
              sublabel={resolvedCount === 0 ? 'No resolved reports yet' : 'Based on resolved reports'}
            />
          </>
        )}
      </div>

      {!criticalLoading && criticalUnacknowledged.length > 0 && (
        <div
          className="rounded-[var(--radius-md)] border px-5 py-4 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row"
          style={{ backgroundColor: 'var(--color-critical-bg)', borderColor: 'var(--color-critical)' }}
        >
          <div className="flex gap-3">
            <AlertTriangle className="size-5 mt-0.5 shrink-0" style={{ color: 'var(--color-critical)' }} />
            <div>
              <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                {criticalUnacknowledged.length === 1
                  ? '1 critical report needs acknowledgment'
                  : `${criticalUnacknowledged.length} critical reports need acknowledgment`}
              </p>
              <p className="text-[14px] text-[var(--color-muted)] mt-0.5">
                Priority 5 reports require review before they can be cleared.
              </p>
            </div>
          </div>
          <Button as={Link} to="/reports?unacknowledgedOnly=true" variant="dangerSolid" size="sm">
            View all priority 5
          </Button>
        </div>
      )}

      <Card padding="p-0">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">Recent reports</h2>
          <Link to="/reports" className="text-[14px] text-[var(--color-accent)] hover:underline underline-offset-2">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[13px] text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="px-5 py-2.5 font-medium w-32">Reference</th>
                <th className="px-3 py-2.5 font-medium">Title &amp; location</th>
                <th className="px-3 py-2.5 font-medium w-40">Department</th>
                <th className="px-3 py-2.5 font-medium w-32">Priority</th>
                <th className="px-3 py-2.5 font-medium w-32">Status</th>
                <th className="px-3 py-2.5 font-medium w-40">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={6} />)
              ) : recentReports.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Inbox}
                      title="No reports yet"
                      description="Citizen-submitted reports will appear here as they come in."
                    />
                  </td>
                </tr>
              ) : (
                recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-page-alt)] transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        to={`/reports/${r.id}`}
                        className="text-[14px] font-medium text-[var(--color-accent)] hover:underline underline-offset-2"
                      >
                        {r.reference_code}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <p className={`text-[14px] truncate ${!r.is_read ? 'font-bold text-[var(--color-ink)]' : 'text-[var(--color-ink)]'}`}>
                        {!r.is_read && <span className="inline-block size-1.5 rounded-full bg-[var(--color-accent)] mr-1.5 align-middle" />}
                        {r.title}
                      </p>
                      <p className="text-[13px] text-[var(--color-muted)] truncate">
                        {r.location_name}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-[var(--color-body)] truncate">
                      {r.departments?.name ?? (
                        <span className="text-[var(--color-subtle)] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <PriorityBadge priority={r.priority} />
                        <AcknowledgmentFlag priority={r.priority} acknowledgedAt={r.priority5_acknowledged_at} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-3 text-[13px] text-[var(--color-muted)] whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, sublabel }) {
  return (
    <Card>
      <p className="text-[13px] font-semibold text-[var(--color-muted)]">{label}</p>
      <p className="text-[27px] font-semibold text-[var(--color-ink)] mt-1">{value}</p>
      <p className="text-[13px] text-[var(--color-subtle)] mt-1">{sublabel}</p>
    </Card>
  )
}