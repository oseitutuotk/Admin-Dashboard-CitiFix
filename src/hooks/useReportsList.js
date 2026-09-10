// src/hooks/useReportsList.js — new file
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { ALL_STATUSES } from '../components/ui/StatusBadge'

const PAGE_SIZE = 15

/**
 * filters: {
 *   search: string,
 *   statuses: string[],       // empty = all
 *   priority: number | null,  // null = all
 *   departmentId: string | null | 'unassigned',
 *   dateFrom: string | null,  // yyyy-mm-dd
 *   dateTo: string | null,
 *   page: number,             // 0-indexed
 * }
 */
export function useReportsList(filters) {
  return useQuery({
    queryKey: ['reports', 'list', filters],
    queryFn: async () => {
      const from = filters.page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('reports')
        .select(
          'id, reference_code, title, location_name, status, priority, priority5_acknowledged_at, created_at, department_id, departments(name)',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filters.search?.trim()) {
        const term = filters.search.trim()
        query = query.or(`title.ilike.%${term}%,reference_code.ilike.%${term}%`)
      }
      if (filters.statuses?.length) {
        query = query.in('status', filters.statuses)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.departmentId === 'unassigned') {
        query = query.is('department_id', null)
      } else if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
      }

      const { data, error, count } = await query
      if (error) throw error

      return { rows: data ?? [], totalCount: count ?? 0, pageSize: PAGE_SIZE }
    },
    keepPreviousData: true,
  })
}

export { PAGE_SIZE }
export const STATUS_OPTIONS = ALL_STATUSES