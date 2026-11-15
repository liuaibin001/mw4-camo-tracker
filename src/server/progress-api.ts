import { env } from 'cloudflare:workers'
import { getAuth } from './auth'
import { emptyDocument, parseDocument } from '../lib/progress'

const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' },
  })
export async function progressApi(request: Request) {
  const origin = new URL(request.url).origin
  const session = await getAuth(origin).api.getSession({ headers: request.headers })
  if (!session) return json({ error: 'Sign in to sync progress.' }, 401)
  if (request.method === 'GET') {
    const saved = await env.DB.prepare('SELECT document, revision FROM progress WHERE user_id = ?')
      .bind(session.user.id)
      .first<{ document: string; revision: number }>()
    return json(
      saved
        ? { document: JSON.parse(saved.document), revision: saved.revision }
        : { document: emptyDocument(), revision: 0 },
    )
  }
  if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405)
  if (request.headers.get('Origin') !== origin)
    return json({ error: 'A same-origin request is required.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return json({ error: 'JSON is required.' }, 415)
  if (Number(request.headers.get('content-length')) > 100_000)
    return json({ error: 'The backup is too large.' }, 413)
  let body: { document?: unknown; expectedRevision?: unknown }
  try {
    const text = await request.text()
    if (text.length > 100_000) return json({ error: 'The backup is too large.' }, 413)
    body = JSON.parse(text)
    if (!body || typeof body !== 'object') return json({ error: 'Invalid request.' }, 400)
  } catch {
    return json({ error: 'Invalid JSON.' }, 400)
  }
  if (!Number.isSafeInteger(body.expectedRevision) || Number(body.expectedRevision) < 0)
    return json({ error: 'A valid revision is required.' }, 400)
  try {
    const document = parseDocument(body.document)
    const revision = Number(body.expectedRevision)
    const result =
      revision === 0
        ? await env.DB.prepare(
            'INSERT INTO progress (user_id, document, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING RETURNING revision',
          )
            .bind(session.user.id, JSON.stringify(document), Date.now())
            .first<{ revision: number }>()
        : await env.DB.prepare(
            'UPDATE progress SET document = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ? RETURNING revision',
          )
            .bind(JSON.stringify(document), Date.now(), session.user.id, revision)
            .first<{ revision: number }>()
    if (!result) {
      const latest = await env.DB.prepare(
        'SELECT document, revision FROM progress WHERE user_id = ?',
      )
        .bind(session.user.id)
        .first<{ document: string; revision: number }>()
      return json(
        {
          error: 'Progress changed on another device.',
          document: latest ? JSON.parse(latest.document) : emptyDocument(),
          revision: latest?.revision || 0,
        },
        409,
      )
    }
    return json({ document, revision: result.revision })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid progress.' }, 400)
  }
}
