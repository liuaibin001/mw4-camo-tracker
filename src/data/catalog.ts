import raw from './catalog.json'

export const MODES = ['multiplayer', 'dmz', 'warzone'] as const
export type Mode = (typeof MODES)[number]
export const modeLabels: Record<Mode, string> = {
  multiplayer: 'Multiplayer',
  dmz: 'DMZ',
  warzone: 'Warzone',
}
export interface Challenge {
  id: string
  key: string
  definitionKey: string
  role: string
  name: string
  tierKey: string
  trackKey: string
  description: string
  unlockLevel: number | null
  sortOrder: number
  confidence: string
  notes: string | null
  icon: string | null
  image: string | null
  variants: {
    mode: string
    description: string
    targetCount: number | null
    times: number | null
  }[]
}
export interface Weapon {
  id: string
  sourceId: string
  name: string
  weaponClass: string
  thumbnail: string
  image: string
  challenges: Challenge[]
}
export const weapons: Weapon[] = raw.weapons
export const mastery: Challenge[] = raw.mastery
export const completionistImages: Record<string, string> = raw.completionistImages
export const DATA_DATE = raw.retrievedAt
export const CATALOG_VERSION = raw.catalogVersion
export const classes = [
  'Assault Rifle',
  'SMG',
  'LMG',
  'Shotgun',
  'Marksman Rifle',
  'Sniper Rifle',
  'Pistol',
  'Launcher',
  'Melee',
]
export const classLabels: Record<string, string> = {
  'Assault Rifle': 'Assault rifles',
  SMG: 'SMGs',
  LMG: 'LMGs',
  Shotgun: 'Shotguns',
  'Marksman Rifle': 'Marksman rifles',
  'Sniper Rifle': 'Sniper rifles',
  Pistol: 'Pistols',
  Launcher: 'Launchers',
  Melee: 'Melee',
}
export const allChallenges = [...weapons.flatMap((w) => w.challenges), ...mastery]
export const challengeById = new Map(allChallenges.map((c) => [c.id, c]))
export const weaponById = new Map(weapons.map((w) => [w.id, w]))

export function requirement(c: Challenge, mode: Mode) {
  return c.variants.find((v) => v.mode === mode)?.description || c.description
}
export function communityReported(c: Challenge, mode: Mode) {
  return (
    c.confidence !== 'verified' ||
    (mode === 'warzone' && /unverified|community-reported/i.test(c.notes || ''))
  )
}
export const sources = {
  catalog: 'https://mw4.gg/camo-tracker/',
  codmunity: 'https://codmunity.gg/camo-tracker',
  wzhub: 'https://wzhub.gg/camo/mw4mpdmz',
  official:
    'https://www.callofduty.com/blog/2026/10/call-of-duty-modern-warfare-4-ready-for-launch-progression-prestige',
  patches:
    'https://www.callofduty.com/patchnotes/2026/11/call-of-duty-modern-warfare-4-season-1-patch-notes',
}
