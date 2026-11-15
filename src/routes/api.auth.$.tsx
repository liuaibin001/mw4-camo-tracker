import { createFileRoute } from '@tanstack/react-router'
import { getAuth } from '@/server/auth'
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => getAuth(new URL(request.url).origin).handler(request),
      POST: ({ request }) => getAuth(new URL(request.url).origin).handler(request),
    },
  },
})
