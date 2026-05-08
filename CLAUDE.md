# Grain

A multi-tenant SaaS tool for product managers to log, cluster, and surface patterns in user feedback signals. Built as a portfolio project targeting startup product engineer / TPM / founding engineer roles.

Full PRD: `docs/PRD.md`

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (auth, Postgres, RLS, realtime) |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Auth context | React context wrapping Supabase session |
| Deployment | Vercel |

---

## Product philosophy

Feature requests are symptoms. Grain forces PMs to articulate the underlying problem, not the solution the user asked for. This principle should be visible in the UI:

- Problem statement is always required, verbatim quote is always optional
- The pattern dashboard is the home screen — patterns matter more than the list
- Won't Solve is a first-class cluster status, not an absence of action
- Share links have no authentication — removing friction for the stakeholder matters more than controlling access

Every design and implementation decision should be explainable in product terms.

---

## Architecture

### Multi-tenancy

All data is scoped to a workspace via `workspace_id`. Every table has a `workspace_id` column. Supabase RLS enforces that users can only read and write data belonging to their own workspace. There is no cross-workspace data access.

### Auth flow

1. User signs up with email + password (Supabase auth)
2. On first login: check if a `workspace_members` record exists for this user
3. If no record: redirect to `/onboarding` (workspace creation wizard)
4. If record exists: redirect to `/dashboard`
5. Workspace ID is stored in React context after resolution and used in all queries

### RLS pattern (applied to every table)

```sql
-- Select: must be a workspace member
-- Insert: must be a workspace member (admin-only tables: must be admin)
-- Update: admin, or the record's created_by/logged_by matches auth.uid()
-- Delete: admin, or the record's created_by/logged_by matches auth.uid()
```

### Share links (unauthenticated access)

The `/share/:token` route is fully public. It queries the `share_links` table using the token, resolves the cluster ID, then fetches cluster + signals using a Supabase service role query (bypasses RLS). The route has no auth requirement. Revoked links (`revoked_at IS NOT NULL`) return a 404.

---

## File structure

```
src/
  components/
    ui/             # Primitive components: Button, Input, Badge, Select, Modal, etc.
    signals/        # SignalCard, SignalForm, SignalList, SignalFilters
    clusters/       # ClusterCard, ClusterForm, ClusterDetail, OpenQuestions
    dashboard/      # PatternDashboard, SegmentFilter, UncludsteredNudge
    layout/         # AppShell, Sidebar, Header, PageHeader
  pages/
    auth/           # LoginPage, SignupPage, ResetPasswordPage
    onboarding/     # WorkspaceSetupPage
    dashboard/      # DashboardPage
    signals/        # SignalsPage
    clusters/       # ClusterDetailPage
    share/          # SharePage (public, no auth)
    settings/       # SettingsPage, TeamPage
  hooks/
    useWorkspace.ts
    useSignals.ts
    useClusters.ts
    useInvites.ts
    useShareLinks.ts
  lib/
    supabase.ts     # Supabase client (anon key)
    supabaseAdmin.ts # Service role client — server-side only (share links)
    schemas.ts      # Zod schemas for all forms
    types.ts        # TypeScript types mirroring DB schema
    utils.ts        # cn(), formatDate(), slugify(), etc.
  contexts/
    AuthContext.tsx
    WorkspaceContext.tsx
```

---

## Design system

### Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F9F7F4` | Page background |
| `--surface` | `#F0EDE8` | Cards, inputs, modals |
| `--border` | `#E5E0D8` | All borders and dividers |
| `--text-primary` | `#1C1917` | Headings, body text |
| `--text-muted` | `#78716C` | Labels, secondary text, placeholders |
| `--accent` | `#D97706` | Interactive elements, key data callouts only |
| `--accent-hover` | `#B45309` | Hover state for accent elements |

### Typography

- Font: Inter (or Geist if available)
- Weights: 400 (body), 500 (labels, UI), 600 (headings)
- No display fonts — this is a tool, not a marketing site

### Rules

- Amber accent appears only on: primary buttons, active nav states, signal count on cluster cards, links
- Everything else uses warm neutrals — no blue, no purple, no generic SaaS palette
- Borders are always `--border`, never `gray-200` or similar Tailwind defaults
- No shadows on cards — separation comes from background/surface color contrast

### Tailwind config additions

```js
colors: {
  grain: {
    bg: '#F9F7F4',
    surface: '#F0EDE8',
    border: '#E5E0D8',
    primary: '#1C1917',
    muted: '#78716C',
    accent: '#D97706',
    'accent-hover': '#B45309',
  }
}
```

---

## Conventions

### Queries

- All Supabase queries live in custom hooks (`hooks/`), never inline in components
- TanStack Query manages caching, loading, and error states
- Query keys follow the pattern: `['signals', workspaceId]`, `['clusters', workspaceId]`, etc.

### Types

- All database types are generated from Supabase (`supabase gen types typescript`) and live in `lib/types.ts`
- Zod schemas for form validation live in `lib/schemas.ts`
- Never duplicate types — derive form types from Zod schemas using `z.infer<>`

### Components

- UI primitives in `components/ui/` are unstyled-first and composed with `cn()`
- Feature components are colocated with their domain (signals, clusters, etc.)
- No prop drilling beyond one level — use context or pass callbacks

### Code style

- No comments unless the why is genuinely non-obvious
- No barrel files (`index.ts` re-exports) — import directly
- Tailwind only — no CSS modules, no styled-components, no inline styles
- Use `cn()` (clsx + tailwind-merge) for all conditional class merging

---

## Database schema

Defined in `supabase/migrations/`. Key tables:

- `workspaces` — one per team
- `workspace_members` — join table with role (admin, contributor)
- `problem_clusters` — named user problems with status and open questions
- `open_questions` — per-cluster knowledge gaps
- `signals` — individual user feedback items, optionally linked to a cluster
- `share_links` — public read-only tokens for cluster views
- `invites` — pending email invitations with one-time tokens

Full schema in `docs/PRD.md` → Data Model section.

---

## Key product decisions and why

| Decision | Reason |
|---|---|
| Problem statement required, quote optional | Forces the translator act from solution request to problem |
| Dashboard is home, not signal list | Grain exists to show patterns, not manage a list |
| Won't Solve is a first-class status | Deliberate deprioritization is a product decision, not an absence |
| Share links need no auth | Stakeholder friction is the enemy of evidence-sharing |
| Segments are multi-select | A signal can come from a user who is both enterprise and a power user |
| One workspace per user in MVP | Simplifies auth and data model; multi-workspace is Phase 2 |

---

## Phase 2 (not in scope)

- Slack integration: `/grain log` command logs a signal from Slack
- AI clustering: suggest which unclustered signals belong to existing clusters
- CSV export for roadmap presentations
- Custom segment tags per workspace
- Activity feed: what the team logged this week
- Multi-workspace support
