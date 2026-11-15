import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from './auth-client'
import {
  emptyDocument,
  mergeEntries,
  parseDocument,
  type Entries,
  type ProgressDocument,
} from './progress'

type SyncState = 'guest' | 'syncing' | 'synced' | 'offline' | 'error'
interface TrackerState {
  entries: Entries
  ready: boolean
  saved: boolean
  syncState: SyncState
  guestAvailable: boolean
  toggle: (id: string) => void
  importProgress: (document: unknown) => void
  reset: () => void
  bringGuest: () => void
  sync: () => Promise<void>
  session: ReturnType<typeof authClient.useSession>
}
const Context = createContext<TrackerState | null>(null)
const guestKey = 'camofield:progress:guest:v1'
function readLocal(key: string): ProgressDocument {
  const raw = localStorage.getItem(key)
  if (!raw) return emptyDocument()
  try {
    return parseDocument(JSON.parse(raw))
  } catch {
    // Keep the original bytes recoverable before starting a clean checklist.
    localStorage.setItem(`${key}:recovery:${Date.now()}`, raw)
    toast.error(
      'A damaged save was preserved in browser recovery storage. Import a backup to restore it.',
    )
    return emptyDocument()
  }
}
export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession()
  const userId = session.data?.user.id
  const [entries, setEntries] = useState<Entries>({})
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>('guest')
  const [guestAvailable, setGuestAvailable] = useState(false)
  const current = useRef<Entries>({}),
    storageKey = useRef(''),
    activeUser = useRef<string | undefined>(undefined)
  const dirty = useRef(false),
    inFlight = useRef(false),
    syncRef = useRef<() => Promise<void>>(async () => {})
  const save = useCallback((next: Entries) => {
    current.current = next
    setEntries(next)
    try {
      localStorage.setItem(storageKey.current, JSON.stringify({ version: 1, entries: next }))
      setSaved(true)
    } catch {
      setSaved(false)
      toast.error('Browser storage is unavailable. Export a backup before leaving.')
    }
  }, [])
  const sync = useCallback(async () => {
    if (!activeUser.current || !storageKey.current || inFlight.current) return
    const startedKey = storageKey.current
    inFlight.current = true
    let retryPendingEdit = false
    setSyncState('syncing')
    try {
      const response = await fetch('/api/progress', { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not read cloud progress.')
      let remote = (await response.json()) as { document: unknown; revision: number }
      for (let attempt = 0; attempt < 4; attempt++) {
        if (storageKey.current !== startedKey) return
        const merged = mergeEntries(parseDocument(remote.document).entries, current.current)
        const sent = JSON.stringify({ version: 1, entries: merged })
        const result = await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document: JSON.parse(sent), expectedRevision: remote.revision }),
        })
        if (storageKey.current !== startedKey) return
        if (result.status === 409) {
          remote = await result.json()
          continue
        }
        if (!result.ok) throw new Error('Could not save cloud progress.')
        const latest = mergeEntries(merged, current.current)
        dirty.current = JSON.stringify({ version: 1, entries: latest }) !== sent
        retryPendingEdit = dirty.current
        save(latest)
        setSyncState('synced')
        return
      }
      throw new Error('Progress is changing on another device. Try syncing again.')
    } catch {
      if (storageKey.current === startedKey) setSyncState(navigator.onLine ? 'error' : 'offline')
    } finally {
      inFlight.current = false
      if (storageKey.current !== startedKey || retryPendingEdit)
        window.setTimeout(() => void syncRef.current(), 1200)
    }
  }, [save])
  syncRef.current = sync
  useEffect(() => {
    if (session.isPending) return
    const key = userId ? `camofield:progress:user:${userId}:v1` : guestKey
    activeUser.current = userId
    storageKey.current = key
    dirty.current = false
    try {
      const local = readLocal(key)
      current.current = local.entries
      setEntries(local.entries)
      setSaved(true)
      setGuestAvailable(!!userId && Object.values(readLocal(guestKey).entries).some((e) => e.done))
    } catch {
      current.current = {}
      setEntries({})
      setSaved(false)
    }
    setReady(true)
    setSyncState(userId ? 'syncing' : 'guest')
    if (userId) void sync()
  }, [userId, session.isPending, sync])
  useEffect(() => {
    if (!ready || !userId || !dirty.current) return
    const timer = window.setTimeout(() => void sync(), 1000)
    return () => clearTimeout(timer)
  }, [entries, ready, userId, sync])
  useEffect(() => {
    function storage(event: StorageEvent) {
      if (event.key !== storageKey.current || !event.newValue) return
      try {
        save(mergeEntries(current.current, parseDocument(JSON.parse(event.newValue)).entries))
      } catch {
        /* Ignore unrelated or malformed tab writes. */
      }
    }
    const online = () => void sync()
    const visibility = () => {
      if (document.visibilityState === 'visible') void sync()
    }
    window.addEventListener('storage', storage)
    window.addEventListener('online', online)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('storage', storage)
      window.removeEventListener('online', online)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [save, sync])
  function commit(next: Entries) {
    dirty.current = true
    save(next)
  }
  function importProgress(value: unknown) {
    const parsed = parseDocument(value)
    const now = Date.now(),
      imported: Entries = {}
    for (const [key, e] of Object.entries(parsed.entries))
      imported[key] = {
        done: e.done,
        updatedAt: Math.max(now, (current.current[key]?.updatedAt || 0) + 1),
      }
    commit(mergeEntries(current.current, imported))
  }
  function reset() {
    const now = Date.now(),
      next = { ...current.current }
    for (const key of Object.keys(next))
      next[key] = { done: false, updatedAt: Math.max(now, next[key].updatedAt + 1) }
    commit(next)
  }
  function bringGuest() {
    try {
      importProgress(readLocal(guestKey))
      setGuestAvailable(false)
      toast.success('Guest progress merged into this account.')
    } catch {
      toast.error('Could not read guest progress.')
    }
  }
  return (
    <Context.Provider
      value={{
        entries,
        ready,
        saved,
        syncState,
        guestAvailable,
        session,
        sync,
        bringGuest,
        reset,
        importProgress,
        toggle(id) {
          if (!ready) return
          commit({
            ...current.current,
            [id]: {
              done: !current.current[id]?.done,
              updatedAt: Math.max(Date.now(), (current.current[id]?.updatedAt || 0) + 1),
            },
          })
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useTracker() {
  const value = useContext(Context)
  if (!value) throw new Error('TrackerProvider is required')
  return value
}
