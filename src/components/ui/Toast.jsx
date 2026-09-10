import { createContext, useCallback, useContext, useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (toast) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, ...toast }])
      const duration = toast.duration ?? 6000
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const isCritical = toast.variant === 'critical'
  const Icon = isCritical ? AlertTriangle : CheckCircle2

  const content = (
    <div className="flex gap-2.5">
      <Icon
        className="size-[18px] mt-0.5 shrink-0"
        style={{ color: isCritical ? 'var(--color-critical)' : 'var(--color-status-resolved)' }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[var(--color-ink)]">{toast.title}</p>
        {toast.description && (
          <p className="text-[12px] text-[var(--color-muted)] mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.preventDefault()
          onDismiss()
        }}
        className="shrink-0 text-[var(--color-subtle)] hover:text-[var(--color-body)]"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  )

  const wrapperClass =
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3'

  return toast.href ? (
    <Link to={toast.href} className={`${wrapperClass} block hover:bg-[var(--color-page-alt)]`} style={{ boxShadow: 'var(--shadow-overlay)' }}>
      {content}
    </Link>
  ) : (
    <div className={wrapperClass} style={{ boxShadow: 'var(--shadow-overlay)' }} role="status">
      {content}
    </div>
  )
}
