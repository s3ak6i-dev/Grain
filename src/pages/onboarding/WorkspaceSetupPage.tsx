import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { workspaceSchema, type WorkspaceValues } from '@/lib/schemas'
import { slugify } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

const GRID = {
  backgroundImage:
    'linear-gradient(rgba(217,119,6,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.06) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}

export default function WorkspaceSetupPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceValues>({ resolver: zodResolver(workspaceSchema) })

  const nameValue = watch('name', '')

  useEffect(() => {
    setValue('slug', slugify(nameValue))
  }, [nameValue, setValue])

  async function onSubmit(values: WorkspaceValues) {
    if (!user) return
    setError('')
    try {
      const { error: rpcError } = await supabase.rpc('create_workspace', {
        workspace_name: values.name,
        workspace_slug: values.slug,
      })
      if (rpcError) throw new Error(`Failed: ${rpcError.message}`)
      await refresh()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0C0A08', ...GRID }}
    >
      {/* Amber glow at top */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-56 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.14) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
            >
              1
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Account
            </span>
          </div>
          <div className="flex items-center gap-1 mx-1">
            <div className="w-2 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-2 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-2 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: '#D97706', color: 'white' }}
            >
              2
            </div>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Workspace
            </span>
          </div>
        </div>

        <div className="mb-8">
          <Logo variant="dark" size="md" />
          <h1
            className="mt-4 text-2xl font-semibold"
            style={{ color: '#FAFAF9', letterSpacing: '-0.01em' }}
          >
            Create your workspace
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Your workspace is where your team logs and tracks signals.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Workspace name
            </label>
            <input
              type="text"
              placeholder="Acme Product Team"
              className="input-dark"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Slug
            </label>
            <input
              type="text"
              placeholder="acme-product-team"
              className="input-dark font-mono"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              {...register('slug')}
            />
            <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Used in your workspace URL
            </p>
            {errors.slug && (
              <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all mt-1 active:scale-[0.98]"
            style={{
              background: isSubmitting ? 'rgba(217,119,6,0.65)' : '#D97706',
              boxShadow: '0 0 0 1px rgba(217,119,6,0.4), 0 4px 16px rgba(217,119,6,0.22)',
            }}
          >
            {isSubmitting ? 'Creating…' : 'Create workspace →'}
          </button>
        </form>
      </div>
    </div>
  )
}
