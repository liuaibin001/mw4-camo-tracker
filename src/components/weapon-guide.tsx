import { useState } from 'react'
import { CircleHelp, HardDrive } from 'lucide-react'
import { Article } from './article'
import { ChallengeList, ModeTabs } from './tracker'
import {
  communityReported,
  requirement,
  sources,
  weapons,
  type Mode,
  type Weapon,
} from '@/data/catalog'
import { useTracker } from '@/lib/tracker-context'
import { weaponCount } from '@/lib/progress'
export function WeaponGuide({ weapon }: { weapon: Weapon }) {
  const [mode, setMode] = useState<Mode>('multiplayer'),
    { entries, saved, ready } = useTracker()
  const related = weapons.filter((w) => w.weaponClass === weapon.weaponClass && w.id !== weapon.id)
  return (
    <div className="weapon-guide-page">
      <Article
        title={`${weapon.name} Camo Challenges & Tracker`}
        description={`All 14 ${weapon.name} camo records: eight Military, three Special, Gold, Platinum and Harmonic Break. Compare Multiplayer, DMZ and Warzone conditions and save your unlocks.`}
        path={`/weapons/${weapon.id}`}
        toc={[
          { id: 'checklist', label: 'Interactive checklist' },
          { id: 'requirements', label: 'All-mode requirements' },
          { id: 'prerequisites', label: 'Unlock prerequisites' },
          { id: 'related', label: `More ${weapon.weaponClass} weapons` },
        ]}
        kicker="WEAPON BRIEF"
      >
        <section id="checklist">
          <div className="weapon-guide-art">
            <img
              src={weapon.image}
              alt={`${weapon.name} weapon side view`}
              width={640}
              height={240}
              fetchPriority="high"
            />
          </div>
          <div className="weapon-guide-header">
            <h2>
              {weapon.name}
              <span className="count-badge" style={{ marginLeft: 10 }}>
                {weapon.weaponClass}
              </span>
            </h2>
            <div className="weapon-overview-count">
              {weaponCount(weapon, entries)}
              <span> / 14</span>
            </div>
          </div>
          <p>
            Click a camo image for a larger preview and unlock requirements. Use its checkbox to
            record an in-game unlock. This checklist uses the same device or account save as the
            main tracker.
          </p>
          <div className="weapon-guide-controls" style={{ marginTop: 18 }}>
            <ModeTabs mode={mode} setMode={setMode} />
            <span className="save-status">
              <HardDrive size={12} />
              {!ready ? 'Loading save…' : saved ? 'Saved on this device' : 'Storage unavailable'}
            </span>
          </div>
          {mode === 'warzone' && (
            <div className="inline-note">
              <CircleHelp size={16} />
              <span>
                Warzone conditions carrying upstream uncertainty are marked community-reported.
                Check the current game before starting them.
              </span>
            </div>
          )}
          <ChallengeList weapon={weapon} mode={mode} />
        </section>
        <section id="requirements">
          <h2>{weapon.name} requirements by mode</h2>
          <p>
            Military camos use the weapon-level milestones listed in the checklist. The table
            compares the six Special and Completionist records. A shared record is completed once
            through an applicable mode, rather than checked separately for all three modes.
          </p>
          <div className="article-table-wrap">
            <table className="article-table">
              <thead>
                <tr>
                  <th>Camo</th>
                  <th>Multiplayer</th>
                  <th>DMZ</th>
                  <th>Warzone</th>
                </tr>
              </thead>
              <tbody>
                {weapon.challenges
                  .filter((c) => c.role !== 'military')
                  .map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      {(['multiplayer', 'dmz', 'warzone'] as Mode[]).map((m) => (
                        <td key={m}>
                          {requirement(c, m)}
                          {communityReported(c, m) && (
                            <>
                              <br />
                              <span className="community-badge">Community-reported</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="prerequisites">
          <h2>Before you start a {weapon.name} challenge</h2>
          <p>
            Gold follows all 11 Military and Special unlocks on this weapon. Platinum has a Gold
            requirement across the {weapon.weaponClass} class. The exact current class threshold and
            seasonal replacement rules should be checked in game; this site does not infer them from
            the inventory size.
          </p>
          <p>
            Harmonic Break follows Platinum on 33 weapons and this weapon’s own progression
            prerequisites. Divergence is the account milestone at 33 Harmonic Break completions. A
            checklist tick records what you tell us; it does not grant an in-game unlock or backfill
            the preceding camos.
          </p>
          <p>
            If this weapon’s progress does not register, compare the condition and date with the{' '}
            <a href="/guides/not-tracking">official fix timeline</a>. Cronen Osprey and CSG-35 have
            separately dated Platinum tracking and Special camo visibility fixes.
          </p>
          <p className="weapon-source-note">
            Conditions:{' '}
            <a href={sources.catalog} target="_blank" rel="noopener noreferrer">
              MW4.GG community catalogue
            </a>
            . System rules:{' '}
            <a href={sources.official} target="_blank" rel="noopener noreferrer">
              Call of Duty progression guide
            </a>
            . Source-reviewed November 15, 2026; upstream snapshot November 7. Game artwork is
            served locally from the public source catalogue; missing images are labeled.{' '}
            <a href="/sources">Read confidence limits or suggest a correction.</a>
          </p>
        </section>
        <section id="related">
          <h2>More from this weapon class</h2>
          {related.length ? (
            <div className="related-weapons">
              {related.map((w) => (
                <a href={`/weapons/${w.id}`} key={w.id}>
                  {w.name} →
                </a>
              ))}
            </div>
          ) : (
            <p>This is the only weapon currently listed in the {weapon.weaponClass} class.</p>
          )}
          <p style={{ marginTop: 15 }}>
            <a href="/">Return to the full arsenal</a> or read the{' '}
            <a href="/guides/camo-challenges">MW4 camo unlock-order guide</a>.
          </p>
        </section>
      </Article>
    </div>
  )
}
