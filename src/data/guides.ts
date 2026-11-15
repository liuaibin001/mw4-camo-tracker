export const guideMeta = {
  'camo-challenges': {
    title: 'MW4 Camo Challenges & Unlock Order',
    description:
      'The shared Military-to-Divergence route, explained with prerequisites, weapon counts and the limits of seasonal class rules.',
    toc: [
      { id: 'quick-answer', label: 'The unlock order' },
      { id: 'base-camos', label: 'Military & Special' },
      { id: 'completionist', label: 'Gold to Divergence' },
      { id: 'modes', label: 'Shared versus mode-specific' },
      { id: 'plan', label: 'Plan your next session' },
    ],
  },
  'not-tracking': {
    title: 'MW4 Camos Not Tracking? Check the Fix Timeline',
    description:
      'Check the challenge prerequisites, separate tracking failures from menu visibility issues, and compare your problem with dated official patches.',
    toc: [
      { id: 'checks', label: 'Start with these checks' },
      { id: 'timeline', label: 'Official fix timeline' },
      { id: 'unresolved', label: 'If it still happens' },
      { id: 'checklist', label: 'Correct your tracker' },
    ],
  },
  spreadsheet: {
    title: 'MW4 Camo Tracker Spreadsheet & Backup',
    description:
      'Download a 490-row weapon challenge CSV for Excel or Google Sheets, or move your checklist between devices with a restorable JSON backup.',
    toc: [
      { id: 'download', label: 'Download the spreadsheet' },
      { id: 'sheets', label: 'Excel & Google Sheets' },
      { id: 'backup', label: 'Restore a JSON backup' },
      { id: 'sync', label: 'Cloud sync & conflicts' },
    ],
  },
  'mastery-camos': {
    title: 'MW4 Mastery Camos: Multiplayer, DMZ & Warzone',
    description:
      'Divergence opens three separate mode-specific Mastery routes. Compare their account-wide goals and check which requirements remain community-reported.',
    toc: [
      { id: 'unlock', label: 'The Divergence prerequisite' },
      { id: 'multiplayer', label: 'Multiplayer Mastery' },
      { id: 'dmz', label: 'DMZ Mastery' },
      { id: 'warzone', label: 'Warzone Mastery' },
      { id: 'record', label: 'Recording progress' },
    ],
  },
}
export type GuideSlug = keyof typeof guideMeta
