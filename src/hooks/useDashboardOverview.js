import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { TERMINAL_STATUSES } from '../components/ui/StatusBadge'

const RECENT_LIMIT = 8
const IN_AREA = 'is_in_service_area.is.null,is_in_service_area.eq.true'

async function fetchDashboardOverview() {
  const [totalRes, activeRes, resolvedRes, recentRes, resolvedTimingRes] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }).or(IN_AREA),

    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .or(IN_AREA)
      .not('status', 'in', `(${TERMINAL_STATUSES.map((s) => `"${s}"`).join(',')})`),

    supabase.from('reports').select('id', { count: 'exact', head: true }).or(IN_AREA).eq('status', 'Resolved'),

    supabase
      .from('reports')
      .select(
        'id, reference_code, title, location_name, status, priority, priority5_acknowledged_at, is_read, created_at, departments(name)'
      )
      .or(IN_AREA)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),

    supabase.from('reports').select('created_at, updated_at').or(IN_AREA).eq('status', 'Resolved'),
  ])

  const firstError =
    totalRes.error || activeRes.error || resolvedRes.error || recentRes.error || resolvedTimingRes.error
  if (firstError) throw firstError

  let avgResolutionHours = null
  const timedRows = resolvedTimingRes.data ?? []
  if (timedRows.length > 0) {
    const totalHours = timedRows.reduce(
      (sum, r) => sum + Math.max((new Date(r.updated_at) - new Date(r.created_at)) / 36e5, 0),
      0
    )
    avgResolutionHours = totalHours / timedRows.length
  }

  return {
    totalCount: totalRes.count ?? 0,
    activeCount: activeRes.count ?? 0,
    resolvedCount: resolvedRes.count ?? 0,
    avgResolutionHours,
    recentReports: recentRes.data ?? [],
  }
}

export function useDashboardOverview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', 'dashboard-overview'],
    queryFn: fetchDashboardOverview,
  })

  return {
    loading: isLoading,
    error,
    totalCount: data?.totalCount ?? 0,
    activeCount: data?.activeCount ?? 0,
    resolvedCount: data?.resolvedCount ?? 0,
    avgResolutionHours: data?.avgResolutionHours ?? null,
    recentReports: data?.recentReports ?? [],
    refetch,
  }
}