import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const input = process.argv[2]
const upstream = input
  ? JSON.parse(await readFile(input, 'utf8'))
  : await (await fetch('https://mw4.gg/data/camo-grind.json')).json()
const raw = upstream.data
const catalogPath = 'src/data/catalog.json'
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const overrides = JSON.parse(await readFile('docs/media-overrides.json', 'utf8')).images
const assets = new Map()
const sharedTiers = raw.tracks.find((t) => t.key === 'shared').tiers
const digest = (value) => createHash('sha256').update(value).digest('hex')

function register(url, group, name) {
  if (!url) return null
  if (new URL(url).origin !== 'https://api.mw4.gg')
    throw new Error(`Missing or unexpected media source: ${name}`)
  if (assets.has(url)) return assets.get(url).local
  const ext = path.extname(new URL(url).pathname)
  if (!['.webp', '.png', '.jpg'].includes(ext)) throw new Error(`Unexpected format: ${url}`)
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
  const local = `/images/${group}/${safeName}-${digest(url).slice(0, 10)}${ext}`
  assets.set(url, { local, source: url })
  return local
}
function attachCamo(target, source) {
  const tier =
    target.role === 'completionist' ? sharedTiers.find((t) => t.key === target.tierKey) : undefined
  const camo = tier?.camo || source.camo
  target.icon = register(overrides[target.id] || camo?.icon || source.icon, 'camos', target.name)
  target.image = register(
    overrides[target.id] || camo?.image || source.image,
    'camos',
    `${target.name}-preview`,
  )
}
for (const weapon of catalog.weapons) {
  const source = raw.weapons.find((w) => w.key === weapon.id)
  weapon.thumbnail = register(source.thumbnail, 'weapons', `${weapon.id}-thumb`)
  weapon.image = register(source.image, 'weapons', weapon.id)
  for (const challenge of weapon.challenges)
    attachCamo(
      challenge,
      source.challenges.find((c) => c.id === challenge.id),
    )
}
for (const challenge of catalog.mastery)
  attachCamo(
    challenge,
    raw.accountChallenges.find((c) => c.id === challenge.id),
  )
catalog.completionistImages = Object.fromEntries(
  sharedTiers
    .filter((t) => t.key !== 'base')
    .map((t) => [t.key, register(t.camo?.icon || t.icon, 'camos', t.name)]),
)

const queue = [...assets.values()]
let cursor = 0
async function download() {
  while (cursor < queue.length) {
    const asset = queue[cursor++]
    const filename = `public${asset.local}`
    await mkdir(path.dirname(filename), { recursive: true })
    let buffer
    try {
      buffer = await readFile(filename)
    } catch {
      /* Download missing assets only. */
    }
    if (!buffer) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(asset.source, { signal: AbortSignal.timeout(30_000) })
          if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
            throw new Error(`Image response ${response.status}: ${asset.source}`)
          buffer = Buffer.from(await response.arrayBuffer())
          break
        } catch (error) {
          if (attempt === 2) throw error
        }
      }
    }
    const signature = buffer.toString('ascii', 0, 12)
    if (
      !(signature.startsWith('RIFF') && signature.endsWith('WEBP')) &&
      buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a' &&
      buffer[0] !== 0xff
    )
      throw new Error(`Invalid image bytes: ${asset.source}`)
    await writeFile(filename, buffer)
    asset.bytes = buffer.length
    asset.sha256 = digest(buffer)
  }
}
await Promise.all(Array.from({ length: 5 }, download))
await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n')
await writeFile(
  'docs/media-sources.json',
  JSON.stringify(
    {
      retrievedAt: '2026-11-15',
      catalogue: 'https://mw4.gg/data/camo-grind.json',
      note: 'Game artwork from public catalogue media URLs. Rights remain with their respective owners; no affiliation or license transfer is claimed. Shared assets are downloaded once and served locally.',
      assets: queue,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `Stored ${queue.length} image files (${(queue.reduce((n, a) => n + a.bytes, 0) / 1048576).toFixed(2)} MiB), with source URLs and SHA-256 checksums.`,
)
