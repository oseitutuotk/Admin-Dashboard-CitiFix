import { useState } from 'react'
import { X, Ban } from 'lucide-react'
import Button from '../ui/Button'
import { ADMIN_SETTABLE_STATUSES } from '../ui/StatusBadge'

export default function BulkActionBar({
  selectedCount,
  departments,
  onClear,
  onChangeStatus,
  onReassignDepartment,
  onReject,
}) {
  const [statusValue, setStatusValue] = useState('')
  const [deptValue, setDeptValue] = useState('')

  if (selectedCount === 0) return null

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-ink)] px-4 py-3 text-white">
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 text-[14px] font-medium hover:opacity-80"
        aria-label="Clear selection"
      >
        <X className="size-4" />
        {selectedCount} selected
      </button>

      <div className="h-4 w-px bg-white/20" />

      <select
        value={statusValue}
        onChange={(e) => {
          setStatusValue(e.target.value)
          if (e.target.value) {
            onChangeStatus(e.target.value)
            setStatusValue('')
          }
        }}
        className="rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[14px] text-white"
      >
        <option value="" className="text-black">Change status…</option>
        {ADMIN_SETTABLE_STATUSES.map((s) => (
          <option key={s} value={s} className="text-black">{s}</option>
        ))}
      </select>

      <select
        value={deptValue}
        onChange={(e) => {
          setDeptValue(e.target.value)
          if (e.target.value) {
            onReassignDepartment(e.target.value)
            setDeptValue('')
          }
        }}
        className="rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[13px] text-white"
      >
        <option value="" className="text-black">Reassign department…</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id} className="text-black">{d.name}</option>
        ))}
      </select>

      <Button variant="dangerSolid" size="sm" icon={Ban} onClick={onReject} className="ml-auto">
        Reject selected
      </Button>
    </div>
  )
}