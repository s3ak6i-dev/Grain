import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight, BarChart2, Share2, CheckCircle } from 'lucide-react'
import Logo from '@/components/ui/Logo'

// ─── Browser mockup ───────────────────────────────────────────────────────────

const MOCK_CLUSTERS = [
  { name: 'Data Export & Sharing', count: 7, status: 'Investigating', desc: 'Users cannot get data out to share with stakeholders.' },
  { name: 'Onboarding Drop-off', count: 5, status: 'Watching', desc: 'New users fail to reach first value before churning.' },
  { name: 'Real-time Collaboration', count: 4, status: 'In Roadmap', desc: 'No way for teammates to work together simultaneously.' },
  { name: 'Mobile Performance', count: 3, status: 'Watching', desc: 'App is too slow on mobile devices for field teams.' },
]

const MOCK_SIGNALS = [
  { problem: 'Users can\'t export their data to share with their team', source: 'User Interview', impact: 'High', account: 'Acme Corp', mrr: 8000 },
  { problem: 'Onboarding takes too long, new users drop off before seeing value', source: 'Support Ticket', impact: 'High', account: 'Stripe Inc', mrr: 4200 },
  { problem: 'No way to collaborate with teammates in real time', source: 'Sales Call', impact: 'Medium', account: 'Notion HQ', mrr: 6500 },
]

const STATUS_COLORS: Record<string, string> = {
  'Investigating': '#F59E0B',
  'Watching': '#78716C',
  'In Roadmap': '#16A34A',
}

function AppMockup() {
  const [activeNav, setActiveNav] = useState<'Dashboard' | 'Signals' | 'Analytics'>('Dashboard')

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-white/10"
      style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#1A1714' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <div className="flex-1 mx-3 rounded px-3 py-1 text-xs font-mono" style={{ background: '#252220', color: 'rgba(255,255,255,0.25)' }}>
          app.grain.pm/{activeNav.toLowerCase()}
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 360, background: '#F9F7F4' }}>

        {/* Sidebar */}
        <div className="flex flex-col shrink-0" style={{ width: 160, borderRight: '1px solid #E5E0D8', background: '#F9F7F4', padding: '16px 12px' }}>
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
            <div style={{ color: '#D97706', fontWeight: 600, fontSize: 14 }}>grain</div>
            <div style={{ color: '#78716C', fontSize: 10, marginTop: 2 }}>Acme Corp</div>
          </div>
          {(['Dashboard', 'Signals', 'Analytics', 'Settings'] as const).map((item) => {
            const isActive = item === activeNav
            const clickable = item !== 'Settings'
            return (
              <div
                key={item}
                onClick={() => clickable && item !== 'Settings' && setActiveNav(item as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, marginBottom: 2,
                  background: isActive ? '#F0EDE8' : 'transparent',
                  color: isActive ? '#1C1917' : '#78716C',
                  fontWeight: isActive ? 500 : 400,
                  cursor: clickable ? 'pointer' : 'default',
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: 3, background: isActive ? '#D97706' : '#E5E0D8' }} />
                {item}
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 20, overflow: 'hidden' }}>

          {/* Dashboard view */}
          {activeNav === 'Dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1917' }}>Dashboard</div>
                  <div style={{ fontSize: 10, color: '#78716C', marginTop: 1 }}>4 clusters · 19 signals</div>
                </div>
                <div style={{ background: '#D97706', color: 'white', fontSize: 10, fontWeight: 500, padding: '5px 10px', borderRadius: 6 }}>+ New cluster</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MOCK_CLUSTERS.map((c) => (
                  <div key={c.name} style={{ background: '#F0EDE8', border: '1px solid #E5E0D8', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#1C1917', lineHeight: 1.3 }}>{c.name}</div>
                        <div style={{ fontSize: 9, color: '#78716C', marginTop: 3, lineHeight: 1.3 }}>{c.desc}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#D97706', lineHeight: 1, marginLeft: 8 }}>{c.count}</div>
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #E5E0D8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[c.status] ?? '#78716C' }} />
                      <span style={{ fontSize: 9, color: '#78716C' }}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Signals view */}
          {activeNav === 'Signals' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>Signals</div>
              <div style={{ fontSize: 10, color: '#78716C', marginBottom: 12 }}>Every piece of user feedback your team has logged.</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['All sources', 'All segments', 'All impact'].map((f) => (
                  <div key={f} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, border: '1px solid #E5E0D8', color: '#78716C', background: '#F9F7F4' }}>{f}</div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MOCK_SIGNALS.map((s) => (
                  <div key={s.problem} style={{ background: '#F0EDE8', border: '1px solid #E5E0D8', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#1C1917', lineHeight: 1.3 }}>{s.problem}</div>
                    <div style={{ fontSize: 9, color: '#78716C', marginTop: 2 }}>{s.account} · ${s.mrr.toLocaleString()}/mo</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: '#E5E0D8', color: '#78716C' }}>{s.source}</div>
                      <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: s.impact === 'High' ? '#FEF2F2' : '#FFFBEB', color: s.impact === 'High' ? '#DC2626' : '#D97706' }}>{s.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Analytics view */}
          {activeNav === 'Analytics' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1917', marginBottom: 12 }}>Analytics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                {[{ label: 'Total signals', val: '19' }, { label: 'High impact', val: '8' }, { label: 'Clustered', val: '16' }, { label: 'Clusters', val: '4' }].map((k) => (
                  <div key={k.label} style={{ background: '#F0EDE8', border: '1px solid #E5E0D8', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 8, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#D97706', lineHeight: 1.2 }}>{k.val}</div>
                  </div>
                ))}
              </div>
              {/* Mini bar chart */}
              <div style={{ background: '#F0EDE8', border: '1px solid #E5E0D8', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#78716C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal velocity — by week</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                  {[2, 3, 1, 4, 3, 5, 7, 4, 6, 8].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 9 ? '#D97706' : '#E5E0D8', borderRadius: '2px 2px 0 0', height: `${(h / 8) * 100}%` }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GRID = {
  backgroundImage: 'linear-gradient(rgba(217,119,6,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.08) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}

export default function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading])

  return (
    <div className="min-h-screen" style={{ background: '#0C0A08', ...GRID }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(12,10,8,0.85)', backdropFilter: 'blur(12px)', ...GRID }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo variant="dark" size="md" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm px-4 py-1.5 rounded-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-1.5"
              style={{ background: '#D97706', color: 'white', boxShadow: '0 0 0 1px rgba(217,119,6,0.4)' }}
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(217,119,6,0.14) 0%, transparent 65%)' }}
      >
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
          <h1 className="text-5xl font-semibold leading-tight mb-6" style={{ color: '#FAFAF9', letterSpacing: '-0.02em' }}>
            Feature requests are symptoms.
            <br />
            <span style={{ color: '#D97706' }}>Grain finds the pattern.</span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Log user feedback from any source, cluster it into real problems, and share evidence-backed briefs — without another spreadsheet.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm"
              style={{ background: '#D97706', color: 'white', boxShadow: '0 0 0 1px rgba(217,119,6,0.4), 0 4px 12px rgba(217,119,6,0.3)' }}
            >
              Start for free <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.04)' }}
            >
              Sign in
            </Link>
          </div>

          <div className="max-w-3xl mx-auto">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          The problem
        </p>
        <h2 className="text-3xl font-semibold mb-5" style={{ color: '#FAFAF9', letterSpacing: '-0.015em' }}>
          Most teams make roadmap decisions from memory
        </h2>
        <p className="leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
          User feedback lives in Slack threads, sales call notes, and CS inboxes. By the time a roadmap meeting happens, the evidence has scattered. Grain keeps it structured, searchable, and ready to share.
        </p>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: <CheckCircle size={16} style={{ color: '#D97706' }} />,
              title: 'Log signals fast',
              desc: 'Capture feedback from user interviews, sales calls, support tickets, NPS — translated into the underlying problem, not the feature request.',
            },
            {
              icon: <BarChart2 size={16} style={{ color: '#D97706' }} />,
              title: 'Find the pattern',
              desc: 'Group signals into named problem clusters. Watch signal velocity over time. See which problems are growing before they become urgent.',
            },
            {
              icon: <Share2 size={16} style={{ color: '#D97706' }} />,
              title: 'Share the evidence',
              desc: 'Generate a public link to any cluster. Stakeholders see real user quotes and data — no login required. Or export a problem brief for your roadmap doc.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl p-6 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border"
                style={{ background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.2)' }}
              >
                {icon}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#FAFAF9' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For the whole team ── */}
      <section className="border-y py-24" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Built for the whole team
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'Product', desc: 'Turn scattered feedback into structured roadmap evidence.' },
              { role: 'Customer Success', desc: 'Log patterns from support without leaving your workflow.' },
              { role: 'Sales', desc: "Capture what prospects say is blocking them from buying." },
              { role: 'Leadership', desc: 'See which problems are growing before they become urgent.' },
            ].map(({ role, desc }) => (
              <div
                key={role}
                className="flex gap-3 p-4 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="w-1 rounded-full shrink-0 self-stretch" style={{ background: '#D97706' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#FAFAF9' }}>{role}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 text-center" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(217,119,6,0.1) 0%, transparent 70%)' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-4" style={{ color: '#FAFAF9', letterSpacing: '-0.015em' }}>
            Stop losing signal in the noise
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Free to use. No credit card required. Set up in two minutes.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-sm"
            style={{ background: '#D97706', color: 'white', boxShadow: '0 0 0 1px rgba(217,119,6,0.4), 0 4px 16px rgba(217,119,6,0.35)' }}
          >
            Get started free <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Logo variant="dark" size="sm" />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2025 Grain</p>
        </div>
      </footer>

    </div>
  )
}
