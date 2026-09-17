import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

const RESULT_LIMIT = 5

export function useGlobalSearch(term) {
  const trimmed = term.trim()

  return useQuery({
    queryKey: ['global-search', trimmed],
    enabled: trimmed.length > 1,
    queryFn: async () => {
      const [reportsRes, deptsRes] = await Promise.all([
        supabase
          .from('reports')
          .select('id, reference_code, title, status')
          .or('is_in_service_area.is.null,is_in_service_area.eq.true')
          .or(`title.ilike.%${trimmed}%,reference_code.ilike.%${trimmed}%`)
          .order('created_at', { ascending: false })
          .limit(RESULT_LIMIT),

        supabase.from('departments').select('id, name').ilike('name', `%${trimmed}%`).limit(RESULT_LIMIT),
      ])
      if (reportsRes.error) throw reportsRes.error
      if (deptsRes.error) throw deptsRes.error

      return { reports: reportsRes.data ?? [], departments: deptsRes.data ?? [] }
    },
  })
}