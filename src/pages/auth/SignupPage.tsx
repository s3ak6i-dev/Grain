import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { signupSchema, type SignupValues } from '@/lib/schemas'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(values: SignupValues) {
    setError('')
    try {
      await signUp(values.email, values.password, values.name)
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div
        className="hidden lg:flex w-80 shrink-0 flex-col justify-between p-10"
        style={{ background: '#0C0A08' }}
      >
        <Logo variant="dark" size="md" />
        <div>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            "The first time we shared a grain brief in a roadmap review, the room went quiet. The evidence did the talking."
          </p>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>— PM, Series B startup</p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Free to use. No credit card required.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-grain-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo variant="light" size="lg" />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-grain-primary" style={{ letterSpacing: '-0.01em' }}>
              Create your account
            </h1>
            <p className="mt-1 text-sm text-grain-muted">Start building your team's signal library</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Name"
              type="text"
              placeholder="Jordan Lee"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Work email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={isSubmitting} className="w-full mt-1">
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-grain-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-grain-accent hover:text-grain-accent-hover transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
