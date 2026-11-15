import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const base = process.env.SMOKE_BASE_URL || 'http://localhost:4321'
const canonical = process.env.SITE_URL || 'https://mw4-camo-tracker.otoo.workers.dev'
const catalogue = JSON.parse(
  await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8'),
)
const paths = [
  '/',
  ...['camo-challenges', 'not-tracking', 'spreadsheet', 'mastery-camos'].map((s) => `/guides/${s}`),
  ...catalogue.weapons.map((w) => `/weapons/${w.id}`),
  '/sources',
  '/about',
  '/changelog',
  '/privacy',
  '/terms',
]
const titles = new Set()
for (let start = 0; start < paths.length; start += 5) {
  await Promise.all(
    paths.slice(start, start + 5).map(async (path) => {
      const response = await fetch(base + path)
      assert.equal(response.status, 200, path)
      const html = await response.text()
      const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
      assert.ok(title && !titles.has(title), `Unique title: ${path}`)
      titles.add(title)
      assert.ok(
        html.includes(`rel="canonical" href="${canonical}${path}"`) ||
          html.includes(`href="${canonical}${path}" rel="canonical"`),
        `Canonical: ${path}`,
      )
      assert.ok((html.match(/<h1\b/g) || []).length === 1, `One H1: ${path}`)
      assert.ok(!html.includes('noindex,nofollow'), `Indexable: ${path}`)
      assert.ok(html.includes('application/ld+json'), `Structured data: ${path}`)
    }),
  )
}
for (const path of ['/no-such-page', '/weapons/not-a-weapon', '/guides/not-a-guide']) {
  const r = await fetch(base + path)
  assert.equal(r.status, 404, path)
  assert.match(r.headers.get('x-robots-tag') || '', /noindex/)
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text()
assert.equal((sitemap.match(/<url>/g) || []).length, paths.length)
const robots = await (await fetch(base + '/robots.txt')).text()
assert.ok(robots.includes(canonical + '/sitemap.xml'))
assert.ok(!robots.includes('Disallow: /\n'))
assert.ok((await (await fetch(base + '/llms.txt')).text()).includes('community-reported'))
const csv = await (await fetch(base + '/downloads/mw4-camo-tracker.csv')).text()
assert.equal(csv.trim().split('\r\n').length, 491)
const og = await fetch(base + '/og.png')
assert.equal(og.status, 200)
assert.match(og.headers.get('content-type') || '', /image\/png/)
console.log(
  `SEO/HTTP: ${paths.length} indexable SSR pages, 3 real 404s, sitemap, robots, llms.txt, CSV and OG image passed.`,
)
const media = JSON.parse(
  await readFile(new URL('../docs/media-sources.json', import.meta.url), 'utf8'),
)
for (let start = 0; start < media.assets.length; start += 8) {
  await Promise.all(
    media.assets.slice(start, start + 8).map(async (asset) => {
      const response = await fetch(base + asset.local)
      assert.equal(response.status, 200, asset.local)
      assert.match(response.headers.get('content-type') || '', /^image\//)
      const bytes = Buffer.from(await response.arrayBuffer())
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.local)
    }),
  )
}
console.log(
  `Media: all ${media.assets.length} local image URLs served with the expected content and checksums.`,
)

const accounts = []
async function call(path, body, cookie = '', method = 'POST', origin = base) {
  const r = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  let data
  try {
    data = await r.json()
  } catch {
    data = null
  }
  const nextCookie = r.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ')
  return { status: r.status, data, cookie: nextCookie || cookie }
}
try {
  for (let i = 0; i < 2; i++) {
    const password = randomBytes(24).toString('base64url')
    const email = `qa-camofield-${randomBytes(8).toString('hex')}@example.com`
    const signup = await call('/api/auth/sign-up/email', { name: 'QA CamoField', email, password })
    assert.equal(signup.status, 200, `Sign up: ${JSON.stringify(signup.data)}`)
    assert.ok(signup.cookie)
    accounts.push({ email, password, cookie: signup.cookie })
  }
  const [a, b] = accounts
  let saved = await call('/api/progress', undefined, a.cookie, 'GET')
  assert.equal(saved.status, 200)
  assert.equal(saved.data.revision, 0)
  const id = 'm4:military-1',
    done = { version: 1, entries: { [id]: { done: true, updatedAt: Date.now() } } }
  saved = await call('/api/progress', { document: done, expectedRevision: 0 }, a.cookie, 'PUT')
  assert.equal(saved.status, 200)
  assert.equal(saved.data.revision, 1)
  let isolated = await call('/api/progress', undefined, b.cookie, 'GET')
  assert.equal(isolated.data.revision, 0)
  assert.deepEqual(isolated.data.document.entries, {})
  let conflict = await call(
    '/api/progress',
    { document: done, expectedRevision: 0 },
    a.cookie,
    'PUT',
  )
  assert.equal(conflict.status, 409)
  assert.equal(conflict.data.revision, 1)
  const undone = { version: 1, entries: { [id]: { done: false, updatedAt: Date.now() } } }
  saved = await call('/api/progress', { document: undone, expectedRevision: 1 }, a.cookie, 'PUT')
  assert.equal(saved.status, 200)
  saved = await call('/api/progress', undefined, a.cookie, 'GET')
  assert.equal(saved.data.document.entries[id].done, false)
  assert.equal(saved.data.revision, 2)
  assert.equal(
    (
      await call(
        '/api/progress',
        { document: done, expectedRevision: 2 },
        a.cookie,
        'PUT',
        'https://untrusted.example',
      )
    ).status,
    403,
  )
  assert.equal(
    (
      await call(
        '/api/progress',
        {
          document: { version: 1, entries: { evil: { done: true, updatedAt: 1 } } },
          expectedRevision: 2,
        },
        a.cookie,
        'PUT',
      )
    ).status,
    400,
  )
  assert.equal((await call('/api/progress', undefined, '', 'GET')).status, 401)
  const concurrent = await Promise.all([
    call('/api/progress', { document: done, expectedRevision: 2 }, a.cookie, 'PUT'),
    call('/api/progress', { document: undone, expectedRevision: 2 }, a.cookie, 'PUT'),
  ])
  assert.deepEqual(
    concurrent.map((r) => r.status).sort(),
    [200, 409],
    'Concurrent writes cannot both overwrite the same revision',
  )
  await call('/api/auth/sign-out', {}, a.cookie)
  assert.equal((await call('/api/progress', undefined, a.cookie, 'GET')).status, 401)
  const signin = await call('/api/auth/sign-in/email', { email: a.email, password: a.password })
  assert.equal(signin.status, 200)
  a.cookie = signin.cookie
  assert.equal((await call('/api/progress', undefined, a.cookie, 'GET')).data.revision, 3)
  console.log(
    'Auth/sync: registration, session cookies, sign-in/out, D1 persistence, independent accounts, revision conflicts, unticks, input validation and same-origin protection passed.',
  )
} finally {
  for (const account of accounts) {
    const deleted = await call(
      '/api/auth/delete-user',
      { password: account.password },
      account.cookie,
    )
    assert.equal(deleted.status, 200, 'Remove disposable QA account')
    assert.equal((await call('/api/progress', undefined, account.cookie, 'GET')).status, 401)
  }
  if (accounts.length) console.log('Disposable QA accounts and their cloud progress removed.')
}
