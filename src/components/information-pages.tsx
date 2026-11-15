import { ExternalLink } from 'lucide-react'
import { Article } from './article'
import { sources, CATALOG_VERSION } from '@/data/catalog'
export const informationMeta = {
  sources: {
    title: 'MW4 Camo Data Sources & Confidence Policy',
    description:
      'Where CamoField’s weapon conditions come from, how uncertainty is labelled, and how to report a correction.',
  },
  about: {
    title: 'About CamoField',
    description:
      'A compact, independent Modern Warfare 4 checklist built around useful next steps, transparent sources and portable progress.',
  },
  privacy: {
    title: 'CamoField Privacy Policy',
    description:
      'What stays in your browser, what optional accounts store, and how to export or remove your progress.',
  },
  terms: {
    title: 'CamoField Terms of Use',
    description:
      'The scope of this independent fan tool, its source limits and the terms for using your optional account.',
  },
  changelog: {
    title: 'CamoField Changelog',
    description:
      'Product releases and the dates behind the current Modern Warfare 4 challenge catalogue.',
  },
}
export type InformationPage = keyof typeof informationMeta
const sections: Record<InformationPage, { id: string; label: string }[]> = {
  sources: [
    { id: 'sources', label: 'Source register' },
    { id: 'confidence', label: 'Confidence labels' },
    { id: 'limits', label: 'Known limits' },
    { id: 'corrections', label: 'Submit a correction' },
  ],
  about: [
    { id: 'purpose', label: 'What this tool does' },
    { id: 'editorial', label: 'Editorial standards' },
    { id: 'independent', label: 'Independent fan project' },
  ],
  privacy: [
    { id: 'device', label: 'Device storage' },
    { id: 'account', label: 'Optional cloud accounts' },
    { id: 'infrastructure', label: 'Hosting & logs' },
    { id: 'control', label: 'Your controls' },
  ],
  terms: [
    { id: 'service', label: 'Using the service' },
    { id: 'accuracy', label: 'Data & availability' },
    { id: 'accounts', label: 'Your account' },
    { id: 'rights', label: 'Game trademarks' },
  ],
  changelog: [
    { id: 'release', label: 'November 15 release' },
    { id: 'catalogue', label: 'Catalogue snapshot' },
    { id: 'next', label: 'Maintenance policy' },
  ],
}
export function Information({ page }: { page: InformationPage }) {
  return (
    <Article
      {...informationMeta[page]}
      kicker="PROJECT NOTES"
      path={`/${page}`}
      toc={sections[page]}
    >
      {page === 'sources' ? (
        <Sources />
      ) : page === 'about' ? (
        <About />
      ) : page === 'privacy' ? (
        <Privacy />
      ) : page === 'terms' ? (
        <Terms />
      ) : (
        <Changelog />
      )}
    </Article>
  )
}
function Sources() {
  return (
    <>
      <section id="sources">
        <h2>The source register</h2>
        <p>
          CamoField separates official system rules, weapon-specific community data and historical
          patch status. “Reviewed” describes a source review, not an independent in-game
          verification of every requirement.
        </p>
        <div className="source-list">
          {[
            [
              'Call of Duty progression guide',
              sources.official,
              'Official source for the eight Military and three Special camos, the Completionist order, the 33-weapon milestones and the distinction between shared progression and mode-specific Mastery. Published October 19, 2026; reviewed November 15.',
            ],
            [
              'Call of Duty Season 1 patch notes',
              sources.patches,
              'Official source for the dated fixes in the tracking guide. The snapshot includes entries through November 13, 2026. A historical fix is not a promise that a similar later report cannot occur.',
            ],
            [
              'MW4.GG community camo catalogue',
              sources.catalog,
              `Primary structured source for factual weapon names, classes, level milestones and challenge conditions. 35 weapons, 490 shared weapon records, nine account Mastery records. Upstream snapshot: ${CATALOG_VERSION}. Retrieved November 15, 2026.`,
            ],
            [
              'CODMunity camo tracker',
              sources.codmunity,
              'Secondary context for catalogue coverage and the player workflow. Public weapon catalogue inspected during the November 15 research. No personal saves or account data copied.',
            ],
            [
              'WZHUB MW4 camo tracker',
              sources.wzhub,
              'Secondary context for weapon coverage, class organization and the Completionist milestones. Public tracker inspected during the November 15 research.',
            ],
          ].map(([name, url, description]) => (
            <div className="source-entry" key={name}>
              <h3>{name}</h3>
              <p>{description}</p>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open source <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
        <p>
          The interface and explanatory articles are CamoField’s own. Weapon and camo artwork is
          downloaded from the public MW4.GG catalogue and served locally, with source URLs and
          checksums recorded in the repository. Images unavailable from the reviewed sources are
          labeled. Game artwork remains the property of its respective owners; no affiliation or
          license transfer is claimed.
        </p>
      </section>
      <section id="confidence">
        <h2>What the confidence labels mean</h2>
        <ul>
          <li>
            <strong>Official system rule:</strong> a broad prerequisite or mode distinction
            described in the official progression article.
          </li>
          <li>
            <strong>Community catalogue:</strong> a weapon-specific condition transcribed from the
            upstream catalogue. An upstream “verified” field is not presented as CamoField’s
            independent game test.
          </li>
          <li>
            <strong>Community-reported:</strong> an upstream condition marked unverified or
            explicitly qualified in its notes. This includes many Warzone variants even when the
            broader challenge has an upstream verified flag.
          </li>
          <li>
            <strong>Check in game:</strong> a prerequisite that the available sources do not settle
            well enough to calculate reliably, such as current seasonal class substitution rules.
          </li>
        </ul>
        <p>
          When sources disagree, we use the current in-game condition if supported by reproducible
          evidence. We retain the distinction between a claim’s source and its confidence, rather
          than treating repetition across websites as independent confirmation.
        </p>
      </section>
      <section id="limits">
        <h2>Current limits you should know</h2>
        <ul>
          <li>
            The launch guide’s eight-Assault-Rifle example differs from the nine in the current
            catalogue. Exact class thresholds and substitution rules are not inferred from list
            length.
          </li>
          <li>
            The official launch guide still marks Warzone Mastery conditions as classified. Reported
            values remain qualified.
          </li>
          <li>
            Partial counters are not converted between modes. CamoField records the final unlock
            checkbox.
          </li>
          <li>
            Weapon Prestige, event camos, store camos and reticles are outside this version’s
            checklist.
          </li>
          <li>
            The source data is a reviewed snapshot. This version does not poll competitors or
            automatically publish unreviewed changes.
          </li>
        </ul>
      </section>
      <section id="corrections">
        <h2>Suggest a source correction</h2>
        <p>
          Use the project’s{' '}
          <a
            href="https://github.com/liuaibin001/mw4-camo-tracker/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub issue tracker
          </a>
          . Include the weapon, camo, mode, exact current wording, game version or date, and an
          official source or a screenshot with personal details removed.
        </p>
        <p>
          Do not include account passwords, cloud backups, Activision credentials or session
          cookies. Reports are reviewed before data changes are published. A proposed or reported
          fix is kept distinct from a developer-confirmed fix.
        </p>
      </section>
    </>
  )
}
function About() {
  return (
    <>
      <section id="purpose">
        <h2>A checklist that keeps the next task visible</h2>
        <p>
          CamoField is a free Modern Warfare 4 camo tracker. It brings a compact weapon checklist,
          mode-aware requirement text, prerequisite notes and portable progress into one place.
        </p>
        <p>
          The tool is manual: you record camos you have unlocked. It does not read your game,
          automate play, connect to your Activision account or grant rewards. You can use device
          saves immediately, export backups, and optionally create an account for cloud sync.
        </p>
      </section>
      <section id="editorial">
        <h2>How the guides are written</h2>
        <p>
          The CamoField editorial pages explain the data used by the tracker. Official progression
          articles establish the broad system; community catalogues supply weapon-specific
          conditions; official patch notes establish the dates of reported fixes.
        </p>
        <p>
          We publish source links, the review date and limitations. The editorial byline identifies
          this project, rather than claiming a named player, developer affiliation, or independent
          game testing that did not happen. See <a href="/sources">the source policy</a> and{' '}
          <a href="/changelog">release history</a> for the current snapshot.
        </p>
      </section>
      <section id="independent">
        <h2>An independent fan project</h2>
        <p>
          CamoField is not affiliated with, sponsored by or endorsed by Activision, Infinity Ward,
          MW4.GG, CODMunity or WZHUB. Call of Duty and Modern Warfare names belong to their
          respective trademark owners.
        </p>
        <p>
          Source corrections and reproducible website bug reports are welcome in the{' '}
          <a
            href="https://github.com/liuaibin001/mw4-camo-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            project issue tracker
          </a>
          . Please keep personal account information out of public reports.
        </p>
      </section>
    </>
  )
}
function Privacy() {
  return (
    <>
      <section id="device">
        <h2>What stays on your device</h2>
        <p>
          Your guest checklist is stored in this browser’s local storage. It contains challenge
          identifiers, complete/incomplete values and edit times. Pinned weapons are also stored
          locally. This information is needed to keep your checklist between visits.
        </p>
        <p>
          Guest progress is not uploaded to CamoField cloud storage unless you choose to import it
          into an account. Clearing site data can remove it. Download a JSON backup before you clear
          storage or move browsers.
        </p>
      </section>
      <section id="account">
        <h2>Optional cloud accounts</h2>
        <p>
          If you register, we store your display name, email address, a password hash, account
          creation and update times, and session information in Cloudflare D1. Session information
          can include IP address and user agent. Better Auth manages the password hash and session
          cookies. We do not store a plaintext password or ask for your game credentials.
        </p>
        <p>
          Your cloud checklist contains challenge IDs, checkbox values and edit timestamps,
          associated with your account. Signed-in progress is sent to the server to support
          synchronization. An account’s locally cached checklist is stored separately from the guest
          cache and other accounts.
        </p>
        <p>
          Essential authentication cookies keep you signed in. We use rate-limit counters to limit
          repeated authentication attempts. There are no advertising or analytics scripts in this
          release, and we do not sell checklist data.
        </p>
      </section>
      <section id="infrastructure">
        <h2>Hosting and operational logs</h2>
        <p>
          Cloudflare Workers serves this website, and Cloudflare D1 stores account and cloud
          progress records. Cloudflare receives network information necessary to serve and secure
          requests. Operational logging is enabled for diagnosing application failures; the
          application does not intentionally log passwords, session cookies or backup contents.
        </p>
        <p>
          Links to sources and GitHub take you to external services with their own policies.
          Challenge data is bundled with this release, so using the tracker does not send your
          checklist to MW4.GG, CODMunity or WZHUB.
        </p>
      </section>
      <section id="control">
        <h2>Your controls</h2>
        <ul>
          <li>Use the tracker without creating an account.</li>
          <li>Export your active checklist to JSON or CSV from Backup & export.</li>
          <li>
            Reset checkbox values from the backup dialog. Reset is a progress edit and syncs to your
            account if signed in.
          </li>
          <li>
            Sign out to return to the guest checklist. Signing out does not clear the account’s
            local cache; on a shared device, clear this site’s browser storage after exporting
            anything you need.
          </li>
          <li>
            Delete your account in Account settings, with your password. This removes the user,
            sessions and cloud checklist. The active account cache is removed on this device; other
            offline devices and separately downloaded backups are outside that deletion.
          </li>
          <li>Clear browser site data to remove device-only caches and preferences.</li>
        </ul>
        <p>
          Email verification and email password recovery are not configured in this release. Keep
          your password in a password manager and maintain a checklist backup. You can change a
          known password from Account settings.
        </p>
        <p>
          Policy effective November 15, 2026. For technical questions, use the{' '}
          <a
            href="https://github.com/liuaibin001/mw4-camo-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            project issue tracker
          </a>{' '}
          without posting personal or authentication information.
        </p>
      </section>
    </>
  )
}
function Terms() {
  return (
    <>
      <section id="service">
        <h2>Using CamoField</h2>
        <p>
          CamoField provides a free, manual fan checklist and informational guides for Modern
          Warfare 4. Use the service lawfully and do not attempt to disrupt it, access another
          user’s account, or automate abusive requests. You remain responsible for your game account
          and how you use external sources.
        </p>
        <p>
          The site does not sell in-game unlocks, perform gameplay actions, or promise a particular
          search ranking or completion time. The basic checklist works without an account.
        </p>
      </section>
      <section id="accuracy">
        <h2>Data and availability</h2>
        <p>
          Requirements and game behavior may change. Source labels, dates and uncertainty notes
          describe the evidence available for the current release. Check the in-game requirement
          when it differs. Guides are informational and are provided as available, without a promise
          that every condition or historical fix applies to your current game version.
        </p>
        <p>
          Keep a backup of your checklist. Browser storage can be cleared, connections can fail, and
          a free service can change or become unavailable. We may update or suspend features to
          maintain the site or address abuse.
        </p>
      </section>
      <section id="accounts">
        <h2>Your optional account</h2>
        <p>
          Use an email address you control and a strong, unique password. Do not share session
          cookies or post backups publicly. Your account stores your own checklist, and you should
          only upload data that belongs to you.
        </p>
        <p>
          The current release has no email recovery service. Account settings allow you to change a
          known password and delete your account using your password. See the{' '}
          <a href="/privacy">privacy policy</a> for what is stored and what account deletion covers.
        </p>
      </section>
      <section id="rights">
        <h2>Trademarks and source material</h2>
        <p>
          Call of Duty and Modern Warfare are trademarks of Activision. Other names identify their
          respective owners. CamoField is an independent fan project and does not claim those
          trademarks or a relationship with the named game publisher or community websites.
        </p>
        <p>
          Weapon and camo images identify the corresponding game content. Artwork and trademarks
          remain the property of their respective owners. Source links, missing-image limits and
          confidence details are available on <a href="/sources">the sources page</a>. Effective
          November 15, 2026.
        </p>
      </section>
    </>
  )
}
function Changelog() {
  return (
    <>
      <section id="release">
        <h2>November 15, 2026 — Initial release</h2>
        <ul>
          <li>35-weapon, 490-record shared camo checklist with independent checkbox edits.</li>
          <li>
            Military, Special, Gold, Platinum and Harmonic Break records, plus the automatic
            Divergence milestone.
          </li>
          <li>Nine mode-specific Mastery records and confidence labels for reported conditions.</li>
          <li>Class filters, weapon search, pinned weapons and fewest-left sorting.</li>
          <li>
            Device saves, validated JSON import, CSV export and optional Better Auth accounts with
            Cloudflare D1 sync.
          </li>
          <li>
            Prerequisite explanations, 35 weapon briefs, a dated tracking-fix guide and a public
            source register.
          </li>
        </ul>
      </section>
      <section id="catalogue">
        <h2>The catalogue’s date is separate from the release date</h2>
        <p>
          The primary upstream catalogue snapshot is <strong>{CATALOG_VERSION}</strong>. It was
          retrieved and source-reviewed on November 15, 2026. Official patch references in the
          tracking guide extend through November 13.
        </p>
        <p>
          “Reviewed November 15” does not mean that every condition was newly published or verified
          in game that day. Source uncertainty, including Warzone notes and seasonal class rules,
          remains visible after a software release.
        </p>
      </section>
      <section id="next">
        <h2>How future updates are published</h2>
        <p>
          Data changes go through review and the same build checks as code changes. The release
          date, upstream snapshot and affected guide entries should be updated together. We do not
          automatically scrape and publish competitor changes without review.
        </p>
        <p>
          If you notice a changed condition, follow the{' '}
          <a href="/sources#corrections">correction process</a>. A feature mentioned in research is
          not a released feature; only the items listed in this release and visible in the product
          are available.
        </p>
      </section>
    </>
  )
}
