import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { TrackerProvider } from '@/lib/tracker-context'
import { Layout } from '@/components/layout'
import { CamoDetailsProvider } from '@/components/camo-details'
import css from '@/styles/app.css?url'
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fafafa' },
      { property: 'og:site_name', content: 'CamoField' },
    ],
    links: [
      { rel: 'stylesheet', href: css },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      {
        rel: 'preload',
        href: '/fonts/inter-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  shellComponent: Document,
  notFoundComponent: () => (
    <div className="page-container error-page">
      <span className="eyebrow">404 / OFF THE MAP</span>
      <h1>This route is uncharted.</h1>
      <p>The page may have moved. Your checklist is still on your device.</p>
      <a className="primary-link" href="/">
        Back to the tracker →
      </a>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="page-container error-page">
      <h1>We couldn’t load this page.</h1>
      <p>Your saved progress is still on your device. Please try again.</p>
      <button className="primary-link" onClick={reset}>
        Try again
      </button>
    </div>
  ),
})
function Document({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  )
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={client}>
          <TrackerProvider>
            <CamoDetailsProvider>
              <Layout>{children}</Layout>
            </CamoDetailsProvider>
            <Toaster richColors position="bottom-right" />
          </TrackerProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
