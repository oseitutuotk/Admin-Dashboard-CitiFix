import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/ui/Button'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'forgot'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-page)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-[20px] font-semibold text-[var(--color-ink)]">CitiFix Admin</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">Okaikwei North Municipal Assembly</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
          {mode === 'signin' ? (
            <SignInForm onForgotPassword={() => setMode('forgot')} onSuccess={() => navigate('/')} />
          ) : (
            <ForgotPasswordForm onBack={() => setMode('signin')} />
          )}
        </div>

        <p className="mt-5 text-center text-[12px] text-[var(--color-subtle)] leading-relaxed">
          Unauthorized access is prohibited and subject to monitoring under the Ghana Cyber
          Security Act.
        </p>
        <p className="mt-2 text-center text-[12px]">
          <a href="/privacy" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] underline underline-offset-2">
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  )
}

function SignInForm({ onForgotPassword, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const next = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      // Supabase returns the same generic message for wrong email vs wrong
      // password by design (avoids leaking which accounts exist) — surface
      // it as-is rather than guessing which field was wrong.
      setFormError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      return
    }

    // Verify this authenticated user is actually an admin — auth
    // succeeding only proves they have a valid account in this
    // Supabase project, not that they're allowed into this dashboard.
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin')

    if (roleError || !isAdmin) {
      await supabase.auth.signOut()
      setFormError('This account is not authorized to access the admin dashboard.')
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-[15px] font-medium text-[var(--color-ink)] mb-4">Sign in</h2>

      {formError && (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
          style={{ backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
        >
          {formError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="block text-[13px] font-medium text-[var(--color-body)] mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@onma.gov.gh"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] pl-9 pr-3 py-2 text-[14px] placeholder:text-[var(--color-subtle)]"
          />
        </div>
        {errors.email && (
          <p id="email-error" className="mt-1 text-[12px]" style={{ color: 'var(--color-critical)' }}>
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-[13px] font-medium text-[var(--color-body)]">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[12px] text-[var(--color-accent)] hover:underline underline-offset-2"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" aria-hidden="true" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] pl-9 pr-9 py-2 text-[14px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-body)]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="mt-1 text-[12px]" style={{ color: 'var(--color-critical)' }}>
            {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" loading={loading} icon={loading ? undefined : ArrowRight} className="w-full mt-5">
        Sign in
      </Button>
    </form>
  )
}

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)

    // Always show the same success state whether or not the email exists,
    // so this form can't be used to enumerate admin accounts.
    if (resetError) {
      setError('Something went wrong. Try again in a moment.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 className="size-8 mx-auto mb-3" style={{ color: 'var(--color-status-resolved)' }} />
        <h2 className="text-[15px] font-medium text-[var(--color-ink)]">Check your email</h2>
        <p className="text-[13px] text-[var(--color-muted)] mt-1.5">
          If an account exists for {email}, a reset link is on its way.
        </p>
        <Button variant="secondary" onClick={onBack} className="mt-5 w-full">
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-[15px] font-medium text-[var(--color-ink)] mb-1">Reset your password</h2>
      <p className="text-[13px] text-[var(--color-muted)] mb-4">
        Enter your email and we'll send a link to reset it.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
          style={{ backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
        >
          {error}
        </div>
      )}

      <label htmlFor="reset-email" className="block text-[13px] font-medium text-[var(--color-body)] mb-1.5">
        Email address
      </label>
      <div className="relative mb-4">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-subtle)]" aria-hidden="true" />
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@onma.gov.gh"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] pl-9 pr-3 py-2 text-[14px] placeholder:text-[var(--color-subtle)]"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full mt-2 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)] py-1"
      >
        Back to sign in
      </button>
    </form>
  )
}
