import { createFileRoute, notFound } from '@tanstack/react-router'
import { Guide } from '@/components/guides'
import { guideMeta, type GuideSlug } from '@/data/guides'
import { seo } from '@/lib/site'
export const Route = createFileRoute('/guides/$slug')({
  beforeLoad: ({ params }) => {
    if (!Object.hasOwn(guideMeta, params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const meta = guideMeta[params.slug as GuideSlug]
    return meta ? seo(meta.title, meta.description, `/guides/${params.slug}`) : {}
  },
  component: () => {
    const { slug } = Route.useParams()
    return <Guide slug={slug as GuideSlug} />
  },
})
