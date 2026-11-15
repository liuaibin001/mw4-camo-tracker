import { createFileRoute, notFound } from '@tanstack/react-router'
import { WeaponGuide } from '@/components/weapon-guide'
import { weaponById } from '@/data/catalog'
import { seo } from '@/lib/site'
export const Route = createFileRoute('/weapons/$slug')({
  beforeLoad: ({ params }) => {
    if (!weaponById.has(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const w = weaponById.get(params.slug)
    return w
      ? seo(
          `${w.name} Camo Challenges & Tracker`,
          `Track all 14 ${w.name} camo unlocks in MW4. Weapon levels, Special camo conditions and Gold, Platinum and Harmonic Break requirements across three modes.`,
          `/weapons/${w.id}`,
        )
      : {}
  },
  component: () => {
    const { slug } = Route.useParams()
    return <WeaponGuide weapon={weaponById.get(slug)!} />
  },
})
