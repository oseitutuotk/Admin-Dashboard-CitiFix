import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertTriangle, Sparkles, GitMerge, ArrowLeft, Send, MapPin, Clock,
  Copy, Check, Tag, User, Save, RotateCcw, MoreVertical, MailX, ImageOff,
} from 'lucide-react'
import { useReportDetail } from '../hooks/useReportDetail'
import { useDepartments } from '../hooks/useDepartments'
import {
  useUpdateStatus, useOverridePriority,
  useOverrideDepartment, usePostAdminUpdate, useMergeReport, useSetReadStatus, useAcknowledgeSingle,
} from '../hooks/useReportMutations'
import { useToast } from '../components/ui/Toast'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import SeverityBadge from '../components/ui/SeverityBadge'
import AcknowledgmentFlag from '../components/ui/AcknowledgmentFlag'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDateTime } from '../lib/format'
import MergeModal from '../components/reportDetail/MergeModal'
import StatusSelect from '../components/reportDetail/StatusSelect'
import PhotoLightbox from '../components/reportDetail/PhotoLightbox'
import MapPreview from '../components/reportDetail/MapPreview'

function CopyRefButton({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-strong)] px-2.5 py-1 text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-page-alt)] transition-colors"
      title="Copy reference code"
    >
      {value}
      {copied ? <Check className="size-3.5" style={{ color: 'var(--color-status-resolved)' }} /> : <Copy className="size-3.5" />}
    </button>
  )
}

function ActionsMenu({ onMarkUnread, onMerge }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-body)] hover:bg-[var(--color-page-alt)]"
        aria-label="More actions"
        aria-expanded={open}
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-1 w-52 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white overflow-hidden z-20"
          style={{ boxShadow: 'var(--shadow-overlay)' }}
        >
          <li>
            <button
              onClick={() => { onMarkUnread(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-left hover:bg-[var(--color-page-alt)]"
            >
              <MailX className="size-4 text-[var(--color-muted)]" /> Mark as unread
            </button>
          </li>
          <li>
            <button
              onClick={() => { onMerge(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-left hover:bg-[var(--color-page-alt)]"
            >
              <GitMerge className="size-4 text-[var(--color-muted)]" /> Merge duplicates
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

export default function ReportDetail() {
  const { id } = useParams()
  const { data, isLoading, error } = useReportDetail(id)
  const { data: departments = [] } = useDepartments()
  const { showToast } = useToast()

  const updateStatus = useUpdateStatus()
  const overridePriority = useOverridePriority()
  const overrideDepartment = useOverrideDepartment()
  const postUpdate = usePostAdminUpdate()
  const mergeReport = useMergeReport()
  const setReadStatus = useSetReadStatus()
  const acknowledgeP5 = useAcknowledgeSingle()

  const [noteBody, setNoteBody] = useState('')
  const [mergeOpen, setMergeOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const autoAckFired = useRef(false)
  const readMarked = useRef(false)
  const p5AckFired = useRef(false)

  const report = data?.report

  useEffect(() => {
    if (report) {
      setDraft({ status: report.status, priority: report.priority, departmentId: report.department_id ?? '' })
    }
  }, [report?.status, report?.priority, report?.department_id])

  useEffect(() => {
    if (report?.status === 'Pending' && !autoAckFired.current) {
      autoAckFired.current = true
      updateStatus.mutate({ report, newStatus: 'Acknowledged' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.status])

  // Same principle, separate flag: opening a priority-5 report is what
  // clears its own acknowledgment state, independent of `status`. This
  // is the only place that ever clears it — the forced popup's "View
  // report" button relies entirely on this firing once the page loads.
  useEffect(() => {
    if (report?.priority === 5 && !report?.priority5_acknowledged_at && !p5AckFired.current) {
      p5AckFired.current = true
      acknowledgeP5.mutate(report)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, report?.priority, report?.priority5_acknowledged_at])

  useEffect(() => {
    if (report && !report.is_read && !readMarked.current) {
      readMarked.current = true
      setReadStatus.mutate({ reportId: report.id, isRead: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, report?.is_read])

  if (isLoading || !draft) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (error) {
    return <Card><p className="text-[15px]" style={{ color: 'var(--color-critical)' }}>Couldn't load report: {error.message}</p></Card>
  }

  const { photos, updates, creatorComments, otherComments, submitter, mergedInto } = data
  const isReadOnly = !!report.merged_into_id
  const isDirty =
    draft.status !== report.status ||
    draft.priority !== report.priority ||
    draft.departmentId !== (report.department_id ?? '')

  async function handleSave() {
    setSaving(true)
    try {
      if (draft.status !== report.status) await updateStatus.mutateAsync({ report, newStatus: draft.status })
      if (draft.priority !== report.priority) await overridePriority.mutateAsync({ reportId: report.id, priority: draft.priority })
      if (draft.departmentId !== (report.department_id ?? '')) {
        await overrideDepartment.mutateAsync({ reportId: report.id, departmentId: draft.departmentId || null })
      }
      showToast({ variant: 'success', title: 'Changes saved' })
    } catch (e) {
      showToast({ variant: 'critical', title: 'Save failed', description: e.message })
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    setDraft({ status: report.status, priority: report.priority, departmentId: report.department_id ?? '' })
  }

  async function handlePostUpdate() {
    if (!noteBody.trim()) return
    try {
      await postUpdate.mutateAsync({ report, body: noteBody.trim() })
      setNoteBody('')
      showToast({ variant: 'success', title: 'Update posted' })
    } catch (e) {
      showToast({ variant: 'critical', title: 'Failed to post update', description: e.message })
    }
  }

  async function handleMerge(target) {
    try {
      await mergeReport.mutateAsync({ secondaryId: report.id, primaryId: target.id, primaryReference: target.reference_code })
      setMergeOpen(false)
      showToast({ variant: 'success', title: `Merged into ${target.reference_code}` })
    } catch (e) {
      showToast({ variant: 'critical', title: 'Merge failed', description: e.message })
    }
  }

  const hasCoords = report.coords_lat != null && report.coords_lng != null

  return (
    <div className="space-y-4">
      <Link to="/reports" className="inline-flex items-center gap-1.5 text-[14px] text-[var(--color-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft className="size-4" /> Back to reports
      </Link>

      {isReadOnly && (
        <div className="rounded-[var(--radius-md)] border px-4 py-3 text-[14px]" style={{ backgroundColor: 'var(--color-page-alt)', borderColor: 'var(--color-border-strong)' }}>
          This report was merged into{' '}
          <Link to={`/reports/${mergedInto?.id}`} className="font-medium text-[var(--color-accent)] hover:underline">
            {mergedInto?.reference_code ?? 'another report'}
          </Link>{' '}
          and is now read-only.
        </div>
      )}

      {report.ai_moderation_flag && (
        <div className="rounded-[var(--radius-md)] border px-4 py-3 text-[14px] flex items-center gap-2" style={{ backgroundColor: 'var(--color-critical-bg)', borderColor: 'var(--color-critical)', color: 'var(--color-critical)' }}>
          <AlertTriangle className="size-4 shrink-0" />
          AI flagged this report's content for moderation review.
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[23px] font-semibold text-[var(--color-ink)]">{report.title}</h1>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
            <AcknowledgmentFlag priority={report.priority} acknowledgedAt={report.priority5_acknowledged_at} />
          </div>
          <div className="flex items-center gap-3 text-[14px] text-[var(--color-muted)] mt-1.5 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="size-3.5" />{report.location_name}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" />{formatDateTime(report.created_at)}</span>
          </div>
        </div>

        {!isReadOnly && (
          <ActionsMenu
            onMarkUnread={() => {
              setReadStatus.mutate({ reportId: report.id, isRead: false })
              showToast({ title: 'Marked as unread' })
            }}
            onMerge={() => setMergeOpen(true)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-[var(--color-muted)]">Report content</h2>
              <CopyRefButton value={report.reference_code} />
            </div>
            <p className="text-[15px] text-[var(--color-body)] leading-relaxed">{report.description}</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[12px] font-medium text-[var(--color-muted)] mb-1.5">Visual evidence</p>
                {photos.length > 0 ? (
                  photos.length === 1 ? (
                    <button onClick={() => setLightboxIndex(0)} className="block w-full">
                      <img
                        src={photos[0].storage_url}
                        alt=""
                        className="w-full h-56 object-cover rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:opacity-90 transition-opacity"
                      />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 h-56">
                      {photos.slice(0, 4).map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => setLightboxIndex(i)}
                          className="relative h-full w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]"
                        >
                          <img src={p.storage_url} alt="" className="h-full w-full object-cover hover:opacity-90 transition-opacity" />
                          {i === 3 && photos.length > 4 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[14px] font-medium">
                              +{photos.length - 4}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] text-[var(--color-subtle)]">
                    <ImageOff className="size-5" />
                    <p className="text-[13px] italic">No photos attached</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[12px] font-medium text-[var(--color-muted)] mb-1.5">Location</p>
                {hasCoords ? (
                  <MapPreview lat={report.coords_lat} lng={report.coords_lng} />
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] text-[var(--color-subtle)]">
                    <MapPin className="size-5" />
                    <p className="text-[13px] italic">No coordinates recorded</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card padding="p-0">
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">Activity</h2>
            </div>

            <ul className="px-5 py-2">
              {updates.map((u) => (
                <li key={u.id} className="relative pl-9 py-3 border-l-2 border-[var(--color-border)] ml-2">
                  <span className="absolute -left-[15px] top-3 flex size-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[11px] font-semibold ring-4 ring-white">A</span>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-accent)' }}>Admin · {u.status_label}</p>
                  <p className="text-[14px] text-[var(--color-body)] mt-0.5">{u.body}</p>
                  <p className="text-[12px] text-[var(--color-subtle)] mt-1">{formatDateTime(u.created_at)}</p>
                </li>
              ))}
              {creatorComments.map((c) => (
                <li key={c.id} className="relative pl-9 py-3 border-l-2 border-[var(--color-border)] ml-2">
                  <span className="absolute -left-[15px] top-3 flex size-6 items-center justify-center rounded-full bg-[var(--color-muted)] text-white text-[11px] font-semibold ring-4 ring-white">
                    {c.authorName.charAt(0).toUpperCase()}
                  </span>
                  <p className="text-[13px] font-medium text-[var(--color-muted)]">{c.authorName} (reporter)</p>
                  <p className="text-[14px] text-[var(--color-body)] mt-0.5">{c.body}</p>
                  <p className="text-[12px] text-[var(--color-subtle)] mt-1">{formatDateTime(c.created_at)}</p>
                </li>
              ))}
              {updates.length === 0 && creatorComments.length === 0 && (
                <li className="py-6 text-center text-[14px] text-[var(--color-muted)]">No activity yet.</li>
              )}
            </ul>

            {!isReadOnly && (
              <div className="px-5 py-4 border-t border-[var(--color-border)]">
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Post an update visible to the citizen…"
                  rows={2}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-[14px]"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" icon={Send} loading={postUpdate.isPending} onClick={handlePostUpdate}>
                    Post update
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {otherComments.length > 0 && (
            <Card padding="p-0">
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">Other comments</h2>
                <p className="text-[13px] text-[var(--color-muted)] mt-0.5">From other citizens on this public report.</p>
              </div>
              <ul className="px-5 py-2">
                {otherComments.map((c) => (
                  <li key={c.id} className="relative pl-9 py-3 border-l-2 border-[var(--color-border)] ml-2">
                    <span className="absolute -left-[15px] top-3 flex size-6 items-center justify-center rounded-full bg-[var(--color-page-alt)] text-[var(--color-body)] text-[11px] font-semibold ring-4 ring-white">
                      {c.authorName.charAt(0).toUpperCase()}
                    </span>
                    <p className="text-[13px] font-medium text-[var(--color-muted)]">{c.authorName}</p>
                    <p className="text-[14px] text-[var(--color-body)] mt-0.5">{c.body}</p>
                    <p className="text-[12px] text-[var(--color-subtle)] mt-1">{formatDateTime(c.created_at)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card style={{ backgroundColor: 'var(--color-accent-subtle)', borderColor: '#c3d9fb' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="size-4" style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">AI insight</h2>
            </div>
            <p className="text-[14px] text-[var(--color-body)] leading-relaxed">{report.ai_summary || 'No AI summary yet.'}</p>
            <dl className="mt-3 space-y-2 text-[13px]">
              <Row label="Category" value={report.ai_category} />
              <div className="flex justify-between items-center">
                <dt className="text-[var(--color-muted)]">Severity</dt>
                <dd><SeverityBadge severity={report.ai_severity} /></dd>
              </div>
              <Row label="Suggested dept." value={report.ai_department} />
            </dl>
            {report.ai_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {report.ai_tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[12px] text-[var(--color-body)]">
                    <Tag className="size-3" />{t}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card className={isDirty ? 'ring-2 ring-[var(--color-accent)]' : ''}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">Classification &amp; routing</h2>
              {isDirty && <span className="text-[12px] font-medium" style={{ color: 'var(--color-accent)' }}>Unsaved</span>}
            </div>

            <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-1">Status</label>
            <div className="mb-3">
              <StatusSelect
                value={draft.status}
                disabled={isReadOnly}
                onChange={(s) => setDraft((d) => ({ ...d, status: s }))}
              />
            </div>

            <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-1">
              Priority {report.priority_overridden && <span className="text-[var(--color-subtle)]">(overridden)</span>}
            </label>
            <select
              disabled={isReadOnly}
              value={draft.priority ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-[14px] mb-3"
            >
              {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>P{p}</option>)}
            </select>

            <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-1">
              Department {report.department_overridden && <span className="text-[var(--color-subtle)]">(overridden)</span>}
            </label>
            <select
              disabled={isReadOnly}
              value={draft.departmentId}
              onChange={(e) => setDraft((d) => ({ ...d, departmentId: e.target.value }))}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-[14px]"
            >
              <option value="">Unassigned</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {isDirty && (
              <div className="flex gap-2 mt-4">
                <Button size="sm" icon={Save} loading={saving} onClick={handleSave} className="flex-1">Save changes</Button>
                <Button size="sm" variant="secondary" icon={RotateCcw} onClick={handleDiscard}>Discard</Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <User className="size-4 text-[var(--color-muted)]" />
              <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">Submitted by</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--color-page-alt)] text-[13px] font-semibold text-[var(--color-body)]">
                {(submitter?.full_name || submitter?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[var(--color-ink)]">{submitter?.full_name || submitter?.email || 'Anonymous submission'}</p>
                <p className="text-[13px] text-[var(--color-muted)]">
                  {submitter?.full_name && submitter?.email
                    ? submitter.email
                    : report.device_id
                    ? `Device ID: ${report.device_id}`
                    : submitter
                    ? 'No additional contact info'
                    : 'No contact on file'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {mergeOpen && (
        <MergeModal currentReport={report} onClose={() => setMergeOpen(false)} onConfirm={handleMerge} isMerging={mergeReport.isPending} />
      )}

      <PhotoLightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="text-[var(--color-body)] font-medium">{value}</dd>
    </div>
  )
}