import handler from '@tanstack/react-start/server-entry'
import { weapons, DATA_DATE } from './data/catalog'
import catalog from './data/catalog.json'
import { SITE_URL } from './lib/site'
import { csvDocument } from './lib/progress'
import { guideMeta } from './data/guides'

const pages = [
  '/',
  ...Object.keys(guideMeta).map((id) => `/guides/${id}`),
  ...weapons.map((w) => `/weapons/${w.id}`),
  '/sources',
  '/about',
  '/changelog',
  '/privacy',
  '/terms',
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((path) => `<url><loc>${SITE_URL}${path}</loc><lastmod>${DATA_DATE}</lastmod></url>`).join('')}</urlset>`
const llms = `# CamoField: MW4 Camo Tracker\n\n> Free manual Modern Warfare 4 camo checklist, with device saves, optional account sync, JSON backup and CSV export. Independent fan project; no game API or automatic game tracking.\n\n## Scope\n\n35 weapons, 14 shared weapon camo records each: 8 Military, 3 Special, Gold, Platinum and Harmonic Break. Divergence is the separate 33-Harmonic milestone. The final nine account Mastery challenges have three stages per mode. Weapon Prestige and event/store camos are not tracked.\n\n## Sources and uncertainty\n\nSource-reviewed ${DATA_DATE}. Primary weapon conditions: MW4.GG catalogue, upstream snapshot ${catalog.catalogVersion}. Broad progression rules and dated fixes: official Call of Duty articles. Some Warzone conditions remain community-reported. Current class thresholds and seasonal substitution rules are not inferred from inventory size. In-game conditions take priority.\n\n## Main resources\n\n- [Tracker](${SITE_URL}/): Interactive checklist.\n- [Challenge order](${SITE_URL}/guides/camo-challenges): Prerequisites and shared progression.\n- [Mastery routes](${SITE_URL}/guides/mastery-camos): Mode-specific endgame conditions.\n- [Not-tracking guide](${SITE_URL}/guides/not-tracking): Dated official fix timeline, through November 13 in this snapshot.\n- [Spreadsheet and backup](${SITE_URL}/guides/spreadsheet): 490-row CSV and restorable JSON.\n- [Source register](${SITE_URL}/sources): Provenance, confidence labels and correction process.\n- [Machine-readable catalogue](${SITE_URL}/api/catalog): Factual records with upstream confidence notes; no personal progress.\n- [Sitemap](${SITE_URL}/sitemap.xml): All indexable pages.\n`
const text = (value: string, type: string) =>
  new Response(value, {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600' },
  })
export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const url = new URL(request.url)
    let response: Response
    if (
      url.pathname.length > 1 &&
      url.pathname.endsWith('/') &&
      ['GET', 'HEAD'].includes(request.method)
    ) {
      url.pathname = url.pathname.slice(0, -1)
      return Response.redirect(url.toString(), 308)
    }
    if (['GET', 'HEAD'].includes(request.method) && url.pathname === '/robots.txt')
      response = text(
        `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`,
        'text/plain; charset=utf-8',
      )
    else if (['GET', 'HEAD'].includes(request.method) && url.pathname === '/sitemap.xml')
      response = text(sitemap, 'application/xml; charset=utf-8')
    else if (['GET', 'HEAD'].includes(request.method) && url.pathname === '/llms.txt')
      response = text(llms, 'text/plain; charset=utf-8')
    else if (['GET', 'HEAD'].includes(request.method) && url.pathname === '/api/catalog')
      response = Response.json(catalog, { headers: { 'Cache-Control': 'public, max-age=3600' } })
    else if (
      ['GET', 'HEAD'].includes(request.method) &&
      url.pathname === '/downloads/mw4-camo-tracker.csv'
    )
      response = new Response(csvDocument({}), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="mw4-camo-tracker.csv"',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    else response = await handler.fetch(request)
    const headers = new Headers(response.headers)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    headers.set('X-Frame-Options', 'DENY')
    if (url.protocol === 'https:') {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'",
      )
    }
    if (url.pathname.startsWith('/api/') && url.pathname !== '/api/catalog')
      headers.set('Cache-Control', 'no-store')
    if (response.status >= 400 || url.pathname.startsWith('/api/'))
      headers.set('X-Robots-Tag', 'noindex')
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
} satisfies ExportedHandler<Cloudflare.Env>
