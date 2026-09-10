// src/hooks/useCriticalAlerts.js — new file
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Single source of truth for "which priority-5 reports still need
 * acknowledgment." Both the notification bell and the forced modal
 * read from this exact query so they can never show different counts.
 */
export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['reports', 'critical-unacknowledged'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, reference_code, title, location_name, created_at')
        .eq('priority', 5)
        .is('priority5_acknowledged_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: 30_000,
  })
}