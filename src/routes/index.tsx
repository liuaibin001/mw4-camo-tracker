import { createFileRoute } from '@tanstack/react-router'
import { Tracker } from '@/components/tracker'
import { seo } from '@/lib/site'
export const Route = createFileRoute('/')({
  head: () =>
    seo(
      'MW4 Camo Tracker — Free Modern Warfare 4 Checklist',
      'Track all 35 MW4 weapons and 490 camo challenges. Military, Special, Gold, Platinum and Harmonic Break checklists, backups, CSV export and free account sync.',
      '/',
    ),
  component: Tracker,
})
