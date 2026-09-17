import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { STATUS_CONFIG, ADMIN_SETTABLE_STATUSES } from '../ui/StatusBadge'

export default function StatusSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const current = STATUS_CONFIG[value]
  const CurrentIcon = current?.icon

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-[14px] disabled:opacity-60"
      >
        <span className="flex items-center gap-1.5" style={{ color: current?.color }}>
          {CurrentIcon && <CurrentIcon className="size-3.5" />}
          {current?.label ?? value}
          {!ADMIN_SETTABLE_STATUSES.includes(value) && (
            <span className="text-[var(--color-subtle)] font-normal">(system-set)</span>
          )}
        </span>
        <ChevronDown className="size-4 text-[var(--color-muted)]" />
      </button>

      {open && !disabled && (
        <ul
          className="absolute left-0 right-0 mt-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white overflow-hidden z-20"
          style={{ boxShadow: 'var(--shadow-overlay)' }}
        >
          {ADMIN_SETTABLE_STATUSES.map((s) => {
            const config = STATUS_CONFIG[s]
            const Icon = config.icon
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => { onChange(s); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-[var(--color-page-alt)] text-left"
                  style={{ color: config.color }}
                >
                  <Icon className="size-3.5" />
                  {config.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}