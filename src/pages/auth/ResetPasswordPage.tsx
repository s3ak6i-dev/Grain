import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/schemas'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(values: ResetPasswordValues) {
    setError('')
    try {
      await resetPassword(values.email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-grain-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <span className="text-grain-accent font-semibold text-xl tracking-tight">grain</span>
          <h1 className="mt-4 text-2xl font-semibold text-grain-primary">Reset your password</h1>
          <p className="mt-1 text-sm text-grain-muted">
            We'll send a reset link to your email address.
          </p>
        </div>

        {sent ? (
          <div className="bg-grain-surface border border-grain-border rounded-md p-4 text-sm text-grain-primary">
            Check your email — a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={isSubmitting} className="w-full">
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-grain-muted">
          <Link to="/login" className="text-grain-accent hover:text-grain-accent-hover transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
