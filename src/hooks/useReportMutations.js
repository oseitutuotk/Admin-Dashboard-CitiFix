import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

function useInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['reports'] })
}

async function postUpdate(reportId, { statusLabel, body, authorName = 'Admin' }) {
  await supabase.from('admin_updates').update({ is_latest: false }).eq('report_id', reportId).eq('is_latest', true)
  const { error } = await supabase
    .from('admin_updates')
    .insert({ report_id: reportId, status_label: statusLabel, body, author_name: authorName, is_latest: true })
  if (error) throw error
}

export function useUpdateStatus() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ report, newStatus }) => {
      const patch = { status: newStatus }
      const autoAck = newStatus === 'Resolved' && report.priority === 5 && !report.priority5_acknowledged_at
      if (autoAck) patch.priority5_acknowledged_at = new Date().toISOString()

      const { error } = await supabase.from('reports').update(patch).eq('id', report.id)
      if (error) throw error

      await postUpdate(report.id, {
        statusLabel: newStatus,
        body: autoAck
          ? `Status changed to "${newStatus}". Priority 5 acknowledgment was auto-applied on resolution.`
          : `Status changed to "${newStatus}".`,
      })
    },
    onSuccess: invalidate,
  })
}

export function useAcknowledgeSingle() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (report) => {
      const { error } = await supabase
        .from('reports')
        .update({ priority5_acknowledged_at: new Date().toISOString() })
        .eq('id', report.id)
      if (error) throw error
      await postUpdate(report.id, { statusLabel: report.status, body: 'Priority 5 report acknowledged (opened by admin).' })
    },
    onSuccess: invalidate,
  })
}

export function useOverridePriority() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ reportId, priority }) => {
      const { error } = await supabase
        .from('reports')
        .update({ priority, priority_overridden: true })
        .eq('id', reportId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useOverrideDepartment() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ reportId, departmentId }) => {
      const { error } = await supabase
        .from('reports')
        .update({ department_id: departmentId, department_overridden: true })
        .eq('id', reportId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function usePostAdminUpdate() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ report, body }) => postUpdate(report.id, { statusLabel: report.status, body }),
    onSuccess: invalidate,
  })
}

export function useSetReadStatus() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ reportId, isRead }) => {
      const { error } = await supabase.from('reports').update({ is_read: isRead }).eq('id', reportId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useMergeReport() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ secondaryId, primaryId, primaryReference }) => {
      const { error } = await supabase.from('reports').update({ merged_into_id: primaryId }).eq('id', secondaryId)
      if (error) throw error
      await postUpdate(secondaryId, {
        statusLabel: 'Merged',
        body: `Merged into ${primaryReference}. This report is now read-only.`,
      })
    },
    onSuccess: invalidate,
  })
}