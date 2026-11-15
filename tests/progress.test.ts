import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeEntries,
  parseDocument,
  totals,
  gate,
  csvDocument,
  type Entries,
} from '../src/lib/progress'
import { weapons, mastery, communityReported, allChallenges } from '../src/data/catalog'

test('an offline untick survives a stale completed cloud copy in either merge order', () => {
  const old = { 'm4:gold': { done: true, updatedAt: 100 } },
    undone = { 'm4:gold': { done: false, updatedAt: 200 } }
  assert.equal(mergeEntries(old, undone)['m4:gold'].done, false)
  assert.equal(mergeEntries(undone, old)['m4:gold'].done, false)
})
test('independent edits on two devices both survive conflict retry', () => {
  const a = { 'm4:gold': { done: true, updatedAt: 100 } },
    b = { 'han-86:gold': { done: true, updatedAt: 150 } }
  const before = mergeEntries(a, b),
    later = { 'm4:gold': { done: false, updatedAt: 200 } }
  assert.deepEqual(mergeEntries(before, later), { ...a, ...b, ...later })
  assert.equal(totals(mergeEntries(before, later)).gold, 1)
})
test('ties choose the untick deterministically and unknown backup IDs are rejected', () => {
  const a = { 'm4:gold': { done: true, updatedAt: 100 } },
    b = { 'm4:gold': { done: false, updatedAt: 100 } }
  assert.deepEqual(mergeEntries(a, b), mergeEntries(b, a))
  assert.throws(() =>
    parseDocument({ version: 1, entries: { 'not-a-challenge': { done: true, updatedAt: 1 } } }),
  )
  assert.throws(() =>
    parseDocument({ version: 1, entries: { 'm4:gold': { done: 'false', updatedAt: 1 } } }),
  )
  assert.throws(() =>
    parseDocument({
      version: 1,
      entries: { 'm4:gold': { done: true, updatedAt: Date.now() + 120_000 } },
    }),
  )
  assert.throws(() => parseDocument({ version: 2, entries: {} }))
})
test('Gold requires all 11 base records; recording Gold does not backfill them', () => {
  const m4 = weapons.find((w) => w.id === 'm4')!,
    gold = m4.challenges.find((c) => c.tierKey === 'gold')!
  const entries: Entries = { 'm4:gold': { done: true, updatedAt: 1 } }
  assert.equal(totals(entries).completed, 1)
  assert.equal(gate(gold, m4, entries).blocked, true)
  for (const c of m4.challenges.filter((c) => c.tierKey === 'base'))
    entries[c.id] = { done: true, updatedAt: 1 }
  assert.equal(gate(gold, m4, entries).blocked, false)
})
test('Divergence opens at 33 Harmonic records, with account Mastery kept separate', () => {
  const entries: Entries = {}
  for (const w of weapons.slice(0, 32))
    entries[`${w.id}:harmonic-break`] = { done: true, updatedAt: 1 }
  assert.equal(totals(entries).divergence, false)
  entries[`${weapons[32].id}:harmonic-break`] = { done: true, updatedAt: 1 }
  entries['account:mercurial-drift'] = { done: true, updatedAt: 1 }
  assert.equal(totals(entries).divergence, true)
  assert.equal(totals(entries).completed, 33)
  assert.equal(
    gate(
      mastery.find((c) => c.tierKey === 'polyatomic-reforged')!,
      undefined,
      entries,
    ).blocked,
    false,
  )
})
test('seasonal class gates remain qualified and Warzone caveats are not lost', () => {
  const w = weapons.find((w) => w.id === 'm4')!,
    c = w.challenges.find((c) => c.tierKey === 'platinum')!
  assert.equal(gate(c, w, {}).uncertain, true)
  const special = w.challenges.find((c) => c.role === 'special')!
  assert.equal(communityReported(special, 'warzone'), true)
  assert.equal(communityReported(special, 'multiplayer'), false)
})
test('the catalogue and portable CSV retain the complete 35 by 14 weapon inventory', () => {
  assert.equal(weapons.length, 35)
  assert.equal(mastery.length, 9)
  assert.equal(new Set(allChallenges.map((c) => c.id)).size, 499)
  for (const w of weapons) {
    assert.equal(w.challenges.length, 14)
    assert.equal(w.challenges.filter((c) => c.role === 'military').length, 8)
    assert.equal(w.challenges.filter((c) => c.role === 'special').length, 3)
  }
  const csv = csvDocument({ 'm4:gold': { done: true, updatedAt: 1 } })
  assert.equal(csv.split('\r\n').length, 491)
  assert.ok(csv.includes('"M4","Assault Rifle","Gold"'))
  assert.ok(csv.includes('"Yes"'))
})
