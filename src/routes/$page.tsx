import { createFileRoute, notFound } from '@tanstack/react-router'
import { Information, informationMeta, type InformationPage } from '@/components/information-pages'
import { seo } from '@/lib/site'
export const Route = createFileRoute('/$page')({
  beforeLoad: ({ params }) => {
    if (!Object.hasOwn(informationMeta, params.page)) throw notFound()
  },
  head: ({ params }) => {
    const meta = informationMeta[params.page as InformationPage]
    return meta ? seo(meta.title, meta.description, `/${params.page}`) : {}
  },
  component: () => {
    const { page } = Route.useParams()
    return <Information page={page as InformationPage} />
  },
})
