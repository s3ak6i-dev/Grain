import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

export const signalSchema = z.object({
  problem_statement: z
    .string()
    .min(10, 'Describe the problem in at least 10 characters'),
  verbatim_quote: z.string().optional(),
  source: z.enum(['user_interview', 'sales_call', 'support_ticket', 'nps', 'slack', 'other']),
  segments: z
    .array(z.enum(['enterprise', 'smb', 'free_tier', 'power_user', 'new_user', 'other']))
    .min(1, 'Select at least one segment'),
  business_impact: z.enum(['low', 'medium', 'high']),
  cluster_id: z.string().uuid().nullable().optional(),
  signal_date: z.string(),
  account_name: z.string().optional(),
  account_mrr: z.coerce.number().int().min(0).nullable().optional(),
  source_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

export const clusterSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Describe the problem in at least 10 characters'),
})

export const openQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
})

export const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  role: z.enum(['admin', 'contributor']),
})

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type WorkspaceValues = z.infer<typeof workspaceSchema>
export type SignalValues = z.infer<typeof signalSchema>
export type ClusterValues = z.infer<typeof clusterSchema>
export type OpenQuestionValues = z.infer<typeof openQuestionSchema>
export type InviteValues = z.infer<typeof inviteSchema>
