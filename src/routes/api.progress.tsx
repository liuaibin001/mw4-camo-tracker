import { createFileRoute } from '@tanstack/react-router'
import { progressApi } from '@/server/progress-api'
export const Route = createFileRoute('/api/progress')({
  server: {
    handlers: {
      GET: ({ request }) => progressApi(request),
      PUT: ({ request }) => progressApi(request),
    },
  },
})
