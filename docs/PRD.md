# Grain — Product Requirements Document

## Overview

Grain is a lightweight signal aggregation tool for product managers at startups. It gives teams a single structured place to log user feedback signals from all sources, group them into underlying problems, and surface evidence-based patterns for roadmap decisions.

---

## Problem Statement

PMs receive product signals from six different places in a single day — a support ticket, a sales call note, a Slack message from CS, an NPS comment, an offhand remark in a user interview. None of it gets written down in one place. By sprint planning, most of it is forgotten.

When it is written down, it lives in personal Notion docs or spreadsheets with no shared access, no pattern detection, and no connection to actual decisions. Customer success and sales — who hear from users constantly — have no structured way to contribute what they hear.

The result: roadmap prioritization feels political rather than evidence-based. PMs struggle to defend decisions with data. Institutional knowledge about user problems evaporates when people leave teams.

---

## Philosophy

Feature requests are symptoms. Underlying problems are what matter.

Grain forces PMs to translate "can you add CSV export?" into "users can't get their data out to share with stakeholders." That translation — from solution request to problem statement — is the core product act. Every design decision in Grain reinforces this.

**Won't Solve is as important as In Roadmap.** It represents a deliberate product decision, not an oversight — "we heard this, we considered it, we chose not to act on it."

---

## Target Users

### Primary — Product Managers at startups (5–200 employees)
- Receives feedback from multiple sources daily
- Needs to defend roadmap decisions to engineering and leadership
- Works in a small team where CS and sales also hear from users
- Currently manages this with: Notion, spreadsheets, or nothing

### Secondary — Customer Success and Sales (contributors)
- Hear user pain in every call but have no structured place to log it
- Want to influence product decisions without owning the process

---

## Goals

### Product goals
- A PM should be able to log a signal in under 60 seconds
- A PM should be able to show a stakeholder evidence for a roadmap decision in under 2 minutes
- A team should be able to go from zero signals to a defensible pattern view in one week of use

### Non-goals (MVP)
- Grain is not a roadmap tool — it feeds decisions, it does not replace them
- Grain is not a project management tool — no tickets, sprints, or assignments
- Grain is not a user research tool — it is where findings land, not where interviews happen
- Grain is not a BI or analytics platform — the pattern view is intentionally simple

---

## Users and Roles

### Admin
- Creates the workspace
- Invites team members by email
- Can log, edit, and delete any signal
- Can create, edit, and archive problem clusters
- Can generate and revoke share links
- Manages workspace settings

### Contributor
- Invited by an admin
- Can log signals
- Can view all signals, clusters, and the pattern dashboard
- Can edit only their own signals
- Cannot manage workspace, invite others, or generate share links

---

## Features

### Authentication

- Email + password signup with name
- Email + password login
- Password reset via email
- On first login after signup: redirect to workspace creation wizard
- On subsequent logins: redirect to pattern dashboard

---

### Workspace Setup

- Workspace name (free text)
- Slug auto-generated from name, editable
- One user can belong to one workspace in MVP
- Workspace creation completes onboarding; user lands on empty dashboard

---

### Signal Logging

Accessible from anywhere via a persistent "+ Log signal" button. Opens as a modal or slide-over.

**Form fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Problem statement | Text (long) | Yes | What underlying problem does this represent? Not what the user asked for. |
| Verbatim quote | Text (long) | No | What did the user actually say? |
| Source | Select (single) | Yes | User Interview, Sales Call, Support Ticket, NPS, Slack, Other |
| User segment | Select (multi) | Yes | Enterprise, SMB, Free Tier, Power User, New User, Other |
| Business impact | Select (single) | Yes | Low, Medium, High |
| Problem cluster | Select (single) | No | Assign to existing cluster, or leave unclustered |
| Signal date | Date | Yes | Auto-fills today, overridable — when the signal was received, not when logged |

The reporter is recorded automatically from the logged-in user.

**After submission:** Signal appears in the list. If unclustered, the dashboard nudges the admin to cluster it.

---

### Signal List View

- All signals in the workspace, newest first by signal date
- Persistent filter bar: source, segment, business impact, cluster, reporter, date range
- Search: matches against problem statement and verbatim quote
- Each row shows: problem statement (truncated at ~80 chars), source tag, segment tags, impact badge, cluster name (or "Unclustered"), signal date
- Click row to expand full signal detail inline or in a side panel
- Admin can delete any signal; contributor can delete their own

---

### Problem Clusters

A problem cluster is a named, recurring user problem that one or more signals point to.

**Creating a cluster:**
- Name (required)
- Description — one line summarizing the problem (required)
- Status defaults to Watching on creation

**Cluster fields:**

| Field | Type | Notes |
|---|---|---|
| Name | Text | Short, named after the problem not the solution |
| Description | Text | One sentence: what is the core user problem here? |
| Status | Enum | Watching / Investigating / In Roadmap / Won't Solve |
| Open questions | List of text | Knowledge gaps the team needs to fill before acting |
| Signal count | Computed | Auto-derived from linked signals |
| Created by / date | Auto | |

**Statuses explained:**
- **Watching** — we're aware of this problem, collecting more signal
- **Investigating** — we're actively trying to understand scope and severity
- **In Roadmap** — we've committed to solving this
- **Won't Solve** — we've considered this and deliberately deprioritized it

Clusters can be archived (hidden from dashboard, signals remain).

---

### Pattern Dashboard

The default home screen. Shows the landscape of known user problems and their relative weight.

**Content:**
- Cards for each active problem cluster, sorted by signal count descending
- Each card: cluster name, signal count, top 2 segments, status badge, days since last signal
- A separate count of unclustered signals with a prompt to cluster them
- Empty state with onboarding guidance

**Filters:**
- Segment filter — shows how signal counts change per segment (e.g., "Enterprise only")
- Time range — last 30 / 60 / 90 days / all time

---

### Problem Detail View

Accessed by clicking a cluster card.

**Sections:**
- Cluster header: name, description, status (editable inline by admin), created date
- Open questions: list, admin can add/remove
- Signal breakdown:
  - Segment distribution (which segments appear most)
  - Source distribution (where signals are coming from)
  - Simple timeline (signal count by week)
- All signals in this cluster — same row format as Signal List, with filters

---

### Read-Only Share Links

Allows admins to share evidence with stakeholders who don't have a Grain account.

- Admin generates a share link from any problem cluster detail view
- Link opens a public read-only page: cluster name, description, signal count, all signals (problem statements + verbatim quotes), segment breakdown
- No authentication required for the viewer
- Link can be revoked by any admin; revocation is immediate
- Each cluster can have one active share link at a time

---

### Team Invites

- Admin enters an email address and selects a role (admin or contributor)
- Grain sends an invite email with a one-time magic link (72-hour expiry)
- Recipient clicks link → if no account: signup form with email pre-filled → joins workspace on completion
- If existing Grain user: clicks link → joins workspace directly
- Admin can see pending invites and revoke them before acceptance

---

## Data Model

### `workspaces`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | |
| slug | text, unique | Used in URLs |
| created_at | timestamptz | |

### `workspace_members`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, FK → workspaces | |
| user_id | uuid, FK → auth.users | |
| role | enum: admin, contributor | |
| created_at | timestamptz | |

### `problem_clusters`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, FK | |
| name | text | |
| description | text | |
| status | enum: watching, investigating, in_roadmap, wont_solve | |
| created_by | uuid, FK → auth.users | |
| created_at | timestamptz | |
| archived_at | timestamptz, nullable | |

### `open_questions`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| cluster_id | uuid, FK → problem_clusters | |
| question | text | |
| created_by | uuid, FK → auth.users | |
| created_at | timestamptz | |

### `signals`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, FK | |
| cluster_id | uuid, FK → problem_clusters, nullable | Null = unclustered |
| problem_statement | text | Required |
| verbatim_quote | text, nullable | |
| source | enum: user_interview, sales_call, support_ticket, nps, slack, other | |
| segments | text[] | Array of: enterprise, smb, free_tier, power_user, new_user, other |
| business_impact | enum: low, medium, high | |
| signal_date | date | When received, not when logged |
| logged_by | uuid, FK → auth.users | |
| created_at | timestamptz | |

### `share_links`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| cluster_id | uuid, FK → problem_clusters | |
| workspace_id | uuid, FK | |
| token | text, unique | Random, used in public URL |
| created_by | uuid, FK → auth.users | |
| created_at | timestamptz | |
| revoked_at | timestamptz, nullable | |

### `invites`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, FK | |
| email | text | |
| role | enum: admin, contributor | |
| token | text, unique | One-time magic link token |
| invited_by | uuid, FK → auth.users | |
| created_at | timestamptz | |
| accepted_at | timestamptz, nullable | |
| revoked_at | timestamptz, nullable | |

---

## Key User Flows

### New user — first signup
1. Lands on landing page → clicks "Get started"
2. Signup form: name, email, password
3. Email verification (Supabase)
4. Redirected to workspace creation wizard
5. Enters workspace name → slug auto-generated → confirms
6. Lands on empty pattern dashboard with onboarding prompt

### Logging a signal
1. Clicks "+ Log signal" from anywhere
2. Modal opens with the signal form
3. Fills problem statement (required) and other fields
4. Submits → signal logged, modal closes, list/dashboard updates
5. If no cluster assigned: dashboard shows unclustered count nudge

### Inviting a teammate
1. Admin goes to Settings → Team
2. Enters email, selects role (contributor), sends invite
3. Teammate receives email, clicks link, creates account
4. Teammate lands directly in the shared workspace

### Sharing evidence with a stakeholder
1. Admin opens a problem cluster
2. Clicks "Share" → share link generated and copied
3. Pastes link to stakeholder in Slack/email
4. Stakeholder opens link — no login required — sees read-only view

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | #F9F7F4 | Page background |
| `--surface` | #F0EDE8 | Cards, inputs, modals |
| `--border` | #E5E0D8 | All borders |
| `--text-primary` | #1C1917 | Headings, body |
| `--text-muted` | #78716C | Labels, secondary text |
| `--accent` | #D97706 | Interactive elements, key data only |
| `--accent-hover` | #B45309 | Accent hover state |

Typography: Inter, weights 400 / 500 / 600. No display fonts — this is a tool, not a marketing site.

**Rule:** Amber accent appears only on interactive elements (primary buttons, active states, links) and key data callouts (signal count on cluster cards). Everything else is neutrals.

---

## Out of Scope for MVP

- Mobile app or responsive-first design (desktop primary)
- Slack integration (Phase 2)
- AI-suggested problem clustering (Phase 2)
- CSV / PDF export (Phase 2)
- Custom segment definitions beyond the default list (Phase 2)
- Activity feed / audit log (Phase 2)
- Roadmap or ticket functionality
- Integrations with Jira, Linear, Notion

---

## Open Questions

| Question | Current thinking |
|---|---|
| Can signals be edited after logging? | Yes, by the reporter or any admin |
| Should the dashboard or signal list be the default home? | Dashboard — the point is patterns, not list management |
| Should we support custom segments? | Phase 2 |
| Should share links expire automatically? | No auto-expiry in MVP, admin revokes manually |
| Can a user belong to multiple workspaces? | No in MVP — one workspace per user |

---

## Phase 2

- **Slack integration** — `/grain log` command to capture a signal without leaving Slack
- **AI clustering** — suggest which unclustered signals belong to existing problem clusters
- **CSV export** — signal list and cluster summary for roadmap presentations
- **Custom segments** — workspace-defined segment tags beyond the defaults
- **Activity feed** — what your team logged this week
