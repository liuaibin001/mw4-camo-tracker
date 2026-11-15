import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { weapons, mastery, allChallenges, communityReported } from '../src/data/catalog'
import media from '../docs/media-sources.json'
assert.equal(weapons.length, 35)
assert.equal(mastery.length, 9)
assert.equal(new Set(allChallenges.map((c) => c.id)).size, 499)
for (const w of weapons) {
  assert.equal(w.challenges.length, 14, `${w.name}: 14 shared challenges`)
  assert.equal(w.challenges.filter((c) => c.role === 'military').length, 8)
  assert.equal(w.challenges.filter((c) => c.role === 'special').length, 3)
  for (const c of w.challenges) {
    assert.ok(c.name && c.description && c.id.startsWith(w.id + ':'))
    if (c.notes?.includes('Warzone requirement is community-reported'))
      assert.ok(communityReported(c, 'warzone'))
  }
}
const assets = new Map(media.assets.map((asset) => [asset.local, asset]))
for (const asset of media.assets) {
  const bytes = readFileSync(`public${asset.local}`)
  assert.equal(bytes.length, asset.bytes, `${asset.local}: image length`)
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    asset.sha256,
    `${asset.local}: checksum`,
  )
}
for (const w of weapons) {
  assert.ok(assets.has(w.thumbnail) && assets.has(w.image), `${w.name}: local weapon images`)
}
for (const c of allChallenges) {
  assert.equal(!!c.icon, !!c.image, `${c.id}: consistent image availability`)
  if (c.icon && c.image)
    assert.ok(assets.has(c.icon) && assets.has(c.image), `${c.id}: local camo images`)
}
console.log(
  `Catalogue valid: 35 weapons, 490 weapon records, 9 account Mastery records, ${media.assets.length} verified image files. ${allChallenges.filter((c) => !c.icon).length} missing images explicitly labeled. Uncertainty preserved.`,
)
