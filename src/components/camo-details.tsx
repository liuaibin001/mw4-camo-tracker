import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { Check, CircleHelp, ExternalLink, ImageOff, LockKeyhole } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import {
  DATA_DATE,
  MODES,
  communityReported,
  modeLabels,
  requirement,
  sources,
  type Challenge,
  type Mode,
  type Weapon,
} from '@/data/catalog'
import { gate, isDone } from '@/lib/progress'
import { useTracker } from '@/lib/tracker-context'

type Selection = { challenge: Challenge; weapon?: Weapon; mode: Mode }
const DetailsContext = createContext<(selection: Selection) => void>(() => {})

export function CompletionCheckbox({
  challenge,
  weapon,
  compact = false,
}: {
  challenge: Challenge
  weapon?: Weapon
  compact?: boolean
}) {
  const { entries, toggle, ready } = useTracker()
  const done = isDone(entries, challenge.id)
  return (
    <label className={`completion-checkbox ${compact ? 'completion-compact' : ''}`}>
      <input
        type="checkbox"
        checked={done}
        disabled={!ready}
        aria-label={`Record ${challenge.name}${weapon ? ` for ${weapon.name}` : ''} as unlocked`}
        onChange={() => toggle(challenge.id)}
      />
      {!compact && <span>{done ? 'Recorded as unlocked' : 'Record in-game unlock'}</span>}
    </label>
  )
}

export function ChallengeRequirements({ challenge, mode }: { challenge: Challenge; mode: Mode }) {
  if (!challenge.variants.length) return <p>{challenge.description}</p>
  return (
    <div className="challenge-variants" aria-label="Alternative game mode requirements">
      {MODES.filter((m) => challenge.trackKey === 'shared' || m === challenge.trackKey).map((m) => (
        <div className="mode-requirement" data-selected={m === mode} key={m}>
          <span className={`mode-label mode-${m}`}>
            {m === 'multiplayer' ? 'MP' : m === 'warzone' ? 'WZ' : 'DMZ'}
          </span>
          <div>
            <p>{requirement(challenge, m)}</p>
            {communityReported(challenge, m) && (
              <span className="community-badge">Community-reported</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CamoTile({
  challenge,
  index,
  large = false,
  weapon,
  mode = 'multiplayer',
}: {
  challenge: Challenge
  index: number
  large?: boolean
  weapon?: Weapon
  mode?: Mode
}) {
  const { entries } = useTracker()
  const open = useContext(DetailsContext)
  const done = isDone(entries, challenge.id)
  return (
    <button
      type="button"
      className={`camo-tile ${large ? 'camo-tile-large' : ''}`}
      data-done={done}
      data-step={index + 1}
      aria-label={`${challenge.name} details${weapon ? ` for ${weapon.name}` : ''}${done ? ', completed' : ''}`}
      title={`${challenge.name} · View image and requirements`}
      onClick={() => open({ challenge, weapon, mode })}
    >
      {challenge.icon ? (
        <img src={challenge.icon} alt="" loading="lazy" width={64} height={64} decoding="async" />
      ) : (
        <ImageOff className="image-unavailable-icon" size={16} />
      )}
      {done && (
        <span className="tile-completed">
          <Check size={large ? 17 : 12} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

export function CamoDetailsProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Selection | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const { entries } = useTracker()
  const info = selected && gate(selected.challenge, selected.weapon, entries)
  const sourceNote = selected?.challenge.notes
    ? [
        /Blog gives/.test(selected.challenge.notes)
          ? 'The repeat count follows the community catalogue’s report of the in-game menu; the official article does not specify it.'
          : '',
        /unverified|community-reported/i.test(selected.challenge.notes)
          ? 'The Warzone condition is community-reported. Confirm it in the current game before starting this challenge.'
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : ''
  return (
    <DetailsContext.Provider value={setSelected}>
      {children}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        {selected && (
          <DialogContent className="camo-detail-dialog" initialFocus={heading}>
            <DialogHeader>
              <span className="eyebrow">
                {selected.weapon?.name || `${modeLabels[selected.mode]} MASTERY`} /{' '}
                {selected.challenge.role.toUpperCase()}
              </span>
              <DialogTitle ref={heading} tabIndex={-1}>
                {selected.challenge.name}
              </DialogTitle>
              <DialogDescription>
                {selected.weapon
                  ? `Unlock this camo for ${selected.weapon.name}. Complete one applicable mode’s condition for the shared record.`
                  : 'An account-wide, mode-specific Mastery challenge.'}
              </DialogDescription>
            </DialogHeader>
            <div className="camo-preview">
              {selected.challenge.image ? (
                <img
                  src={selected.challenge.image}
                  alt={`${selected.challenge.name} camo artwork`}
                  width={640}
                  height={360}
                />
              ) : (
                <div className="missing-preview">
                  <ImageOff size={28} />
                  <span>Image not available from the reviewed sources</span>
                </div>
              )}
            </div>
            <div className="detail-requirements">
              <h3>Unlock requirements</h3>
              <ChallengeRequirements challenge={selected.challenge} mode={selected.mode} />
            </div>
            {info && (
              <div className={`detail-gate ${info.blocked ? 'is-blocked' : ''}`}>
                {info.blocked ? <LockKeyhole size={16} /> : <CircleHelp size={16} />}
                <div>
                  <strong>Prerequisite</strong>
                  <p>{info.label}</p>
                </div>
              </div>
            )}
            {sourceNote && <p className="detail-source-note">Source note: {sourceNote}</p>}
            <div className="detail-record">
              <CompletionCheckbox challenge={selected.challenge} weapon={selected.weapon} />
              <p>
                This records your checklist. It does not unlock a camo in game or fill preceding
                records.
              </p>
            </div>
            <div className="detail-source">
              <span>Reviewed {DATA_DATE} · Game artwork via MW4.GG</span>
              <a href={sources.catalog} target="_blank" rel="noopener noreferrer">
                View source <ExternalLink size={12} />
              </a>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </DetailsContext.Provider>
  )
}
