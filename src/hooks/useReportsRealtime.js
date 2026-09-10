// src/hooks/useReportsRealtime.js — new file
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../components/ui/Toast'

/**
 * Single Realtime subscription to the reports table, mounted once at
 * the app shell (AdminLayout). On ANY insert/update it invalidates the
 * cached queries so every screen showing report data (dashboard,
 * reports list, notification bell) stays live without polling. On a
 * brand-new priority-5 arrival specifically, it also fires a toast.
 *
 * Requires "reports" to be enabled for Realtime in the Supabase
 * dashboard: Database → Replication → toggle the reports table on.
 * Without that toggle this subscribes successfully but never receives
 * events — a silent failure, not an error.
 */
export function useReportsRealtime() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const toastedIds = useRef(new Set())

  useEffect(() => {
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['reports'] })

          const row = payload.new
          const isNewCritical =
            payload.eventType === 'INSERT' &&
            row?.priority === 5 &&
            !row?.priority5_acknowledged_at

          if (isNewCritical && !toastedIds.current.has(row.id)) {
            toastedIds.current.add(row.id)
            showToast({
              variant: 'critical',
              title: 'New priority 5 report',
              description: `${row.reference_code} · ${row.title}`,
              href: `/reports/${row.id}`,
              duration: 10_000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}