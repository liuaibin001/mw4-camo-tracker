# CamoField — MW4 Camo Tracker

An independent Modern Warfare 4 checklist with 35 weapons, 490 shared weapon records, nine account Mastery records, portable backups and optional cloud sync.

- Live: https://mw4-camo-tracker.otoo.workers.dev
- Repository: https://github.com/liuaibin001/mw4-camo-tracker
- Deployment history: https://github.com/liuaibin001/mw4-camo-tracker/actions

## Stack

TanStack Start / Router provides server-rendered routes. React 19, Tailwind CSS 4 and shadcn/ui `base-nova` components built on Base UI provide the interface. Better Auth manages email/password sessions. Cloudflare Workers hosts SSR and APIs; D1 stores accounts, revision-controlled progress and auth rate-limit counters.

The light background and Inter typography follow the supplied Fiapp reference. CamoField’s branding, green palette, content and progress interface are original. Weapon thumbnails and camo artwork are served locally from the public source catalogue. Clicking an image opens its preview, all applicable mode requirements, prerequisites and a separate progress checkbox. No game screen reading or Activision integration is provided.

## Run locally

Use Node 24 LTS and the committed npm lockfile.

```sh
npm ci
cp .dev.vars.example .dev.vars
# Replace BETTER_AUTH_SECRET with a random secret of at least 32 characters.
npm run db:local
npm run dev
```

Open http://localhost:4321. Local HTTP origins are supported for auth; production uses the canonical `BETTER_AUTH_URL` in `wrangler.jsonc`.

```sh
npm run data:check
npm test
npm run typecheck
npm run build
# With the dev or preview server running:
npm run test:smoke
```

The smoke test checks all 45 indexable SSR pages, real 404 responses, canonicals, structured data, sitemap, robots, llms.txt, CSV and the OG image. It creates two disposable QA accounts to test sessions, account isolation, persisted tick/untick records, revision conflicts and same-origin/input checks, then deletes those accounts and their progress. It does not send emails. Run against production only when intentionally validating a deployment:

```sh
SMOKE_BASE_URL=https://mw4-camo-tracker.otoo.workers.dev npm run test:smoke
```

## Deployments

Pushes to `main` trigger `.github/workflows/deploy.yml`. The workflow installs from the lockfile, checks catalogue integrity and progression behavior, typechecks, builds, migrates a local test D1, smoke-tests the built Worker, applies production migrations, and deploys. Pull requests run verification without production credentials. Deployment runs are serialized per branch.

Repository secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare credential for Workers deployment and D1 migrations.
- `CLOUDFLARE_ACCOUNT_ID`: target account.

The production `BETTER_AUTH_SECRET` is a Worker secret, not a repository variable. Provision it with `npx wrangler secret put BETTER_AUTH_SECRET`. `.dev.vars`, `.env*`, build files and local D1 state are excluded from Git. Never expose secrets through `VITE_` variables or commit secret values.

```sh
npm run db:remote
npm run deploy
```

Changing domains requires updating `SITE_URL` in `src/lib/site.ts`, `BETTER_AUTH_URL` in `wrangler.jsonc`, the documented live URL and any domain routing. Rebuild and deploy so canonicals, Open Graph, sitemap and llms.txt agree. Bind the new custom domain in Cloudflare before making it canonical; no domain purchase is automated.

## Persistence and sync

Guest state is local to the browser. Account caches use distinct user-specific keys, and guest progress enters an account only through an explicit merge. Entries contain `done` and `updatedAt`, including false tombstones. Last edit wins per entry; equal timestamps choose false deterministically. The server uses a conditional revision update to prevent concurrent whole-document overwrites. The client remerges on a 409 and preserves changes made during an upload. Network failures do not erase local progress.

JSON backups use `{ "version": 1, "entries": { "m4:gold": { "done": true, "updatedAt": 1794729600000 } } }`. Import validates known IDs and value types and rejects malformed/future-dated entries. An import refreshes the edit time of its entries, merges them, and does not remove entries absent from the backup. CSV is export only and contains 490 weapon rows, not the account Mastery entries. A full JSON backup includes recorded Mastery entries.

Email verification and email password recovery are not configured. The product states this during registration and in its privacy policy. Signed-in users can change a known password and delete their account using their password. Add a verified email provider before offering email recovery; do not enable a nonfunctional reset link.

## Data and editorial updates

- `src/data/catalog.json`: normalized factual names and conditions from the MW4.GG public catalogue, retrieved November 15, 2026; upstream version November 7.
- `docs/data-provenance.json`: source register and scope.
- `src/data/catalog.ts`: source and uncertainty helpers.
- `src/lib/progress.ts`: records, portable formats, prerequisites and milestones.
- `src/components/guides.tsx`: original explainers and dated official patch references.
- `src/components/information-pages.tsx`: source policy, privacy, terms, about and changelog.

Preserve upstream uncertainty notes. A generic verified flag must not erase a Warzone-specific unverified note. Do not derive seasonal class thresholds from current inventory counts. Do not describe historical fixes as currently unresolved. Source review is not independent in-game verification.

Data is bundled so a user’s checklist is never sent to competitor sites. There is no unattended scraping or auto-publication of unreviewed data. Review changes, update relevant dates and prose, run the data check and tests, then commit and push. Do not delete old challenge IDs without planning a save migration.

Media sources and checksums are recorded in `docs/media-sources.json`. `node scripts/download-media.mjs /path/to/reviewed-camo-grind.json` downloads and validates image files, deduplicates shared images and attaches local paths to the catalogue. `docs/media-overrides.json` records reviewed exact-name images missing from the tracker catalogue. Missing artwork is labeled in the interface. The data check verifies every stored image checksum and every catalogue media reference. Artwork rights remain with their respective owners; see `NOTICE.md`.

## Search and machine-readable content

English is the primary language for the target English query. All guide and weapon brief content is server-rendered. The site provides unique titles/descriptions/canonicals, Article/Breadcrumb/WebApplication/FAQ structured data that matches visible content, an XML sitemap, robots.txt, llms.txt and a public factual catalogue. None guarantees ranking or AI citation. No fake ratings or download totals are used.

Account/progress endpoints use `no-store` and `noindex`. Unknown content routes return real 404s with `noindex`. The shipped release has no advertising or analytics scripts. Add analytics and Search Console ownership only for the final domain and update the privacy policy if collection changes.

## Third-party notices

Inter is distributed under the SIL Open Font License in `public/fonts/OFL.txt`. The small UI primitives derive from shadcn/ui’s MIT-licensed Base UI variant; see `NOTICE.md`. All game names and trademarks belong to their respective owners. CamoField is not affiliated with Activision or the cited community sites.
