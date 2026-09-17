import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Building2, X } from 'lucide-react'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import StatusBadge from '../ui/StatusBadge'

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

export default function GlobalSearch() {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const debouncedTerm = useDebouncedValue(term, 250)
  const { data, isLoading } = useGlobalSearch(debouncedTerm)

  const reports = data?.reports ?? []
  const departments = data?.departments ?? []
  const hasQuery = term.trim().length > 1
  const hasResults = reports.length > 0 || departments.length > 0

  const flatResults = useMemo(
    () => [
      ...reports.map((r) => ({ type: 'report', item: r })),
      ...departments.map((d) => ({ type: 'department', item: d })),
    ],
    [reports, departments]
  )

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setActiveIndex(-1)
  }, [debouncedTerm])

  function goTo(result) {
    if (!result) return
    if (result.type === 'report') navigate(`/reports/${result.item.id}`)
    else navigate(`/reports?departmentId=${result.item.id}`)
    setOpen(false)
    setTerm('')
  }

  function handleKeyDown(e) {
    if (!open || flatResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      goTo(flatResults[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" aria-hidden="true" />
      <input
        type="search"
        value={term}
        onChange={(e) => { setTerm(e.target.value); setOpen(true) }}
        onFocus={() => term && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search reports, departments…"
        className="w-64 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-page)] pl-9 pr-8 py-1.5 text-[13px] placeholder:text-[var(--color-subtle)] focus:bg-white"
        aria-label="Search reports and departments"
      />
      {term && (
        <button
          onClick={() => { setTerm(''); setOpen(false) }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-body)]"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}

      {open && hasQuery && (
        <div
          className="absolute left-0 right-0 mt-1.5 w-96 max-w-[80vw] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white overflow-hidden z-30"
          style={{ boxShadow: 'var(--shadow-overlay)' }}
        >
          {isLoading ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">Searching…</div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">
              No matches for "{term.trim()}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {reports.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">Reports</p>
                  <ul>
                    {reports.map((r, i) => (
                      <li key={r.id}>
                        <button
                          onClick={() => goTo({ type: 'report', item: r })}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-left ${activeIndex === i ? 'bg-[var(--color-page-alt)]' : 'hover:bg-[var(--color-page-alt)]'}`}
                        >
                          <FileText className="size-4 text-[var(--color-muted)] shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] text-[var(--color-ink)] truncate">{r.title}</span>
                            <span className="block text-[12px] text-[var(--color-muted)]">{r.reference_code}</span>
                          </span>
                          <StatusBadge status={r.status} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {departments.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">Departments</p>
                  <ul>
                    {departments.map((d, i) => {
                      const flatIndex = reports.length + i
                      return (
                        <li key={d.id}>
                          <button
                            onClick={() => goTo({ type: 'department', item: d })}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-left ${activeIndex === flatIndex ? 'bg-[var(--color-page-alt)]' : 'hover:bg-[var(--color-page-alt)]'}`}
                          >
                            <Building2 className="size-4 text-[var(--color-muted)] shrink-0" />
                            <span className="text-[13px] text-[var(--color-ink)]">{d.name}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}