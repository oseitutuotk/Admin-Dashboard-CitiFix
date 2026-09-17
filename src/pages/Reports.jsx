import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Inbox, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReportsList, PAGE_SIZE } from '../hooks/useReportsList'
import { useDepartments } from '../hooks/useDepartments'
import { useBulkReportActions } from '../hooks/useBulkReportActions'
import { useToast } from '../components/ui/Toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import AcknowledgmentFlag from '../components/ui/AcknowledgmentFlag'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonRow } from '../components/ui/Skeleton'
import ReportsFilterBar from '../components/reports/ReportsFilterBar'
import BulkActionBar from '../components/reports/BulkActionBar'
import { formatDateTime } from '../lib/format'

const EMPTY_FILTERS = {
  search: '',
  statuses: [],
  priority: null,
  unacknowledgedOnly: false,
  departmentId: null,
  dateFrom: null,
  dateTo: null,
  page: 0,
}

function filtersFromSearchParams(params) {
  return {
    ...EMPTY_FILTERS,
    priority: params.get('priority') ? Number(params.get('priority')) : null,
    unacknowledgedOnly: params.get('unacknowledgedOnly') === 'true',
    departmentId: params.get('departmentId') || null,
  }
}

export default function Reports() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams))
  const [selected, setSelected] = useState(() => new Set())
  const { showToast } = useToast()

  const { data, isLoading, error } = useReportsList(filters)
  const { data: departments = [] } = useDepartments()
  const { bulkUpdateStatus, bulkReassignDepartment, bulkDelete } = useBulkReportActions()

  const rows = data?.rows ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasFiltersApplied = JSON.stringify({ ...filters, page: 0 }) !== JSON.stringify(EMPTY_FILTERS)

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function handleBulkStatus(status) {
    try {
      await bulkUpdateStatus.mutateAsync({ ids: [...selected], status })
      showToast({ variant: 'success', title: `Updated ${selected.size} report(s) to "${status}"` })
      clearSelection()
    } catch (e) {
      showToast({ variant: 'critical', title: 'Bulk status update failed', description: e.message })
    }
  }

  async function handleBulkDepartment(departmentId) {
    const dept = departments.find((d) => d.id === departmentId)
    try {
      await bulkReassignDepartment.mutateAsync({ ids: [...selected], departmentId })
      showToast({ variant: 'success', title: `Reassigned ${selected.size} report(s) to ${dept?.name ?? 'department'}` })
      clearSelection()
    } catch (e) {
      showToast({ variant: 'critical', title: 'Bulk reassignment failed', description: e.message })
    }
  }

  async function handleBulkReject() {
    if (!window.confirm(`Reject ${selected.size} selected report(s)? This marks them as not actionable.`)) return
    try {
      await bulkDelete.mutateAsync([...selected])
      showToast({ variant: 'success', title: `Rejected ${selected.size} report(s)` })
      clearSelection()
    } catch (e) {
      showToast({ variant: 'critical', title: 'Bulk reject failed', description: e.message })
    }
  }

  if (error) {
    return (
      <Card>
        <p className="text-[14px]" style={{ color: 'var(--color-critical)' }}>
          Couldn't load reports: {error.message}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[23px] font-semibold text-[var(--color-ink)]">Infrastructure reports</h1>
        <p className="text-[14px] text-[var(--color-muted)] mt-1">
          Centralized management of municipal infrastructure issues.
        </p>
      </div>

      <ReportsFilterBar filters={filters} onChange={setFilters} departments={departments} />

      <BulkActionBar
        selectedCount={selected.size}
        departments={departments}
        onClear={clearSelection}
        onChangeStatus={handleBulkStatus}
        onReassignDepartment={handleBulkDepartment}
        onReject={handleBulkReject}
      />

      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[13px] text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="pl-5 pr-2 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={toggleAll}
                    aria-label="Select all reports on this page"
                  />
                </th>
                <th className="px-3 py-2.5 font-medium w-32">Reference</th>
                <th className="px-3 py-2.5 font-medium">Title &amp; location</th>
                <th className="px-3 py-2.5 font-medium w-40">Department</th>
                <th className="px-3 py-2.5 font-medium w-32">Priority</th>
                <th className="px-3 py-2.5 font-medium w-32">Status</th>
                <th className="px-3 py-2.5 font-medium w-40">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} columns={7} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    {hasFiltersApplied ? (
                      <EmptyState
                        icon={SearchX}
                        title="No reports match these filters"
                        description="Try widening your search or clearing some filters."
                        action={{ label: 'Clear filters', onClick: () => setFilters(EMPTY_FILTERS) }}
                      />
                    ) : (
                      <EmptyState
                        icon={Inbox}
                        title="No reports yet"
                        description="Citizen-submitted reports will appear here as they come in."
                      />
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-page-alt)] transition-colors">
                    <td className="pl-5 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleRow(r.id)}
                        aria-label={`Select report ${r.reference_code}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/reports/${r.id}`}
                        className="text-[14px] font-medium text-[var(--color-accent)] hover:underline underline-offset-2"
                      >
                        {r.reference_code}
                      </Link>
                    </td>
                    <td className="px-3 py-3 max-w-0">
                      <p className={`text-[14px] truncate ${!r.is_read ? 'font-bold text-[var(--color-ink)]' : 'text-[var(--color-ink)]'}`}>
                        {!r.is_read && <span className="inline-block size-1.5 rounded-full bg-[var(--color-accent)] mr-1.5 align-middle" />}
                        {r.title}
                      </p>
                      <p className="text-[13px] text-[var(--color-muted)] truncate">{r.location_name}</p>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-[var(--color-body)]">
                      {r.departments?.name ?? <span className="text-[var(--color-subtle)] italic">Unassigned</span>}
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
                    <td className="px-3 py-3 text-[14px] text-[var(--color-muted)] whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && rows.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <p className="text-[14px] text-[var(--color-muted)]">
              Showing {filters.page * PAGE_SIZE + 1}–{Math.min((filters.page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={filters.page === 0}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= totalPages - 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}