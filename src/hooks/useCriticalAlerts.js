import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['reports', 'critical-unacknowledged'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, reference_code, title, location_name, ai_summary, created_at')
        .eq('priority', 5)
        .is('priority5_acknowledged_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error

      const alerts = data ?? []
      const ids = alerts.map((a) => a.id)
      let photoByReport = {}

      if (ids.length > 0) {
        const { data: photos } = await supabase
          .from('report_photos')
          .select('report_id, storage_url')
          .in('report_id', ids)
        for (const p of photos ?? []) {
          if (!photoByReport[p.report_id]) photoByReport[p.report_id] = p.storage_url
        }
      }

      return alerts.map((a) => ({ ...a, photoUrl: photoByReport[a.id] ?? null }))
    },
    staleTime: 30_000,
  })
}