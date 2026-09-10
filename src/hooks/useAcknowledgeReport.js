// src/hooks/useAcknowledgeReport.js — new file
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useAcknowledgeReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportId) => {
      const { error } = await supabase
        .from('reports')
        .update({ priority5_acknowledged_at: new Date().toISOString() })
        .eq('id', reportId)
      if (error) throw error
    },
    onSuccess: () => {
      // Prefix match invalidates every ['reports', ...] query at once —
      // the bell, the modal, and the dashboard all refresh together.
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}