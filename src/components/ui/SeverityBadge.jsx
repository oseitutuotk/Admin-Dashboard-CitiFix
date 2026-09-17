const SEVERITY_CONFIG = {
  Low: { color: '#2f7a4f', bg: '#e9f5ee' },
  Medium: { color: '#8a4c00', bg: '#fbe9d3' },
  High: { color: '#b3261e', bg: '#fbeceb' },
  Critical: { color: '#ffffff', bg: '#b3261e' },
}

export default function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity]
  if (!config) return null
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[13px] font-semibold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {severity}
    </span>
  )
}