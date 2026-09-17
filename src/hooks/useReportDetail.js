import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useReportDetail(id) {
  return useQuery({
    queryKey: ['reports', 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const [reportRes, photosRes, updatesRes, commentsRes] = await Promise.all([
        supabase.from('reports').select('*, departments(id, name)').eq('id', id).single(),
        supabase.from('report_photos').select('id, storage_url').eq('report_id', id),
        supabase.from('admin_updates').select('*').eq('report_id', id).order('created_at', { ascending: false }),
        supabase.from('comments').select('*').eq('report_id', id).order('created_at', { ascending: true }),
      ])
      if (reportRes.error) throw reportRes.error

      const report = reportRes.data
      const comments = commentsRes.data ?? []

      let submitter = null
      if (report.user_id) {
        const { data } = await supabase.from('profiles').select('full_name, email').eq('id', report.user_id).maybeSingle()
        submitter = data
      }

      let mergedInto = null
      if (report.merged_into_id) {
        const { data } = await supabase.from('reports').select('id, reference_code').eq('id', report.merged_into_id).maybeSingle()
        mergedInto = data
      }

      const commenterIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))]
      let commenterProfiles = {}
      if (commenterIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name, email').in('id', commenterIds)
        commenterProfiles = Object.fromEntries((data ?? []).map((p) => [p.id, p]))
      }

      const enrichedComments = comments.map((c) => ({
        ...c,
        authorName: commenterProfiles[c.user_id]?.full_name || commenterProfiles[c.user_id]?.email || 'Unknown citizen',
        isFromCreator: report.user_id != null && c.user_id === report.user_id,
      }))

      return {
        report,
        photos: photosRes.data ?? [],
        updates: updatesRes.data ?? [],
        creatorComments: enrichedComments.filter((c) => c.isFromCreator),
        otherComments: enrichedComments.filter((c) => !c.isFromCreator),
        submitter,
        mergedInto,
      }
    },
  })
}