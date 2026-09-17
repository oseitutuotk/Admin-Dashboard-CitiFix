import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { TERMINAL_STATUSES } from '../components/ui/StatusBadge'

export function useDepartmentsWithCounts() {
  return useQuery({
    queryKey: ['departments', 'with-counts'],
    queryFn: async () => {
      const [deptRes, reportsRes] = await Promise.all([
        supabase.from('departments').select('id, name, created_at').order('name'),
        supabase.from('reports').select('department_id, status'),
      ])
      if (deptRes.error) throw deptRes.error
      if (reportsRes.error) throw reportsRes.error

      const counts = {}
      for (const r of reportsRes.data ?? []) {
        if (!r.department_id) continue
        counts[r.department_id] ??= { total: 0, active: 0 }
        counts[r.department_id].total += 1
        if (!TERMINAL_STATUSES.includes(r.status)) counts[r.department_id].active += 1
      }

      return deptRes.data.map((d) => ({
        ...d,
        totalCount: counts[d.id]?.total ?? 0,
        activeCount: counts[d.id]?.active ?? 0,
      }))
    },
  })
}