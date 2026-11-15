import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema'

export function getAuth(origin: string) {
  if (!env.BETTER_AUTH_SECRET) throw new Error('Authentication is not configured')
  return betterAuth({
    appName: 'CamoField',
    baseURL:
      origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
        ? origin
        : env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DB, { schema }), { provider: 'sqlite', schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    user: { deleteUser: { enabled: true } },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        '/sign-up/email': { window: 60, max: 3 },
        '/sign-in/email': { window: 60, max: 5 },
      },
      customStorage: {
        consume: async (key, rule) => {
          const now = Date.now(),
            period = rule.window * 1000
          const window = Math.floor(now / period)
          const row = await env.DB.prepare(
            'INSERT INTO auth_rate_limit (key, window, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window = excluded.window THEN count + 1 ELSE 1 END, window = excluded.window RETURNING count',
          )
            .bind(key, window)
            .first<{ count: number }>()
          const allowed = !!row && row.count <= rule.max
          return {
            allowed,
            retryAfter: allowed ? null : Math.ceil(((window + 1) * period - now) / 1000),
          }
        },
      },
    },
  })
}
