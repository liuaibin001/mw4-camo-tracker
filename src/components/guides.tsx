import { CircleHelp, Download, ExternalLink } from 'lucide-react'
import { Article } from './article'
import {
  sources,
  mastery,
  modeLabels,
  communityReported,
  requirement,
  type Mode,
} from '@/data/catalog'
import { guideMeta, type GuideSlug } from '@/data/guides'
const Official = ({ patch = false }: { patch?: boolean }) => (
  <a href={patch ? sources.patches : sources.official} target="_blank" rel="noopener noreferrer">
    {patch ? 'official Season 1 patch notes' : 'official progression guide'}{' '}
    <ExternalLink className="inline" size={10} />
  </a>
)
export function Guide({ slug }: { slug: GuideSlug }) {
  const meta = guideMeta[slug]
  return (
    <Article {...meta} path={`/guides/${slug}`}>
      {slug === 'camo-challenges' ? (
        <ChallengesGuide />
      ) : slug === 'not-tracking' ? (
        <TrackingGuide />
      ) : slug === 'spreadsheet' ? (
        <SpreadsheetGuide />
      ) : (
        <MasteryGuide />
      )}
    </Article>
  )
}
function ChallengesGuide() {
  return (
    <>
      <section id="quick-answer">
        <h2>What is the MW4 camo unlock order?</h2>
        <p>
          The shared weapon path is{' '}
          <strong>8 Military camos → 3 Special camos → Gold → Platinum → Harmonic Break</strong>.
          Completing 33 Harmonic Break challenges awards Divergence. The current community catalogue
          contains 35 weapons, but the account milestone is 33, and those are different numbers.
        </p>
        <p>
          That is why the tracker shows 14 records per weapon: eight Military, three Special and
          three individual Completionist challenges. Divergence is calculated once from your
          recorded Harmonic Break completions. The nine final Mastery challenges are separate
          account-wide records.
        </p>
        <p>
          The core route comes from the <Official />. Weapon-specific conditions are drawn from the
          MW4.GG community catalogue and carry confidence labels; they are not all independently
          verified in game.
        </p>
      </section>
      <section id="base-camos">
        <h2>Military and Special camos come first</h2>
        <h3>Military: weapon-level milestones</h3>
        <p>
          Each weapon starts with eight Military camos. These unlock at escalating weapon-level
          milestones, so the practical task is leveling the weapon. Open a weapon in the tracker to
          see the individual level listed for each camo; do not assume every weapon uses an
          identical level schedule.
        </p>
        <h3>Special: three weapon-specific challenges</h3>
        <p>
          Each weapon then has three Special camos, with their own level and challenge conditions.
          The same Special camo can have a different requirement in Multiplayer, DMZ and Warzone.
          Select the mode you are actually playing before planning a session.
        </p>
        <p>
          Completing the applicable challenge in one mode makes the camo available across modes. The
          tracker keeps one shared checkbox for that camo, rather than treating each mode as a
          separate unlock. Where the source does not establish the exact prerequisite level, we ask
          you to check it in game.
        </p>
      </section>
      <section id="completionist">
        <h2>Gold, Platinum, Harmonic Break and Divergence</h2>
        <div className="route-steps">
          {[
            [
              '01',
              'Gold',
              'Complete all eight Military and three Special camos on that weapon, then complete its Gold challenge. The tracker tells you how many of those 11 base records remain.',
            ],
            [
              '02',
              'Platinum',
              'Complete the required Gold camos in the weapon class, then the class-specific Platinum challenge. Check the current in-game threshold before choosing weapons to skip.',
            ],
            [
              '03',
              'Harmonic Break',
              'Complete Platinum challenges on 33 weapons, then the individual Harmonic Break challenge. The weapon itself must satisfy its progression prerequisites.',
            ],
            [
              '04',
              'Divergence',
              'Complete 33 Harmonic Break challenges. Divergence is awarded automatically and opens the first challenge in each final mode-specific Mastery route.',
            ],
          ].map(([n, title, text]) => (
            <div className="route-step" key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="inline-note">
          <CircleHelp size={16} />
          <span>
            The launch guide gives eight Assault Rifles as an example. The current catalogue lists
            nine. That does not establish whether every new weapon changes the threshold or can
            substitute for a launch weapon. CamoField does not derive class gates from the current
            inventory size.
          </span>
        </div>
        <p>
          Gold and Platinum summary denominators show the 35 weapons in the current catalogue. The
          Harmonic Break summary highlights the 33-weapon milestone. You may record more than 33
          completed weapons; reaching the milestone does not remove those additional records.
        </p>
      </section>
      <section id="modes">
        <h2>What is shared across modes?</h2>
        <p>
          The basic weapon camo grind is shared across Multiplayer, DMZ and Warzone. The final
          Mastery routes are mode-specific: Multiplayer, DMZ and Warzone each have three challenges
          after Divergence. See the <a href="/guides/mastery-camos">Mastery camo comparison</a> for
          those routes.
        </p>
        <p>
          The launch article still marks Warzone Mastery conditions as classified. Community
          trackers publish conditions, and some upstream notes explicitly call them unverified. We
          display those as community-reported. We also do not assume partial counters convert
          one-to-one when you change modes.
        </p>
      </section>
      <section id="plan">
        <h2>How to plan your next session</h2>
        <ol>
          <li>Pin one or two weapons you are actively using.</li>
          <li>Select Multiplayer, DMZ or Warzone to read the matching condition.</li>
          <li>Expand the weapon to check the prerequisite before starting the challenge.</li>
          <li>Record the unlock after it appears in game. Each checkbox is independent.</li>
          <li>
            Use the “Fewest left” sort to find nearly finished weapons, then check the class gate in
            game.
          </li>
        </ol>
        <p>
          Before clearing browser storage or moving devices, use{' '}
          <a href="/guides/spreadsheet">JSON backup or account sync</a>. A checklist is most useful
          when your existing progress stays with you.
        </p>
      </section>
    </>
  )
}
const patches = [
  [
    '2026-11-13',
    'Special camos missing from Shared Camos',
    'Cronen Osprey and CSG-35 Special camos missing from the Shared Camos tab were listed as fixed. This is a visibility fix, separate from the earlier Platinum tracking fix.',
  ],
  [
    '2026-11-12',
    'DMZ BlackCell challenge tracking',
    'Some BlackCell challenges that were not always tracking correctly in DMZ were listed as fixed.',
  ],
  [
    '2026-11-10',
    'Osprey / CSG-35 Platinum and Sniper BlackCell',
    'Platinum tracking for Cronen Osprey and CSG-35 was listed as fixed. Sniper BlackCell headshot tracking was also listed as fixed. The Platinum issue had appeared as a known issue on November 7.',
  ],
  [
    '2026-11-07',
    'BlackCell: kills without reloading',
    'The challenge requiring five kills without reloading ten times was listed as fixed.',
  ],
  [
    '2026-11-06',
    'Completed Events and Event Mastery',
    'Completed Events not counting toward Event Mastery Camo Challenge progression were listed as fixed.',
  ],
  [
    '2026-11-05',
    'Mercurial Drift unlock and DMZ LT dog tags',
    'Mercurial Drift remaining locked after its requirements were completed was listed as fixed. Certain DMZ Lieutenant dog tags not counting toward progression were also listed as fixed.',
  ],
]
function TrackingGuide() {
  return (
    <>
      <section id="checks">
        <h2>Check prerequisites before assuming a bug</h2>
        <p>
          “Not tracking” can describe several different problems: an unmet prerequisite, a challenge
          counter that does not increment, a reward that remains locked, or an unlocked camo missing
          from a menu. The fix depends on which one you can reproduce.
        </p>
        <ol>
          <li>
            <strong>Read the condition for your current mode.</strong> A Multiplayer requirement can
            differ from the DMZ or Warzone variant. Community-reported Warzone text should be
            checked against your game.
          </li>
          <li>
            <strong>Check weapon level and the earlier unlocks.</strong> Gold requires the 11 base
            camos. Platinum has a class Gold prerequisite. Harmonic Break has the 33-Platinum
            prerequisite.
          </li>
          <li>
            <strong>Check the target type and match scope.</strong> Player kills, enemy kills, a
            single match and repeated qualifying matches are different conditions. Use the exact
            wording on the weapon.
          </li>
          <li>
            <strong>Separate the counter from the menu.</strong> Note whether the counter increases,
            whether the unlock notification appears, and whether the camo can be equipped.
          </li>
          <li>
            <strong>Check the dated patch entry.</strong> A November 7 “known issue” should not
            remain labelled unresolved after a November 10 official fix.
          </li>
        </ol>
      </section>
      <section id="timeline">
        <h2>The official camo fix timeline</h2>
        <p>
          These are historical status statements from the <Official patch /> reviewed on November
          15, 2026. “Listed as fixed” means the developer reported a fix on that date; it does not
          prove that every similar later report is resolved.
        </p>
        <div className="patch-timeline">
          {patches.map(([date, title, text]) => (
            <div className="patch-entry" key={date}>
              <time dateTime={date}>{date}</time>
              <h3>
                {title}
                <span className="patch-status">Listed as fixed</span>
              </h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p>
          Not every problem is merely visual. The notes include actual tracking and unlock fixes as
          well as the Shared Camos menu visibility correction. Use the matching entry, rather than
          applying one explanation to all failures.
        </p>
      </section>
      <section id="unresolved">
        <h2>If the problem still happens after the fix</h2>
        <p>
          Capture the weapon name, exact camo, game mode, game version, the prerequisite state and a
          short before-and-after clip of the counter. A repeatable report is more useful than an
          isolated screenshot of a locked reward.
        </p>
        <p>
          Read the latest dated section in the <Official patch /> before treating this snapshot as
          current. If the in-game requirement differs from this site, the game takes priority. You
          can submit a source correction through{' '}
          <a href="/sources#corrections">our correction process</a>; CamoField cannot repair
          game-side progress or unlock a reward on your account.
        </p>
        <div className="inline-note">
          <CircleHelp size={16} />
          <span>
            We do not recommend reinstalling the game, unlinking your Activision account, paying an
            unlock service, or assuming a particular lobby type works without evidence for your
            specific issue.
          </span>
        </div>
      </section>
      <section id="checklist">
        <h2>What to do with your CamoField checklist</h2>
        <p>
          Record a camo when the game confirms that you have unlocked it. If you marked one by
          mistake, clear its checkbox in the camo brief or expanded weapon row. Recording a later
          camo does not automatically mark its prerequisites, so an imported or partially entered
          checklist can look different from the game until you fill in the earlier records.
        </p>
        <p>
          For a website save problem, export a JSON backup before troubleshooting browser storage.
          Cloud sync and game-side tracking are separate systems: signing in here will not change
          your game’s challenge counters.
        </p>
      </section>
    </>
  )
}
function SpreadsheetGuide() {
  return (
    <>
      <section id="download">
        <h2>Download the MW4 weapon challenge spreadsheet</h2>
        <p>
          The downloadable CSV contains all 35 weapons and 490 weapon challenge rows: weapon name,
          class, camo, tier, three mode requirements, a completion column, source and review date.
          It uses UTF-8 and standard quoted CSV cells.
        </p>
        <a className="primary-link" href="/downloads/mw4-camo-tracker.csv" download>
          <Download size={15} />
          Download blank challenge CSV
        </a>
        <p style={{ marginTop: 16 }}>
          For a spreadsheet with your existing ticks, open <a href="/">the tracker</a> and select{' '}
          <strong>Backup & export → Export spreadsheet</strong>. The downloaded “Completed” column
          reflects the active guest or account checklist at that moment.
        </p>
        <p>
          Divergence and the nine final account Mastery records are not part of the 490-row weapon
          CSV. The tracker keeps those milestones separate; a JSON backup contains the individual
          recorded Mastery entries too.
        </p>
      </section>
      <section id="sheets">
        <h2>Open the CSV in Excel or Google Sheets</h2>
        <ol>
          <li>
            In Excel, import the file using <strong>Data → From Text/CSV</strong> and choose UTF-8
            if prompted.
          </li>
          <li>
            In Google Sheets, use <strong>File → Import → Upload</strong>, then select the
            downloaded CSV.
          </li>
          <li>Filter the Class or Tier column to focus on one part of the grind.</li>
          <li>Use the Completed column for your own notes or turn it into checkboxes.</li>
        </ol>
        <p>
          The spreadsheet is a snapshot. It does not run scripts, connect to your account, update
          itself or write changes back to CamoField. CSV re-import is not supported. To restore
          progress on this website, use the JSON format.
        </p>
        <p>
          The Mode columns may include community-reported conditions, particularly Warzone. Read{' '}
          <a href="/sources">the data confidence policy</a> and verify uncertain requirements in
          game before planning a long grind.
        </p>
      </section>
      <section id="backup">
        <h2>Back up and restore your checklist</h2>
        <p>
          Choose <strong>Backup & export → Download JSON backup</strong>. Keep the file somewhere
          private. To use it on another device, open the tracker there and choose{' '}
          <strong>Import CamoField backup</strong>.
        </p>
        <p>
          Imports accept CamoField version 1 JSON backups up to 100 KB. We validate the version,
          known challenge IDs, checkbox values and edit timestamps. An invalid file does not replace
          the existing checklist.
        </p>
        <p>
          An import merges the entries present in the backup. A backed-up false value explicitly
          unchecks that entry; entries absent from the file remain as they were. Imported values
          receive a fresh edit time so your deliberate restore can sync to your account. A JSON
          backup is not an interchangeable export format for MW4.GG, CODMunity or WZHUB.
        </p>
      </section>
      <section id="sync">
        <h2>How device saves and account sync differ</h2>
        <p>
          Guest progress is stored in this browser. Clearing site data, using private browsing or
          changing browsers can remove or separate the save. Export a backup before you clear
          storage.
        </p>
        <p>
          Account progress is stored separately from the guest checklist and belongs to the
          signed-in account. After signing in, use the merge option if you want to bring this
          device’s guest entries into that account. Signing out returns to the guest checklist.
        </p>
        <p>
          Cloud sync merges the latest edit to each camo, including unticks, and checks a server
          revision before writing. If another device saves at the same time, the tracker fetches the
          newer version and retries. Edits remain on the device if the network fails; use “Sync now”
          after reconnecting. Independent guest saves never synchronize automatically.
        </p>
      </section>
    </>
  )
}
function MasteryGuide() {
  return (
    <>
      <section id="unlock">
        <h2>Mastery starts after Divergence</h2>
        <p>
          The final Mastery challenges are account-wide and mode-specific. According to the{' '}
          <Official />, Divergence opens the first challenge in each route after you complete 33
          Harmonic Break challenges. The subsequent Mastery challenges form a sequence within that
          mode.
        </p>
        <p>
          Completing a Multiplayer Mastery challenge is not the same as completing its DMZ or
          Warzone counterpart. In CamoField, select a mode to see its three records. These nine
          records sit outside the 490 per-weapon checklist entries.
        </p>
      </section>
      {MODES_CONTENT.map((mode) => (
        <section id={mode} key={mode}>
          <h2>{modeLabels[mode]} Mastery route</h2>
          {mode === 'warzone' && (
            <div className="inline-note">
              <CircleHelp size={16} />
              <span>
                The official launch article still lists the Warzone requirements as classified. The
                conditions here come from the community catalogue and should be verified in game.
              </span>
            </div>
          )}
          <div className="article-table-wrap">
            <table className="article-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Camo</th>
                  <th>Reported requirement</th>
                </tr>
              </thead>
              <tbody>
                {mastery
                  .filter((c) => c.trackKey === mode)
                  .map((c, i) => (
                    <tr key={c.id}>
                      <td>Mastery {i + 1}</td>
                      <td>
                        {c.name}
                        {communityReported(c, mode) && (
                          <>
                            <br />
                            <span className="community-badge">Community-reported</span>
                          </>
                        )}
                      </td>
                      <td>{requirement(c, mode)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {mode === 'multiplayer' ? (
            <p>
              These are repeated qualifying events, not a simple sum of total kills. “Ten kills in a
              match, 250 times” requires qualifying matches. Check the current challenge wording for
              which weapon, loadout and match conditions apply.
            </p>
          ) : mode === 'dmz' ? (
            <p>
              Pay attention to enemy tier, dog-tag requirements, a single deployment, weapon rarity
              and Operator level. Historical LT dog-tag counting issues and some BlackCell DMZ
              tracking issues appear in the <a href="/guides/not-tracking">dated fix timeline</a>.
            </p>
          ) : (
            <p>
              Use the in-game condition if it differs from these reported values. We do not convert
              partial progress between modes or treat the community conditions as independently
              confirmed.
            </p>
          )}
        </section>
      ))}
      <section id="record">
        <h2>Record the unlock, keep the prerequisite in view</h2>
        <p>
          CamoField records the final unlock checkbox for each Mastery camo. It does not
          automatically measure your kills, qualifying matches or dog tags. The prerequisite note
          helps you see what comes first, while independent checkboxes let you enter an existing
          account’s unlocks in any order.
        </p>
        <p>
          Weapon Prestige is a different progression system. Its four per-weapon rewards are outside
          this version of the tracker. This site currently focuses on the shared weapon camo route
          and the nine final Mastery rewards.
        </p>
      </section>
    </>
  )
}
const MODES_CONTENT: Mode[] = ['multiplayer', 'dmz', 'warzone']
