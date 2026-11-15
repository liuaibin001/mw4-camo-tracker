import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Crosshair,
  FileJson,
  HardDrive,
  ListFilter,
  LockKeyhole,
  Search,
  ShieldCheck,
  Star,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Breadcrumbs } from './layout'
import { AccountDialog } from './account-dialog'
import { CamoTile, ChallengeRequirements, CompletionCheckbox } from './camo-details'
import { JsonLd } from './json-ld'
import {
  DATA_DATE,
  classes,
  completionistImages,
  classLabels,
  communityReported,
  mastery,
  modeLabels,
  MODES,
  requirement,
  sources,
  weapons,
  type Challenge,
  type Mode,
  type Weapon,
} from '@/data/catalog'
import { csvDocument, gate, isDone, nextChallenge, totals, weaponCount } from '@/lib/progress'
import { useTracker } from '@/lib/tracker-context'
import { downloadFile } from '@/lib/download'
import { SITE_URL } from '@/lib/site'

export function ModeTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => {
        if (MODES.includes(value as Mode)) setMode(value as Mode)
      }}
    >
      <TabsList aria-label="Game mode">
        {MODES.map((m) => (
          <TabsTrigger key={m} value={m}>
            {modeLabels[m]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
export function ChallengeList({ weapon, mode }: { weapon: Weapon; mode: Mode }) {
  const { entries } = useTracker()
  return (
    <div className="challenge-groups">
      {[
        ['military', 'Military camos', 'Weapon-level milestones'],
        ['special', 'Special camos', 'Mode-specific conditions, one shared unlock'],
        ['completionist', 'Completionist camos', 'Complete the prerequisite, then the challenge'],
      ].map(([role, title, hint]) => (
        <section key={role} className="challenge-group">
          <div className="group-label">
            <h3>{title}</h3>
            <span>{hint}</span>
          </div>
          <div className={role === 'military' ? 'military-grid' : 'challenge-list'}>
            {weapon.challenges
              .filter((c) => c.role === role)
              .map((c) => {
                const info = gate(c, weapon, entries),
                  index = weapon.challenges.indexOf(c)
                return (
                  <div
                    key={c.id}
                    className="challenge-detail"
                    data-complete={isDone(entries, c.id)}
                  >
                    <CamoTile challenge={c} index={index} large weapon={weapon} mode={mode} />
                    <div>
                      <div className="challenge-name">
                        <strong>{c.name}</strong>
                        {communityReported(c, mode) && (
                          <span className="community-badge">Community-reported</span>
                        )}
                      </div>
                      <ChallengeRequirements challenge={c} mode={mode} />
                      {role !== 'military' && (
                        <span className={`prerequisite ${info.blocked ? 'is-blocked' : ''}`}>
                          {info.blocked ? <LockKeyhole size={12} /> : <CircleHelp size={12} />}{' '}
                          {info.label}
                        </span>
                      )}
                    </div>
                    <CompletionCheckbox challenge={c} weapon={weapon} compact />
                  </div>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}
function MasterySummary() {
  const { entries } = useTracker(),
    t = totals(entries)
  return (
    <section className="mastery-summary" aria-label="Completionist progress">
      {[
        {
          label: 'Gold',
          value: t.gold,
          total: 35,
          kind: 'gold',
          hint: '11 base camos + challenge',
        },
        {
          label: 'Platinum',
          value: t.platinum,
          total: 35,
          kind: 'platinum',
          hint: 'Class Gold prerequisite',
        },
        {
          label: 'Harmonic Break',
          value: t.harmonic,
          total: 33,
          kind: 'harmonic-break',
          hint: 'Goal: 33 completed weapons',
        },
        {
          label: 'Divergence',
          value: t.divergence ? 1 : 0,
          total: 1,
          kind: 'divergence',
          hint: 'Awarded at 33 Harmonic Break',
        },
      ].map((item, i) => (
        <div className="summary-card" key={item.kind}>
          <div className="summary-top">
            <span className={`mastery-emblem ${item.kind}`} aria-hidden="true">
              <img src={completionistImages[item.kind]} alt="" width={36} height={36} />
            </span>
            <span className="step-number">0{i + 1}</span>
          </div>
          <div className="summary-title">{item.label}</div>
          <div className="summary-value">
            {item.value}
            <span>/ {item.total}</span>
            {item.kind === 'divergence' && <span className="auto-label">AUTO</span>}
          </div>
          <div className="thin-progress">
            <span style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%` }} />
          </div>
          <p>{item.hint}</p>
        </div>
      ))}
    </section>
  )
}
function BackupDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { entries, importProgress, reset } = useTracker(),
    [error, setError] = useState(''),
    [resetOpen, setResetOpen] = useState(false),
    file = useRef<HTMLInputElement>(null)
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="backup-dialog">
          <DialogHeader>
            <DialogTitle>Your progress, portable.</DialogTitle>
            <DialogDescription>
              Keep a copy of your checklist. JSON restores progress; CSV opens in Excel or Google
              Sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="backup-options">
            <button
              onClick={() =>
                downloadFile(
                  JSON.stringify({ version: 1, entries }, null, 2),
                  `camofield-${new Date().toISOString().slice(0, 10)}.json`,
                  'application/json',
                )
              }
            >
              <FileJson size={21} />
              <span>
                <strong>Download JSON backup</strong>
                <small>Restorable, including unchecked entries</small>
              </span>
              <ArrowDownToLine size={16} />
            </button>
            <button
              onClick={() =>
                downloadFile(csvDocument(entries), 'mw4-camo-tracker.csv', 'text/csv;charset=utf-8')
              }
            >
              <ListFilter size={21} />
              <span>
                <strong>Export spreadsheet</strong>
                <small>All 490 weapon challenges + your progress</small>
              </span>
              <ArrowDownToLine size={16} />
            </button>
            <button onClick={() => file.current?.click()}>
              <Upload size={21} />
              <span>
                <strong>Import CamoField backup</strong>
                <small>Merges the entries in your JSON backup</small>
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
          <input
            type="file"
            accept=".json,application/json"
            ref={file}
            className="sr-only"
            aria-label="Import JSON backup"
            onChange={async (event) => {
              setError('')
              const selected = event.target.files?.[0]
              if (!selected) return
              try {
                if (selected.size > 100_000)
                  throw new Error('This file is too large (maximum 100 KB).')
                importProgress(JSON.parse(await selected.text()))
                toast.success('Backup merged. Existing entries absent from the backup are kept.')
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not import this file.')
              }
              event.target.value = ''
            }}
          />
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <p className="small muted">
            Import supports CamoField v1 JSON only. CSV is an export format. Keep backups private;
            they contain your checklist.
          </p>
          <button className="danger-link" onClick={() => setResetOpen(true)}>
            Reset this checklist…
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogTitle>Reset this checklist?</DialogTitle>
          <DialogDescription>
            All recorded camo unlocks will be marked incomplete. If you are signed in, this change
            syncs to your other devices.
          </DialogDescription>
          <Button
            variant="outline"
            onClick={() =>
              downloadFile(
                JSON.stringify({ version: 1, entries }, null, 2),
                'camofield-before-reset.json',
                'application/json',
              )
            }
          >
            Download a backup first
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              reset()
              setResetOpen(false)
              toast.success('Checklist reset. Your unchecked entries will sync.')
            }}
          >
            Reset all recorded unlocks
          </Button>
          <Button variant="ghost" onClick={() => setResetOpen(false)}>
            Keep my progress
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
export function Tracker() {
  const { entries, ready, saved, syncState, session, guestAvailable, bringGuest, sync } =
    useTracker()
  const [mode, setMode] = useState<Mode>('multiplayer'),
    [category, setCategory] = useState('all'),
    [query, setQuery] = useState(''),
    [sort, setSort] = useState('class'),
    [hideComplete, setHideComplete] = useState(false),
    [pinnedOnly, setPinnedOnly] = useState(false)
  const [pinned, setPinned] = useState<string[]>([]),
    [expanded, setExpanded] = useState<string | null>(null),
    [backup, setBackup] = useState(false),
    [account, setAccount] = useState(false)
  const t = totals(entries)
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem('camofield:pinned') || '[]')
      if (Array.isArray(v))
        setPinned(
          v.filter(
            (id): id is string => typeof id === 'string' && weapons.some((w) => w.id === id),
          ),
        )
    } catch {
      /* Pins are optional preferences. */
    }
  }, [])
  function pin(id: string) {
    setPinned((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem('camofield:pinned', JSON.stringify(next))
      } catch {
        toast.error('Could not save pinned weapons.')
      }
      return next
    })
  }
  let filtered = weapons.filter(
    (w) =>
      (category === 'all' || w.weaponClass === category) &&
      (!pinnedOnly || pinned.includes(w.id)) &&
      (!hideComplete || weaponCount(w, entries) < w.challenges.length) &&
      `${w.name} ${w.weaponClass}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  filtered = filtered.sort((a, b) => {
    const priority = Number(pinned.includes(b.id)) - Number(pinned.includes(a.id))
    if (priority) return priority
    if (sort === 'remaining')
      return (
        a.challenges.length -
          weaponCount(a, entries) -
          (b.challenges.length - weaponCount(b, entries)) || a.name.localeCompare(b.name)
      )
    if (sort === 'name') return a.name.localeCompare(b.name)
    return (
      classes.indexOf(a.weaponClass) - classes.indexOf(b.weaponClass) ||
      a.name.localeCompare(b.name)
    )
  })
  const focus =
    weapons.find((w) => pinned.includes(w.id) && weaponCount(w, entries) < w.challenges.length) ||
    filtered.find((w) => weaponCount(w, entries) < w.challenges.length) ||
    weapons.find((w) => weaponCount(w, entries) < w.challenges.length)
  const next = focus && nextChallenge(focus, entries)
  function openWeapon(w: Weapon) {
    setCategory('all')
    setQuery('')
    setPinnedOnly(false)
    setHideComplete(false)
    setExpanded(w.id)
    window.setTimeout(
      () =>
        document
          .getElementById(`weapon-${w.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      50,
    )
  }
  return (
    <div className="page-container tracker-page">
      <div className="page-topline">
        <Breadcrumbs items={[{ label: 'Camo tracker' }]} />
        <a className="season-stamp" href="/changelog">
          <span className="status-dot" />
          SEASON 01 <span className="stamp-separator">/</span> DATA REVIEWED NOV 15
        </a>
      </div>
      <section className="tracker-intro">
        <div>
          <div className="eyebrow">YOUR GRIND. A CLEARER ROUTE.</div>
          <h1>
            MW4 Camo Tracker<span className="title-dot">.</span>
          </h1>
          <p>
            Every weapon. Every challenge. Know what’s next.
            <br className="desktop-break" /> Track your Modern Warfare 4 camo grind, from Military
            to Divergence.
          </p>
        </div>
        <div className="intro-meta">
          <span className="intro-count">
            35<span>WEAPONS</span>
          </span>
          <span className="intro-divider" />
          <span className="intro-count">
            490<span>CHALLENGES</span>
          </span>
          <div className="intro-crosshair">
            <Crosshair strokeWidth={0.8} />
          </div>
        </div>
      </section>
      <MasterySummary />
      <div className="workspace-grid">
        <div className="tracker-main">
          <section className="arsenal-panel" aria-labelledby="arsenal-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">01 / WEAPON CHECKLIST</span>
                <h2 id="arsenal-title">
                  Your arsenal<span className="count-badge">{weapons.length}</span>
                </h2>
              </div>
              <Button variant="outline" onClick={() => setBackup(true)}>
                <ArrowDownToLine size={14} />
                Backup & export
              </Button>
            </div>
            <div className="mode-status">
              <ModeTabs mode={mode} setMode={setMode} />
              <span className={`save-status ${!saved ? 'save-error' : ''}`} aria-live="polite">
                <HardDrive size={12} />
                {!ready ? 'Loading save…' : saved ? 'Saved on this device' : 'Storage unavailable'}
              </span>
            </div>
            {focus && next && (
              <button className="mobile-focus" onClick={() => openWeapon(focus)}>
                <Crosshair size={18} />
                <span>
                  <small>NEXT IN YOUR SIGHTS / {focus.name}</small>
                  <strong>
                    {next.name} <span>· {requirement(next, mode)}</span>
                  </strong>
                </span>
                <ArrowRight size={15} />
              </button>
            )}
            {mode === 'warzone' && (
              <div className="inline-note">
                <CircleHelp size={14} />
                <span>
                  Some Warzone requirements are community-reported. Check the in-game challenge
                  before committing to a grind.
                </span>
              </div>
            )}
            <div className="filter-toolbar">
              <label className="search-field">
                <Search size={16} />
                <input
                  aria-label="Search weapons"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a weapon…"
                />
                {query && (
                  <button aria-label="Clear search" onClick={() => setQuery('')}>
                    <X size={13} />
                  </button>
                )}
              </label>
              <label className="sort-field">
                <span>Sort</span>
                <select
                  aria-label="Sort weapons"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="class">Weapon class</option>
                  <option value="remaining">Fewest left</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
            <div className="class-filters" aria-label="Weapon class">
              <button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
                All weapons <span>35</span>
              </button>
              {classes.map((c) => (
                <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
                  {classLabels[c]} <span>{weapons.filter((w) => w.weaponClass === c).length}</span>
                </button>
              ))}
            </div>
            <div className="checklist-options">
              <div>
                <button
                  className={pinnedOnly ? 'option-active' : ''}
                  aria-pressed={pinnedOnly}
                  onClick={() => setPinnedOnly(!pinnedOnly)}
                >
                  <Star size={13} fill={pinnedOnly ? 'currentColor' : 'none'} />
                  Pinned{pinned.length > 0 && ` (${pinned.length})`}
                </button>
                <label>
                  <input
                    type="checkbox"
                    checked={hideComplete}
                    onChange={(e) => setHideComplete(e.target.checked)}
                  />
                  Hide completed
                </label>
              </div>
              <span>{filtered.length} weapons</span>
            </div>
            <div className="camo-table-heading" aria-hidden="true">
              <span>WEAPON</span>
              <div>
                <span>
                  MILITARY <i>8</i>
                </span>
                <span>
                  SPECIAL <i>3</i>
                </span>
                <span>
                  COMPLETIONIST <i>3</i>
                </span>
              </div>
              <span>DONE</span>
            </div>
            <div className="weapon-list">
              {filtered.map((w) => {
                const count = weaponCount(w, entries),
                  isExpanded = expanded === w.id
                return (
                  <article
                    className="weapon-row"
                    key={w.id}
                    id={`weapon-${w.id}`}
                    data-expanded={isExpanded}
                  >
                    <div className="weapon-row-top">
                      <div className="weapon-identity">
                        <button
                          className="pin-button"
                          aria-label={`${pinned.includes(w.id) ? 'Unpin' : 'Pin'} ${w.name}`}
                          aria-pressed={pinned.includes(w.id)}
                          onClick={() => pin(w.id)}
                        >
                          <Star size={14} fill={pinned.includes(w.id) ? 'currentColor' : 'none'} />
                        </button>
                        <a
                          className="weapon-thumbnail"
                          href={`/weapons/${w.id}`}
                          aria-label={`${w.name} weapon guide`}
                        >
                          <img
                            src={w.thumbnail}
                            alt={`${w.name} weapon`}
                            loading="lazy"
                            decoding="async"
                            width={96}
                            height={48}
                          />
                        </a>
                        <div>
                          <a className="weapon-name" href={`/weapons/${w.id}`}>
                            {w.name}
                          </a>
                          <span className="weapon-class">{w.weaponClass}</span>
                        </div>
                      </div>
                      <div className="camo-strip">
                        {[
                          ['military', 'Military', 8],
                          ['special', 'Special', 3],
                          ['completionist', 'Completionist', 3],
                        ].map(([role, label, count]) => (
                          <div className="camo-group" data-role={role} key={role}>
                            <span className="camo-group-label">
                              {label} <small>{count}</small>
                            </span>
                            <div className="camo-group-items">
                              {w.challenges
                                .filter((c) => c.role === role)
                                .map((c) => (
                                  <CamoTile
                                    key={c.id}
                                    challenge={c}
                                    index={w.challenges.indexOf(c)}
                                    weapon={w}
                                    mode={mode}
                                  />
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="row-end">
                        <span className="weapon-done" data-full={count === 14}>
                          {count}
                          <small>/14</small>
                        </span>
                        <button
                          aria-label={`${isExpanded ? 'Hide' : 'View'} ${w.name} challenges`}
                          aria-expanded={isExpanded}
                          aria-controls={`challenges-${w.id}`}
                          className="expand-button"
                          onClick={() => setExpanded(isExpanded ? null : w.id)}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="weapon-expanded" id={`challenges-${w.id}`}>
                        <div className="expanded-heading">
                          <span>CHALLENGE BRIEF / {modeLabels[mode].toUpperCase()}</span>
                          <a href={`/weapons/${w.id}`}>
                            Full weapon guide <ArrowRight size={13} />
                          </a>
                        </div>
                        <ChallengeList weapon={w} mode={mode} />
                        <p className="small muted">
                          Click an image for its full brief. Use the checkbox to record an in-game
                          unlock. Recording a later camo does not fill earlier records.
                        </p>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
            {!filtered.length && (
              <div className="empty-state">
                <Search size={27} />
                <h3>No weapons in this view.</h3>
                <p>Try a different search or clear your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                    setHideComplete(false)
                    setPinnedOnly(false)
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
            <div className="table-footnote">
              <span>
                <Check size={12} />
                Click an image for details. Check an unlock in its brief.
              </span>
              <a href="/guides/camo-challenges">
                How progression works <ArrowRight size={12} />
              </a>
            </div>
          </section>
          <section className="mode-mastery-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">02 / BEYOND DIVERGENCE</span>
                <h2>{modeLabels[mode]} Mastery</h2>
              </div>
              <a href="/guides/mastery-camos">
                View routes <ArrowRight size={14} />
              </a>
            </div>
            <p className="section-copy">
              Mode-specific, account-wide goals. These are separate from your 490 weapon challenge
              records.
            </p>
            <div className="mode-mastery-cards">
              {mastery
                .filter((c) => c.trackKey === mode)
                .map((c, i) => {
                  const info = gate(c, undefined, entries)
                  return (
                    <div className="mode-mastery-card" key={c.id}>
                      <div className="mastery-card-top">
                        <CamoTile challenge={c} index={i + 11} large mode={mode} />
                        <span>0{i + 1}</span>
                      </div>
                      <h3>{c.name}</h3>
                      <p>{requirement(c, mode)}</p>
                      {communityReported(c, mode) && (
                        <span className="community-badge">Community-reported</span>
                      )}
                      <CompletionCheckbox challenge={c} />
                      <div className="mastery-prereq">
                        <LockKeyhole size={12} />
                        {info.label}
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        </div>
        <aside className="field-sidebar">
          <div className="sidebar-sticky">
            <section className="next-task">
              <div className="aside-heading">
                <Crosshair size={17} />
                <span>NEXT IN YOUR SIGHTS</span>
                <span className="live-dot" />
              </div>
              {focus && next ? (
                <>
                  <span className="focus-class">{focus.weaponClass}</span>
                  <h2>{focus.name}</h2>
                  <div className="next-task-camo">
                    <span className="small muted">Next unrecorded camo</span>
                    <strong>{next.name}</strong>
                    <p>{requirement(next, mode)}</p>
                  </div>
                  <div className="next-prereq">{gate(next, focus, entries).label}</div>
                  <Button className="w-full" onClick={() => openWeapon(focus)}>
                    View challenges <ArrowRight size={14} />
                  </Button>
                </>
              ) : (
                <>
                  <h2>Arsenal complete.</h2>
                  <p>All weapon challenges are recorded. Your mode Mastery routes are next.</p>
                </>
              )}
            </section>
            <section className="overall-progress">
              <div className="aside-section-title">
                <h3>The full picture</h3>
                <span>{Math.round((t.completed / t.total) * 100)}%</span>
              </div>
              <div className="progress-blocks" aria-hidden="true">
                {Array.from({ length: 40 }, (_, i) => (
                  <span key={i} data-filled={i < (t.completed / t.total) * 40} />
                ))}
              </div>
              <p>
                <strong>{t.completed.toLocaleString()}</strong> of {t.total} weapon challenges
                recorded
              </p>
            </section>
            <section className="sync-card">
              <div className="aside-section-title">
                <h3>
                  <Cloud size={15} />
                  {session.data ? 'Cloud checklist' : 'Keep your progress'}
                </h3>
                <ShieldCheck size={14} />
              </div>
              <p>
                {session.data
                  ? syncState === 'synced'
                    ? 'Your account progress is synced.'
                    : syncState === 'syncing'
                      ? 'Saving your account progress…'
                      : syncState === 'offline'
                        ? 'You’re offline. Your changes are saved on this device.'
                        : 'Sync needs attention. Device progress is still available.'
                  : 'Your checklist saves in this browser. Create a free account to continue on another device.'}
              </p>
              {session.data ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void sync()}
                  disabled={syncState === 'syncing'}
                >
                  {syncState === 'syncing' ? 'Syncing…' : 'Sync now'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setAccount(true)}>
                  Enable free cloud sync <ArrowRight size={13} />
                </Button>
              )}
              {guestAvailable && (
                <button className="text-button small" onClick={bringGuest}>
                  Merge guest progress into account →
                </button>
              )}
            </section>
            <section className="field-notes">
              <div className="aside-section-title">
                <h3>Field notes</h3>
                <span className="small muted">NOV 15</span>
              </div>
              <a href="/guides/not-tracking">
                <span className="note-tag">PATCH / NOV 13</span>
                <strong>Osprey & CSG-35 fixes</strong>
                <p>Special camo visibility was fixed Nov 13; Platinum tracking was fixed Nov 10.</p>
                <span className="note-link">
                  Check the fix timeline <ArrowRight size={12} />
                </span>
              </a>
              <a href="/sources">
                <span className="note-tag">DATA CONFIDENCE</span>
                <strong>Know what’s confirmed.</strong>
                <p>Source dates and uncertain seasonal requirements stay visible.</p>
                <span className="note-link">
                  Our data policy <ArrowRight size={12} />
                </span>
              </a>
            </section>
          </div>
        </aside>
      </div>
      <section className="field-guide-teasers">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / THE FIELD GUIDE</span>
            <h2>Less guessing. More progress.</h2>
          </div>
        </div>
        <div className="guide-card-grid">
          {[
            [
              '01',
              'Camo unlock order',
              'From your first Military camo to the 33-weapon Divergence milestone.',
              '/guides/camo-challenges',
            ],
            [
              '02',
              'Camos not tracking?',
              'Check prerequisites and the dated official fix timeline.',
              '/guides/not-tracking',
            ],
            [
              '03',
              'Take it to a spreadsheet',
              'Export every weapon challenge to CSV, or keep a restorable JSON backup.',
              '/guides/spreadsheet',
            ],
          ].map(([n, title, copy, href]) => (
            <a href={href} className="guide-card" key={n}>
              <span>{n} / BRIEFING</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ArrowRight size={18} />
            </a>
          ))}
        </div>
      </section>
      <TrackerExplainer />
      <AccountDialog open={account} onOpenChange={setAccount} />
      <BackupDialog open={backup} onOpenChange={setBackup} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'MW4 Camo Tracker by CamoField',
          url: SITE_URL,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any modern web browser',
          description:
            'A free manual Modern Warfare 4 camo checklist with device saving, JSON backups, CSV export, and optional account sync.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          featureList: [
            '35 weapons and 490 weapon challenge records',
            'Military, Special and Completionist camos',
            'Mode-specific Mastery checklists',
            'JSON backups and CSV export',
            'Optional free cloud account sync',
          ],
        }}
      />
    </div>
  )
}
const faqs = [
  [
    'Is this MW4 camo tracker free?',
    'Yes. The weapon checklist, device saves, CSV export, JSON backups and optional account sync are free. You can start without signing in.',
  ],
  [
    'Does CamoField automatically read my game?',
    'No. This is a manual checklist. Open a camo’s brief and check it when you unlock it in game. CamoField does not connect to your Activision account or read your game screen.',
  ],
  [
    'How many weapon camos are on the checklist?',
    'The current catalogue has 35 weapons, each with 8 Military camos, 3 Special camos, Gold, Platinum and Harmonic Break: 490 weapon challenge records. Divergence is a separate automatic milestone at 33 Harmonic Break completions.',
  ],
  [
    'Is camo progress shared across Multiplayer, DMZ and Warzone?',
    'The basic weapon camo grind is shared. Complete a challenge through an applicable mode to unlock that camo across modes. The final Mastery routes are mode-specific. Some Warzone conditions in this catalogue remain community-reported.',
  ],
  [
    'Can I move progress to another device?',
    'Create an account to use cloud sync, or export a CamoField JSON backup and import it on another device. Guest saves belong to one browser. Clearing browser storage can remove those saves.',
  ],
  [
    'Does checking Gold also complete the earlier camos?',
    'No. Each tile is an independent record. You can record unlocks you already earned out of order; prerequisite notes explain the game rules. Account sync keeps the most recent edit to each entry, including an unchecked entry.',
  ],
]
function TrackerExplainer() {
  return (
    <section className="tracker-explainer">
      <div className="explainer-copy">
        <span className="eyebrow">A TRACKER BUILT FOR THE ACTUAL GRIND</span>
        <h2>Track MW4 camos without losing the thread.</h2>
        <p>
          CamoField brings the Modern Warfare 4 weapon camo checklist and challenge requirements
          into one compact view. Filter by class, pin the weapons you are working on, switch the
          challenge text between Multiplayer, DMZ and Warzone, and record only the unlocks you have
          earned.
        </p>
        <p>
          The shared path runs through eight Military camos, three Special camos, Gold, Platinum and
          Harmonic Break. Completing 33 Harmonic Break challenges awards Divergence and opens the
          final mode-specific Mastery routes. Weapon-class prerequisites can change with seasonal
          additions; we flag the gaps rather than calculate a skip route from the number of weapons
          in a list.
        </p>
        <p>
          Reviewed {DATA_DATE}. Challenge data uses the{' '}
          <a href={sources.catalog} target="_blank" rel="noopener noreferrer">
            MW4.GG community catalogue
          </a>
          , with context from{' '}
          <a href={sources.codmunity} target="_blank" rel="noopener noreferrer">
            CODMunity
          </a>
          ,{' '}
          <a href={sources.wzhub} target="_blank" rel="noopener noreferrer">
            WZHUB
          </a>{' '}
          and the{' '}
          <a href={sources.official} target="_blank" rel="noopener noreferrer">
            official progression guide
          </a>
          . See the <a href="/sources">source and correction policy</a> for confidence labels and
          current limitations.
        </p>
      </div>
      <div className="faq-list">
        <h2>Common questions</h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <ChevronDown size={15} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(([q, a]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />
    </section>
  )
}
