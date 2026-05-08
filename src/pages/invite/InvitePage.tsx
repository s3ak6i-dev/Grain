import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { signupSchema, loginSchema, type SignupValues, type LoginValues } from '@/lib/schemas'
import { useAuth } from '@/contexts/AuthContext'

interface InviteDetails {
  email: string
  role: string
  workspace_name: string
}

type Mode = 'loading' | 'invalid' | 'signup' | 'login' | 'accepting' | 'done'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mode, setMode] = useState<Mode>('loading')
  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')

  // Fetch invite details on mount
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.rpc('get_invite_details', { invite_token: token })
      if (error || !data) {
        setMode('invalid')
        return
      }
      setInvite(data as InviteDetails)
      setMode(user ? 'accepting' : 'signup')
    }
    load()
  }, [token])

  // If user just logged in and we have an invite, accept it
  useEffect(() => {
    if (user && invite) {
      setMode('accepting')
      acceptAndRedirect()
    }
  }, [user, invite])

  async function acceptAndRedirect() {
    setError(null)
    try {
      await supabase.rpc('accept_invite', { invite_token: token })
      // Force a page reload to re-resolve workspace context
      window.location.href = '/dashboard'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept invite')
      setMode('signup')
    }
  }

  // Signup form
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: invite?.email ?? '' },
  })

  useEffect(() => {
    if (invite?.email) signupForm.setValue('email', invite.email)
  }, [invite?.email])

  async function onSignup(values: SignupValues) {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.name } },
    })
    if (error) { setError(error.message); return }
    // Auth state change will trigger acceptAndRedirect via the useEffect above
  }

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: invite?.email ?? '' },
  })

  useEffect(() => {
    if (invite?.email) loginForm.setValue('email', invite.email)
  }, [invite?.email])

  async function onLogin(values: LoginValues) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) { setError(error.message); return }
  }

  return (
    <div className="min-h-screen bg-grain-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-grain-accent font-semibold text-xl tracking-tight">grain</span>
        </div>

        {mode === 'loading' && (
          <p className="text-sm text-grain-muted text-center">Loading invite…</p>
        )}

        {mode === 'invalid' && (
          <div className="bg-grain-surface border border-grain-border rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-grain-primary">Invite not found</p>
            <p className="text-xs text-grain-muted mt-1">
              This invite link is invalid or has already been used.
            </p>
          </div>
        )}

        {mode === 'accepting' && (
          <div className="bg-grain-surface border border-grain-border rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-grain-primary">Joining workspace…</p>
          </div>
        )}

        {(mode === 'signup' || mode === 'login') && invite && (
          <div className="bg-grain-surface border border-grain-border rounded-lg p-6">
            <p className="text-sm font-medium text-grain-primary mb-1">
              You're invited to <span className="text-grain-accent">{invite.workspace_name}</span>
            </p>
            <p className="text-xs text-grain-muted mb-5">
              as a <span className="capitalize">{invite.role}</span>.
              {authMode === 'signup' ? ' Create an account to join.' : ' Sign in to join.'}
            </p>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            {authMode === 'signup' ? (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="flex flex-col gap-3">
                <input
                  placeholder="Your name"
                  className={cn(inputCls, signupForm.formState.errors.name ? 'border-red-400' : '')}
                  {...signupForm.register('name')}
                />
                {signupForm.formState.errors.name && (
                  <p className="text-xs text-red-500 -mt-2">{signupForm.formState.errors.name.message}</p>
                )}
                <input
                  type="email"
                  placeholder="Email"
                  className={cn(inputCls, signupForm.formState.errors.email ? 'border-red-400' : '')}
                  {...signupForm.register('email')}
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  className={cn(inputCls, signupForm.formState.errors.password ? 'border-red-400' : '')}
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-500 -mt-2">{signupForm.formState.errors.password.message}</p>
                )}
                <Button type="submit" loading={signupForm.formState.isSubmitting}>
                  Create account & join
                </Button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  className={cn(inputCls, loginForm.formState.errors.email ? 'border-red-400' : '')}
                  {...loginForm.register('email')}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className={cn(inputCls, loginForm.formState.errors.password ? 'border-red-400' : '')}
                  {...loginForm.register('password')}
                />
                <Button type="submit" loading={loginForm.formState.isSubmitting}>
                  Sign in & join
                </Button>
              </form>
            )}

            <button
              onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
              className="mt-4 text-xs text-grain-muted hover:text-grain-primary w-full text-center"
            >
              {authMode === 'signup'
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = cn(
  'w-full px-3 py-2 text-sm rounded-md border bg-grain-bg text-grain-primary',
  'placeholder:text-grain-muted border-grain-border',
  'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
)
