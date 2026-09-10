// src/hooks/useDepartments.js — new file
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Departments change rarely (admin CRUD, not citizen activity), so this
 * gets a much longer staleTime than report data — no need to re-fetch
 * on every screen visit. Realtime invalidation can be added later if
 * the Departments CRUD page needs instant cross-tab updates; not worth
 * it yet for a single-admin system.
 */
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('id, name').order('name')
      if (error) throw error
      return data ?? []
    },
    staleTime: 5 * 60_000,
  })
}