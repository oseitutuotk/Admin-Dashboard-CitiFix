import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, GitMerge, Check, X, Building2, ListFilter } from 'lucide-react'
import { useDepartmentsWithCounts } from '../hooks/useDepartmentsWithCounts'
import { useAddDepartment, useRenameDepartment, useDeleteDepartment, useMergeDepartments } from '../hooks/useDepartmentMutations'
import { useToast } from '../components/ui/Toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonRow } from '../components/ui/Skeleton'
import { formatDateTime } from '../lib/format'

export default function Departments() {
  const { data: departments = [], isLoading } = useDepartmentsWithCounts()
  const { showToast } = useToast()

  const addDept = useAddDepartment()
  const renameDept = useRenameDepartment()
  const deleteDept = useDeleteDepartment()
  const mergeDept = useMergeDepartments()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [mergeSource, setMergeSource] = useState(null)

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      await addDept.mutateAsync(newName)
      showToast({ variant: 'success', title: `"${newName.trim()}" added` })
      setNewName('')
      setAdding(false)
    } catch (e) {
      showToast({ variant: 'critical', title: 'Failed to add department', description: e.message })
    }
  }

  async function handleRename(id) {
    if (!editValue.trim()) return
    try {
      await renameDept.mutateAsync({ id, name: editValue })
      showToast({ variant: 'success', title: 'Department renamed' })
      setEditingId(null)
    } catch (e) {
      showToast({ variant: 'critical', title: 'Rename failed', description: e.message })
    }
  }

  async function handleDelete(dept) {
    if (dept.totalCount > 0) {
      showToast({
        variant: 'critical',
        title: 'Cannot delete',
        description: `${dept.totalCount} report(s) are assigned here. Merge or reassign them first.`,
      })
      return
    }
    if (!window.confirm(`Delete "${dept.name}"? This cannot be undone.`)) return
    try {
      await deleteDept.mutateAsync(dept.id)
      showToast({ variant: 'success', title: 'Department deleted' })
    } catch (e) {
      showToast({ variant: 'critical', title: 'Delete failed', description: e.message })
    }
  }

  async function handleMerge(targetId) {
    const target = departments.find((d) => d.id === targetId)
    try {
      await mergeDept.mutateAsync({ sourceId: mergeSource.id, targetId })
      showToast({ variant: 'success', title: `Merged "${mergeSource.name}" into "${target.name}"` })
      setMergeSource(null)
    } catch (e) {
      showToast({ variant: 'critical', title: 'Merge failed', description: e.message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[23px] font-semibold text-[var(--color-ink)]">Departments</h1>
          <p className="text-[14px] text-[var(--color-muted)] mt-1">
            Manage which departments reports can be routed to.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setAdding(true)}>Add department</Button>
      </div>

      {adding && (
        <Card className="flex items-center gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Department name…"
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-[14px]"
          />
          <Button size="sm" loading={addDept.isPending} onClick={handleAdd}>Add</Button>
          <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName('') }}>Cancel</Button>
        </Card>
      )}

      {mergeSource && (
        <Card className="flex items-center gap-3 flex-wrap" style={{ backgroundColor: 'var(--color-accent-subtle)', borderColor: '#c3d9fb' }}>
          <GitMerge className="size-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
          <p className="text-[14px] text-[var(--color-body)]">
            Merge <strong>{mergeSource.name}</strong> ({mergeSource.totalCount} reports) into:
          </p>
          <select
            onChange={(e) => e.target.value && handleMerge(e.target.value)}
            defaultValue=""
            className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-1.5 text-[13px]"
          >
            <option value="" disabled>Choose target department…</option>
            {departments.filter((d) => d.id !== mergeSource.id).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <Button size="sm" variant="secondary" onClick={() => setMergeSource(null)} className="ml-auto">Cancel</Button>
        </Card>
      )}

      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[14px] text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium w-32">Active reports</th>
                <th className="px-5 py-2.5 font-medium w-32">Total reports</th>
                <th className="px-5 py-2.5 font-medium w-40">Created</th>
                <th className="px-5 py-2.5 font-medium w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={5} />)
              ) : departments.length === 0 ? (
                <tr><td colSpan={5}>
                  <EmptyState icon={Building2} title="No departments yet" description="Add one to start routing reports." />
                </td></tr>
              ) : (
                departments.map((d) => (
                  <tr key={d.id} className="hover:bg-[var(--color-page-alt)] transition-colors">
                    <td className="px-5 py-3">
                      {editingId === d.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(d.id)}
                            className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-2 py-1 text-[14px]"
                          />
                          <button onClick={() => handleRename(d.id)} aria-label="Save">
                            <Check className="size-4" style={{ color: 'var(--color-status-resolved)' }} />
                          </button>
                          <button onClick={() => setEditingId(null)} aria-label="Cancel">
                            <X className="size-4 text-[var(--color-muted)]" />
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/reports?departmentId=${d.id}`}
                          className="text-[14px] font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:underline underline-offset-2"
                        >
                          {d.name}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[14px] text-[var(--color-body)]">{d.activeCount}</td>
                    <td className="px-5 py-3 text-[14px] text-[var(--color-body)]">{d.totalCount}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--color-muted)]">{formatDateTime(d.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/reports?departmentId=${d.id}`}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-ink)]"
                          aria-label={`Filter ${d.name} reports`}
                        >
                          <ListFilter className="size-4" />
                        </Link>
                        <button
                          onClick={() => { setEditingId(d.id); setEditValue(d.name) }}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-ink)]"
                          aria-label={`Rename ${d.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setMergeSource(d)}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-ink)]"
                          aria-label={`Merge ${d.name}`}
                        >
                          <GitMerge className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-critical-bg)] hover:text-[var(--color-critical)]"
                          aria-label={`Delete ${d.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}