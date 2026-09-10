export function formatRelativeTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDuration(hours) {
  if (hours == null || Number.isNaN(hours)) return '—'
  if (hours < 24) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
}
