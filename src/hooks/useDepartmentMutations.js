import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['departments'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useAddDepartment() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (name) => {
      const { error } = await supabase.from('departments').insert({ name: name.trim() })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useRenameDepartment() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ id, name }) => {
      const { error } = await supabase.from('departments').update({ name: name.trim() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useDeleteDepartment() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('departments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useMergeDepartments() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ sourceId, targetId }) => {
      const { error: reassignError } = await supabase
        .from('reports')
        .update({ department_id: targetId })
        .eq('department_id', sourceId)
      if (reassignError) throw reassignError

      const { error: deleteError } = await supabase.from('departments').delete().eq('id', sourceId)
      if (deleteError) throw deleteError
    },
    onSuccess: invalidate,
  })
}