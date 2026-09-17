import { Search, X } from 'lucide-react'
import { ALL_STATUSES } from '../ui/StatusBadge'

export default function ReportsFilterBar({ filters, onChange, departments }) {
  function update(patch) {
    onChange({ ...filters, ...patch, page: 0 })
  }

  function toggleStatus(status) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    update({ statuses: next })
  }

  const hasActiveFilters =
    filters.search || filters.statuses.length > 0 || filters.priority || filters.unacknowledgedOnly || filters.departmentId || filters.dateFrom || filters.dateTo

  function clearAll() {
    onChange({ search: '', statuses: [], priority: null, unacknowledgedOnly: false, departmentId: null, dateFrom: null, dateTo: null, page: 0 })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by reference or title…"
            className="w-full rounded-full border border-[var(--color-border-strong)] bg-white pl-9 pr-3 py-2 text-[14px] placeholder:text-[var(--color-subtle)]"
          />
        </div>

        <select
          value={filters.priority ?? ''}
          onChange={(e) => update({ priority: e.target.value ? Number(e.target.value) : null })}
          className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[14px]"
        >
          <option value="">All priorities</option>
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>P{p}</option>
          ))}
        </select>

        <select
          value={filters.departmentId ?? ''}
          onChange={(e) => update({ departmentId: e.target.value || null })}
          className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[14px]"
        >
          <option value="">All departments</option>
          <option value="unassigned">Unassigned</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => update({ dateFrom: e.target.value || null })}
            className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[14px] text-[var(--color-body)]"
            aria-label="From date"
          />
          <span className="text-[14px] text-[var(--color-subtle)]">–</span>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => update({ dateTo: e.target.value || null })}
            className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-2 text-[14px] text-[var(--color-body)]"
            aria-label="To date"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <X className="size-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.map((status) => {
          const active = filters.statuses.includes(status)
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-ink)] border-[var(--color-ink)] text-white'
                  : 'bg-white border-[var(--color-border-strong)] text-[var(--color-body)] hover:bg-[var(--color-page-alt)]'
              }`}
            >
              {status}
            </button>
          )
        })}
      </div>
    </div>
  )
}