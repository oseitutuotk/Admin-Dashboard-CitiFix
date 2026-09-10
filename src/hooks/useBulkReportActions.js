// src/hooks/useBulkReportActions.js — new file (with the Reject-not-delete note applied)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useBulkReportActions() {
  const queryClient = useQueryClient()
  const invalidateReports = () => queryClient.invalidateQueries({ queryKey: ['reports'] })

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ ids, status }) => {
      const { error } = await supabase.from('reports').update({ status }).in('id', ids)
      if (error) throw error
    },
    onSuccess: invalidateReports,
  })

  const bulkReassignDepartment = useMutation({
    mutationFn: async ({ ids, departmentId }) => {
      const { error } = await supabase
        .from('reports')
        .update({ department_id: departmentId, department_overridden: true })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: invalidateReports,
  })

  // NOTE: "delete" is intentionally implemented as setting status to
  // 'Rejected' rather than a real row delete. A true delete would (a)
  // likely fail on the foreign keys from comments/report_photos/
  // admin_updates/notifications unless those are ON DELETE CASCADE, and
  // (b) destroys a citizen's report history irreversibly. Rejected
  // already exists as the "doesn't belong here" terminal state and is
  // reversible. Revisit if a real hard-delete is actually required.
  const bulkDelete = useMutation({
    mutationFn: async (ids) => {
      const { error } = await supabase.from('reports').update({ status: 'Rejected' }).in('id', ids)
      if (error) throw error
    },
    onSuccess: invalidateReports,
  })

  return { bulkUpdateStatus, bulkReassignDepartment, bulkDelete }
}