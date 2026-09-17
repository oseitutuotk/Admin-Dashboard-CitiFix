import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Search } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../ui/Button'

export default function MergeModal({ currentReport, onClose, onConfirm, isMerging }) {
  const [term, setTerm] = useState('')
  const [target, setTarget] = useState(null)

  const { data: results = [] } = useQuery({
    queryKey: ['reports', 'merge-search', term],
    enabled: term.trim().length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, reference_code, title, status')
        .neq('id', currentReport.id)
        .is('merged_into_id', null)
        .or(`title.ilike.%${term}%,reference_code.ilike.%${term}%`)
        .limit(8)
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[var(--radius-md)] bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-overlay)' }}>
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">Merge into another report</h2>
          <button onClick={onClose} aria-label="Close"><X className="size-4 text-[var(--color-muted)]" /></button>
        </div>

        <div className="p-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" />
            <input
              autoFocus
              value={term}
              onChange={(e) => { setTerm(e.target.value); setTarget(null) }}
              placeholder="Search by reference or title…"
              className="w-full rounded-full border border-[var(--color-border-strong)] pl-9 pr-3 py-2 text-[13px]"
            />
          </div>

          {results.length > 0 && (
            <ul className="max-h-56 overflow-y-auto divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-sm)]">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setTarget(r)}
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--color-page-alt)] ${target?.id === r.id ? 'bg-[var(--color-accent-subtle)]' : ''}`}
                  >
                    <span className="font-medium text-[var(--color-ink)]">{r.reference_code}</span>{' '}
                    <span className="text-[var(--color-muted)]">— {r.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[12px] text-[var(--color-muted)] mt-3">
            This report ({currentReport.reference_code}) becomes read-only and stays visible with a
            "merged into" banner — nothing is deleted.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!target} loading={isMerging} onClick={() => target && onConfirm(target)}>
              Merge
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}