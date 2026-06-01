import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  KeyRound,
  Loader2,
  Play,
  Search,
  Sparkles,
  Trash2,
  XCircle,
  Activity,
  Database,
  ShieldCheck,
} from 'lucide-react'
import { api } from './api.js'

const today = new Date().toISOString().slice(0, 10)
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const emptyForm = {
  start_date: lastWeek,
  end_date: today,
  keywordsText: '',
  contextsText: '',
  hashtagsText: '',
  actorsText: '',
  lang: 'id',
  limit_per_category: 100,
  include_retweets: false,
  debug_raw_sample: false,
  raw_query: '',
  output_name: 'twitter_dataset.csv',
}

function splitLines(value) {
  return value.split(/\n|,/).map((x) => x.trim()).filter(Boolean)
}

function toScrapePayload(form) {
  const rawQuery = form.raw_query.trim()
  return {
    start_date: rawQuery ? null : form.start_date,
    end_date: rawQuery ? null : form.end_date,
    keywords: splitLines(form.keywordsText),
    contexts: splitLines(form.contextsText),
    hashtags: splitLines(form.hashtagsText),
    actors: splitLines(form.actorsText),
    lang: form.lang,
    limit_per_category: Number(form.limit_per_category),
    include_retweets: form.include_retweets,
    debug_raw_sample: form.debug_raw_sample,
    raw_query: rawQuery || null,
    output_name: form.output_name || 'twitter_dataset.csv',
  }
}

function StatusBadge({ status }) {
  const cls = {
    queued: 'border-amber-400/30 bg-amber-400/10 text-amber-200 shadow-amber-400/10',
    running: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-cyan-400/10 animate-soft-pulse',
    completed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-emerald-400/10',
    failed: 'border-rose-400/30 bg-rose-400/10 text-rose-200 shadow-rose-400/10',
  }[status] || 'border-white/10 bg-white/5 text-slate-200'

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] shadow-lg ${cls}`}>{status}</span>
}

function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-50',
    error: 'border-rose-400/20 bg-rose-400/10 text-rose-50',
  }
  const Icon = type === 'error' ? XCircle : type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div className={`motion-enter flex gap-3 rounded-2xl border p-4 text-sm shadow-xl backdrop-blur ${styles[type]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

function Shell({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="orb orb-three" />
      <div className="noise" />
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </main>
  )
}

function Header({ backendOk }) {
  return (
    <header className="motion-enter mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100 shadow-2xl backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5" /> X Dataset Studio
        </div>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Scrape cleaner Twitter/X datasets.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          A separated React frontend with polished motion, cookie auth tools, query preview, live job tracking, and CSV download flow.
        </p>
      </div>
      <div className="glass-panel min-w-64 p-4">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>Backend</span>
          <span className={backendOk ? 'text-emerald-300' : 'text-rose-300'}>{backendOk ? 'Online' : 'Offline'}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full transition-all duration-700 ${backendOk ? 'w-full bg-gradient-to-r from-emerald-300 to-cyan-300' : 'w-1/3 bg-gradient-to-r from-rose-400 to-amber-300'}`} />
        </div>
      </div>
    </header>
  )
}

function FeatureStrip() {
  const items = [
    { icon: ShieldCheck, label: 'Cookie auth', text: 'Manage twscrape accounts' },
    { icon: Search, label: 'Query builder', text: 'Structured or raw X search' },
    { icon: Activity, label: 'Live jobs', text: 'Polling status cards' },
    { icon: Database, label: 'CSV ready', text: 'Clean full_text + # hashtags' },
  ]
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className="glass-panel motion-enter group p-4" style={{ animationDelay: `${index * 70}ms` }}>
          <item.icon className="mb-4 h-5 w-5 text-cyan-200 transition duration-300 group-hover:scale-110 group-hover:text-white" />
          <div className="font-bold text-white">{item.label}</div>
          <div className="mt-1 text-sm text-slate-400">{item.text}</div>
        </div>
      ))}
    </div>
  )
}

function AuthPanel() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [cookies, setCookies] = useState('')
  const [replace, setReplace] = useState(false)
  const [verifyQuery, setVerifyQuery] = useState('from:TwitterDev')
  const [message, setMessage] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      setStatus(await api.authStatus())
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function addCookie(e) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await api.addCookie({ username, cookies, replace })
      setMessage({ type: 'success', text: res.message })
      setCookies('')
      await refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function verify() {
    setMessage(null)
    setLoading(true)
    try {
      const res = await api.verifyAuth({ query: verifyQuery, limit: 1 })
      setMessage(res.success
        ? { type: 'success', text: `Verified. Fetched ${res.tweets_fetched} tweet(s). Sample: ${res.sample || '(no text)'}` }
        : { type: 'error', text: res.error || 'Verification failed' })
      await refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function deleteAccount(accountName) {
    if (!confirm(`Delete account ${accountName}?`)) return
    setLoading(true)
    try {
      const res = await api.deleteAccount(accountName)
      setMessage({ type: 'success', text: res.message })
      await refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card motion-enter">
      <PanelTitle icon={KeyRound} title="Authentication" subtitle="Store cookie auth in twscrape accounts.db. Requires auth_token and ct0." action={<button className="btn-secondary" onClick={refresh} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}</button>} />

      {message && <div className="mb-4"><Alert type={message.type}>{message.text}</Alert></div>}

      <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="grid grid-cols-5 gap-2 bg-white/[0.06] px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <div>Username</div><div>Active</div><div>Login</div><div>Req</div><div></div>
        </div>
        {(status?.accounts || []).map((account) => (
          <div key={account.username} className="grid grid-cols-5 gap-2 border-t border-white/10 px-3 py-3 text-sm text-slate-200 transition hover:bg-white/[0.04]">
            <div className="font-semibold text-white">{account.username}</div>
            <div className={account.active ? 'text-emerald-300' : 'text-rose-300'}>{account.active ? 'yes' : 'no'}</div>
            <div>{account.logged_in ? 'yes' : 'no'}</div>
            <div>{account.total_req}</div>
            <button className="justify-self-end text-rose-300 transition hover:scale-110 hover:text-rose-100" onClick={() => deleteAccount(account.username)}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {status?.accounts?.length === 0 && <div className="px-3 py-5 text-sm text-slate-400">No accounts yet.</div>}
      </div>

      <form onSubmit={addCookie} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Username"><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_x_username" required /></Field>
          <label className="flex items-end gap-3 pb-3 text-sm text-slate-300"><input className="accent-cyan-300" type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} /> Replace existing account</label>
        </div>
        <Field label="Cookie string">
          <textarea
            className="input min-h-28 font-mono text-xs leading-6"
            value={cookies}
            onChange={(e) => setCookies(e.target.value)}
            placeholder="auth_token=YOUR_AUTH_TOKEN_HERE; ct0=YOUR_CT0_CSRF_TOKEN_HERE; guest_id=v1%3A1234567890; twid=u%3D1234567890"
            required
          />
          <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-xs leading-6 text-slate-300">
            <div className="mb-1 font-bold uppercase tracking-[0.16em] text-cyan-200">Example format</div>
            <code className="block break-all text-slate-100">auth_token=abc123...; ct0=xyz789...; guest_id=v1%3A1234567890; twid=u%3D1234567890</code>
            <p className="mt-2 text-slate-400">Minimum required cookies are <span className="text-slate-200">auth_token</span> and <span className="text-slate-200">ct0</span>. Paste the full Cookie request header from your logged-in X/Twitter browser session if available.</p>
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" disabled={loading || !username || !cookies}>Save cookies</button>
          <input className="input max-w-xs" value={verifyQuery} onChange={(e) => setVerifyQuery(e.target.value)} />
          <button type="button" className="btn-secondary" onClick={verify} disabled={loading}>Verify auth</button>
        </div>
      </form>
    </section>
  )
}

function ScrapePanel({ onJobStarted }) {
  const [form, setForm] = useState(emptyForm)
  const [queries, setQueries] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const payload = useMemo(() => toScrapePayload(form), [form])
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  async function preview() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.previewQuery(payload)
      setQueries(res.queries)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function start(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.startScrape(payload)
      setMessage({ type: 'success', text: `Started job ${res.job_id}` })
      onJobStarted(res.job_id)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card motion-enter delay-2">
      <PanelTitle icon={Search} title="Scrape job" subtitle="Use a raw query, or structured fields with date range, keywords, contexts, hashtags, and actors." />
      {message && <div className="mb-4"><Alert type={message.type}>{message.text}</Alert></div>}
      <form onSubmit={start} className="space-y-4">
        <Field label="Raw query (optional, overrides structured fields)">
          <input className="input input-lg" value={form.raw_query} onChange={(e) => setField('raw_query', e.target.value)} placeholder='e.g. "machine learning" lang:en since:2026-01-01 until:2026-01-08' />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Start date"><input className="input" type="date" value={form.start_date} disabled={!!form.raw_query.trim()} onChange={(e) => setField('start_date', e.target.value)} /></Field>
          <Field label="End date"><input className="input" type="date" value={form.end_date} disabled={!!form.raw_query.trim()} onChange={(e) => setField('end_date', e.target.value)} /></Field>
          <Field label="Language"><input className="input" value={form.lang} onChange={(e) => setField('lang', e.target.value)} placeholder="id, en, ja" /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextArea label="Keywords" value={form.keywordsText} onChange={(v) => setField('keywordsText', v)} placeholder="one per line or comma separated" />
          <TextArea label="Contexts" value={form.contextsText} onChange={(v) => setField('contextsText', v)} placeholder="related terms" />
          <TextArea label="Hashtags" value={form.hashtagsText} onChange={(v) => setField('hashtagsText', v)} placeholder="#ai, #health" />
          <TextArea label="Actors" value={form.actorsText} onChange={(v) => setField('actorsText', v)} placeholder="@username or names" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Limit per category"><input className="input" type="number" min="1" max="10000" value={form.limit_per_category} onChange={(e) => setField('limit_per_category', e.target.value)} /></Field>
          <Field label="Output CSV name"><input className="input" value={form.output_name} onChange={(e) => setField('output_name', e.target.value)} /></Field>
          <div className="flex flex-col justify-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <label className="flex gap-3"><input className="accent-cyan-300" type="checkbox" checked={form.include_retweets} onChange={(e) => setField('include_retweets', e.target.checked)} /> Include retweets</label>
            <label className="flex gap-3"><input className="accent-cyan-300" type="checkbox" checked={form.debug_raw_sample} onChange={(e) => setField('debug_raw_sample', e.target.checked)} /> Debug raw sample</label>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={preview} disabled={loading}>Preview query</button>
          <button className="btn-primary" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start scraping</button>
        </div>
      </form>
      {queries && <QueryPreview queries={queries} />}
    </section>
  )
}

function PanelTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-black text-white"><Icon className="h-5 w-5 text-cyan-200" /> {title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function Field({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>
}

function TextArea({ label, value, onChange, placeholder }) {
  return <Field label={label}><textarea className="input min-h-24" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></Field>
}

function QueryPreview({ queries }) {
  return (
    <div className="motion-enter mt-5 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl">
      <h3 className="mb-3 font-bold text-white">Generated queries</h3>
      <div className="space-y-3">
        {Object.entries(queries).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{key}</div>
            <pre className="overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/50 p-3 text-xs leading-6 text-slate-200">{value}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function JobTracker({ jobId }) {
  const [job, setJob] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jobId) return
    setJob(null)
    setError(null)
    let cancelled = false
    async function poll() {
      try {
        const res = await api.getJob(jobId)
        if (!cancelled) setJob(res)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    poll()
    const timer = setInterval(poll, 2500)
    return () => { cancelled = true; clearInterval(timer) }
  }, [jobId])

  return (
    <section className="card motion-enter delay-1">
      <PanelTitle icon={Activity} title="Job tracker" subtitle="Watch progress and download the generated CSV when complete." />
      {!jobId && <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">Start a scrape job to see live progress here.</p>}
      {jobId && !job && !error && (
        <div className="motion-enter rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
          <div className="mb-4 flex items-center gap-3 text-cyan-100">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div>
              <div className="font-bold">Starting tracker...</div>
              <div className="mt-1 text-sm text-slate-400">Polling job status for <span className="font-mono text-slate-200">{jobId}</span></div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="tracker-loading-bar h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400" />
          </div>
        </div>
      )}
      {error && <Alert type="error">{error}</Alert>}
      {job && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-400">Job ID <span className="font-mono text-slate-200">{job.job_id}</span></div>
            <StatusBadge status={job.status} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Category" value={job.progress.current_category || '-'} />
            <Metric label="Category rows" value={job.progress.collected_rows} />
            <Metric label="Total rows" value={job.progress.total_rows} />
          </div>
          {job.error && <Alert type="error">{job.error}</Alert>}
          {job.status === 'completed' && <a className="btn-primary" href={api.downloadUrl(job.job_id)}><Download className="h-4 w-4" /> Download CSV</a>}
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"><div className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</div><div className="mt-2 font-black text-white">{value}</div></div>
}

export default function App() {
  const [backendOk, setBackendOk] = useState(false)
  const [jobId, setJobId] = useState('')

  useEffect(() => {
    api.health().then(() => setBackendOk(true)).catch(() => setBackendOk(false))
  }, [])

  return (
    <Shell>
      <Header backendOk={backendOk} />
      <FeatureStrip />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <AuthPanel />
          <JobTracker jobId={jobId} />
        </div>
        <ScrapePanel onJobStarted={setJobId} />
      </div>
    </Shell>
  )
}
