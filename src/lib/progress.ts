import {
  allChallenges,
  challengeById,
  communityReported,
  DATA_DATE,
  CATALOG_VERSION,
  weapons,
  type Challenge,
  type Mode,
  type Weapon,
} from '../data/catalog'

export interface Entry {
  done: boolean
  updatedAt: number
}
export type Entries = Record<string, Entry>
export interface ProgressDocument {
  version: 1
  entries: Entries
}
export const emptyDocument = (): ProgressDocument => ({ version: 1, entries: {} })
export const isDone = (entries: Entries, id: string) => entries[id]?.done === true
export const weaponCount = (w: Weapon, entries: Entries) =>
  w.challenges.filter((c) => isDone(entries, c.id)).length
export function mergeEntries(a: Entries, b: Entries): Entries {
  const result = { ...a }
  for (const [key, value] of Object.entries(b)) {
    // A false entry is a tombstone: unticking on another device must survive a merge.
    if (
      !result[key] ||
      value.updatedAt > result[key].updatedAt ||
      (value.updatedAt === result[key].updatedAt && !value.done)
    )
      result[key] = value
  }
  return result
}
export function parseDocument(value: unknown, now = Date.now()): ProgressDocument {
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('entries' in value) ||
    !value.entries ||
    typeof value.entries !== 'object' ||
    Array.isArray(value.entries)
  )
    throw new Error('This is not a CamoField v1 backup.')
  const entries: Entries = {}
  const pairs = Object.entries(value.entries)
  if (pairs.length > allChallenges.length) throw new Error('The backup contains too many entries.')
  for (const [key, entry] of pairs) {
    if (!challengeById.has(key)) throw new Error(`Unknown challenge: ${key}`)
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.done !== 'boolean' ||
      !Number.isSafeInteger(entry.updatedAt) ||
      entry.updatedAt < 0 ||
      entry.updatedAt > now + 60_000
    )
      throw new Error('The backup contains an invalid progress entry.')
    entries[key] = { done: entry.done, updatedAt: Math.min(entry.updatedAt, now) }
  }
  return { version: 1, entries }
}
export function totals(entries: Entries) {
  const count = (tier: string) =>
    weapons.filter((w) => w.challenges.some((c) => c.tierKey === tier && isDone(entries, c.id)))
      .length
  const gold = count('gold'),
    platinum = count('platinum'),
    harmonic = count('harmonic-break')
  return {
    gold,
    platinum,
    harmonic,
    divergence: harmonic >= 33,
    completed: weapons.reduce((n, w) => n + weaponCount(w, entries), 0),
    total: weapons.reduce((n, w) => n + w.challenges.length, 0),
  }
}
export function gate(
  c: Challenge,
  w: Weapon | undefined,
  entries: Entries,
): { label: string; blocked: boolean; uncertain?: boolean } {
  if (c.role === 'military') return { label: c.description, blocked: false }
  if (c.role === 'special')
    return {
      label: c.unlockLevel
        ? `Reach weapon level ${c.unlockLevel}.`
        : 'Check the weapon-level prerequisite in game.',
      blocked: false,
      uncertain: !c.unlockLevel,
    }
  if (c.tierKey === 'gold' && w) {
    const base = w.challenges.filter((x) => x.tierKey === 'base')
    const left = base.filter((x) => !isDone(entries, x.id)).length
    return {
      label: left
        ? `${left} of the 11 Military and Special camos still to record.`
        : 'All 11 base camos recorded. Complete the Gold challenge.',
      blocked: left > 0,
    }
  }
  if (c.tierKey === 'platinum')
    return {
      label:
        'Complete the required Gold camos in this weapon class. Check the current class threshold in game; seasonal substitution rules are unconfirmed.',
      blocked: false,
      uncertain: true,
    }
  if (c.tierKey === 'harmonic-break') {
    const left = Math.max(0, 33 - totals(entries).platinum)
    return {
      label: left
        ? `${left} more Platinum weapons to reach the 33-weapon prerequisite.`
        : '33 Platinum weapons recorded. Check this weapon’s Platinum unlock, then complete its Harmonic Break challenge.',
      blocked: left > 0,
    }
  }
  if (c.role === 'mastery') {
    if (!totals(entries).divergence)
      return {
        label: 'Unlock Divergence by completing 33 Harmonic Break challenges.',
        blocked: true,
      }
    const sequence: Record<string, string[]> = {
      multiplayer: ['mercurial-drift', 'polyatomic-reforged', 'orion-reforged'],
      dmz: ['chiral', 'ripple-tide', 'helio'],
      warzone: ['parallax', 'damascus-reforged', 'empyros'],
    }
    const route = sequence[c.trackKey] || []
    const previous = route[route.indexOf(c.tierKey) - 1]
    return {
      label:
        previous && !isDone(entries, `account:${previous}`)
          ? `Complete ${challengeById.get(`account:${previous}`)?.name || previous} first.`
          : 'Complete this mode-specific Mastery challenge.',
      blocked: !!previous && !isDone(entries, `account:${previous}`),
    }
  }
  return { label: 'Record the camo when it is unlocked in game.', blocked: false }
}
export function nextChallenge(w: Weapon, entries: Entries) {
  return w.challenges.find((c) => !isDone(entries, c.id))
}
export function csvDocument(entries: Entries) {
  const cell = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"'
  const rows = [
    [
      'Weapon',
      'Class',
      'Camo',
      'Tier',
      'Multiplayer requirement',
      'DMZ requirement',
      'Warzone requirement',
      'Completed',
      'Source',
      'Reviewed',
      'Upstream snapshot',
    ],
  ]
  for (const w of weapons)
    for (const c of w.challenges)
      rows.push([
        w.name,
        w.weaponClass,
        c.name,
        c.tierKey,
        ...(['multiplayer', 'dmz', 'warzone'] as Mode[]).map(
          (mode) =>
            (c.variants.find((v) => v.mode === mode)?.description || c.description) +
            (communityReported(c, mode) ? ' [Community-reported; verify in game]' : ''),
        ),
        isDone(entries, c.id) ? 'Yes' : 'No',
        'https://mw4.gg/camo-tracker/',
        DATA_DATE,
        CATALOG_VERSION,
      ])
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')
}
