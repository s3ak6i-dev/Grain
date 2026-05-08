import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginValues } from '@/lib/schemas'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    setError('')
    try {
      await signIn(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex w-80 shrink-0 flex-col justify-between p-10"
        style={{ background: '#0C0A08' }}
      >
        <Logo variant="dark" size="md" />
        <div>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            "We used to make roadmap calls based on who spoke to users most recently. Grain changed that."
          </p>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>— Head of Product, early-stage SaaS</p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Built for product teams</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-grain-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo variant="light" size="lg" />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-grain-primary" style={{ letterSpacing: '-0.01em' }}>Welcome back</h1>
            <p className="mt-1 text-sm text-grain-muted">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={isSubmitting} className="w-full mt-1">
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-center text-sm text-grain-muted">
            <Link to="/reset-password" className="hover:text-grain-primary transition-colors">
              Forgot your password?
            </Link>
            <span>
              No account?{' '}
              <Link to="/signup" className="text-grain-accent hover:text-grain-accent-hover transition-colors">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
