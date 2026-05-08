// ─── Enums ────────────────────────────────────────────────────────────────────

export type WorkspaceRole = 'admin' | 'contributor'

export type ClusterStatus = 'watching' | 'investigating' | 'in_roadmap' | 'wont_solve'

export type SignalSource =
  | 'user_interview'
  | 'sales_call'
  | 'support_ticket'
  | 'nps'
  | 'slack'
  | 'other'

export type BusinessImpact = 'low' | 'medium' | 'high'

export type UserSegment =
  | 'enterprise'
  | 'smb'
  | 'free_tier'
  | 'power_user'
  | 'new_user'
  | 'other'

// ─── Display labels ────────────────────────────────────────────────────────────

export const SOURCE_LABELS: Record<SignalSource, string> = {
  user_interview: 'User Interview',
  sales_call: 'Sales Call',
  support_ticket: 'Support Ticket',
  nps: 'NPS',
  slack: 'Slack',
  other: 'Other',
}

export const SEGMENT_LABELS: Record<UserSegment, string> = {
  enterprise: 'Enterprise',
  smb: 'SMB',
  free_tier: 'Free Tier',
  power_user: 'Power User',
  new_user: 'New User',
  other: 'Other',
}

export const IMPACT_LABELS: Record<BusinessImpact, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const STATUS_LABELS: Record<ClusterStatus, string> = {
  watching: 'Watching',
  investigating: 'Investigating',
  in_roadmap: 'In Roadmap',
  wont_solve: "Won't Solve",
}

// ─── Table types ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  avatar_color: string
  display_name: string | null
  created_at: string
}

export interface ProblemCluster {
  id: string
  workspace_id: string
  name: string
  description: string
  status: ClusterStatus
  created_by: string
  created_at: string
  archived_at: string | null
}

export interface OpenQuestion {
  id: string
  cluster_id: string
  question: string
  created_by: string
  created_at: string
}

export interface Signal {
  id: string
  workspace_id: string
  cluster_id: string | null
  problem_statement: string
  verbatim_quote: string | null
  source: SignalSource
  segments: UserSegment[]
  business_impact: BusinessImpact
  signal_date: string
  logged_by: string
  created_at: string
  account_name: string | null
  account_mrr: number | null
  source_url: string | null
}

export interface ShareLink {
  id: string
  cluster_id: string
  workspace_id: string
  token: string
  created_by: string
  created_at: string
  revoked_at: string | null
}

export interface Invite {
  id: string
  workspace_id: string
  email: string
  role: WorkspaceRole
  token: string
  invited_by: string
  created_at: string
  accepted_at: string | null
  revoked_at: string | null
}

// ─── Supabase Database type (expanded as needed) ───────────────────────────────

export interface Database {
  public: {
    Tables: {
      workspaces: { Row: Workspace; Insert: Omit<Workspace, 'id' | 'created_at'>; Update: Partial<Workspace> }
      workspace_members: { Row: WorkspaceMember; Insert: Omit<WorkspaceMember, 'id' | 'created_at'>; Update: Partial<WorkspaceMember> }
      problem_clusters: { Row: ProblemCluster; Insert: Omit<ProblemCluster, 'id' | 'created_at'>; Update: Partial<ProblemCluster> }
      open_questions: { Row: OpenQuestion; Insert: Omit<OpenQuestion, 'id' | 'created_at'>; Update: Partial<OpenQuestion> }
      signals: { Row: Signal; Insert: Omit<Signal, 'id' | 'created_at'>; Update: Partial<Signal> }
      share_links: { Row: ShareLink; Insert: Omit<ShareLink, 'id' | 'created_at'>; Update: Partial<ShareLink> }
      invites: { Row: Invite; Insert: Omit<Invite, 'id' | 'created_at'>; Update: Partial<Invite> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
